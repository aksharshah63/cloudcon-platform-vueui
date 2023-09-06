<script lang="ts">
import {
  IColumnMetadata,
  ITableRecord,
} from "../../../cloudconLibrary/store/modules/tableData/tableDataModule";
import {
  computed,
  defineComponent,
  PropType,
  ref,
  watch,
  watchEffect,
} from "vue";
import DatatableHeader from "./datatableHeader.vue";
import DatatableBody from "./datatableBody.vue";
import { MenuItem } from "primevue/menuitem";
import utils from "../../utilities/useUtils";
import {
  DataFilterCondition,
  IDataFilterRule,
  IDataFilterGroup,
} from "../../dataFilter/dataFilterInterfaces";
import { DataFilter } from "../../dataFilter/dataFilter";
import { orderBy } from "lodash";
import Paginator from "../paginator/paginator.vue";
import {
  DatabaseWebApi,
  IDatatableSortObject,
  SortOrderOption,
} from "../../api/databaseWebApi";

export interface IDatatableStyleOptions {
  rowStyleOptions?: IDatatableRowStyleOptions;
}

export interface IDatatableRowStyleOptions {
  alternateBackgroundColours?: boolean; // Alternate background colours between backgroundColour and backgroundColour2 (default - false)
  backgroundColour?: string; // (default - #ffffff)
  backgroundColour2?: string; // Only used with alternateBackgroundColours (default - #fafafa)
  expandedRowGap?: boolean; // spacing between rows when the row is expanded (default - false)
}

export type IDatatableFilter = Record<
  string,
  {
    // key is the column internal name
    condition: DataFilterCondition;
    rules: IDataFilterRule[];
  }
>;

export const Datatable = /*#__PURE__*/ defineComponent({
  name: "Datatable",
  components: {
    DatatableHeader,
    DatatableBody,
    Paginator,
  },
  emits: [
    "headersResize",
    "expandAllRows",
    "update:selectedRows",
    "update:expandedRows",
    "update:sort",
  ],
  props: {
    data: {
      type: Array as PropType<ITableRecord[]>,
      required: true,
    },
    columns: {
      type: Array as PropType<IColumnMetadata[]>,
      required: true,
    },
    contextMenuOptions: {
      type: Array as PropType<MenuItem[]>,
      required: false,
    },
    enableRowExpansion: {
      type: Boolean,
      required: false,
      default: false,
    },
    expandedRows: {
      type: Object as PropType<Set<string>>,
      required: false,
      default: new Set(),
    },
    enableHeader: {
      type: Boolean,
      required: false,
      default: true,
    },
    enableRowSelection: {
      type: Boolean,
      required: false,
      default: true,
    },
    selectedRows: {
      type: Object as PropType<Set<string>>,
      required: false,
      default: new Set(),
    },
    customStylesObject: {
      type: Object as PropType<IDatatableStyleOptions>,
      required: false,
    },
    parentColumnWidths: {
      type: Array as PropType<number[]>,
      required: false,
    },
    sort: {
      type: Array as PropType<IDatatableSortObject[]>,
      required: false,
      default: () => [],
    },
    defaultSort: {
      type: Array as PropType<IDatatableSortObject[]>,
      required: false,
      default: () => [],
    },
    filters: {
      type: Object as PropType<IDatatableFilter>,
      required: false,
    },
    enablePaginator: {
      type: Boolean,
      required: false,
      default: true,
    },
    enableLazyLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
    tableName: {
      type: String,
      required: false,
    },
  },
  setup(props, { emit }) {
    const databaseWebApi = new DatabaseWebApi();
    const dataFilter = new DataFilter();
    const itemsPerPage = ref<number>(10);
    const pageNumber = ref<number>(1);
    const lazyLoadingTotalNumberOfRecords = ref<number>(1);
    const lazyLoadingDataToShow = ref<ITableRecord[]>([]);
    const isLoading = ref(false);

    const sortToApply = computed<IDatatableSortObject[]>(() => {
      var result = [];
      // Add sort objects to apply
      if (props.defaultSort) result.push(...props.defaultSort);
      if (props.sort) {
        var fields: Array<string> = props.sort.map(({ field }) => field);
        result = result.filter(({ field }) => !fields.includes(field));
        result.push(...props.sort);
      }
      return result;
    });

    const filteredAndSortedData = computed<ITableRecord[]>(() => {
      let tableData = props.data;
      var sortResults: IDatatableSortObject[] = [];
      // Filter data
      tableData = dataFilter.filterArray(tableData, filtersToApply.value);
      // Sort data
      if (sortToApply.value.length > 0) {
        const sortFields: string[] = [];
        const sortOrders: SortOrderOption[] = [];

        sortResults.forEach((s) => {
          sortFields.push(s.field);
          sortOrders.push(s.order);
        });

        tableData = orderBy(tableData, sortFields, sortOrders);
      }

      return tableData;
    });

    const dataToShow = computed<ITableRecord[]>(() => {
      if (props.enableLazyLoading) {
        return lazyLoadingDataToShow.value as ITableRecord[];
      }

      if (props.enablePaginator)
        return filteredAndSortedData.value.slice(
          (pageNumber.value - 1) * itemsPerPage.value,
          pageNumber.value * itemsPerPage.value
        );
      else return filteredAndSortedData.value;
    });

    const dataIds = computed<string[]>(() =>
      filteredAndSortedData.value.map((d) => d.id ?? "")
    );

    const filtersToApply = computed<IDataFilterGroup>(() => {
      const filtersResult: IDataFilterGroup = {
        condition: DataFilterCondition.AND,
        rules: [],
      };

      // Add filter objects to apply
      if (props.filters) {
        const filterRules = Object.values(props.filters);

        filtersResult.rules = filterRules;
      }

      return filtersResult;
    });

    const allRowsSelected = computed<boolean>(() => {
      if (props.selectedRows.size < 1 || dataIds.value.length < 1) return false;
      return dataIds.value.every((d) => props.selectedRows.has(d) ?? false);
    });

    function headersResize(headerWidths: number[]): void {
      emit("headersResize", headerWidths);
    }

    function toggleAllRowsSelection() {
      // if all rows selected in table, deselect all rows
      if (allRowsSelected.value) {
        emit("update:selectedRows", new Set<string>());
      } else {
        // else select all rows
        const copySelectedRows = utils.deepCopySet(props.selectedRows);

        dataIds.value.forEach((id) => {
          copySelectedRows.add(id);
        });

        emit("update:selectedRows", copySelectedRows);
      }
    }

    function toggleRowSelection(recordId: string) {
      const copySelectedRows = utils.deepCopySet(props.selectedRows);

      // if row selected in table, deselect row
      if (copySelectedRows.has(recordId)) copySelectedRows.delete(recordId);
      // else select row
      else copySelectedRows.add(recordId);

      emit("update:selectedRows", copySelectedRows);
    }

    function toggleRowExpansion(recordId: string): void {
      const copyExpandedRows = utils.deepCopySet(props.expandedRows);

      // if row expanded in table, collapse row
      if (copyExpandedRows.has(recordId)) copyExpandedRows.delete(recordId);
      // else expand row
      else copyExpandedRows.add(recordId);

      emit("update:expandedRows", copyExpandedRows);
    }

    function expandAllRows(emitExpandAllRows = false): void {
      const copyExpandedRows = utils.deepCopySet(props.expandedRows);

      dataIds.value.forEach((id) => {
        copyExpandedRows.add(id);
      });

      emit("update:expandedRows", copyExpandedRows);
      if (emitExpandAllRows) emit("expandAllRows");
    }

    function collapseAllRows(): void {
      emit("update:expandedRows", new Set<string>());
    }

    function onSort(
      column: IColumnMetadata,
      sortType: SortOrderOption | null
    ): void {
      const copySort = utils.deepCopy(props.sort);
      const sortObjectIndex = copySort.findIndex(
        (s) => s.field == column.InternalName
      );

      // if sort type is null, remove sort from array
      if (sortType == null && sortObjectIndex != -1)
        copySort.splice(sortObjectIndex, 1);
      else if (sortType != null) {
        // add sort
        if (sortObjectIndex == -1 && column.InternalName)
          copySort.push({ field: column.InternalName, order: sortType });
        //update sort
        else if (sortObjectIndex != -1) {
          const sortObject = copySort[sortObjectIndex];
          if (sortObject) sortObject.order = sortType;
        }
      }

      emit("update:sort", copySort);
    }

    function removeSelectedRowsNotInTable() {
      const removedIds: string[] = [];

      props.selectedRows.forEach((id) => {
        if (!dataIds.value.includes(id)) removedIds.push(id);
      });

      // if there are ids to delete, update selected rows
      if (removedIds.length > 0) {
        const copySelectedRows = utils.deepCopySet(props.selectedRows);

        removedIds.forEach((id) => {
          copySelectedRows.delete(id);
        });

        emit("update:expandedRows", copySelectedRows);
      }
    }

    function removeExpandedRowsNotInTable() {
      const removedIds: string[] = [];

      props.expandedRows.forEach((id) => {
        if (!dataIds.value.includes(id)) removedIds.push(id);
      });

      // if there are ids to delete, update selected rows
      if (removedIds.length > 0) {
        const copyExpandedRows = utils.deepCopySet(props.expandedRows);

        removedIds.forEach((id) => {
          copyExpandedRows.delete(id);
        });

        emit("update:expandedRows", copyExpandedRows);
      }
    }

    function changePage(newPageNumber: number) {
      pageNumber.value = newPageNumber;
    }

    watch(
      dataIds,
      () => {
        removeSelectedRowsNotInTable();
        removeExpandedRowsNotInTable();
      },
      { deep: true }
    );

    watchEffect(() => {
      if (props.enableLazyLoading && props.tableName) {
        isLoading.value = true;
        console.log("FETCHING DATA FOR PAGINATION", {
          condition: DataFilterCondition.AND,
          rules: filtersToApply.value,
          sort: sortToApply.value,
        });
        databaseWebApi
          .fetchTableData(
            props.tableName,
            undefined,
            {
              [props.tableName]: filtersToApply.value,
            },
            {
              [props.tableName]: sortToApply.value,
            },
            pageNumber.value,
            itemsPerPage.value
          )
          .then((response) => {
            const dataFromResponse = response.data.tableData;
            const metadataFromResponse = response.metadata;

            if (metadataFromResponse.totalNumberOfRecords != null)
              lazyLoadingTotalNumberOfRecords.value =
                metadataFromResponse.totalNumberOfRecords;

            // if (metadataFromResponse.paginationItemsPerPage != null)
            //   itemsPerPage.value = metadataFromResponse.paginationItemsPerPage;

            // if (metadataFromResponse.paginationPage)
            //   pageNumber.value = metadataFromResponse.paginationPage;

            lazyLoadingDataToShow.value = dataFromResponse;
            isLoading.value = false;
          });
      }
    });

    return {
      itemsPerPage,
      pageNumber,
      lazyLoadingTotalNumberOfRecords,
      dataToShow,
      dataIds,
      allRowsSelected,
      toggleRowExpansion,
      headersResize,
      expandAllRows,
      collapseAllRows,
      onSort,
      toggleAllRowsSelection,
      toggleRowSelection,
      changePage,
      isLoading,
    };
  },
});
export default Datatable;
</script>

<template>
  <div class="datatable">
    <table class="datatable-table">
      <DatatableHeader
        v-if="enableHeader"
        :columns="columns"
        :enableRowExpansion="enableRowExpansion"
        :enableRowSelection="enableRowSelection"
        :allRowsSelected="allRowsSelected"
        :sort="sort"
        @headersResize="headersResize"
        @expandAllRows="expandAllRows(true)"
        @collapseAllRows="collapseAllRows"
        @onSort="onSort"
        @toggleAllRowsSelection="toggleAllRowsSelection"
      />
      <div class="datatable-loading-overlay" v-if="isLoading">
        <i class="p-datatable-loading-icon pi-spin pi pi-spinner"></i>
      </div>
      <DatatableBody
        :columns="columns"
        :data="dataToShow"
        :contextMenuOptions="contextMenuOptions"
        :enableRowExpansion="enableRowExpansion"
        :enableRowSelection="enableRowSelection"
        :selectedRows="selectedRows"
        :expandedRows="expandedRows"
        :customStylesObject="customStylesObject"
        :parentColumnWidths="parentColumnWidths"
        @rowExpansion="toggleRowExpansion"
        @rowSelection="toggleRowSelection"
      >
        <template #row-expansion="{ data }">
          <slot name="row-expansion" :data="data"></slot>
        </template>
      </DatatableBody>
    </table>

    <div v-if="enablePaginator" class="datatable-paginator">
      <Paginator
        :currentPageNumber="pageNumber"
        :numberOfItems="
          enableLazyLoading ? lazyLoadingTotalNumberOfRecords : dataIds.length
        "
        v-model:itemsPerPage="itemsPerPage"
        @changePage="changePage"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../../../node_modules/primeicons/primeicons.css";
.datatable {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;

  .datatable-table {
    min-width: 100%;
    border-collapse: separate;
  }

  .datatable-paginator {
    padding: var(--datatable-paginator-padding);
    float: right;
  }

  .datatable-loading-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    background-color: rgba(0, 0, 0, 0.4);
    transition-duration: 0.2s;
  }
}
</style>
