<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useState } from "../../store/index";
import { IRecord } from "../../store/modules/upvise.d";
import FabricationEditDetails from "../../pages/workshop/fabricationEditDetails.vue";
import ProcessingEditDetails from "../../pages/workshop/processingEditDetails.vue";
import AutoCompleteTextBox from "../../components/input/autoCompleteTextBox.vue";
import useWorkshopController from "../../use/controller/workshop/workshop";
import ProgressSpinner from "primevue/progressspinner";
import Sidebar from "primevue/sidebar";
import { IProcessingRecord } from "../../use/controller/workshop/processing.d";
import { ILot } from "../../use/controller/workshop/workshop.d";
import utils from "../../use/function/useUtils";
import LotEdit from "../../pages/workshop/lotEditDetails.vue";
import { IRecordDealsProduct } from "../../use/controller/sales/deals.d";

export const newLot = defineComponent({
  name: "NewLot",
  components: {
    LotEdit,
    ProgressSpinner,
    Sidebar,
    AutoCompleteTextBox,
    FabricationEditDetails,
    ProcessingEditDetails,
  },
  props: {
    qualifiedWelders: {
      type: Array as () => IRecord[],
      required: false,
      default: () => [],
    },
    allPaintTypes: {
      type: Array as () => IRecord[],
      required: false,
      default: () => [],
    },
    forageData: {
      type: Object as () => Record<string, IRecord[]>,
      required: true,
    },
    traceabilityOptions: {
      type: Array as () => IRecordDealsProduct[],
      required: false,
      default: () => [],
    },
    isFabrication: {
      type: Boolean,
      required: true,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const upvise = useState().upvise;
    const workshop = useWorkshopController(upvise);
    const showLot = ref(true);
    const awaitingResponse = ref(false);
    const lot = workshop.newLot();
    const fabrication = workshop.newFabrication();
    const processing = workshop.newProcessing();
    const originalLot = utils.deepCopy(lot);

    const allReleases = ref(
      Object.values(upvise.entityData(workshop.releaseTable))
    );
    const allProjects = ref(props.forageData["unybiz.projects.projects"]);

    const allLots = ref(
      Object.values(upvise.entityData(workshop.lotTable)) as unknown as ILot[]
    );

    const allEquipment = ref(
      Object.values(upvise.entityData("TableEmployeedashboardLookups"))
    );

    const allProcessing = ref(
      Object.values(
        upvise.entityData(workshop.processingTable)
      ) as unknown as IProcessingRecord[]
    );

    const showSave = computed(() => checkUpdate());

    const lotsForSelectedRelease = computed(() => {
      // Only show lots for the selected release and do not have a manual processing entry yet
      return !props.isFabrication
        ? allLots.value.filter(
            (l) =>
              l.releaseid === lot.releaseid &&
              !allProcessing.value.find(
                (p) => p.lotid === l.id && p.source === "Manual"
              )
          )
        : [];
    });

    const sortedEquipment = computed(() => {
      return allEquipment.value
        .filter((e) => e.lookuptype === "Equipment")
        .sort((a, b) =>
          (a?.lookupname || 0) >= (b?.lookupname || 0) ? 1 : -1
        );
    });

    function checkUpdate() {
      return JSON.stringify(lot) !== JSON.stringify(originalLot);
    }

    function closeLot() {
      showLot.value = false;
      emit("closeLot");
    }

    function saveLot() {
      fabrication.lotid = lot.id;
      processing.lotid = lot.id;
      awaitingResponse.value = true;
      // add in a check to prevent duplicate fab/processing manual entries`
      const payload = {
        TableWorkshopLot: [utils.deepCopy(lot)],
        TableWorkshopFabrication: [fabrication],
        TableWorkshopProcessing: [processing],
      };
      if (!workshop.getValidSave(payload)) {
        awaitingResponse.value = false;
        return;
      }

      workshop
        .doSaveModelEntities(payload)
        .then(() => {
          awaitingResponse.value = false;
          closeLot();
        })
        .catch(() => {
          awaitingResponse.value = false;
        });
    }

    function updateOptionsValue(fieldName: string, value: string) {
      if (
        fieldName === "releaseid" ||
        fieldName === "projectid" ||
        fieldName === "treatmentids"
      )
        lot[fieldName] = value;
    }

    return {
      props,
      showLot,
      awaitingResponse,
      lot,
      fabrication,
      processing,
      allReleases,
      allProjects,
      showSave,
      closeLot,
      saveLot,
      updateOptionsValue,
      lotsForSelectedRelease,
      sortedEquipment,
    };
  },
});
export default newLot;
</script>

<template>
  <div>
    <sidebar class="fabrication-screen" :visible="showLot" position="right">
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name"> New Manual Lot </span>
            </div>
          </div>
        </div>
        <div class="p-col-5 sidebar-options">
          <div class="loading-spinner" v-if="awaitingResponse">
            <ProgressSpinner class="spinner"></ProgressSpinner>
          </div>
          <div v-if="showSave" class="option" @click="saveLot()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <div class="option" @click="closeLot()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>

        <div class="p-col-12">
          <lot-edit
            :lot-copy="lot"
            :all-projects="allProjects"
            :archived="false"
          ></lot-edit>
        </div>

        <div class="p-col-12 divider"></div>

        <div v-if="isFabrication" class="p-col-12">
          <fabrication-edit-details
            v-if="isFabrication"
            :fabrication-record="fabrication"
            :manual="true"
            :qualified-welders="qualifiedWelders"
            :all-paint-types="allPaintTypes"
            :new-lot="true"
            @updateLot="saveLot"
          />
        </div>

        <template v-else>
          <div class="p-col-12">
            <processing-edit-details
              :process-record="processing"
              :is-manual="true"
              :is-new-process="true"
              :traceability-options="traceabilityOptions"
            />
          </div>

          <div class="p-col-3 input-label">Planned Work</div>
          <div class="p-col-9">
            <auto-complete-text-box
              display-field="lookupname"
              field-name="equipment"
              :options="sortedEquipment"
              :multi-select="true"
              @updateOptionsValue="updateOptionsValue"
            />
          </div>
        </template>
      </div>
    </sidebar>
  </div>
</template>

<style scoped></style>
