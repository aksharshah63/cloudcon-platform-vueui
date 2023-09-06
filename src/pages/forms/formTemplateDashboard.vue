<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import MenuSidebar from "@/components/sidebar/MenuSidebar.vue";
import useCookies from "../../../cloudconLibrary/utilities/useCookies";
import {
  FilterStringOperator,
  FilterType,
  cookieKeys,
} from "../../../cloudconLibrary/utilities/useConstants";
import SubHeaderAction from "../../components/header/SubHeaderAction.vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Tag from "primevue/tag";
import Checkbox from "primevue/checkbox";
import { useRouter } from "vue-router";
import ProgressSpinner from "primevue/progressspinner";
import { useToast } from "primevue/usetoast";
import formTemplateDataAccess from "../../../cloudconLibrary/store/modules/formTemplateData/formTemplateDataAccess";
import {
  ISortItem,
  IFilters,
} from "../../../cloudconLibrary/utilities/useGenericInterfaces";
import { SortOrderOption } from "../../../cloudconLibrary/utilities/useConstants";
import { IFormTemplate } from "cloudconLibrary/store/modules/formTemplateData/formTemplateDataModule";
import { AxiosError } from "axios";

/* eslint-disable */
export const FormTemplateDashboard = /*#__PURE__*/ defineComponent({
  name: "FormTemplateDashboard",
  components: {
    MenuSidebar,
    SubHeaderAction,
    TabView,
    TabPanel,
    Tag,
    Checkbox,
    ProgressSpinner,
  },
  setup() {
    const toast = useToast();
    const router = useRouter();
    const sortOrders = ref<Record<string, number>>({});
    const columns = ref<Record<string, string>[]>([
      { label: "Name", name: "name" },
      { label: "Groups", name: "groups" },
      { label: "Linked To", name: "linkedto" },
    ]);
    columns.value.forEach((column) => {
      sortOrders.value[column.name] = -1;
    });

    const formTemplatesData = computed<IFormTemplate[]>(() =>
      formTemplateDataAccess.getFormTemplates()
    );
    const sortKey = ref("name");
    const length = ref(10);
    const search = ref("");
    const tableShow = ref<Record<string, boolean>>({
      showdata: true,
    });
    const pagination = ref<Record<string, string | number>>({
      currentPage: 1,
      total: "",
      nextPage: "",
      prevPage: "",
      from: "",
      to: "",
    });
    const token: string | undefined = useCookies.get(
      cookieKeys.AUTH0_ACCESS_TOKEN
    );
    const tenants_id: string | undefined = useCookies.get(cookieKeys.TENANT_ID);
    const is_loading = ref(true);

    const sort = ref<ISortItem[]>([
      {
        Field: "name",
        Order: SortOrderOption.DESCENDING,
      },
    ]);

    const filter = computed<IFilters>(() => {
      return {
        Field: "name",
        Type: FilterType.STRING,
        Operator: FilterStringOperator.CONTAINS,
        Value: search.value,
      };
    });

    onMounted(async () => {
      try {
        is_loading.value = true;
        await getFormTemplates();
        await getFormTemplateGroups();
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

    async function getFormTemplates() {
      if (token && tenants_id) {
        await formTemplateDataAccess.fetchFormTemplates(
          parseInt(tenants_id),
          undefined,
          sort.value
        );
        pagination.value.total = formTemplatesData.value.length;
      } else {
        router.push({
          path: "/login",
        });
      }
    }

    async function getFormTemplateGroups() {
      if (token && tenants_id) {
        await formTemplateDataAccess.fetchFormTemplateGroups(
          parseInt(tenants_id)
        );
      } else {
        router.push({
          path: "/login",
        });
      }
    }

    function paginate(array: any, length: any, pageNumber: any) {
      array = array.value;
      pagination.value.from = array.length
        ? (pageNumber - 1) * length + 1
        : " ";
      pagination.value.to =
        pageNumber * length > array.length ? array.length : pageNumber * length;
      pagination.value.prevPage = pageNumber > 1 ? pageNumber : "";
      pagination.value.nextPage =
        array.length > pagination.value.to ? pageNumber + 1 : "";
      return array.slice((pageNumber - 1) * length, pageNumber * length);
    }

    async function resetPagination(order = "", ordertype = "") {
      if (token && tenants_id) {
        is_loading.value = true;

        if (order == "" && ordertype == "") {
          formTemplateDataAccess.resetFormTemplate();
          await formTemplateDataAccess.fetchFormTemplates(
            parseInt(tenants_id),
            filter.value,
            sort.value
          );
          pagination.value.total = formTemplatesData.value.length;
          pagination.value.currentPage = 1;
          pagination.value.prevPage = "";
          pagination.value.nextPage = "";
          is_loading.value = false;
        } else {
          sort.value = Object.entries(sortOrders.value).map(
            ([sortKey, sortOrder]) => {
              return {
                Field: sortKey,
                Order: sortOrder
                  ? SortOrderOption.ASCENDING
                  : SortOrderOption.DESCENDING,
              };
            }
          );
          await formTemplateDataAccess.fetchFormTemplates(
            parseInt(tenants_id),
            filter.value,
            sort.value
          );
        }
        is_loading.value = false;
      } else {
        router.push({
          path: "/login",
        });
      }
    }

    async function sortBy(key: string) {
      await resetPagination(key, sortOrders.value[key].toString());
      sortKey.value = key;
      sortOrders.value[key] = sortOrders.value[key] * -1;
    }

    function getIndex(array: any[], key: string, value: string) {
      return array.findIndex((i: { [x: string]: any }) => i[key] == value);
    }

    async function deleteTemplate(templateid: number) {
      if (tenants_id && confirm("Are you sure to delete this Form Template?")) {
        await formTemplateDataAccess.deleteFormTemplate(
          parseInt(tenants_id),
          templateid
        );
        toast.add({
          severity: "success",
          summary: "Success Message",
          detail: "Form Template Delete Successfully",
          life: 10000,
        });
      }
    }

    const filteredTemplates = computed(() => {
      let template: any = formTemplatesData.value;
      let sort_Key: any = sortKey.value;
      let order: any = sortOrders.value[sort_Key] || 1;
      if (sortKey) {
        template = template.slice().sort((a: any, b: any) => {
          let index: any = getIndex(columns.value, "name", sort_Key);
          a = String(a[sort_Key]).toLowerCase();
          b = String(b[sort_Key]).toLowerCase();
          if (
            columns.value[index].type &&
            columns.value[index].type === "date"
          ) {
            return (
              (a === b
                ? 0
                : new Date(a).getTime() > new Date(b).getTime()
                ? 1
                : -1) * order
            );
          } else if (
            columns.value[index].type &&
            columns.value[index].type === "number"
          ) {
            return (+a === +b ? 0 : +a > +b ? 1 : -1) * order;
          } else {
            return (a === b ? 0 : a > b ? 1 : -1) * order;
          }
        });
      }
      return template;
    });

    const paginatedTemplates = computed(() => {
      return paginate(
        filteredTemplates,
        length.value,
        pagination.value.currentPage
      );
    });

    const checked = ref(false);

    return {
      filter,
      formTemplatesData,
      columns,
      sortKey,
      sortOrders,
      length,
      search,
      tableShow,
      pagination,
      is_loading,
      getTemplates: getFormTemplates,
      paginate,
      resetPagination,
      sortBy,
      getIndex,
      filteredTemplates,
      paginatedTemplates,
      checked,
      deleteTemplate,
    };
  },
});
export default FormTemplateDashboard;
</script>
<template>
  <div class="dashboard-wrapper">
    <section>
      <div class="p-text-center" v-if="is_loading">
        <ProgressSpinner />
      </div>
      <div v-else>
        <SubHeaderAction>
          <template v-slot:actionsLeft> Form Templates </template>
          <template v-slot:actionsRight>
            <div class="action" v-tooltip.top="'Attach'">
              <font-awesome-icon
                class="action-icon"
                :class="'attach-icon'"
                :icon="['fa', 'paperclip']"
              />
            </div>
            <router-link
              to="/formTemplates/add"
              class="action datatable-router-link"
              v-tooltip.top="'Add'"
              v-if="$route.path == '/formTemplates'"
            >
              <font-awesome-icon
                class="action-icon"
                :class="'add-icon'"
                :icon="['fa', 'plus-circle']"
              />
            </router-link>
            <div class="action" v-tooltip.top="'Download'">
              <font-awesome-icon
                class="action-icon"
                :class="'download-icon'"
                :icon="['fa', 'cloud-download-alt']"
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
          <div class="datatable-action-wrapper">
            <div class="datable-view-search">
              <div class="search-bar-container">
                <input
                  class="search-bar-input"
                  type="text"
                  v-model="search"
                  placeholder="Search"
                  v-on:keyup.enter="resetPagination()"
                />
                <div class="search-icon-container">
                  <font-awesome-icon
                    class="search-icon"
                    :icon="['fa', 'search']"
                  />
                </div>
              </div>
            </div>
            <div class="datatable-view-filter-button-container">
              <div
                class="
                  datatable-view-filter-button
                  is-flex is-justify-content-center is-align-items-center
                  pointer
                "
              >
                <font-awesome-icon
                  class="datatable-view-filter-button-icon"
                  :icon="['fa', 'filter']"
                />
                <span class="datatable-view-filter-button-label">FILTER</span>
              </div>
            </div>
            <div class="datatable-select-length">
              <div class="select">
                <select v-model="length" @change="resetPagination()">
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                </select>
              </div>
            </div>
          </div>
          <div class="datatable-tabs-container">
            <TabView>
              <TabPanel>
                <template
                  #header
                  class="datatable-tab is-flex is-align-items-center pointer"
                >
                  <span class="datatable-tab-label">Templates</span>
                  <span class="datatable-tab-label-count">20</span>
                </template>
                <div class="p-datatable p-datatable-striped people-datatable">
                  <div class="p-datatable-wrapper">
                    <table class="p-datatable-table">
                      <thead class="p-datatable-thead">
                        <tr>
                          <th><Checkbox v-model="checked" :binary="true" /></th>
                          <th
                            v-for="column in columns"
                            :key="column.name"
                            @click="sortBy(column.name)"
                            class="p-sortable-column"
                            :class="
                              sortKey === column.name
                                ? sortOrders[column.name] > 0
                                  ? 'sorting_asc'
                                  : 'sorting_desc'
                                : 'sorting'
                            "
                          >
                            <div class="p-column-header-content">
                              <span class="p-column-title">{{
                                column.label
                              }}</span>
                              <span class="p-sortable-column-icon">
                                <font-awesome-icon :icon="['fas', 'sort']" />
                              </span>
                            </div>
                          </th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody class="p-datatable-tbody">
                        <tr
                          v-for="template in paginatedTemplates"
                          :key="template.id"
                        >
                          <td><Checkbox v-model="checked" :binary="true" /></td>
                          <!-- <td>{{ formTemplatesData.id }}</td> -->
                          <td>
                            <router-link
                              :to="{
                                name: 'FormTemplateView',
                                params: { id: template.id },
                              }"
                              class="datatable-router-link"
                            >
                              {{ template.name }}
                            </router-link>
                          </td>
                          <td>{{ template.formTemplateGroup?.name }}</td>
                          <td>Equipment</td>
                          <td>
                            <Tag severity="success" value="In Progress"></Tag>
                          </td>
                          <td>
                            <router-link
                              :to="{
                                name: 'UpdateFormTemplate',
                                params: { id: template.id },
                              }"
                              class="mr-4 action-btn"
                            >
                              <font-awesome-icon :icon="['fa', 'pen']" />
                            </router-link>
                            <a
                              class="action-btn"
                              href="#"
                              @click="deleteTemplate(template.id)"
                            >
                              <font-awesome-icon :icon="['fa', 'trash-alt']" />
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabPanel>
              <TabPanel>
                <template
                  #header
                  class="datatable-tab is-flex is-align-items-center pointer"
                >
                  <span class="datatable-tab-label">Favourites</span>
                  <span class="datatable-tab-label-count">10</span>
                </template>
                tab2
              </TabPanel>
            </TabView>
          </div>
        </div>

        <div class="py-3">
          <nav class="pagination" v-if="!tableShow.showdata">
            <span class="page-stats"
              >{{ pagination.from }} - {{ pagination.to }} of
              {{ pagination.total }}</span
            >
            <a
              v-if="pagination.prevPageUrl"
              class="btn btn-sm btn-primary pagination-previous"
              @click="--(pagination.currentPage as number)"
            >
              Prev
            </a>
            <a
              class="btn btn-sm btn-primary pagination-previous"
              v-else
              disabled
            >
              Prev
            </a>
            <a
              v-if="pagination.nextPageUrl"
              class="btn btn-sm pagination-next"
              @click="++(pagination.currentPage as number)"
            >
              Next
            </a>
            <a class="btn btn-sm btn-primary pagination-next" v-else disabled>
              Next
            </a>
          </nav>
          <nav class="pagination" v-else>
            <span class="page-stats">
              {{ pagination.from }} - {{ pagination.to }} of
              {{ filteredTemplates.length }}
              <span v-if="`filteredTemplates.length < pagination.total`"></span>
            </span>
            <a
              v-if="pagination.prevPage"
              class="btn btn-sm btn-primary pagination-previous"
              @click="--(pagination.currentPage as number)"
            >
              Prev
            </a>
            <a
              class="btn btn-sm pagination-previous btn-primary"
              v-else
              disabled
            >
              Prev
            </a>
            <a
              v-if="pagination.nextPage"
              class="btn btn-sm btn-primary pagination-next"
              @click="++(pagination.currentPage as number)"
            >
              Next
            </a>
            <a class="btn btn-sm pagination-next btn-primary" v-else disabled>
              Next
            </a>
          </nav>
        </div>
      </div>
    </section>
  </div>
</template>
<style lang="scss">
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
    .p-tabview-panels {
      padding: var(--datatable-container-padding);
      background: var(--datatable-container-background-colour);
      border-radius: var(--datatable-container-border-radius);
      border-top-left-radius: 0;
      border: none;
    }
  }
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
