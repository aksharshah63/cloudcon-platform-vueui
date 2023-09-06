<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import SubHeaderAction from "../../components/header/SubHeaderAction.vue";
import Divider from "primevue/divider";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import useCookies from "../../../cloudconLibrary/utilities/useCookies";
import { cookieKeys } from "../../../cloudconLibrary/utilities/useConstants";
import ProgressSpinner from "primevue/progressspinner";
import Image from "primevue/image";
import MenuSidebar from "@/components/sidebar/MenuSidebar.vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import formTemplateDataAccess from "../../../cloudconLibrary/store/modules/formTemplateData/formTemplateDataAccess";
import { AxiosError } from "axios";
import { IFormTemplateGroup } from "cloudconLibrary/store/modules/formTemplateData/formTemplateDataModule";

/* eslint-disable */
export const formTemplateGroupView = /*#__PURE__*/ defineComponent({
  name: "formTemplateGroupView",
  components: {
    SubHeaderAction,
    TabView,
    TabPanel,
    Divider,
    Button,
    DataTable,
    Column,
    ProgressSpinner,
    Image,
    MenuSidebar,
  },
  setup() {
    const toast = useToast();
    const router = useRouter();
    const route = useRoute();

    const token: any = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);
    const tenants_id: any = useCookies.get(cookieKeys.TENANT_ID);
    const is_loading: any = ref(true);

    const formTemplateGroupId = parseInt(route.params.id as string);

    const formTemplateGroup = ref<IFormTemplateGroup>();

    onMounted(async () => {
      try {
        is_loading.value = true;
        await getFormTemplateGroup();
        is_loading.value = false;
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error Message",
          detail: (error as AxiosError).response?.data.message,
          life: 10000,
        });
      }
    });

    async function getFormTemplateGroup() {
      if (token && tenants_id) {
        formTemplateGroup.value =
          formTemplateDataAccess.getFormTemplateGroupById(formTemplateGroupId);
      } else {
        router.push({
          path: "/login",
        });
      }
    }

    async function deleteFormTemplateGroup(id: number) {
      if (confirm("Are you sure to delete this form template group?")) {
        if (token && tenants_id) {
          try {
            await formTemplateDataAccess.deleteFormTemplateGroup(
              parseInt(tenants_id),
              id
            );
            toast.add({
              severity: "success",
              summary: "Success Message",
              detail: "Form Template Group Successfully Deleted",
              life: 10000,
            });
            router.push({
              path: "/formTemplates",
            });
          } catch (error) {
            toast.add({
              severity: "error",
              summary: "Error Message",
              detail: (error as AxiosError).response?.data.message,
              life: 10000,
            });
          }
        } else {
          router.push({
            path: "/login",
          });
        }
      }
    }

    return {
      deleteFormTemplateGroup,
      is_loading,
      formTemplateGroup,
    };
  },
});
export default formTemplateGroupView;
</script>

<template>
  <MenuSidebar panel="form_template" />
  <div class="dashboard-wrapper">
    <section>
      <div class="p-text-center" v-if="is_loading">
        <ProgressSpinner />
      </div>
      <div v-else>
        <SubHeaderAction>
          <template v-slot:actionsLeft>
            <div>{{ formTemplateGroup?.name }}</div>
          </template>

          <template v-slot:actionsRight>
            <router-link
              class="action"
              v-tooltip.top="'Edit'"
              :to="'/formTemplates/groups/edit' + '/' + $route.params.id"
            >
              <font-awesome-icon
                class="action-icon"
                :class="'edit-icon'"
                :icon="['fa', 'pen']"
              />
            </router-link>
            <div
              class="action"
              v-tooltip.top="'Delete'"
              @click="deleteFormTemplateGroup(Number($route.params.id))"
            >
              <font-awesome-icon
                class="action-icon"
                :class="'delete-icon'"
                :icon="['fa', 'trash']"
              />
            </div>
            <div class="action" v-tooltip.top="'View More'">
              <font-awesome-icon
                class="action-icon"
                :class="'more-icon'"
                :icon="['fa', 'ellipsis-v']"
              />
            </div>
          </template>
        </SubHeaderAction>

        <div class="datatable-wrapper">
          <div class="datatable-tabs-container">
            <TabView>
              <TabPanel>
                <template
                  #header
                  class="datatable-tab is-flex is-align-items-center pointer"
                >
                  <span class="datatable-tab-label">Info</span>
                  <span class="datatable-tab-label-count">1</span>
                </template>
                <div class="people-view-container">
                  <div class="p-grid">
                    <div class="p-col-12">
                      <div class="people-view-box">
                        <h6 class="people-view-title">Info</h6>
                        <div class="p-grid">
                          <div class="p-col-12 p-lg-3 people-view-fields">
                            <p class="people-view-field-name">Name</p>
                            <p class="people-view-field-data">
                              {{ formTemplateGroup?.name }}
                            </p>
                          </div>
                          <div class="p-col-12 p-lg-3 people-view-fields">
                            <p class="people-view-field-name">Rank</p>
                            <p class="people-view-field-data"></p>
                          </div>
                          <div class="p-col-12 p-lg-3 people-view-fields">
                            <p class="people-view-field-name">Version</p>
                            <p class="people-view-field-data"></p>
                          </div>
                          <div class="p-col-12 p-lg-3 people-view-fields">
                            <p class="people-view-field-name">Icon</p>
                            <p class="people-view-field-data"></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>

              <TabPanel>
                <template
                  #header
                  class="datatable-tab is-flex is-align-items-center pointer"
                >
                  <span class="datatable-tab-label">Form Template</span>
                  <span class="datatable-tab-label-count">{{
                    formTemplateGroup?.formTemplates.length
                  }}</span>
                </template>
                <div
                  class="people-view-container"
                  v-if="formTemplateGroup?.formTemplates.length === 0"
                >
                  No Templates
                </div>
                <DataTable
                  v-else
                  :value="formTemplateGroup?.formTemplates"
                  class="p-col-12"
                >
                  <Column field="name" header="Name">
                    <template #body="{ data }">
                      {{ data.name }}
                    </template>
                  </Column>
                  <Column field="action" header="Action" style="width: 3rem">
                    <template #body="{ data }">
                      <router-link
                        :to="{
                          name: 'FormTemplateView',
                          params: { id: data.id },
                        }"
                        class="datatable-router-link"
                      >
                        <font-awesome-icon :icon="['fa', 'pen']" />
                      </router-link>
                    </template>
                  </Column>
                </DataTable>
              </TabPanel>
            </TabView>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.people-view-container {
  background: $white;
  border-radius: 15px;
  padding: 32px;
  .people-view-title {
    color: $blue;
    font-weight: 600;
    font-size: 18px;
    line-height: 120%;
    margin-bottom: 26px;
    &.people-bank-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .lock-icon {
        color: $grey3;
        font-size: 14px;
        cursor: pointer;
      }
    }
  }
  .people-view-fields {
    margin-bottom: 24px;
    &:last-child {
      margin-bottom: 0;
    }
    .people-view-field-name {
      font-size: 12px;
      line-height: 16px;
      color: $grey6;
      margin-bottom: 5px;
    }
    .people-view-field-data {
      font-size: 14px;
      line-height: 20px;
      color: $grey3;
    }
    .copy-icon {
      color: $blue;
      margin-left: 10px;
      cursor: pointer;
    }
  }
  .p-divider {
    &.p-divider-horizontal {
      margin: 24px 0;
      &:before {
        border-color: $grey;
      }
    }
  }
  .people-view-form-box {
    .people-view-title {
      color: $grey3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .show-more-form {
        font-weight: 500;
        font-size: 12px;
        line-height: 100%;
        color: $blue;
        cursor: pointer;
      }
    }

    .people-view-form {
      flex-basis: 20%;
    }
    .outline-icon-btn {
      margin-right: 0 !important;
      padding: 12px 20px;
      justify-content: space-between;
      width: 100%;
      .form-icon {
        margin-right: 10px;
        color: $blue;
      }
      .form-count {
        font-size: 12px;
        line-height: 16px;
        color: $grey6;
      }
    }
  }
}
.actions-list {
  .people-subtitle {
    font-size: 12px;
    line-height: 16px;
    color: $blue;
  }
}

.pagination {
  justify-content: flex-end !important;
  .page-stats {
    align-items: center;
    margin-right: 5px;
  }
  i {
    color: #3273dc !important;
  }
}

.datatable-action-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  width: 30%;
  margin-left: auto;
  position: relative;
  bottom: -40px;
  right: -70%;
  z-index: 3;

  .datable-view-search {
    margin-right: 10px;
  }

  .datatable-view-filter-button {
    gap: var(--datatable-filer-button-gap);
    border-radius: var(--datatable-filer-button-border-radius);
    border: var(--datatable-filer-button-border);
    padding: var(--datatable-filer-button-padding);
    height: fit-content;
    background: var(--datatable-filer-button-background-colour);
    margin-right: 10px;

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
  .datatable-select-length {
    .select {
      height: auto;
      &:not(.is-multiple):not(.is-loading)::after {
        right: 10px;
        border-color: var(--datatable-filter-button-icon-colour);
        width: 8px;
        height: 8px;
        margin-top: -5px;
      }
      select {
        gap: var(--datatable-filer-button-gap);
        border-radius: var(--datatable-filer-button-border-radius);
        border: var(--datatable-filer-button-border);
        padding: 8px 24px 8px 8px;
        height: fit-content;
        background: var(--datatable-filer-button-background-colour);

        font-weight: var(--datatable-filter-button-label-font-weight);
        font-size: var(--datatable-filter-button-label-font-size);
        line-height: var(--datatable-filter-button-label-font-size);
        color: var(--datatable-filter-button-label-font-colour);
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

::v-deep(.p-datatable) {
  margin: 0;
}

.people-datatable {
  .p-datatable-thead > tr {
    > th {
      &:nth-child(2) {
        min-width: 250px;
      }
      &:nth-child(3) {
        min-width: 200px;
      }
      &:nth-child(4) {
        min-width: 120px;
      }
      &:nth-child(5) {
        min-width: 220px;
      }
      &:nth-child(6) {
        min-width: 150px;
      }
    }
  }
}
</style>
