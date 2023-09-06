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
import { IFormTemplateGroup } from "../../../cloudconLibrary/store/modules/formTemplateData/formTemplateDataModule";
import formTemplateDataAccess from "../../../cloudconLibrary/store/modules/formTemplateData/formTemplateDataAccess";
import useCookies from "../../../cloudconLibrary/utilities/useCookies";
import { cookieKeys } from "../../../cloudconLibrary/utilities/useConstants";
import {
  IRequestFormTemplateGroupCreate,
  IRequestFormTemplateGroupUpdate,
} from "../../../cloudconLibrary/api/apiInterfaces";
import { useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import Button from "primevue/button";
import FieldMenu from "./fieldMenu.vue";
import FieldTable from "./fieldTable.vue";

/* eslint-disable */
export const AddFormTemplateGroup = /*#__PURE__*/ defineComponent({
  name: "AddFormTemplateGroup",
  components: {
    TabView,
    TabPanel,
    FieldMenu,
    FieldTable,
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
  },
  setup() {
    const name = ref<string>();
    const rank = ref<number>();
    const version = ref<string>();
    const icon = ref<string>();
    // const formTemplateGroup = ref<IFormTemplateGroup>();

    const formTemplateGroup = computed<IFormTemplateGroup | null>(() => {
      return router.currentRoute.value.params.id
        ? formTemplateDataAccess.getFormTemplateGroupById(formTemplateGroupId.value)
        : null;
    });

    const toast = useToast();
    const is_loading = ref(true);
    const router = useRouter();
    const token = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);
    const tenants_id = useCookies.get(cookieKeys.TENANT_ID);
    const formTemplateGroupId = computed<number>(() =>
      parseInt(router.currentRoute.value.params.id as string)
    );
    const editTemplateGroup_loading = ref(false);

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
            detail: "Form Template Group Name is Required",
            life: 10000,
          });
        } else {
          editTemplateGroup_loading.value = true;
          if (router.currentRoute.value.params.id) {
            let requestFormTemplateGroupUpdate: IRequestFormTemplateGroupUpdate = {
              id: formTemplateGroupId.value,
              name: name.value,
            };
            await formTemplateDataAccess.updateFormTemplateGroup(
              parseInt(tenants_id),
              requestFormTemplateGroupUpdate
            );

            toast.add({
              severity: "success",
              summary: "Success Message",
              detail: "Form Template Group Update Successfully",
              life: 10000,
            });

            editTemplateGroup_loading.value = false;
          } else {
            editTemplateGroup_loading.value = true;
            let requestFormTemplateGroupCreate: IRequestFormTemplateGroupCreate = {
              name: name.value,
            };
            formTemplateDataAccess.createFormTemplateGroup(
              parseInt(tenants_id),
              requestFormTemplateGroupCreate
            );

            toast.add({
              severity: "success",
              summary: "Success Message",
              detail: "Form Template Group Add Successfully",
              life: 10000,
            });

            editTemplateGroup_loading.value = false;

            router.push({
              path: "/formTemplates/groups",
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

    onMounted(async () => {
      if (!tenants_id || !token) {
        router.push({
          path: "/login",
        });
        return;
      }

      is_loading.value = true;
      try {
        if (formTemplateDataAccess.getFormTemplateGroups().length == 0) {
          await formTemplateDataAccess.fetchFormTemplateGroups(
            parseInt(tenants_id)
          );
        }
        if (router.currentRoute.value.params.id) {
          name.value = formTemplateGroup.value!.name;

          if (
            formTemplateDataAccess.getFormTemplateFieldsByFormTemplateId(
              formTemplateGroupId.value
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

    return {
      name,
      rank,
      version,
      icon,
      editTemplateGroup_loading,
      add,
      cancel,
      is_loading,
      formTemplateGroup,
    };
  },
});
export default AddFormTemplateGroup;
</script>

<template>
  <div class="dashboard-wrapper">
    <div class="p-text-center" v-if="is_loading && $route.params.id">
      <ProgressSpinner />
    </div>
    <div v-else>
      <section class="page-header">
        <h2 class="page-hedaer-title">
          {{ $route.params.id ? "Update " + formTemplateGroup?.name: "Add New"}}
        </h2>
        <div class="header-btn-wrapper">
          <Button
            type="button"
            label="create"
            class="btn btn-primary mr-3"
            :loading="editTemplateGroup_loading"
            @click="add"
            v-if="!$route.params.id"
          />
          <Button
            type="button"
            label="update"
            class="btn btn-primary mr-3"
            :loading="editTemplateGroup_loading"
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
                            <InputText class="cm-input" id="rank" v-model="rank" />
                            <label for="rank">Rank</label>
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
                        <div class="p-col-12 p-lg-6">
                          <span class="p-float-label">
                            <InputText
                              class="cm-input"
                              id="icon"
                              v-model="icon"
                            />
                            <label for="icon">Icon</label>
                          </span>
                        </div>
                      </div>
                    </div>
                  </form>
                </section>
              </TabPanel>

              <!-- <TabPanel>
                <template
                  #header
                  class="datatable-tab is-flex is-align-items-center pointer"
                >
                  <span class="datatable-tab-label">More</span>
                  <span class="datatable-tab-label-count">10</span>
                </template>
              </TabPanel> -->
            </TabView>
          </div>
        </div>

      </div>
    </div>
  </div>
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
