<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import Divider from "primevue/divider";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import fileUpload from "../../components/input/fileUpload.vue";
import Chips from "primevue/chips";
import RadioButton from "primevue/radiobutton";
import { useToast } from "primevue/usetoast";
import { AxiosError } from "axios";
import {
  IField,
  IFieldGroup,
  IFieldMenu,
  IFieldMenuItems,
  IFormTemplate,
} from "../../../cloudconLibrary/store/modules/formTemplateData/formTemplateDataModule";
import formTemplateDataAccess from "../../../cloudconLibrary/store/modules/formTemplateData/formTemplateDataAccess";
import useCookies from "../../../cloudconLibrary/utilities/useCookies";
import { cookieKeys } from "../../../cloudconLibrary/utilities/useConstants";
import {
  IRequestFormTemplateCreate,
  IRequestFormTemplateFieldCreate,
  IRequestFormTemplateUpdate,
} from "../../../cloudconLibrary/api/apiInterfaces";
import { useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import Button from "primevue/button";
import Sidebar from 'primevue/sidebar';
import FieldMenu from "./fieldMenu.vue";
import FieldTable from "./fieldTable.vue";
import FormTemplateFieldEdit from "./formTemplateFieldEdit.vue";
import {
  DataTableCellEditCompleteEvent,
  DataTableRowReorderEvent,
} from "primevue/datatable";
import { IFormTemplateGroup } from "../../../cloudconLibrary/store/modules/formTemplateData/formTemplateDataModule";
import { IFormTemplateField } from "../../../cloudconLibrary/store/modules/formTemplateData/formTemplateDataModule";
import { IRequestFormTemplateFieldUpdate } from "../../../cloudconLibrary/api/apiInterfaces";

/* eslint-disable */
export const AddFormTemplate = /*#__PURE__*/ defineComponent({
  name: "AddFormTemplate",
  components: {
    TabView,
    TabPanel,
    FieldMenu,
    FieldTable,
    FormTemplateFieldEdit,
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
  },
  setup() {
    const name = ref<string>();
    const prefix = ref<string>();
    const owner = ref<string>();
    const linkedto = ref<string>();
    const nextFormId = ref<string>();
    const version = ref<string>();
    const formTemplateGroup = ref<IFormTemplateGroup>();
    const notifyManagers = ref<string>();
    const autoarchivedays = ref<string>();
    const listColumns = ref<string>();
    const sortBy = ref<string>();
    const owners = ref([
      {
        id: 1,
        name: "csm tester123",
      },
      {
        id: 7,
        name: "Ashwin Nair",
      },
    ]);

    const linkedTables = ref([
      { name: "Plant", id: "plant" },
      { name: "Jobs", id: "jobs" },
      { name: "People", id: "people" },
    ]);

    const managers = ref([
      { name: "Cloudcon Pty Ltd", code: "cloudconptyltd" },
      { name: "Admin", code: "admin" },
    ]);

    const sortbyOptions = ref([
      {
        name: "Most Recent",
        code: "mostrecent",
      },
      {
        name: "Name",
        code: "name",
      },
      {
        name: "Old First",
        code: "oldfirst",
      },
      {
        name: "Priority",
        code: "priority",
      },
    ]);

    const section = ref({
      label: "Section",
      count: 1,
    });

    const fieldsData = computed<IField[]>(() => {
      return formTemplateDataAccess.getFields();
    });
    const fieldGroupsData = computed<IFieldGroup[]>(() => {
      return formTemplateDataAccess.getFieldGroups();
    });

    const formTemplateData = computed<IFormTemplate | null>(() => {
      return router.currentRoute.value.params.id
        ? formTemplateDataAccess.getFormTemplateById(formTemplateId.value)
        : null;
    });

    const formTemplateGroupsData = computed<IFormTemplateGroup[]>(() => {
      return formTemplateDataAccess.getFormTemplateGroups();
    });

    const items = computed<IFieldMenu[]>(() => {
      return mapFieldGroup();
    });

    const formTemplateFieldsData = computed<IFormTemplateField[]>(() => {
      const result =
        formTemplateDataAccess.getFormTemplateFieldsByFormTemplateId(
          formTemplateId.value
        );
      return result.sort((a, b) => a.position - b.position);
    });

    const editingRows = ref([]);
    const columns = ref([
      { field: "position", header: "Position" },
      { field: "field.name", header: "Type" },
      { field: "label", header: "Label" },
    ]);

    const editColumns = [{ field: "name", header: "Name" }];

    const toast = useToast();
    const is_loading = ref(true);
    const router = useRouter();
    const token = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);
    const tenants_id = useCookies.get(cookieKeys.TENANT_ID);
    const formTemplateId = computed<number>(() =>
      parseInt(router.currentRoute.value.params.id as string)
    );
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
        if (name.value == "" || name.value == null) {
          toast.add({
            severity: "error",
            summary: "Error Message",
            detail: "Form Template Name is Required",
            life: 10000,
          });
        } else {
          editTemplate_loading.value = true;
          if (router.currentRoute.value.params.id) {
            let requestFormTemplateUpdate: IRequestFormTemplateUpdate = {
              id: formTemplateId.value,
              name: name.value,
            };
            if (formTemplateGroup.value) {
              requestFormTemplateUpdate.formtemplategroupid =
                formTemplateGroup.value.id;
            }
            await formTemplateDataAccess.updateFormTemplate(
              parseInt(tenants_id),
              requestFormTemplateUpdate
            );

            toast.add({
              severity: "success",
              summary: "Success Message",
              detail: "Form Template Update Successfully",
              life: 10000,
            });

            editTemplate_loading.value = false;
          } else {
            editTemplate_loading.value = true;
            let requestFormTemplateCreate: IRequestFormTemplateCreate = {
              name: name.value,
            };
            if (formTemplateGroup.value) {
              requestFormTemplateCreate.formtemplategroupid =
                formTemplateGroup.value.id;
            }
            formTemplateDataAccess.createFormTemplate(
              parseInt(tenants_id),
              requestFormTemplateCreate
            );

            toast.add({
              severity: "success",
              summary: "Success Message",
              detail: "Form Template Add Successfully",
              life: 10000,
            });

            editTemplate_loading.value = false;

            router.push({
              path: "/formTemplates",
            });
          }
        }
      }
    }

    function cancel() {
      router.push({
        path: "/formTemplates",
      });
    }

    function mapFieldGroup() {
      let mappedFieldGroups: IFieldMenu[] = [];
      if (!fieldGroupsData.value || !fieldsData.value) {
        return mappedFieldGroups;
      }

      fieldGroupsData.value.forEach((g) => {
        let group: IFieldMenu = {
          key: g.id.toString(),
          label: g.name,
          items: [],
        };

        let fields: IField[] = g.fields;
        for (let i = 0; i < fields.length; i++) {
          let item: IFieldMenuItems = {
            key: g.id + "_" + fields[i].id,
            label: fields[i].name,
            command: () => {
              addField(fields[i].id);
            },
          };

          group.items.push(item);
        }

        mappedFieldGroups.push(group);
      });

      return mappedFieldGroups;
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
        if (formTemplateDataAccess.getFieldGroups.length == 0) {
          await formTemplateDataAccess.fetchFieldGroups(parseInt(tenants_id));
        }
        if (formTemplateDataAccess.getFields.length == 0) {
          await formTemplateDataAccess.fetchFields(parseInt(tenants_id));
        }

        if (formTemplateDataAccess.getFormTemplateGroups().length == 0) {
          await formTemplateDataAccess.fetchFormTemplateGroups(
            parseInt(tenants_id)
          );
        }
        if (router.currentRoute.value.params.id) {
          name.value = formTemplateData.value!.name;
          formTemplateGroup.value = formTemplateGroupsData.value.find(x => x.id == formTemplateData.value!.formTemplateGroup.id);

          if (
            formTemplateDataAccess.getFormTemplateFieldsByFormTemplateId(
              formTemplateId.value
            ).length == 0
          ) {
            await formTemplateDataAccess.fetchFormTemplateFields(
              parseInt(tenants_id)
            );
          }
        }
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

      console.log(`field edit complete >> ${field}`);

      switch (field) {
        default:
          if (newValue.trim().length > 0) data[field] = newValue;
          else (event as unknown as Event).preventDefault();
          break;
      }

      if (tenants_id) {
        fieldTable_loading.value = true;
        await formTemplateDataAccess.updateFormTemplateField(
          parseInt(tenants_id),
          data
        );
        fieldTable_loading.value = false;
      }
    }

    async function addField(fieldId: number) {
      console.log(`Added field <${fieldId}>`);
      const field = fieldsData.value.find((f) => f.id == fieldId);
      if (!field) {
        console.error("cannot find the field id: " + fieldId);
        return;
      }
      let newFormTemplateField: IRequestFormTemplateFieldCreate;

      if (router.currentRoute.value.params.id && formTemplateData.value) {
        newFormTemplateField = {
          name:
            formTemplateData.value.name
              .split(/\s/)
              .reduce((response, word) => (response += word.slice(0, 1)), "") +
            " " +
            field.fieldGroup.name +
            " " +
            (formTemplateFieldsData.value.length + 1),
          label: "CLD-" + (formTemplateFieldsData.value.length + 1),
          position: formTemplateFieldsData.value.length + 1,

          hidden: false,
          mandatory: false,
          options: "",
          onchange: "",
          status: 0,
          value: "",

          fieldId: fieldId,
          formTemplateId: parseInt(
            router.currentRoute.value.params.id as string
          ),
        };

        if (!tenants_id || !token) {
          router.push({
            path: "/login",
          });
          return;
        }
        try {
          fieldTable_loading.value = true;
          await formTemplateDataAccess.createFormTemplateField(
            parseInt(tenants_id),
            newFormTemplateField
          );
          fieldTable_loading.value = false;
        } catch (error) {
          toast.add({
            severity: "error",
            summary: "Error Message",
            detail: (error as AxiosError).response?.data.message,
            life: 10000,
          });
          formTemplateDataAccess.fetchFormTemplateFields(
            parseInt(tenants_id)
          );
        }
      }
    }

    const onRowReorder = async (event: DataTableRowReorderEvent) => {
      const requestUpdateFormTemplateField: IRequestFormTemplateFieldUpdate[] =
        (event.value as IFormTemplateField[]).map((formTemplateField, index) =>
          Object.assign({}, formTemplateField, { position: index + 1 })
        );
      try {
        if (!tenants_id) {
          return;
        }

        fieldTable_loading.value = true;
        await formTemplateDataAccess.updateMultipleFormTemplateFields(
          parseInt(tenants_id),
          requestUpdateFormTemplateField
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

    function editField(fieldid: number){
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
        await formTemplateDataAccess.deleteFormTemplateField(
          parseInt(tenants_id),
          fieldid
        );

        const requestUpdateFormTemplateField: IRequestFormTemplateFieldUpdate[] =
        (formTemplateFieldsData.value).map((formTemplateField, index) =>
          Object.assign({}, formTemplateField, { position: index + 1 })
        );

        await formTemplateDataAccess.updateMultipleFormTemplateFields(
          parseInt(tenants_id),
          requestUpdateFormTemplateField
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
    }

    function closeFormTemplateEdit() {
      setTimeout(() => {
        showFormTemplateFieldEdit.value = false;
      }, 200);
    }

    return {
      name,
      prefix,
      owner,
      owners,
      linkedto,
      linkedTables,
      nextFormId,
      version,
      formTemplateGroup,
      formTemplateGroupsData,
      formTemplateFieldsData,
      notifyManagers,
      managers,
      autoarchivedays,
      listColumns,
      sortBy,
      sortbyOptions,
      section,
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
      formTemplateData,
      showFormTemplateFieldEdit,
      closeFormTemplateEdit,
      formtemplateFieldId
    };
  },
});
export default AddFormTemplate;
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="p-text-center" v-if="is_loading && $route.params.id">
      <ProgressSpinner />
    </div>
    <div v-else>
      <section class="page-header">
        <h2 class="page-hedaer-title">
          {{ $route.params.id ? "Update " + formTemplateData?.name: "Add New"}}
        </h2>
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

      <section class="people-form-wrapper" v-if="!$route.params.id">
        <form>
          <div>
            <h5 class="my-2">Info</h5>
            <div class="p-grid pt-4">
              <div class="p-col-12 p-lg-6">
                <span class="p-float-label">
                  <InputText class="cm-input" id="name" v-model="name" />
                  <label for="name">Name</label>
                </span>
              </div>
            </div>
          </div>
        </form>
      </section>

      <div v-else>
        <div class="datatable-wrapper">
          <div class="datatable-tabs-container">
            <TabView class="module-edit-zone">
              <TabPanel>
                <template
                  #header
                  class="datatable-tab is-flex is-align-items-center pointer"
                >
                  <span class="datatable-tab-label">Info</span>
                  <span class="datatable-tab-label-count">4</span>
                </template>
                <section class="people-form-wrapper">
                  <form>
                    <div>
                      <h5 class="my-2">Info</h5>
                      <div class="p-grid pt-4">
                        <div class="p-col-12 p-lg-6">
                          <span class="p-float-label">
                            <InputText class="cm-input" id="name" v-model="name" />
                            <label for="name">Name</label>
                          </span>
                        </div>
                        <div class="p-col-12 p-lg-6">
                          <span class="p-float-label">
                            <InputText class="cm-input" id="prefix" v-model="prefix" />
                            <label for="prefix">Prefix</label>
                          </span>
                        </div>
                        <div class="p-col-12 p-lg-6">
                          <div class="p-float-label">
                            <Dropdown
                              v-model="owner"
                              inputId="owner"
                              :options="owners"
                              optionLabel="name"
                              placeholder="Onwer"
                              class="cm-dropdown"
                            />
                            <label for="owner">Owner</label>
                          </div>
                        </div>
                        <div class="p-col-12 p-lg-6">
                          <div class="p-float-label">
                            <Dropdown
                              v-model="linkedto"
                              inputId="linkedto"
                              :options="linkedTables"
                              optionLabel="linkedto"
                              placeholder="Linked To"
                              class="cm-dropdown"
                            />
                            <label for="linkedto">Linked To</label>
                          </div>
                        </div>
                        <div class="p-col-12 p-lg-6">
                          <span class="p-float-label">
                            <InputText
                              class="cm-input"
                              id="nextFormId"
                              v-model="nextFormId"
                            />
                            <label for="nextFormId">Next Form ID</label>
                          </span>
                        </div>
                        <div class="p-col-12 p-lg-6">
                          <span class="p-float-label">
                            <InputText
                              class="cm-input"
                              id="version"
                              v-model="version"
                            />
                            <label for="version">Version</label>
                          </span>
                        </div>
                      </div>
                    </div>
                    <Divider />
                    <div>
                      <h5 class="my-2">Template Group</h5>
                      <div class="p-grid pt-4">
                        <div class="p-col-12 p-lg-6">
                          <div class="p-float-label">
                            <Dropdown
                              v-model="formTemplateGroup"
                              inputId="float-formTemplateGroup"
                              :options="formTemplateGroupsData"
                              optionLabel="name"
                              placeholder="Template Group"
                              class="cm-dropdown"
                            />
                            <label for="float-formTemplateGroup">Template Group</label>
                          </div>
                        </div>
                        <div class="p-col-12 p-lg-6">
                          <div class="p-float-label">
                            <Dropdown
                              v-model="notifyManagers"
                              inputId="notifyManagers"
                              :options="managers"
                              optionLabel="notifyManagers"
                              placeholder="Notify Managers"
                              class="cm-dropdown"
                            />
                            <label for="notifyManagers">Notify Managers</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Divider />
                    <div>
                      <h5 class="my-2">Auto Archive</h5>
                      <div class="p-grid pt-4">
                        <div class="p-col-12 p-lg-6">
                          <span class="p-float-label">
                            <InputText
                              class="cm-input"
                              id="autoarchivedays"
                              v-model="autoarchivedays"
                            />
                            <label for="autoarchivedays">Archive after nb days</label>
                          </span>
                        </div>
                      </div>
                    </div>
                    <Divider />
                    <div>
                      <h5 class="my-2">Display Columns</h5>
                      <div class="p-grid pt-4">
                        <div class="p-col-12 p-lg-6">
                          <div class="p-float-label">
                            <Dropdown
                              v-model="listColumns"
                              inputId="listColumns"
                              :options="formTemplateFieldsData"
                              optionLabel="listColumns"
                              placeholder="List Columns"
                              class="cm-dropdown"
                            />
                            <label for="listColumns">List Columns</label>
                          </div>
                        </div>
                        <div class="p-col-12 p-lg-6">
                          <div class="p-float-label">
                            <Dropdown
                              v-model="sortBy"
                              inputId="sortBy"
                              :options="sortbyOptions"
                              optionLabel="name"
                              placeholder="Sort By"
                              class="cm-dropdown"
                            />
                            <label for="sortBy">Sort By</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </section>
              </TabPanel>

              <TabPanel>
                <template
                  #header
                  class="datatable-tab is-flex is-align-items-center pointer"
                >
                  <span class="datatable-tab-label">Fields</span>
                  <span class="datatable-tab-label-count">{{ formTemplateFieldsData.length }}</span>
                </template>
                <section>
                  <div class="field-body">
                    <div class="field-menu-container">
                      <FieldMenu :fieldGroups="items" />
                    </div>
                    <div class="field-table-container">
                      <FieldTable
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
  <FormTemplateFieldEdit
    v-if="showFormTemplateFieldEdit"
    :form-Template-Field-Id="formtemplateFieldId"
    @closeFormTemplateEdit="closeFormTemplateEdit"
  ></FormTemplateFieldEdit>
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
