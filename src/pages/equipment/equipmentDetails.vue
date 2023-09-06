<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  ref,
  watchEffect,
} from "vue";
import controller from "../../use/controller/equipment/equipmentDetails";
import { IEquipmentDetails } from "../../use/controller/equipment/equipmentDetails.d";
import DashboardOverview from "../../controls/dashboard/dashboardOverview.vue";
import Overview from "../../controls/dashboard/overview.vue";
import EquipmentWidget from "./equipmentWidget.vue";
import LinkedItemsButton from "../../components/button/linkedItemsButton.vue";
import { useStore } from "vuex";
import utils from "../../use/function/useUtils";
import { IUpviseDataMessage } from "../../store/modules/upvise.d";
import { UpviseDataMessage } from "../../store/modules/upvise";

export const equipmentDetails = /*#__PURE__*/ defineComponent({
  name: "Equipment Details",
  components: {
    DashboardOverview,
    EquipmentWidget,
    LinkedItemsButton,
    Overview,
  },
  props: {
    equipmentId: {
      type: String,
      required: false,
    },
  },
  setup() {
    const detailsHover = ref(false);
    const headerActionButtons = [
      {
        icon: "plus",
        tooltip: "Add",
        action: "add",
        isDisabled: false,
      },
      {
        icon: "trash",
        tooltip: "Delete",
        action: "delete",
        isDisabled: false,
      },
      {
        icon: "globe-asia",
        tooltip: "Link",
        action: "link",
        isDisabled: false,
      },
      {
        icon: "exclamation-triangle",
        tooltip: "Risks",
        action: "risks",
        isDisabled: false,
      },
    ];

    const upvise = useStore().state.upvise;
    const metadata = ref<IUpviseDataMessage>({} as UpviseDataMessage);
    const upviseDataMessage = ref<IUpviseDataMessage>({} as UpviseDataMessage);
    const equipmentFields = ref([{}]);
    const equipDetailController = controller(upvise);
    const equipmentId = "5c6a86ef42f14d959ed497fa1a811933";
    const equipment = ref({});
    const slicingInformation = ref();
    const projects = ref({});

    const gridRef = ref();
    const currentView = ref<string>("data");

    const currentRows = computed(() => {
      return gridRef.value?.dataTableRef?.processedData ?? [];
    });

    const rowsSelected = ref([]);

    function getAllSelectedRows() {
      rowsSelected.value =
        gridRef.value === null ? [] : gridRef.value.getSelectedRows();
      return gridRef.value === null ? [] : gridRef.value.getSelectedRows();
    }

    function clearSelectedRows() {
      if (gridRef.value) {
        gridRef.value.clearSelectedRows();
      }
    }
    function getCurrentItems() {
      return gridRef.value === null ? [] : gridRef.value.getCurrentItems();
    }

    const equipmentDetailsCalcs = ref({} as IEquipmentDetails);

    onBeforeMount(async () => {
      equipment.value = utils.deepCopy(
        upvise.recordData("TableToolsTools", equipmentId)
      );

      projects.value = upvise.entityData("TableUnybizProjectsProjects");

      equipDetailController.getMetadata().then((m) => {
        metadata.value = m;
        equipmentFields.value = m.persistence.TableToolsTools.Schema;
        console.log(equipmentFields.value);
      });

      equipDetailController.getMetadata().then((m) => {
        upviseDataMessage.value = m;
      });

      equipmentDetailsCalcs.value = await equipDetailController.getCalcs();
    });

    const headerActionClicked = function (value: string) {
      console.log(value);
    };

    const toggleDetails = function () {
      detailsHover.value = !detailsHover.value;
    };

    watchEffect(() => {
      slicingInformation.value = equipDetailController.getSlicingInformation();
    });

    return {
      metadata,
      headerActionButtons,
      headerActionClicked,
      gridRef,
      getAllSelectedRows,
      clearSelectedRows,
      getCurrentItems,
      currentRows,
      rowsSelected,
      currentView,
      detailsHover,
      toggleDetails,
      equipment,
      equipmentFields,
      equipmentDetailsCalcs,
      projects,
      upviseDataMessage,
    };
  },
});

export default equipmentDetails;
</script>

<template>
  <DashboardOverview
    :isLoading="false"
    :headerActionButtons="headerActionButtons"
    @headerActionClicked="headerActionClicked"
  >
    <template v-slot:header-title>
      <div class="allocation-status">
        {{
          equipment.name != ""
            ? "Allocated - " + projects[equipment.projectid].name
            : "Unallocated"
        }}
      </div>
      <div class="title">
        {{ equipment.name }}
      </div>
    </template>
    <template v-slot:header-row-1>
      <p>
        <i class="fa fa-map-marker"></i> {{ equipment.address + " - " }}
        <a
          :href="'http://maps.google.com/maps?q=' + equipment.address"
          target="_blank"
          >VIEW ON MAP</a
        >
      </p>
    </template>
    <template v-slot:header-row-2>
      <div class="columns">
        <div class="column">
          <EquipmentWidget>
            <template v-slot:widget-data>
              <div class="widget-header">Forms</div>
              <div class="columns">
                <div class="column">
                  <div class="widget-value">
                    {{ equipmentDetailsCalcs.numberOfForms }}
                  </div>
                  <div class="widget-body">Total Forms</div>
                </div>
                <div class="column">
                  <div class="widget-value">
                    {{ equipmentDetailsCalcs.numberOfFormsCompleted }}
                  </div>
                  <div class="widget-body">Completed Forms</div>
                </div>
              </div>
              <hr />
              <div class="widget-header">Jobs</div>
              <div class="widget-value">
                {{ equipmentDetailsCalcs.numberOfJobs }}
              </div>
              <div class="widget-body">Total Jobs</div>
            </template>
          </EquipmentWidget>
        </div>
        <div class="column">
          <EquipmentWidget>
            <template v-slot:widget-data>
              <div class="widget-header">Utilisation</div>
              <div class="widget-value">
                {{ equipmentDetailsCalcs.utilizationAverage }}km
              </div>
              <div class="widget-body">Average</div>
              <hr />
              <div class="widget-value">
                {{ equipmentDetailsCalcs.utilizationTotal }}km
              </div>
              <div class="widget-body">Total</div>
              <hr />
              <div class="widget-value">{{ equipment.endOdometer }}</div>
              <div class="widget-body">Current Reading</div>
            </template>
          </EquipmentWidget>
        </div>
        <div class="column">
          <EquipmentWidget>
            <template v-slot:widget-data>
              <div class="widget-header">Maintenance Details</div>
              <div class="widget-value">
                {{ equipmentDetailsCalcs.nextMaintenanceDate }}
              </div>
              <div class="widget-body">Next Service Date</div>
              <hr />
              <div class="widget-value">
                ${{ equipmentDetailsCalcs.maintenanceCost }}
              </div>
              <div class="widget-body">Maintenance Cost</div>
              <hr />
              <div class="widget-value">
                {{ equipmentDetailsCalcs.healthStatus }}
              </div>
              <div class="widget-body">Health Status</div>
            </template>
          </EquipmentWidget>
        </div>
        <div class="column">
          <EquipmentWidget>
            <template v-slot:widget-data>
              <div class="widget-header">Fuel Details</div>
              <div class="widget-value">
                ${{ equipmentDetailsCalcs.avgFuelCostPerMile }}
              </div>
              <div class="widget-body">Average Fuel Cost / Mile</div>
              <hr />
              <div class="widget-value">
                ${{ equipmentDetailsCalcs.avgFuelCostPerGallon }}
              </div>
              <div class="widget-body">Average Fuel Cost / Gallon</div>
              <hr />
              <div class="widget-value">
                ${{ equipmentDetailsCalcs.totalFuelCost }}
              </div>
              <div class="widget-body">Total Cost</div>
            </template>
          </EquipmentWidget>
        </div>
        <div class="column">
          <EquipmentWidget>
            <template v-slot:widget-data>
              <div class="widget-header">Operating Costs</div>
              <div class="widget-value">
                ${{ equipmentDetailsCalcs.operatingCosts }}
              </div>
              <div class="widget-body">Fuel Cost</div>
              <hr />
              <div class="widget-value">
                ${{ equipmentDetailsCalcs.servicingCosts }}
              </div>
              <div class="widget-body">Servicing Cost</div>
              <hr />
              <div class="widget-value">
                ${{ equipmentDetailsCalcs.totalCosts }}
              </div>
              <div class="widget-body">Total Cost</div>
            </template>
          </EquipmentWidget>
        </div>
        <div class="column">
          <EquipmentWidget>
            <template v-slot:widget-data>
              <div class="widget-header">Revenue</div>
              <div class="widget-value">
                ${{ equipmentDetailsCalcs.avgInvoice }}
              </div>
              <div class="widget-body">Average Invoice</div>
              <hr />
              <div class="widget-value">
                {{ equipmentDetailsCalcs.totalInvoices }}
              </div>
              <div class="widget-body">Total Invoices</div>
              <hr />
              <div class="widget-value">
                ${{ equipmentDetailsCalcs.totalRevenue }}
              </div>
              <div class="widget-body">Total</div>
            </template>
          </EquipmentWidget>
        </div>
        <div class="column">
          <EquipmentWidget>
            <template v-slot:widget-data>
              <div class="widget-header">Revenue</div>
              <div class="widget-value">$6780</div>
              <div class="widget-body">Average Invoice</div>
              <hr />
              <div class="widget-value">50</div>
              <div class="widget-body">Total Invoices</div>
              <hr />
              <div class="widget-value">$78000</div>
              <div class="widget-body">Total</div>
            </template>
          </EquipmentWidget>
        </div>
      </div>
    </template>
    <template v-slot:header-row-3>
      <div class="columns">
        <div class="column">
          <LinkedItemsButton Title="Files" :Amount="5" />
        </div>
        <div class="column">
          <LinkedItemsButton Title="Archives" :Amount="5" />
        </div>
        <div class="column">
          <LinkedItemsButton Title="Notes" :Amount="5" />
        </div>
        <div class="column">
          <LinkedItemsButton Title="History" :Amount="5" />
        </div>
        <div class="column">
          <LinkedItemsButton
            Title="Forms"
            :Amount="equipmentDetailsCalcs.numberOfForms"
          />
        </div>
      </div>
    </template>
    <template v-slot:header-row-4>
      <div class="detail-panel">
        <div class="details-header" @click="toggleDetails()">
          <h1>Equipment Details</h1>
          <font-awesome-icon class="pointer" :icon="['fa', 'chevron-down']" />
          <font-awesome-icon class="pencil" :icon="['fa', 'pen-square']" />
        </div>
        <template v-if="detailsHover == true">
          <hr />
          <div class="details-expanded columns is-multiline">
            <template
              v-for="property in equipmentFields.filter((eq) => eq.IsVisible)"
              :key="property"
            >
              <div class="column is-2">
                {{ property.Label }}: {{ equipment[property.InternalName] }}
              </div>
            </template>
          </div>
        </template>
      </div>
    </template>
    <template v-slot:body>
      <overview
        ref="dashboardOverviewRef"
        title="Risks"
        module-name="risks"
        :upvise-data-message="upviseDataMessage"
      >
      </overview>
    </template>
  </DashboardOverview>
</template>

<style lang="scss" scoped>
@import url("https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css");

.columns {
  width: 100%;
}

.view-grid {
  width: 100%;
}

.allocation-status {
  height: 17px;

  font-family: "Poppins";
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 120%;

  color: #666666;
  margin-bottom: 15px;
  /* Inside auto layout */
  flex: none;
  order: 0;
  flex-grow: 0;
}

.title {
  max-width: 75%;
}

.detail-panel {
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 5px;

  margin-top: 10px;
  cursor: pointer;

  .details-header {
    display: flex;
    justify-content: space-between;
    height: 60px;
    padding: 15px;
  }

  .details-expanded {
    padding: 15px;
  }
}
</style>
