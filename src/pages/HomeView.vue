<template>
  <HomeSidebar />
  <div class="dashboard-wrapper">
    <section>
      <HomeResultBar />
      <div class="home">
        <div style="">
          <!-- <DatatableView
          :metadata="exampleMetadata"
          :rowMenuOptions="exampleRowMenuOptions"
          :tabOptions="exampleTabOptions"
          :parentId="'35413F01E1B21CEBD12A021E4F042E'"
          :parentField="'projectid'"
          :customStyles="exampleDatatableCustomStyles"
          :defaultSort="exampleDefaultSort"
          :enableLazyLoading="true"
          v-model:sort="exampleSort"
          v-model:filters="exampleFilter"
        /> -->
          <!-- <DatatableView
          :metadata="exampleMetadata"
          :rowMenuOptions="exampleRowMenuOptions"
          :tabOptions="exampleTabOptions"
          :customStyles="exampleDatatableCustomStyles"
          :defaultSort="exampleDefaultSort"
          :enableLazyLoading="true"
          v-model:sort="exampleSort"
          v-model:filters="exampleFilter"
        /> -->
        </div>
        <div class="home-datatable-wrapper">
          <div class="home-datatable-header">
            <div class="datatable-calender">
              <font-awesome-icon
                class="pointer"
                :icon="['fa', 'chevron-left']"
              />
              <Calendar v-model="date" showIcon />
              <font-awesome-icon
                class="pointer"
                :icon="['fa', 'chevron-right']"
              />
            </div>
            <div class="home-datatable-sorting">
              <InputText
                v-model="value1"
                placeholder="Search"
                class="home-datatable-search"
              />
              <span class="home-data-sort">Sort</span>
              <span class="home-data-filter">Filters</span>
            </div>
          </div>
          <DataTable
            :value="modules"
            stripedRows
            sortMode="multiple"
            tableStyle=""
            class="home-datatable"
          >
            <Column
              field="asssetNumber"
              header="Project Assset Number"
              sortable
              style="min-width: 245px"
            ></Column>
            <Column
              field="name"
              header="Name"
              sortable
              style="min-width: 300px"
            ></Column>
            <Column
              field="startOdometer"
              header="Start Odometer"
              sortable
              style="min-width: 200px"
            ></Column>
            <Column
              field="starDate"
              header="Star Date"
              sortable
              style="min-width: 155px"
            ></Column>
            <Column
              field="endOdometer"
              header="End Odometer"
              sortable
              style="min-width: 180px"
            ></Column>
            <Column
              field="endDate"
              header="End Date"
              sortable
              style="min-width: 145px"
            ></Column>
            <Column
              field="average"
              header="Average"
              sortable
              style="min-width: 130px"
            ></Column>
            <Column
              field="total"
              header="Total"
              sortable
              style="min-width: 50px"
            ></Column>
          </DataTable>
        </div>
      </div>
    </section>
  </div>
</template>
<script lang="ts">
import {
  IMetadata,
  ITableRecord,
  Metadata,
} from "../../cloudconLibrary/store/modules/tableData/tableDataModule";
import { defineComponent, onMounted, ref, computed } from "vue";
//import HelloWorld from '@/components/header/bar.vue'; // @ is an alias to /src
import DatatableView, {
  IDatatableTabOption,
} from "../../cloudconLibrary/components/datatable/datatableView.vue";
import useControllerEquipment from "../use/controller/equipment/equipment";
import { MenuItem } from "primevue/menuitem";
import {
  DataFilterCondition,
  DataFilterStringOperator,
  DataFilterType,
} from "../../cloudconLibrary/dataFilter/dataFilterInterfaces";
import {
  IDatatableFilter,
  IDatatableStyleOptions,
} from "../../cloudconLibrary/components/datatable/datatable.vue";
import {
  IDatatableSortObject,
  SortOrderOption,
} from "../../cloudconLibrary/api/databaseWebApi";
import useControllerIndex from "@/use/controller/HomeData";
import { IModuleOption1 } from "../store/modules/upvise.d";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import HomeResultBar from "../components/homeResultBar/HomeResultBar.vue";
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import HomeSidebar from "@/components/sidebar/HomeSidebar.vue";
/* eslint-disable */
export default defineComponent({
  name: "HomeView",
  components: {
    DatatableView,
    //HelloWorld,
    DataTable,
    Column,
    HomeResultBar,
    Calendar,
    InputText,
    HomeSidebar,
  },
  data() {
    return {
      date: null,
      value1: null,
    };
  },
  setup() {
    const controller = useControllerEquipment();
    const controller1 = useControllerIndex();
    const modules = computed<IModuleOption1[]>(() => {
      return controller1.getModuleOptions();
    });
    const exampleMetadata = ref<IMetadata>(new Metadata());
    const exampleRowMenuOptions: Record<string, MenuItem[]> = {
      TableToolsTools: [
        {
          label: "Test Option",
          icon: "pi pi-plus",
          onClick: (record: ITableRecord) => {
            console.log("record", record);
          },
        },
      ],
    };
    const exampleTabOptions: IDatatableTabOption[] = [
      {
        name: "test1 test1",
        filters: {
          TableToolsTools: {
            field: "name",
            type: DataFilterType.STRING,
            operator: DataFilterStringOperator.CONTAINS,
            value: "",
          },
        },
      },
      {
        name: "test2 test2",
        filters: {
          TableToolsTools: {
            field: "name",
            type: DataFilterType.STRING,
            operator: DataFilterStringOperator.CONTAINS,
            value: "Liger",
          },
        },
      },
    ];
    const exampleDatatableCustomStyles: Record<string, IDatatableStyleOptions> =
      {
        TableSchedulerMilestones: {
          rowStyleOptions: {
            expandedRowGap: true,
            backgroundColour: "#fafafa",
          },
        },
      };

    const exampleDefaultSort: Record<string, IDatatableSortObject[]> = {
      TableSchedulerMilestones: [
        {
          field: "name",
          order: SortOrderOption.DESCENDING,
        },
      ],
      TableSchedulerTasks: [
        {
          field: "name",
          order: SortOrderOption.ASCENDING,
        },
      ],
      TableToolsTools: [
        {
          field: "serialnumber",
          order: SortOrderOption.ASCENDING,
        },
      ],
    };

    const exampleSort = ref<Record<string, IDatatableSortObject[]>>({});

    const exampleFilter = ref<Record<string, IDatatableFilter>>({
      TableSchedulerMilestones: {
        name: {
          condition: DataFilterCondition.AND,
          rules: [
            {
              field: "name",
              type: DataFilterType.STRING,
              operator: DataFilterStringOperator.CONTAINS,
              value: "Milestone",
            },
          ],
        },
      },
      TableSchedulerTasks: {
        name: {
          condition: DataFilterCondition.AND,
          rules: [
            {
              field: "name",
              type: DataFilterType.STRING,
              operator: DataFilterStringOperator.CONTAINS,
              value: "2",
            },
          ],
        },
      },
    });

    onMounted(async () => {
      controller.fetch().then(async () => {
        // exampleMetadata.value = controller.getMetadata();
        console.log("METADATA:", exampleMetadata.value);
      });
    });

    return {
      exampleMetadata,
      exampleRowMenuOptions,
      exampleTabOptions,
      exampleDatatableCustomStyles,
      exampleDefaultSort,
      exampleSort,
      exampleFilter,
      modules,
    };
  },
});
</script>
<style lang="scss">
.home-datatable-wrapper {
  background-color: $white;
  padding: 30px 24px;
  .home-datatable-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .datatable-calender {
      margin: 0 auto;
      .p-inputtext {
        border: none;
        font-weight: 600;
        font-size: 18px;
        line-height: 120%;
        width: 150px;
        &:focus {
          box-shadow: none;
        }
      }
      .p-button {
        background-color: transparent;
        color: $grey3;
        border: none;
        font-size: 16px;
        &:focus {
          box-shadow: none;
        }
      }
    }
    .home-datatable-sorting {
      .home-datatable-search {
        background: $grey;
        border-radius: 16px;
        padding: 5px 13px;
        margin-right: 24px;
        border: none;
        font-weight: 400;
        font-size: 10px;
        line-height: 140%;
        &:focus {
          box-shadow: none;
        }
      }
      .home-data-sort,
      .home-data-filter {
        font-weight: 400;
        font-size: 10px;
        line-height: 120%;
        color: $black;
        display: inline-block;
        margin-right: 24px;
        cursor: pointer;
      }
      .home-data-filter {
        margin-right: 0;
      }
    }
  }
}
</style>
