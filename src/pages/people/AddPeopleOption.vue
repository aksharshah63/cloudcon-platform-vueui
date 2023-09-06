<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import Divider from "primevue/divider";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import fileUpload from "../../components/input/fileUpload.vue";
import Chips from "primevue/chips";
import RadioButton from "primevue/radiobutton";
import { useToast } from "primevue/usetoast";
import { AxiosError } from "axios";
import {
  IFieldMenu,
  IFieldMenuItems,
} from "../../../cloudconLibrary/store/modules/formTemplateData/formTemplateDataModule";
import customFieldDataAccess from "../../../cloudconLibrary/store/modules/customFieldData/customFieldDataAccess";
import useCookies from "../../../cloudconLibrary/utilities/useCookies";
import { cookieKeys } from "../../../cloudconLibrary/utilities/useConstants";
import {
  IRequestCustomFieldCreate,
  IRequestCustomFieldUpdate,
} from "../../../cloudconLibrary/api/apiInterfaces";
import { useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import Button from "primevue/button";
import Sidebar from "primevue/sidebar";
import MenuSidebar from "@/components/sidebar/MenuSidebar.vue";
import customFieldMenu from "../customField/customFieldMenu.vue";
import customFieldTable from "../customField/customFieldTable.vue";
import cutomFieldEdit from "../customField/customFieldEdit.vue";
import {
  DataTableCellEditCompleteEvent,
  DataTableRowReorderEvent,
} from "primevue/datatable";
import { ICustomField } from "../../../cloudconLibrary/store/modules/customFieldData/customFieldDataModule";
import customFieldController from "../../controllers/customFieldController";
import { customFields } from "../../controllers/customfield";

/* eslint-disable */
export const AddFormTemplate = /*#__PURE__*/ defineComponent({
  name: "AddFormTemplate",
  components: {
    TabView,
    TabPanel,
    customFieldMenu,
    customFieldTable,
    cutomFieldEdit,
    InputText,
    Checkbox,
    Divider,
    Textarea,
    Dropdown,
    fileUpload,
    Chips,
    RadioButton,
    ProgressSpinner,
    Button,
    Sidebar,
    MenuSidebar,
  },
  setup() {
    const { customField } = customFields;
    const formTemplateFieldsData = ref<ICustomField[]>([]);
    const controllers = customFieldController();

    const items = computed<IFieldMenu[]>(() => {
      return mapFieldGroup();
    });

    const editingRows = ref([]);
    const columns = ref([
      { field: "name", header: "Label" },
      { field: "position", header: "Position" },
      { field: "type", header: "Type" },
    ]);

    const editColumns = [{ field: "label", header: "Name" }];

    const toast = useToast();
    const is_loading = ref(true);
    const router = useRouter();
    const token = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);
    const tenants_id = useCookies.get(cookieKeys.TENANT_ID);
    const formtemplateFieldId = ref();
    const fieldTable_loading = ref(false);
    const editTemplate_loading = ref(false);

    const showFormTemplateFieldEdit = ref(false);

    async function add() {
      if (!tenants_id || !token) {
        {
          router.push({
            path: "/login",
          });
          return;
        }
      } else {
        toast.add({
          severity: "success",
          summary: "Success Message",
          detail: "Custom Field Add Successfully",
          life: 10000,
        });

        router.push({
          path: "/peopleOption",
        });
      }
    }

    function cancel() {
      router.push({
        path: "/peopleOption",
      });
    }

    function mapFieldGroup() {
      let fields: any = [];

      customField.forEach((data: any) => {
        let item: IFieldMenuItems = {
          key: data.key,
          label: data.label,
          command: () => {
            addField(data.key);
          },
        };

        fields.push(item);
      });

      return fields;
    }

    onMounted(async () => {
      if (!tenants_id || !token) {
        router.push({
          path: "/login",
        });
        return;
      }

      // fieldTableData.value = json.data;

      is_loading.value = true;
      try {
        const data = await controllers.getcustomfieldbyentity("contacts");
        formTemplateFieldsData.value = data.data;
        formTemplateFieldsData.value = formTemplateFieldsData.value.sort(
          function (a, b) {
            return a.position! - b.position!;
          }
        );
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error Message",
          detail: (error as AxiosError).response?.data.message,
          life: 10000,
        });
      }

      is_loading.value = false;
    });

    async function onCellEditComplete(event: DataTableCellEditCompleteEvent) {
      let { data, newValue, field } = event;

      console.log("data", data);

      switch (field) {
        default:
          if (newValue.trim().length > 0) data[field] = newValue;
          else (event as unknown as Event).preventDefault();
          break;
      }
      const _updatedata = {
        entity: "contacts",
        id: data.id,
        // name: data.label,
        label: data.label,
        position: data.position,
        // options: copyformTemplateFieldData.value.options,
        type: data.type,
      };
      if (tenants_id) {
        fieldTable_loading.value = true;
        await customFieldDataAccess.updateCustomField(
          parseInt(tenants_id),
          _updatedata as IRequestCustomFieldUpdate
        );
        fieldTable_loading.value = false;
      }
    }

    async function addField(fieldId: string) {
      console.log(`Added field <${fieldId}>`);
      let newFormTemplateField: IRequestCustomFieldCreate;

      newFormTemplateField = {
        name: fieldId + "-" + (formTemplateFieldsData.value.length + 1),

        entity: "contacts",
        type: fieldId,
        label: "CLD-" + (formTemplateFieldsData.value.length + 1),
        position: formTemplateFieldsData.value.length + 1,

        hidden: false,
        mandatory: false,
        options: "",
        onchange: "",
        status: 0,
        value: "",
      };

      if (!tenants_id || !token) {
        router.push({
          path: "/login",
        });
        return;
      }
      try {
        fieldTable_loading.value = true;
        controllers
          .addcustomfield(parseInt(tenants_id), newFormTemplateField)
          .then(() => {
            toast.add({
              severity: "success",
              summary: "Success Message",
              detail: "Custom Field Add Successfully",
              life: 10000,
            });
            fieldTable_loading.value = false;
          })
          .finally(async () => {
            await customFieldDataAccess.getCustomFieldsByEntity("contacts");
            formTemplateFieldsData.value =
              await customFieldDataAccess.getCustomFieldsForTable();
          });
      } catch (error: any) {
        if (error.message.InvalidField) {
          toast.add({
            severity: "error",
            summary: "Error Message",
            detail: error.message.InvalidField[0],
            life: 10000,
          });
        }
      }
    }

    const onRowReorder = async (event: DataTableRowReorderEvent) => {
      const requestUpdateCustomField: IRequestCustomFieldUpdate[] = (
        event.value as ICustomField[]
      ).map((formTemplateField, index) =>
        Object.assign({}, formTemplateField, { position: index + 1 })
      );
      try {
        if (!tenants_id) {
          return;
        }

        fieldTable_loading.value = true;
        await customFieldDataAccess.updateMultipleCustomFields(
          parseInt(tenants_id),
          requestUpdateCustomField
        );

        fieldTable_loading.value = false;
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error Message",
          detail: (error as AxiosError).response?.data.message,
          life: 10000,
        });
      }
    };

    function editField(fieldid: number) {
      showFormTemplateFieldEdit.value = true;
      formtemplateFieldId.value = fieldid;
      console.log(`field id: ${fieldid}`);
      console.log(`show edit pane: ${showFormTemplateFieldEdit.value}`);
    }

    async function deleteField(fieldid: number) {
      console.log(`Delete field ${fieldid}`);
      try {
        if (!tenants_id) {
          return;
        }

        fieldTable_loading.value = true;

        controllers
          .deletecustomfield(parseInt(tenants_id), fieldid)
          .then(() => {
            toast.add({
              severity: "success",
              summary: "Success Message",
              detail: "Custom Field Delete Successfully",
              life: 10000,
            });
            fieldTable_loading.value = false;
          })
          .finally(async () => {
            await customFieldDataAccess.getCustomFieldsByEntity("contacts");
            formTemplateFieldsData.value =
              await customFieldDataAccess.getCustomFieldsForTable();
          });

        // const requestUpdateCustomField: IRequestCustomFieldUpdate[] =
        //   formTemplateFieldsData.value.map((formTemplateField, index) =>
        //     Object.assign({}, formTemplateField, { position: index + 1 })
        //   );

        // await customFieldDataAccess.updateMultipleCustomFields(
        //   parseInt(tenants_id),
        //   requestUpdateCustomField
        // );

        fieldTable_loading.value = false;
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error Message",
          detail: (error as AxiosError).response?.data.message,
          life: 10000,
        });
      }
    }

    function closeFormTemplateEdit() {
      setTimeout(() => {
        showFormTemplateFieldEdit.value = false;
      }, 200);
    }

    return {
      formTemplateFieldsData,
      items,
      fieldTable_loading,
      editTemplate_loading,
      editingRows,
      columns,
      editColumns,
      onCellEditComplete,
      onRowReorder,
      editField,
      deleteField,
      add,
      cancel,
      is_loading,
      showFormTemplateFieldEdit,
      closeFormTemplateEdit,
      formtemplateFieldId,
      customField,
    };
  },
});
export default AddFormTemplate;
</script>

<template>
  <MenuSidebar panel="people" />
  <div class="dashboard-wrapper">
    <div class="p-text-center" v-if="is_loading && $route.params.id">
      <ProgressSpinner />
    </div>
    <div v-else>
      <section class="page-header">
        <h2 class="page-hedaer-title">Add New People Custom Field</h2>
        <div class="header-btn-wrapper">
          <Button
            type="button"
            label="create"
            class="btn btn-primary mr-3"
            :loading="editTemplate_loading"
            @click="add"
            v-if="!$route.params.id"
          />
          <Button
            type="button"
            label="update"
            class="btn btn-primary mr-3"
            :loading="editTemplate_loading"
            @click="add()"
            v-else
          />
          <button class="btn btn-primary-outline" @click="$router.go(-1)">
            Cancel
          </button>
        </div>
      </section>
      <div>
        <div class="datatable-wrapper">
          <div class="datatable-tabs-container">
            <TabView class="module-edit-zone">
              <TabPanel>
                <template
                  #header
                  class="datatable-tab is-flex is-align-items-center pointer"
                >
                  <span class="datatable-tab-label">Fields</span>
                  <span class="datatable-tab-label-count">{{
                    formTemplateFieldsData.length
                  }}</span>
                </template>
                <section>
                  <!-- {{ items }} -->
                  <div class="field-body">
                    <div class="field-menu-container">
                      <customFieldMenu :fieldGroups="items" />
                    </div>
                    <div class="field-table-container">
                      <customFieldTable
                        :isLoading="fieldTable_loading"
                        :templateFields="formTemplateFieldsData"
                        :editingRows="editingRows"
                        :columns="columns"
                        :editColumns="editColumns"
                        @onCellEditComplete="onCellEditComplete"
                        @editField="editField"
                        @deleteField="deleteField"
                        @onRowReorder="onRowReorder"
                      />
                    </div>
                  </div>
                </section>
              </TabPanel>
            </TabView>
          </div>
        </div>
      </div>
    </div>
  </div>
  <cutomFieldEdit
    v-if="showFormTemplateFieldEdit"
    :form-Template-Field-Id="formtemplateFieldId"
    @closeFormTemplateEdit="closeFormTemplateEdit"
  ></cutomFieldEdit>
</template>

<style lang="scss" scoped>
.module-edit-zone {
  width: 750px;
  padding: 0;
}
.p-tabview-panel {
  width: 800px;
}
.page-header {
  max-width: 750px;
}
.people-form-wrapper {
  padding: 40px;
  background-color: $white;
  border-radius: 15px;
  max-width: 750px;
  .cm-input,
  .cm-textarea,
  .cm-dropdown,
  .cm-chips {
    width: 100%;
  }
  .cm-label {
    font-size: 12px;
    line-height: 16px;
    color: $grey3;
    margin-bottom: 5px;
    display: inline-block;
  }
  .check-label {
    font-size: 12px;
    line-height: 16px;
    color: $grey3;
  }

  .radio-label {
    font-size: 14px;
    line-height: 20px;
    color: $grey9;
    display: inline-block;
  }
  .p-divider {
    &.p-divider-horizontal {
      margin: 40px 0;
    }
  }
  .lock-icon {
    color: $grey3;
    font-size: 14px;
    cursor: pointer;
  }
  .people-add-social {
    .p-col {
      flex-grow: 0;
    }
    .outline-icon-btn {
      padding: 12px;
      .p-inputtext {
        border: none;
        flex-grow: 1;
        padding: 0;
        &:focus {
          box-shadow: none;
        }
      }
    }
  }
  ::v-deep(.p-checkbox) {
    width: 14px;
    height: 14px;
    .p-checkbox-box {
      width: 14px;
      height: 14px;
      border-color: $grey6;
      .p-checkbox-icon {
        font-size: 9px;
      }
    }
  }
}

.datatable-wrapper {
  .datatable-tabs-container {
    .p-tabview-nav-content {
      ul {
        li {
          margin-right: 0;
          .p-tabview-nav-link {
            &:not(.p-disabled):focus {
              box-shadow: none;
            }
            border-top-left-radius: var(--datatable-tabs-border-radius);
            border-top-right-radius: var(--datatable-tabs-border-radius);
            padding: var(--datatable-tabs-padding);
            border: none;
            font-size: var(--datatable-tabs-label-font-size);
            font-weight: var(--datatable-tabs-label-font-weight);
            line-height: var(--datatable-tabs-label-font-size);
            color: var(--datatable-tabs-label-font-colour);
            text-transform: uppercase;
            .datatable-tab-label-count {
              font-size: 12px;
              line-height: 16px;
              color: $grey9;
              padding: 2px 8px;
              background: $white;
              border-radius: 8px;
              margin-left: 8px;
              font-weight: 400;
            }
          }

          &.p-highlight {
            .p-tabview-nav-link {
              background-color: var(
                --datatable-tabs-selected-tab-background-colour
              );
              .datatable-tab-label-count {
                background: var(--grey-2000);
              }
            }
          }
        }
      }
    }
    ::v-deep(.p-tabview-panels) {
      padding: 0;
      background: var(--datatable-container-background-colour);
      border-radius: var(--datatable-container-border-radius);
      border-top-left-radius: 0;
      border: none;
    }
  }
}

.field-body {
  padding: 10px 20px;
}

.field-menu-container {
  width: 200px;
  padding: 15px 0;
}

.field-table-container {
  padding: 0 15px;
}
</style>
