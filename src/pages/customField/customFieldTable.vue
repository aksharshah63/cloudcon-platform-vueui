<script lang="ts">
import { defineComponent, PropType } from "vue";
import DataTable, {
  DataTableCellEditCompleteEvent,
  DataTableRowReorderEvent,
} from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import { IFormTemplateField } from "../../../cloudconLibrary/store/modules/formTemplateData/formTemplateDataModule";

export const customFieldTable = /*#__PURE__*/ defineComponent({
  name: "FieldTable",
  props: {
    isLoading: {
      type: Boolean,
      required: true,
      default: false,
    },
    templateFields: {
      type: Array as PropType<IFormTemplateField[]>,
      required: true,
    },
    editingRows: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    editColumns: {
      type: Array,
      required: true,
    },
  },
  components: {
    DataTable,
    Column,
    InputText,
  },
  setup(props, { emit }) {
    function onCellEditComplete(event: DataTableCellEditCompleteEvent) {
      emit("onCellEditComplete", event);
    }

    function deleteField(fieldid: string) {
      window.alert(`delete field ${fieldid}`);
      emit("deleteField", fieldid);
    }

    function editField(fieldid: string) {
      emit("editField", fieldid);
    }

    function onRowReorder(event: DataTableRowReorderEvent) {
      emit("onRowReorder", event);
    }

    return {
      onCellEditComplete,
      onRowReorder,
      props,
      editField,
      deleteField,
    };
  },
});
export default customFieldTable;
</script>
<template>
  <div class="field-table">
    <div class="p-fluid">
      <div class="card">
        <DataTable
          :loading="props.isLoading"
          :value="props.templateFields"
          editMode="cell"
          :reorderableColumns="true"
          @cell-edit-complete="onCellEditComplete($event)"
          @rowReorder="onRowReorder"
          class="editable-cells-table"
          responsiveLayout="scroll"
        >
          <!-- reorder column -->
          <Column
            :rowReorder="true"
            headerStyle="width: 2.5rem"
            :reorderableColumn="false"
            style="
              width: 40px;
              border-top: none;
              border-left: none;
              border-right: none;
            "
          />

          <Column
            v-for="col of props.columns"
            :field="col.field"
            :header="col.header"
            :key="col.field"
            style="
              width: 80px;
              border-top: none;
              border-left: none;
              border-right: none;
            "
          >
            <template>
              <InputText autofocus />
            </template>
          </Column>

          <!-- field info columns -->
          <Column
            v-for="col of props.editColumns"
            :field="col.field"
            :header="col.header"
            :key="col.field"
            style="
              width: 100px;
              border-top: none;
              border-left: none;
              border-right: none;
            "
          >
            <template #editor="{ data, field }">
              <InputText v-model="data[field]" autofocus />
            </template>
          </Column>

          <!-- delete column -->
          <Column
            style="border-top: none; border-left: none; border-right: none"
          >
            <template #body="{ data }">
              <span @click="editField(data.id)" class="pointer">
                <font-awesome-icon :icon="['fa', 'pen']" />
              </span>
            </template>
          </Column>

          <Column
            style="border-top: none; border-left: none; border-right: none"
          >
            <template #body="{ data }">
              <span @click="deleteField(data.id)" class="pointer">
                <font-awesome-icon :icon="['fa', 'trash-alt']" />
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import "../../assets/styles/global";

.field-table {
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.05) 10px 10px 20px;
}
::v-deep(.editable-cells-table td.p-cell-editing) {
  padding-top: 0;
  padding-bottom: 0;
}
</style>
