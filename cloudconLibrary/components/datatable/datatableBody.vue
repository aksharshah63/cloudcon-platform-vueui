<script lang="ts">
import {
  IColumnMetadata,
  ITableRecord,
} from "../../store/modules/tableData/tableDataModule";
import { computed, CSSProperties, defineComponent, PropType, ref } from "vue";
import DatatableBodyCell from "./datatableBodyCell.vue";
import ContextMenu from "primevue/contextmenu";
import { MenuItem } from "primevue/menuitem";
import { IDatatableStyleOptions } from "./datatable.vue";
import Checkbox from "primevue/checkbox";

export const DatatableBody = /*#__PURE__*/ defineComponent({
  name: "DatatableBody",
  components: {
    Checkbox,
    ContextMenu,
    DatatableBodyCell,
  },
  emits: ["rowClick", "rowExpansion", "rowSelection"],
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
  },
  setup(props, { emit }) {
    const contextMenu = ref();
    const contextMenuSelectedRow = ref<ITableRecord>();

    const numberOfColumns = computed<number>(() => {
      let numOfCol = 0;

      if (props.enableRowSelection) numOfCol++;
      if (props.enableRowExpansion) numOfCol++;

      numOfCol += props.columns.length;

      return numOfCol;
    });

    const rowBackgroundColour1 = computed<string>(
      () =>
        props.customStylesObject?.rowStyleOptions?.backgroundColour ?? "#ffffff"
    );
    const rowBackgroundColour2 = computed<string>(
      () =>
        props.customStylesObject?.rowStyleOptions?.backgroundColour2 ??
        "#fafafa"
    );

    function rowStyle(record: ITableRecord): CSSProperties {
      const styleObject: CSSProperties = {};

      if ("_rowColour" in record && typeof record._rowColour === "string")
        styleObject.backgroundColor = "#" + record._rowColour;

      return styleObject;
    }

    function cellStyle(index: number): CSSProperties {
      const styleObject: CSSProperties = {};

      if (
        props.parentColumnWidths &&
        props.parentColumnWidths[index] != undefined
      )
        styleObject.width = props.parentColumnWidths[index] + "px";

      return styleObject;
    }

    function onRowClick(recordId: string): void {
      emit("rowClick", recordId);
    }

    function onRowRightClick(event: any, record: ITableRecord): void {
      contextMenuSelectedRow.value = record;
      contextMenu.value.show(event);
    }

    function onContextMenuClick(item: MenuItem): void {
      if ("onClick" in item) item.onClick(contextMenuSelectedRow.value);
    }

    function toggleRowExpansion(recordId: string): void {
      emit("rowExpansion", recordId);
    }

    function isRowExpanded(recordId: string): boolean {
      return props.expandedRows.has(recordId);
    }

    function isRowSelected(recordId: string): boolean {
      return props.selectedRows.has(recordId);
    }

    function toggleRowSelection(recordId: string): void {
      emit("rowSelection", recordId);
    }

    return {
      contextMenu,
      contextMenuSelectedRow,
      numberOfColumns,
      rowBackgroundColour1,
      rowBackgroundColour2,
      rowStyle,
      cellStyle,
      onRowClick,
      onRowRightClick,
      onContextMenuClick,
      toggleRowExpansion,
      isRowExpanded,
      isRowSelected,
      toggleRowSelection,
    };
  },
});
export default DatatableBody;
</script>

<template>
  <tbody
    class="datatable-body"
    :class="{
      'alternate-row-colours':
        customStylesObject?.rowStyleOptions?.alternateBackgroundColours == true,
    }"
  >
    <template v-for="record in data" :key="record.id">
      <tr
        :style="rowStyle(record)"
        @click="onRowClick(record.id)"
        @contextmenu="onRowRightClick($event, record)"
      >
        <td v-if="enableRowSelection" class="datatable-body-row-selection-cell">
          <div
            class="datatable-body-row-selection-cell-content is-flex is-justify-content-center"
          >
            <Checkbox
              :modelValue="isRowSelected(record.id)"
              :binary="true"
              @input="toggleRowSelection(record.id)"
            />
          </div>
        </td>

        <td v-if="enableRowExpansion" class="datatable-body-row-expansion-cell">
          <div
            class="datatable-body-row-expansion-cell-content is-flex is-justify-content-center"
          >
            <div
              class="datatable-body-row-expansion-expander-container is-flex is-justify-content-center is-align-items-center pointer"
              :class="{
                expanded: isRowExpanded(record.id),
              }"
              @click="toggleRowExpansion(record.id)"
            >
              <template v-for="i in 5" :key="i">
                <font-awesome-icon
                  v-if="i < 5"
                  class="datatable-body-row-expansion-expander-chevron-icon"
                  :icon="['fa', 'chevron-right']"
                />
              </template>
            </div>
          </div>
        </td>

        <td
          v-for="(column, index) in columns"
          :key="column.InternalName"
          :style="cellStyle(index)"
        >
          <DatatableBodyCell
            :data="record?.[column.InternalName]"
            :style="column?.Style"
          />
        </td>
      </tr>

      <tr v-if="isRowExpanded(record.id)" class="datatable-body-expanded-row">
        <td
          :colspan="numberOfColumns"
          class="datatable-body-expanded-row-content-cell"
          :class="{
            'expanded-row-gap':
              customStylesObject?.rowStyleOptions?.expandedRowGap == true,
          }"
        >
          <slot name="row-expansion" :data="record"></slot>
        </td>
      </tr>
    </template>
  </tbody>

  <ContextMenu ref="contextMenu" :model="contextMenuOptions">
    <template #item="{ item }">
      <a @click="onContextMenuClick(item)" class="p-menuitem-link">
        <span class="p-menuitem-icon" :class="item.icon" />
        <span class="p-menu-item-text"> {{ item.label }} </span>
      </a>
    </template>
  </ContextMenu>
</template>

<style scoped lang="scss">
.datatable-body {
  &.alternate-row-colours {
    > tr {
      &:nth-child(odd) {
        background-color: v-bind(rowBackgroundColour1);
      }
      &:nth-child(even) {
        background-color: v-bind(rowBackgroundColour2);
      }
    }
  }

  > tr {
    background-color: v-bind(rowBackgroundColour1);

    &.datatable-body-expanded-row {
      // The row holding the expanded content
      background-color: transparent;

      > td {
        &.datatable-body-expanded-row-content-cell {
          &.expanded-row-gap {
            padding-bottom: var(--datatable-body-row-gap);
          }
        }
      }
    }

    > td {
      &:not(.datatable-body-expanded-row-content-cell) {
        height: var(--datatable-body-row-min-height);
      }

      &.datatable-body-row-selection-cell {
        // The cell with the row selection column content
        width: var(--datatable-row-selection-column-width);

        > .datatable-body-row-selection-cell-content {
          padding: var(--datatable-row-selection-padding);
          height: 100%;
        }
      }

      &.datatable-body-row-expansion-cell {
        // The cell with the row expansion column content
        width: var(--datatable-row-expansion-column-width);

        > .datatable-body-row-expansion-cell-content {
          padding: var(--datatable-row-expansion-padding);
          height: 100%;

          > .datatable-body-row-expansion-expander-container {
            height: var(--datatable-row-expansion-size);
            width: var(--datatable-row-expansion-size);
            border-radius: var(--datatable-row-expansion-border-radius);
            background-color: var(--datatable-row-expansion-background-colour);
            transition: var(--datatable-row-expansion-transition);

            &.expanded {
              transform: rotate(90deg);
            }

            > .datatable-body-row-expansion-expander-chevron-icon {
              color: var(--datatable-row-expansion-chevron-icon-colour);
              font-size: var(--datatable-row-expansion-chevron-icon-font-size);
              margin: var(--datatable-row-expansion-chevron-icon-margin);
            }
          }
        }
      }
    }
  }
}
</style>
