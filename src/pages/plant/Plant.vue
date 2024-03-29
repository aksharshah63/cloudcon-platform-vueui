<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import MenuSidebar from "@/components/sidebar/MenuSidebar.vue";
import useCookies from "../../../cloudconLibrary/utilities/useCookies";
import {
  cookieKeys,
  SortOrderOption,
} from "../../../cloudconLibrary/utilities/useConstants";
import SubHeaderAction from "../../components/header/SubHeaderAction.vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Tag from "primevue/tag";
import Checkbox from "primevue/checkbox";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";
import plantController from "../../controllers/plantController";
import commonController from "../../controllers/commonController";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
/* eslint-disable */
export const Plants = /*#__PURE__*/ defineComponent({
  name: "Plants",
  components: {
    MenuSidebar,
    SubHeaderAction,
    TabView,
    TabPanel,
    Tag,
    Checkbox,
  },
  setup() {
    const controllers = plantController();
    const controllers1 = commonController();
    const toast = useToast();
    const router = useRouter();
    const sortOrders: any = ref({});
    const columns: any = ref([
      { label: "Name", name: "name" },
      { label: "Maintenance Usage", name: "maintenanceUsage" },
      { label: "Manufacturer", name: "manufacturer" },
      { label: "Model", name: "model" },
      { label: "Serial Number", name: "serialNumber" },
    ]);
    columns.value.forEach((column: any) => {
      sortOrders.value[column.name] = SortOrderOption.DESCENDING;
    });
    const users: any = ref([]);
    const sortKey = ref("name");
    const length = ref(10);
    const search = ref("");
    const pagination: any = ref({
      currentPage: 1,
      total: undefined,
      totalPage: 1,
    });
    const token = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);
    const is_loading = ref(true);
    const checked = ref(false);

    onMounted(async () => {
      getPlants();
    });

    async function fetchPlants(
      itemsPerPage: number,
      pageNumber: number,
      filterField: string,
      searchKey: string,
      sortField: string,
      sortOrder: SortOrderOption
    ) {
      try {
        const _pagination: IPagination = controllers1.getPagination(
          itemsPerPage,
          pageNumber
        );
        const _filter: IFilters = controllers1.getFilter(
          filterField,
          searchKey
        );
        const _sort: ISort = controllers1.getSort(sortField, sortOrder);
        const response = await controllers.getplantbysearch(
          searchKey.length > 0 ? _filter : undefined,
          sortField.length > 0 ? _sort : undefined,
          _pagination
        );

        pagination.value.total = response.totalData;
        pagination.value.totalPage = Math.ceil(
          response.totalData / length.value
        );
        return response.data;
      } catch (error) {
        console.log(error);
      }
    }

    async function getPlants() {
      if (token) {
        is_loading.value = true;
        try {
          const data = await fetchPlants(
            length.value,
            pagination.value.currentPage,
            "",
            "",
            sortKey.value,
            sortOrders.value[sortKey.value]
          );
          users.value = data;
          is_loading.value = false;
        } catch (error) {
          console.log(error);
        }
      } else {
        router.push({
          path: "/login",
        });
      }
    }

    // function to get data with search query
    async function getFilteredPlant() {
      try {
        const data = await controllers1.getRecords(
          fetchPlants,
          search.value,
          sortKey.value,
          sortOrders.value[sortKey.value],
          Number(length.value),
          1
        );
        pagination.value.currentPage = 1;
        users.value = data;
      } catch (error) {
        console.log(error);
      }
    }

    // function to get data for sorting column
    async function getSortedPlants(key: string) {
      try {
        sortKey.value = key;
        sortOrders.value[key] =
          sortOrders.value[key] === SortOrderOption.ASCENDING
            ? SortOrderOption.DESCENDING
            : SortOrderOption.ASCENDING;
        const data = await controllers1.getRecords(
          fetchPlants,
          search.value,
          key,
          sortOrders.value[key],
          Number(length.value),
          pagination.value.currentPage
        );
        users.value = data;
      } catch (error) {
        console.log(error);
      }
    }

    // function to get data from changing perPage
    async function handlePerPage() {
      try {
        const data = await controllers1.getRecords(
          fetchPlants,
          search.value,
          sortKey.value,
          sortOrders.value[sortKey.value],
          Number(length.value),
          1
        );
        pagination.value.currentPage = 1;
        users.value = data;
      } catch (error) {
        console.log(error);
      }
    }

    // function to get data for pagination
    async function getPaginatedPlants() {
      try {
        const data = await controllers1.getRecords(
          fetchPlants,
          search.value,
          sortKey.value,
          sortOrders.value[sortKey.value],
          Number(length.value),
          pagination.value.currentPage
        );
        users.value = data;
      } catch (error) {
        console.log(error);
      }
    }

    function deletePlant(id: number) {
      if (confirm("Are you sure to delete this Plant?")) {
        controllers
          .deleteplant(id)
          .then(() => {
            getPlants();
            toast.add({
              severity: "success",
              summary: "Success Message",
              detail: "Plant Successfully Deleted",
              life: 10000,
            });
          })
          .catch((error: any) => {
            console.log(error);
          });
      }
    }

    return {
      users,
      columns,
      sortKey,
      sortOrders,
      length,
      search,
      pagination,
      is_loading,
      getPlants,
      getFilteredPlant,
      getSortedPlants,
      handlePerPage,
      getPaginatedPlants,
      deletePlant,
      checked,
    };
  },
});
export default Plants;
</script>
<template>
  <MenuSidebar panel="plant" />
  <div class="dashboard-wrapper">
    <section>
      <SubHeaderAction>
        <template v-slot:actionsLeft> Plant </template>
        <template v-slot:actionsRight>
          <div class="action" v-tooltip.top="'Attach'">
            <font-awesome-icon
              class="action-icon"
              :class="'attach-icon'"
              :icon="['fa', 'paperclip']"
            />
          </div>
          <router-link
            to="/plant/add"
            class="action datatable-router-link"
            v-tooltip.top="'Add'"
            v-if="$route.path == '/plant'"
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
                v-on:keyup.enter="getFilteredPlant()"
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
              <select v-model="length" @change="handlePerPage()">
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
                <span class="datatable-tab-label">All</span>
                <span class="datatable-tab-label-count">{{
                  pagination.total
                }}</span>
              </template>
              <div class="p-datatable p-datatable-striped people-datatable">
                <div class="p-datatable-wrapper">
                  <table class="p-datatable-table">
                    <thead class="p-datatable-thead">
                      <tr>
                        <th>
                          <Checkbox v-model="checked" name="checked" value="" />
                        </th>
                        <th
                          v-for="column in columns"
                          :key="column.name"
                          @click="getSortedPlants(column.name)"
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
                      <tr v-for="plant in users" :key="plant.id">
                        <td>
                          <Checkbox
                            v-model="checked"
                            :inputId="plant.id"
                            name="category"
                            :value="plant.name"
                          />
                        </td>
                        <td>
                          <router-link
                            :to="{
                              name: 'PlantView',
                              params: { id: plant.id },
                            }"
                            class="datatable-router-link"
                          >
                            {{ plant.name }}
                          </router-link>
                        </td>
                        <td>
                          <router-link
                            :to="{
                              name: 'PlantView',
                              params: { id: plant.id },
                            }"
                            class="datatable-router-link"
                          >
                            {{ plant.maintenanceUsage }}
                          </router-link>
                        </td>
                        <td>
                          <router-link
                            :to="{
                              name: 'PlantView',
                              params: { id: plant.id },
                            }"
                            class="datatable-router-link"
                          >
                            {{ plant.manufacturer }}
                          </router-link>
                        </td>
                        <td>
                          <router-link
                            :to="{
                              name: 'PlantView',
                              params: { id: plant.id },
                            }"
                            class="datatable-router-link"
                          >
                            {{ plant.model }}
                          </router-link>
                        </td>
                        <td>
                          <router-link
                            :to="{
                              name: 'PlantView',
                              params: { id: plant.id },
                            }"
                            class="datatable-router-link"
                          >
                            {{ plant.serialNumber }}
                          </router-link>
                        </td>
                        <td>
                          <router-link
                            :to="{
                              name: 'PeopleView',
                              params: { id: plant.id },
                            }"
                            class="datatable-router-link"
                          >
                            <Tag severity="success" value="In Progress"></Tag>
                          </router-link>
                        </td>
                        <td>
                          <router-link
                            :to="{
                              name: 'PlantEdit',
                              params: { id: plant.id },
                            }"
                            class="mr-4 action-btn"
                          >
                            <font-awesome-icon :icon="['fa', 'pen']" />
                          </router-link>
                          <a
                            class="action-btn"
                            href="#"
                            @click="deletePlant(plant.id)"
                          >
                            <font-awesome-icon :icon="['fa', 'trash-alt']" />
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="datatable-pagination-wrapper">
                  <nav class="datatable-pagination">
                    <span class="page-stats"
                      >{{
                        Math.min(
                          pagination.currentPage * length - length + 1,
                          pagination.total
                        )
                      }}
                      -
                      {{
                        Math.min(
                          pagination.currentPage * length,
                          pagination.total
                        )
                      }}
                      of {{ pagination.total }}</span
                    >
                    <a
                      v-if="pagination.currentPage > 1"
                      class="btn btn-sm btn-primary pagination-previous"
                      @click="
                        --pagination.currentPage;
                        getPaginatedPlants();
                      "
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
                      v-if="pagination.currentPage < pagination.totalPage"
                      class="btn btn-sm btn-primary pagination-next"
                      @click="
                        ++pagination.currentPage;
                        getPaginatedPlants();
                      "
                    >
                      Next
                    </a>
                    <a
                      class="btn btn-sm pagination-next btn-primary"
                      v-else
                      disabled
                    >
                      Next
                    </a>
                  </nav>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <template
                #header
                class="datatable-tab is-flex is-align-items-center pointer"
              >
                <span class="datatable-tab-label">Employees</span>
                <span class="datatable-tab-label-count">10</span>
              </template>
              tab2
            </TabPanel>
            <TabPanel>
              <template
                #header
                class="datatable-tab is-flex is-align-items-center pointer"
              >
                <span class="datatable-tab-label">Clients</span>
                <span class="datatable-tab-label-count">10</span>
              </template>
              tab3
            </TabPanel>
          </TabView>
        </div>
      </div>
    </section>
  </div>
</template>
<style lang="scss">
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
.contactgroup + .contactgroup:before {
  content: ", ";
}
</style>
