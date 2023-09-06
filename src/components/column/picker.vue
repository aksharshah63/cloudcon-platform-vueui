<script lang="ts">
import { defineComponent, ref, computed, reactive } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Sidebar from "primevue/sidebar";
import InputText from "primevue/inputtext";
import {
  IColumnMetadata,
  IUpviseDataMessage,
} from "../../store/modules/upvise.d";
import { FilterMatchMode } from "primevue/api";

export const ColumnPicker = /*#__PURE__*/ defineComponent({
  name: "ColumnPicker",
  components: {
    DataTable,
    Column,
    Sidebar,
    InputText,
  },
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
  },
  setup(props, { emit }) {
    //const store = useStore();
    const upviseDataMessage = ref(props.upviseDataMessage);
    const grouping = ref(upviseDataMessage.value.definition?.Grouping);
    const showSidebar = ref(true);
    const tabItems = ref(getTabItems());

    const currentGroupName = ref(grouping.value[0]?.Type || "");
    // const currentGroupName = computed((): string => {
    //   return upviseDataMessage.value.definition?.grouping[0] || "";
    // });

    const getColumns = computed(() => {
      const schema =
        upviseDataMessage.value.persistence[currentGroupName.value]?.Schema;
      let filteredschema = schema.filter((t) => t.Label != null);
      let defaultOrder = filteredschema?.filter(
        (column: IColumnMetadata) => column.IsVisible
      );
      return defaultOrder ? sortColumns(defaultOrder) : null;
    });

    //const singleColumn = computed(() => currentColumns.value.length > 1)

    function sortColumns(defaultOrder: any) {
      //TODO: Improve this function
      const alphabeticalOrder = defaultOrder.sort(
        (a: IColumnMetadata, b: IColumnMetadata) =>
          (a.Label ?? "") < (b.Label ?? "") ? 1 : -1
      );
      return alphabeticalOrder.sort((a: IColumnMetadata, b: IColumnMetadata) =>
        a.Hidden! > b.Hidden!
          ? 1
          : a.Hidden === b.Hidden
          ? a.DisplayOrderIndex! > b.DisplayOrderIndex!
            ? 1
            : -1
          : -1
      );
    }

    const getSelected = computed(() => {
      return columns?.value[currentGroupName.value]?.filter(
        (item: IColumnMetadata) => item.Hidden == false
      );
    });

    const columns = ref({ [currentGroupName.value]: getColumns.value });
    const currentColumns = ref(columns.value[currentGroupName.value]);
    const selectedColumns = ref({
      [currentGroupName.value]: getSelected.value,
    });
    const currentSelectedColumns = ref(
      selectedColumns.value[currentGroupName.value]
    );

    const columnFilters = ref({
      Label: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    const getSchemaCopy = () => {
      const editSchema =
        upviseDataMessage.value.persistence[currentGroupName.value].Schema;
      return reactive(JSON.parse(JSON.stringify(editSchema)));
    };

    const onRowSelect = (event: any) => {
      console.log(event);
    };

    function saveColumns() {
      columns.value[currentGroupName.value] = currentColumns.value;
      selectedColumns.value[currentGroupName.value] =
        currentSelectedColumns.value;
      const groupingLevels = Object.keys(columns.value);
      groupingLevels.forEach((groupingLevel) => {
        currentGroupName.value = groupingLevel;
        const schemaCopy = getSchemaCopy();
        columns.value[currentGroupName.value].forEach(
          (column: IColumnMetadata, index: number) => {
            const currentSchemaColumn = schemaCopy.find(
              (schemaColumn: IColumnMetadata) =>
                schemaColumn.InternalName === column.InternalName
            );
            // Forces the name column to always be shown. Should be some usability on this to tell the user
            if (column.InternalName === "name")
              currentSchemaColumn.Hidden = false;
            else currentSchemaColumn.Hidden = !isSelected(column);
            currentSchemaColumn.DisplayOrderIndex = index;
          }
        );
        upviseDataMessage.value.persistence[currentGroupName.value].Schema =
          schemaCopy;
      });
      emit("columnsUpdated");
      closeColumnPicker();
    }

    function showColumns(name: string) {
      columns.value[currentGroupName.value] = currentColumns.value;
      selectedColumns.value[currentGroupName.value] =
        currentSelectedColumns.value;
      currentGroupName.value = findGroupingType(name);
      if (columns.value[currentGroupName.value]) {
        currentColumns.value = columns.value[currentGroupName.value];
        currentSelectedColumns.value =
          selectedColumns.value[currentGroupName.value];
      } else {
        columns.value[currentGroupName.value] = getColumns.value;
        currentColumns.value = columns.value[currentGroupName.value];

        selectedColumns.value[currentGroupName.value] = getSelected.value;
        currentSelectedColumns.value =
          selectedColumns.value[currentGroupName.value];
      }
    }

    function findGroupingType(name: string) {
      const newLevel = Object.values(grouping.value).find(
        (group) => group.LookupKey.toLowerCase() === name.toLowerCase()
      );
      return newLevel?.Type || "";
    }

    function getTabItems() {
      const tabItems: string[] = [];
      Object.values(grouping.value).forEach((group) => {
        if (group.BaseType !== "") return;
        const name = group.LookupKey;
        tabItems.push(name.charAt(0).toUpperCase() + name.slice(1));
      });
      return tabItems;
    }

    const reorder = (event: any) => {
      // filter removes row from @rowReorder but not v-model:selection
      currentColumns.value = event.value;
    };

    // move selected columns to top after filter
    const selectedFirstSort = () => {
      currentColumns.value = currentColumns.value.sort(
        (a: IColumnMetadata, b: IColumnMetadata) =>
          isSelected(a, true) === isSelected(b, true)
            ? 0
            : isSelected(a, true) > isSelected(b, true)
            ? -1
            : 1
      );
    };

    // disallow reordering when column picker is filtered
    const reorderFunc = computed(() =>
      !columnFilters.value.Label.value ? reorder : undefined
    );

    function resetDefault() {
      currentColumns.value = getColumns.value;
      currentSelectedColumns.value = getSelected.value;
    }

    function closeColumnPicker() {
      showSidebar.value = false;
      emit("closeColumnPicker");
    }

    function tabClicked(event: any, name: string) {
      const option = document.getElementsByClassName("tab");
      for (let i = 0; i < option.length; i++) {
        option[i].classList.remove("selected");
      }

      event.currentTarget.classList.add("selected");
      showColumns(name);
    }

    function isSelected(column: IColumnMetadata, current = false) {
      let selectedCols = current
        ? currentSelectedColumns.value
        : selectedColumns.value[currentGroupName.value];
      return !!selectedCols.find((selectedColumn: IColumnMetadata) =>
        column.InternalName
          ? selectedColumn.InternalName === column.InternalName
          : selectedColumn.Title === column.Title
      );
    }

    return {
      showSidebar,
      currentColumns,
      onRowSelect,
      saveColumns,
      tabItems,
      currentSelectedColumns,
      reorder,
      resetDefault,
      closeColumnPicker,
      tabClicked,
      // eslint-disable-next-line vue/no-dupe-keys
      upviseDataMessage,
      columnFilters,
      reorderFunc,
      selectedFirstSort,
    };
  },
});
export default ColumnPicker;
</script>

<template>
  <div>
    <Sidebar class="milestone-screen" :visible="showSidebar" position="right">
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name">Column Selector</span>
            </div>
          </div>
        </div>

        <div class="p-col-5 sidebar-options">
          <div class="option" @click="saveColumns()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <!-- Change the trash icon to an undo/reset icon -->
          <div class="option" @click="resetDefault()">
            <font-awesome-icon
              class="undo-alt-icon"
              :icon="['fa', 'undo-alt']"
            />
          </div>
          <div class="option" @click="closeColumnPicker()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>
      </div>
      <!--      <div v-if="tabItems">-->
      <!--        <TabMenu :model="tabItems"></TabMenu>-->
      <!--      </div>-->
      <div class="grid">
        <div class="tabs-group">
          <template v-for="(name, index) in tabItems" :key="name">
            <div
              v-if="index === 0"
              class="tab selected"
              @click="tabClicked($event, name)"
            >
              <div class="tab-wrapper">
                <span class="tab-text">{{ name }}</span>
              </div>
            </div>
            <div v-else class="tab" @click="tabClicked($event, name)">
              <div class="tab-wrapper">
                <span class="tab-text">{{ name }}</span>
              </div>
            </div>
          </template>
        </div>
        <!--      <div class="columnDiv">-->
        <!--        <input type="checkbox" class="checkbox" id="selectAll" />-->
        <!--        <p class="selectAll">Select All</p>-->
        <!--      </div>-->
        <!-- DataTable has no dataKey, as there are some cols that don't have the internalName field which was previously being used as the key -->
        <DataTable
          class="table-header"
          :value="currentColumns"
          v-model:selection="currentSelectedColumns"
          responsiveLayout="scroll"
          v-model:filters="columnFilters"
          filterDisplay="menu"
          @rowReorder="reorderFunc"
          @update:filters="selectedFirstSort()"
        >
          <Column selectionMode="multiple" headerStyle="width: 3em"></Column>
          <Column
            field="Label"
            header="Select All"
            filterMenuClass="filter-menu-class"
            :showFilterMatchModes="false"
          >
            <template #body="row">
              <div
                :style="{
                  width: '100%',
                  height: '100%',
                  fontFamily: 'Poppins, serif',
                  fontWeight: 400,
                }"
                v-tooltip.bottom="row.data.TooltipValue ?? row.data.Label"
              >
                {{ row.data.Label }}
              </div>
            </template>
            <template #filter="{ filterModel }">
              <InputText
                type="text"
                v-model="filterModel.value"
                class="input-text-field"
              />
            </template>
          </Column>
          <Column
            v-if="!columnFilters.Label.value"
            :rowReorder="true"
            headerStyle="width: 3em"
          />
        </DataTable>
      </div>
    </Sidebar>
  </div>
</template>

<style lang="scss" scoped>

@keyframes slide-in {
  from {
    top: 20px;
  }
  to {
    top: 49px;
  }
}
.picker {
  animation: slide-in 0.5s;
  display: flex;
  flex-direction: column;
  z-index: 900;
  position: absolute;
  top: 50px;
  right: 0;
  border: 1px solid var(--grey5);
  border-radius: 16px;
  background: var(--white);
  width: 200px;
  max-height: 200px;
  overflow: scroll;

  .columnDiv {
    align-items: center;
    display: flex;
    flex-direction: row;
    .checkbox {
      flex: 1;
    }
    .columnName {
      flex: 3;
    }
    .selectAll {
      flex: 4;
    }

    .bar-icon {
      flex: 1;
      color: var(--grey3);
    }
  }
}

.tabs-group {
  display: flex;
  flex-wrap: wrap;
  flex: 1 1 auto;
  height: 44px;
  align-items: flex-end;

  .tab {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $grey2;
    border-radius: 8px 8px 0 0;
    //padding: 12px; While we arent using tab-count
    padding: 12px 12px 12px 12px;
    font-weight: 700;
    height: 75%;
    box-sizing: border-box;
    min-width: 90px;
    max-width: 140px;
    cursor: pointer;
    border: 1px solid #c8c8c8;
    border-bottom: none;

    .tab-wrapper {
      overflow: hidden;

      .tab-text {
        color: $grey3;
        white-space: nowrap;
        text-align: center;
      }
    }

    &.selected {
      background-color: $grey4;
      height: 100%;
    }
  }
}

/*
Row reordering
*/
::v-deep(.p-datatable .p-datatable-tbody > tr.p-datatable-dragpoint-top > td) {
  box-shadow: inset 0 2px 0 0 $grey3;
}
::v-deep(.p-datatable
    .p-datatable-tbody
    > tr.p-datatable-dragpoint-bottom
    > td) {
  box-shadow: inset 0 -2px 0 0 $grey3;
}
</style>
