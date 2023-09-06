<script lang="ts">
import {
  IColumnMetadata,
  IGroupDetail,
  IMetadata,
  ITableRecord,
} from "../../store/modules/tableData/tableDataModule";
import { MenuItem } from "primevue/menuitem";
import { computed, defineComponent, nextTick, PropType, ref } from "vue";
import useMetadata from "../../utilities/useMetadata";
import Datatable, {
  IDatatableFilter,
  IDatatableStyleOptions,
} from "./datatable.vue";
import DatatableFilterFeedback from "./datatableFilterFeedback.vue";
import DatatableFilterMenu from "./datatableFilterMenu.vue";
import {
  DataFilterCondition,
  DataFilterStringOperator,
  DataFilterType,
  IDataFilterRule,
  IDataFilters,
} from "../../dataFilter/dataFilterInterfaces";
import { DataFilter } from "../../dataFilter/dataFilter";
import utils from "../../utilities/useUtils";
import OverlayPanel from "primevue/overlaypanel";
import { IDatatableSortObject } from "../../api/databaseWebApi";

export interface IDatatableTabOption {
  name: string;
  filters: Record<string, IDataFilters>; // key is the group type e.g. TableToolsTools
}

export const DatatableView = /*#__PURE__*/ defineComponent({
  name: "DatatableView",
  components: {
    Datatable,
    DatatableFilterFeedback,
    DatatableFilterMenu,
    OverlayPanel,
  },
  emits: ["action", "update:sort", "update:filters"],
  props: {
    metadata: {
      type: Object as PropType<IMetadata>,
      required: true,
    },
    parentId: {
      type: String,
      required: false,
    },
    parentField: {
      type: String,
      required: false,
    },
    currentLevel: {
      type: Number,
      required: false,
      default: 0,
    },
    groupLevel: {
      type: Number,
      required: false,
      default: 0,
    },
    rowMenuOptions: {
      type: Object as PropType<Record<string, MenuItem[]>>,
      required: false,
      default: () => ({}),
    },
    tabOptions: {
      type: Array as PropType<IDatatableTabOption[]>,
      required: false,
      default: () => [],
    },
    parentColumns: {
      type: Array as PropType<IColumnMetadata[]>,
      required: false,
    },
    parentColumnWidths: {
      type: Array as PropType<number[]>,
      required: false,
    },
    customStyles: {
      type: Object as PropType<Record<string, IDatatableStyleOptions>>,
      required: false,
    },
    defaultSort: {
      type: Object as PropType<Record<string, IDatatableSortObject[]>>,
      required: false,
    },
    sort: {
      type: Object as PropType<Record<string, IDatatableSortObject[]>>,
      required: false,
    },
    filters: {
      type: Object as PropType<Record<string, IDatatableFilter>>,
      required: false,
      default: () => ({}),
    },
    enableFilterFeedback: {
      type: Boolean,
      required: false,
      default: true,
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
  },
  setup(props, { emit }) {
    const metadataController = useMetadata();
    const dataFilter = new DataFilter();
    const filterMenuOverlayPanelRef = ref<
      InstanceType<typeof OverlayPanel> | undefined
    >();
    const datatableRef = ref<InstanceType<typeof Datatable> | undefined>();
    const datatableViewReflectiveRefs = ref<
      Record<string, InstanceType<typeof DatatableView> | undefined>
    >({}); // key is the id of the row and value is the ref of the component
    const datatableViewChildRefs = ref<
      Record<string, InstanceType<typeof DatatableView> | undefined>
    >({}); // key is the id of the row and value is the ref of the component
    const selectedTab = ref<IDatatableTabOption | null>(
      props.tabOptions.length > 0 ? props.tabOptions[0] : null
    );
    const expandedRowsSet = ref<Set<string>>(new Set<string>());
    const headerWidths = ref<number[]>();
    const selectedRowsSet = ref<Set<string>>(new Set<string>());

    // Data to be passed to Datatable
    const filteredData = computed<ITableRecord[]>(() => {
      const filtersToApply: IDataFilters[] = [];

      // if no group type, return no data
      if (groupType.value == null) return [];

      let tableData: ITableRecord[] = [];
      const tabFilters = selectedTab.value?.filters[groupType.value];

      // Add filter objects to apply
      if (parentIdFilter.value) filtersToApply.push(parentIdFilter.value);
      if (tabFilters) filtersToApply.push(tabFilters);

      // Filter data
      if (filtersToApply.length > 0)
        tableData = dataFilter.filterArray(tableData, {
          condition: DataFilterCondition.AND,
          rules: filtersToApply,
        });

      return tableData;
    });

    // Filter for filtering by parentId and parentField props
    const parentIdFilter = computed<IDataFilterRule | null>(() => {
      if (props.parentId == null || props.parentField == null) return null;

      return {
        field: props.parentField,
        type: DataFilterType.STRING,
        operator: DataFilterStringOperator.EQUAL,
        value: props.parentId,
      };
    });

    // Current group from metadata
    const group = computed<IGroupDetail | null>(() =>
      metadataController.getGroup(props.metadata, props.groupLevel)
    );

    // Current group type from metadata
    const groupType = computed<string | null>(() => group.value?.Type ?? null);

    // Child group from metadata
    const childGroup = computed<IGroupDetail | null>(() =>
      metadataController.getGroup(props.metadata, props.groupLevel + 1)
    );

    // Is current group the lowest group
    const isLowestGroup = computed<boolean>(() => {
      const numberOfLevels = metadataController.getGroupingLevels(
        props.metadata
      );
      return props.groupLevel >= numberOfLevels - 1;
    });

    // Does group have reflective or child groups
    const hasChildren = computed<boolean>(
      () => !!group.value?.ReflectiveName || !isLowestGroup.value
    );

    // Columns to be passed to Datatable
    const columns = computed<IColumnMetadata[]>(() => {
      if (props.parentColumns) return props.parentColumns;
      if (groupType.value == null) return [];

      return (
        metadataController.getDisplayColumns(props.metadata, groupType.value) ??
        []
      );
    });

    // Context Menu Options To show for rows in Datatable
    const contextMenuOptions = computed<MenuItem[]>(() => {
      const options: MenuItem[] = [];

      // Add default options
      if (!isLowestGroup.value && groupType.value) {
        const reflectiveName = group.value?.ReflectiveName;

        if (reflectiveName)
          options.push({
            label: `Add ${reflectiveName}`,
            icon: "pi pi-plus",
            onClick: (record: ITableRecord) => {
              if (typeof record.id == "string")
                emitAction("addReflective", groupType.value ?? "", record.id);
            },
          });

        if (childGroup.value?.Type)
          options.push({
            label: `Add ${childGroup.value?.Name ?? ""}`,
            icon: "pi pi-plus",
            onClick: (record: ITableRecord) => {
              if (typeof record.id == "string")
                emitAction("addChild", groupType.value ?? "", record.id);
            },
          });
      }

      // Add menu options from props
      if (groupType.value) {
        const customMenuOptions = props.rowMenuOptions[groupType.value] ?? [];
        options.push(...customMenuOptions);
      }

      // if no options
      if (options.length < 1)
        options.push({
          label: "No Options",
          disabled: true,
        });

      return options;
    });

    // If there are tabs, is first tab selected
    const isFirstTabSelected = computed<boolean>(() => {
      // if no tab options
      if (props.tabOptions.length < 1) return false;
      // if selected tab is first tab
      if (
        selectedTab.value != null &&
        props.tabOptions[0].name == selectedTab.value.name
      )
        return true;
      return false;
    });

    // Styles to apply to Datatable
    const customStylesObject = computed<IDatatableStyleOptions | undefined>(
      () => {
        return groupType.value
          ? props.customStyles?.[groupType.value]
          : undefined;
      }
    );

    // Show table header row in Datatable
    const enableHeader = computed<boolean>(() => {
      return group.value?.BaseType ||
        (group.value?.ReflectiveName && !isTopLevelTable.value)
        ? false
        : true;
    });

    // Sort passed to Datatable
    const sortArray = computed<IDatatableSortObject[] | undefined>(() => {
      return groupType.value ? props.sort?.[groupType.value] : undefined;
    });

    // Default sort passed to Datatable
    const defaultSortArray = computed<IDatatableSortObject[] | undefined>(
      () => {
        return groupType.value
          ? props.defaultSort?.[groupType.value]
          : undefined;
      }
    );

    // Filter passed to Datatable
    const filterArray = computed<IDatatableFilter | undefined>(() => {
      return groupType.value ? props.filters[groupType.value] : undefined;
    });

    const isTopLevelTable = computed<boolean>(() => props.currentLevel == 0);

    function tabClick(tab: IDatatableTabOption): void {
      selectedTab.value = tab;
    }

    function emitAction(
      action: string,
      groupType: string,
      recordId: string
    ): void {
      emit("action", action, groupType, recordId);
    }

    function headersResize(widths: number[]): void {
      headerWidths.value = widths;
    }

    function expandAllRowsRecursively(): void {
      if (datatableRef.value) {
        datatableRef.value.expandAllRows();
        nextTick(expandAllChildRows);
      }
    }

    function expandAllChildRows(): void {
      // expand reflective datatables
      Object.values(datatableViewReflectiveRefs.value).forEach((e) => {
        if (e) e.expandAllRowsRecursively();
      });

      // expand child datatables
      Object.values(datatableViewChildRefs.value).forEach((e) => {
        if (e) e.expandAllRowsRecursively();
      });
    }

    function addReflectiveRef(
      e: InstanceType<typeof DatatableView>,
      data: ITableRecord
    ): void {
      if (data.id) datatableViewReflectiveRefs.value[data.id] = e;
    }

    function addChildRef(
      e: InstanceType<typeof DatatableView>,
      data: ITableRecord
    ): void {
      if (data.id) datatableViewChildRefs.value[data.id] = e;
    }

    function onSortFromDatatable(
      newSortArray: IDatatableSortObject[],
      groupTypeFromEmit: string | undefined
    ): void {
      const newSortGroupType =
        groupTypeFromEmit ?? groupType.value ?? undefined;

      if (newSortGroupType == null) return;

      const copySort = props.sort ? utils.deepCopy(props.sort) : {};

      if (!(newSortGroupType in copySort)) copySort[newSortGroupType] = [];

      copySort[newSortGroupType] = newSortArray;

      emit("update:sort", copySort);
    }

    function onSortFromDatatableView(
      newSort: Record<string, IDatatableSortObject>
    ) {
      emit("update:sort", newSort);
    }

    function deleteColumnFilter(groupType: string, columnInternalName: string) {
      const copyFilter = props.filters
        ? utils.deepCopy(props.filters)
        : undefined;

      if (copyFilter?.[groupType]?.[columnInternalName]) {
        delete copyFilter[groupType][columnInternalName];
        emit("update:filters", copyFilter);
      }
    }

    function deleteAllFilters() {
      const copyFilter = props.filters
        ? utils.deepCopy(props.filters)
        : undefined;

      if (copyFilter) {
        Object.keys(copyFilter).forEach((columnInternalName) => {
          copyFilter[columnInternalName] = {};
        });
        emit("update:filters", copyFilter);
      }
    }

    function updateFiltersFromFilterMenu(
      newFilters: Record<string, IDatatableFilter>
    ) {
      emit("update:filters", newFilters);
    }

    function toggleFilterMenu(event: Event) {
      filterMenuOverlayPanelRef.value?.toggle(event);
    }

    function closeFilterMenu() {
      filterMenuOverlayPanelRef.value?.hide();
    }

    return {
      filterMenuOverlayPanelRef,
      datatableRef,
      selectedTab,
      expandedRowsSet,
      headerWidths,
      selectedRowsSet,
      filteredData,
      group,
      groupType,
      childGroup,
      hasChildren,
      columns,
      contextMenuOptions,
      isFirstTabSelected,
      customStylesObject,
      filterArray,
      enableHeader,
      sortArray,
      defaultSortArray,
      isTopLevelTable,
      tabClick,
      headersResize,
      expandAllRowsRecursively,
      addReflectiveRef,
      addChildRef,
      onSortFromDatatable,
      onSortFromDatatableView,
      deleteColumnFilter,
      deleteAllFilters,
      updateFiltersFromFilterMenu,
      toggleFilterMenu,
      closeFilterMenu,
    };
  },
});
export default DatatableView;
</script>

<template>
  <div class="datatable-view">
    <div class="datatable-view-actions-container is-flex is-align-items-end">
      <div
        v-if="tabOptions.length > 0"
        class="datatable-view-tabs-container is-flex is-flex-grow-1"
      >
        <div
          v-for="tab in tabOptions"
          :key="tab.name"
          class="datatable-view-tab is-flex pointer"
          :class="{
            'datatable-view-tab-selected':
              selectedTab != null && selectedTab.name == tab.name,
          }"
          @click="tabClick(tab)"
        >
          <span class="datatable-view-tab-label">{{ tab.name }}</span>
        </div>
      </div>

      <div
        v-if="isTopLevelTable"
        class="datatable-view-filter-button-container"
      >
        <div
          class="
            datatable-view-filter-button
            is-flex is-justify-content-center is-align-items-center
            pointer
          "
          @click="toggleFilterMenu"
        >
          <font-awesome-icon
            class="datatable-view-filter-button-icon"
            :icon="['fa', 'filter']"
          />
          <span class="datatable-view-filter-button-label">FILTER</span>
        </div>
      </div>
    </div>

    <div
      class="datatable-view-datatable-container"
      :class="{
        'datatable-view-first-tab-selected': isFirstTabSelected,
      }"
      :style="{
        padding: !isTopLevelTable ? '0' : '',
      }"
    >
      <div
        v-if="isTopLevelTable && enableFilterFeedback"
        class="datatable-view-filter-feedback-container is-flex"
      >
        <DatatableFilterFeedback
          :metadata="metadata"
          :filters="filters"
          @deleteColumnFilter="deleteColumnFilter"
          @deleteAllFilters="deleteAllFilters"
        />
      </div>

      <Datatable
        ref="datatableRef"
        :data="filteredData"
        :columns="columns"
        :contextMenuOptions="contextMenuOptions"
        :enableRowExpansion="hasChildren"
        v-model:expandedRows="expandedRowsSet"
        :enableHeader="enableHeader"
        v-model:selectedRows="selectedRowsSet"
        :customStylesObject="customStylesObject"
        :parentColumnWidths="!enableHeader ? parentColumnWidths : undefined"
        :sort="sortArray"
        :defaultSort="defaultSortArray"
        :filters="filterArray"
        :enablePaginator="enablePaginator"
        :enableLazyLoading="enableLazyLoading"
        :tableName="groupType"
        @headersResize="headersResize"
        @expandAllRows="expandAllRowsRecursively"
        @update:sort="onSortFromDatatable"
      >
        <template #row-expansion="{ data }">
          <DatatableView
            v-if="group?.ReflectiveName"
            :ref="
              (e) => {
                addReflectiveRef(e, data);
              }
            "
            :metadata="metadata"
            :parentId="data.id"
            :parentField="
              group?.LookupKey ? `${group?.LookupKey}id` : undefined
            "
            :currentLevel="currentLevel + 1"
            :groupLevel="groupLevel"
            :rowMenuOptions="rowMenuOptions"
            :parentColumns="columns"
            :customStyles="customStyles"
            :parentColumnWidths="headerWidths"
            :defaultSort="defaultSort"
            :enablePaginator="false"
          />
          <DatatableView
            v-if="childGroup"
            :ref="
              (e) => {
                addChildRef(e, data);
              }
            "
            :metadata="metadata"
            :parentId="data.id"
            :parentField="
              group?.LookupKey ? `${group?.LookupKey}id` : undefined
            "
            :currentLevel="currentLevel + 1"
            :groupLevel="groupLevel + 1"
            :rowMenuOptions="rowMenuOptions"
            :parentColumns="childGroup?.BaseType ? columns : undefined"
            :customStyles="customStyles"
            :parentColumnWidths="headerWidths"
            :defaultSort="defaultSort"
            :sort="sort"
            :filters="filters"
            :enablePaginator="false"
            @update:sort="onSortFromDatatableView"
          />
        </template>
      </Datatable>
    </div>

    <OverlayPanel ref="filterMenuOverlayPanelRef" :dismissable="true">
      <DatatableFilterMenu
        :metadata="metadata"
        :filters="filters"
        @closeMenu="closeFilterMenu"
        @updateFilters="updateFiltersFromFilterMenu"
      />
    </OverlayPanel>
  </div>
</template>

<style scoped lang="scss">
.datatable-view {
  width: 100%;
  height: 100%;

  > .datatable-view-actions-container {
    > .datatable-view-tabs-container {
      > .datatable-view-tab {
        padding: var(--datatable-tabs-padding);
        border-top-left-radius: var(--datatable-tabs-border-radius);
        border-top-right-radius: var(--datatable-tabs-border-radius);

        &.datatable-view-tab-selected {
          background-color: var(
            --datatable-tabs-selected-tab-background-colour
          );
        }

        > .datatable-view-tab-label {
          font-size: var(--datatable-tabs-label-font-size);
          font-weight: var(--datatable-tabs-label-font-weight);
          line-height: var(--datatable-tabs-label-font-size);
          color: var(--datatable-tabs-label-font-colour);
        }
      }
    }

    > .datatable-view-filter-button-container {
      margin-bottom: var(--datatable-filer-button-margin-bottom);

      > .datatable-view-filter-button {
        gap: var(--datatable-filer-button-gap);
        border-radius: var(--datatable-filer-button-border-radius);
        border: var(--datatable-filer-button-border);
        padding: var(--datatable-filer-button-padding);
        height: fit-content;
        background: var(--datatable-filer-button-background-colour);

        > .datatable-view-filter-button-icon {
          color: var(--datatable-filter-button-icon-colour);
          font-size: var(--datatable-filter-button-icon-font-size);
        }

        > .datatable-view-filter-button-label {
          font-weight: var(--datatable-filter-button-label-font-weight);
          font-size: var(--datatable-filter-button-label-font-size);
          line-height: var(--datatable-filter-button-label-font-size);
          color: var(--datatable-filter-button-label-font-colour);
        }
      }
    }
  }

  > .datatable-view-datatable-container {
    padding: var(--datatable-container-padding);
    background: var(--datatable-container-background-colour);
    border-radius: var(--datatable-container-border-radius);

    &.datatable-view-first-tab-selected {
      border-top-left-radius: 0;
    }

    > .datatable-view-filter-feedback-container {
      width: 100%;
      margin: var(--datatable-filter-feedback-container-margin);
    }
  }
}
</style>
