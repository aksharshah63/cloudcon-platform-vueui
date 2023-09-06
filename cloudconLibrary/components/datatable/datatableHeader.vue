<script lang="ts">
import { IColumnMetadata } from "../../store/modules/tableData/tableDataModule";
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  PropType,
  ref,
  watch,
} from "vue";
import {
  IDatatableSortObject,
  SortOrderOption,
} from "../../api/databaseWebApi";
import Checkbox from "primevue/checkbox";

interface IDatatableHeaderColumns {
  column: IColumnMetadata;
  sortType: SortOrderOption | null;
  sortIcon: string;
  sortIndex: number;
}

export const DatatableHeader = /*#__PURE__*/ defineComponent({
  name: "DatatableHeader",
  components: {
    Checkbox,
  },
  emits: [
    "headersResize",
    "expandAllRows",
    "collapseAllRows",
    "onSort",
    "toggleAllRowsSelection",
  ],
  props: {
    columns: {
      type: Array as PropType<IColumnMetadata[]>,
      required: true,
    },
    enableRowExpansion: {
      type: Boolean,
      required: false,
      default: false,
    },
    enableRowSelection: {
      type: Boolean,
      required: false,
      default: true,
    },
    allRowsSelected: {
      type: Boolean,
      required: false,
      default: false,
    },
    sort: {
      type: Array as PropType<IDatatableSortObject[]>,
      required: false,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const tableHeaderCells = ref<HTMLElement[]>([]);
    const tableHeadersResizeObserver = new ResizeObserver(onTableHeadersResize);

    const columnDetails = computed<IDatatableHeaderColumns[]>(() => {
      return props.columns.map((c) => {
        return {
          column: c,
          sortType: sortType(c),
          sortIcon: sortIcon(c),
          sortIndex: sortIndex(c),
        };
      });
    });

    function onTableHeadersResize(): void {
      const headerWidths: number[] = [];

      tableHeaderCells.value.forEach((e) => {
        if (e) headerWidths.push(e.getBoundingClientRect().width);
      });

      emit("headersResize", headerWidths);
    }

    function assignTableHeaderElementsToObserver(): void {
      if (tableHeaderCells.value)
        tableHeaderCells.value.forEach((e) => {
          if (e) tableHeadersResizeObserver.observe(e);
        });
    }

    function expandAllRows(): void {
      emit("expandAllRows");
    }

    function collapseAllRows(): void {
      emit("collapseAllRows");
    }

    function sortType(column: IColumnMetadata): SortOrderOption | null {
      const sortObjectForColumn = props.sort.find(
        (s) => s.field == column.InternalName
      );
      return sortObjectForColumn?.order ?? null;
    }

    function sortIcon(column: IColumnMetadata): string {
      const type = sortType(column);

      switch (type) {
        case SortOrderOption.ASCENDING:
          return "sort-amount-up-alt";
        case SortOrderOption.DESCENDING:
          return "sort-amount-down";
        default:
          return "sort";
      }
    }

    function sortIndex(column: IColumnMetadata): number {
      return props.sort.findIndex((s) => s.field == column.InternalName);
    }

    function sortColumn(column: IColumnMetadata): void {
      const oldSortType = sortType(column);
      let newSortType: SortOrderOption | null = null;

      switch (oldSortType) {
        case SortOrderOption.ASCENDING:
          newSortType = SortOrderOption.DESCENDING;
          break;
        case SortOrderOption.DESCENDING:
          newSortType = null;
          break;
        case null:
          newSortType = SortOrderOption.ASCENDING;
          break;
        default:
          newSortType = null;
          break;
      }

      emit("onSort", column, newSortType);
    }

    function onToggleAllRowsSelection(): void {
      emit("toggleAllRowsSelection");
    }

    onMounted(() => {
      assignTableHeaderElementsToObserver();
    });

    onUnmounted(() => {
      tableHeadersResizeObserver.disconnect();
    });

    watch(
      tableHeaderCells,
      () => {
        assignTableHeaderElementsToObserver();
      },
      { deep: true, flush: "post" }
    );

    return {
      SortOrderOption,
      tableHeaderCells,
      columnDetails,
      expandAllRows,
      collapseAllRows,
      sortColumn,
      onToggleAllRowsSelection,
    };
  },
});
export default DatatableHeader;
</script>

<template>
  <thead class="datatable-header">
    <tr>
      <th v-if="enableRowSelection" class="datatable-header-row-selection-cell">
        <div
          class="
            datatable-header-row-selection-cell-content
            is-flex is-justify-content-center is-align-items-center
          "
        >
          <Checkbox
            :modelValue="allRowsSelected"
            :binary="true"
            @input="onToggleAllRowsSelection()"
          />
        </div>
      </th>

      <th v-if="enableRowExpansion" class="datatable-header-row-expansion-cell">
        <div
          class="
            datatable-header-row-expansion-cell-content
            is-flex is-justify-content-center is-align-items-center
          "
        >
          <div
            class="
              datatable-header-row-expansion-cell-button-container
              is-flex is-justify-content-center is-align-items-center
              pointer
            "
            @click="expandAllRows()"
          >
            <font-awesome-icon :icon="['fa', 'expand-alt']" />
          </div>
          <div
            class="
              datatable-header-row-expansion-cell-button-container
              is-flex is-justify-content-center is-align-items-center
              pointer
            "
            @click="collapseAllRows()"
          >
            <font-awesome-icon :icon="['fa', 'compress-alt']" />
          </div>
        </div>
      </th>

      <th
        v-for="(c, index) in columnDetails"
        :key="c.column.InternalName"
        :ref="
          (e) => {
            tableHeaderCells[index] = e;
          }
        "
        :class="{
          'datatable-header-cell-sort-asc':
            c.sortType == SortOrderOption.ASCENDING,
          'datatable-header-cell-sort-desc':
            c.sortType == SortOrderOption.DESCENDING,
        }"
      >
        <div
          class="
            datatable-header-cell-content
            is-flex is-justify-content-center is-align-items-center
            pointer
          "
          @click="sortColumn(c.column)"
        >
          <span
            class="datatable-header-cell-content-label"
            v-tooltip.bottom="c.column.TooltipValue ?? c.column.Label"
          >
            {{ c.column.Label }}
          </span>

          <div class="datatable-header-cell-content-sort-icon-container">
            <font-awesome-icon :icon="['fa', c.sortIcon]" />
          </div>

          <div
            v-if="c.sortIndex != -1"
            class="datatable-header-cell-content-sort-index-container"
          >
            <span class="datatable-header-cell-content-sort-index">{{
              c.sortIndex + 1
            }}</span>
          </div>
        </div>
      </th>
    </tr>
  </thead>
</template>

<style scoped lang="scss">
.datatable-header {
  background-color: var(--datatable-header-background-colour);
  position: sticky;
  top: 0;
  z-index: 1;

  > tr {
    > th {
      vertical-align: middle;

      &:first-child {
        border-top-left-radius: var(--datatable-header-border-radius);
        border-bottom-left-radius: var(--datatable-header-border-radius);
      }

      &:last-child {
        border-top-right-radius: var(--datatable-header-border-radius);
        border-bottom-right-radius: var(--datatable-header-border-radius);
      }

      &.datatable-header-row-selection-cell {
        // The cell with the row selection column content
        width: var(--datatable-row-selection-column-width);

        > .datatable-header-row-expansion-cell-content {
          padding: var(--datatable-header-row-selection-cell-padding);
        }
      }

      &.datatable-header-row-expansion-cell {
        // The cell with the row expansion column content
        width: var(--datatable-row-expansion-column-width);

        > .datatable-header-row-expansion-cell-content {
          padding: var(--datatable-row-expansion-header-padding);
          gap: var(--datatable-row-expansion-header-buttons-gap);

          > .datatable-header-row-expansion-cell-button-container {
            padding: var(--datatable-row-expansion-header-buttons-padding);
            border-radius: var(
              --datatable-row-expansion-header-buttons-border-radius
            );

            &:hover {
              background-color: var(
                --datatable-row-expansion-header-buttons-hover-background-colour
              );
            }
          }
        }
      }

      &.datatable-header-cell-sort-asc,
      &.datatable-header-cell-sort-desc {
        background-color: var(--datatable-header-cell-sort-background-colour);

        > .datatable-header-cell-content {
          color: var(--datatable-header-cell-sort-font-colour);
        }
      }

      .datatable-header-cell-content {
        padding: var(--datatable-header-cell-padding);
        color: var(--datatable-header-cell-content-font-colour);
        gap: var(--datatable-header-cell-content-gap);
        user-select: none;

        > .datatable-header-cell-content-label {
          font-size: var(--datatable-header-cell-label-font-size);
          font-weight: var(--datatable-header-cell-label-font-weight);
          line-height: var(--datatable-header-cell-label-line-height);
        }

        > .datatable-header-cell-content-sort-index-container {
          > .datatable-header-cell-content-sort-index {
            font-size: var(
              --datatable-header-cell-content-sort-index-font-size
            );
          }
        }
      }
    }
  }
}
</style>
