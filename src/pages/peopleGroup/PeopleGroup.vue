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
import peopleGroupController from "../../controllers/peopleGroupController";
import commonController from "../../controllers/commonController";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
/* eslint-disable */
export const PeopleGroup = /*#__PURE__*/ defineComponent({
  name: "PeopleGroup",
  components: {
    MenuSidebar,
    SubHeaderAction,
    TabView,
    TabPanel,
    Tag,
    Checkbox,
  },
  setup() {
    const controllers = peopleGroupController();
    const controllers1 = commonController();
    const toast = useToast();
    const router = useRouter();
    const sortOrders: any = ref({});
    const columns: any = ref([
      { label: "Name", name: "name" },
      { label: "Contact Name", name: "contacts" },
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
      getUsers();
    });

    async function fetchUsers(
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
        const response = await controllers.getpeoplegroupbysearch(
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

    async function getUsers() {
      if (token) {
        is_loading.value = true;
        try {
          const data = await fetchUsers(
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
    async function getFilteredUser() {
      try {
        const data = await controllers1.getRecords(
          fetchUsers,
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
    async function getSortedUsers(key: string) {
      try {
        sortKey.value = key;
        sortOrders.value[key] =
          sortOrders.value[key] === SortOrderOption.ASCENDING
            ? SortOrderOption.DESCENDING
            : SortOrderOption.ASCENDING;
        const data = await controllers1.getRecords(
          fetchUsers,
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
          fetchUsers,
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
    async function getPaginatedUsers() {
      try {
        const data = await controllers1.getRecords(
          fetchUsers,
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

    function deleteUser(id: number) {
      if (confirm("Are you sure to delete this People Group?")) {
        controllers
          .deletepeoplegroup(id)
          .then(() => {
            getUsers();
            toast.add({
              severity: "success",
              summary: "Success Message",
              detail: "People Group Successfully Deleted",
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
      getUsers,
      getFilteredUser,
      getSortedUsers,
      handlePerPage,
      getPaginatedUsers,
      deleteUser,
      checked,
    };
  },
});
export default PeopleGroup;
</script>
<template>
  <MenuSidebar panel="people" />
  <div class="dashboard-wrapper">
    <section>
      <SubHeaderAction>
        <template v-slot:actionsLeft> People Group </template>
        <template v-slot:actionsRight>
          <div class="action" v-tooltip.top="'Attach'">
            <font-awesome-icon
              class="action-icon"
              :class="'attach-icon'"
              :icon="['fa', 'paperclip']"
            />
          </div>
          <router-link
            to="/peopleGroup/add"
            class="action datatable-router-link"
            v-tooltip.top="'Add'"
            v-if="$route.path == '/peopleGroup'"
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
                v-on:keyup.enter="getFilteredUser()"
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
                          @click="
                            column.name !== 'contacts' &&
                              getSortedUsers(column.name)
                          "
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody class="p-datatable-tbody">
                      <tr v-for="user in users" :key="user.id">
                        <td>
                          <Checkbox
                            v-model="checked"
                            :inputId="user.id"
                            name="category"
                            :value="user.name"
                          />
                        </td>
                        <td>
                          <router-link
                            :to="{
                              name: 'PeopleGroupView',
                              params: { id: user.id },
                            }"
                            class="datatable-router-link"
                          >
                            {{ user.name }}
                          </router-link>
                        </td>
                        <td>
                          <router-link
                            :to="{
                              name: 'PeopleGroupView',
                              params: { id: user.id },
                            }"
                            class="datatable-router-link"
                          >
                            <!-- {{ user.contactNames.join(",") }} -->
                            <label
                              v-for="result in user.contacts"
                              :key="result"
                              class="contactgroup"
                              >{{ result.name }}</label
                            >
                          </router-link>
                        </td>
                        <td>
                          <router-link
                            :to="{
                              name: 'PeopleGroupEdit',
                              params: { id: user.id },
                            }"
                            class="mr-4 action-btn"
                          >
                            <font-awesome-icon :icon="['fa', 'pen']" />
                          </router-link>
                          <a
                            class="action-btn"
                            href="#"
                            @click="deleteUser(user.id)"
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
                        getPaginatedUsers();
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
                        getPaginatedUsers();
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
