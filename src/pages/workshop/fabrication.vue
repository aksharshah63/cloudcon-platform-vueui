<script lang="ts">
import useControllerFabrication from "../../use/controller/workshop/fabrication";
import DashletTable from "../../components/charts/staticdashboard/dashletTable.vue";
import ColourSelector from "../../components/display/colourSelector.vue";
import DashboardOverview from "../../controls/dashboard/overview.vue";
import FabricationEdit from "../../pages/workshop/fabricationEdit.vue";
import FabricationNew from "../../pages/workshop/newLot.vue";
import TeklaImport from "../../pages/workshop/teklaImport.vue";
import { UpviseDataMessage } from "../../store/modules/upvise";
import { defineComponent, onMounted, ref, watch, watchEffect } from "vue";
import { IRecord, IUpviseDataMessage } from "../../store/modules/upvise.d";
import { useState } from "../../store/index";
import useWorkshopController from "../../use/controller/workshop/workshop";
import backingField from "../../use/utils/useBackingField";
import { IFabricationRecord } from "../../use/controller/workshop/fabrication.d";
import { ModuleNames } from "../../use/utils/useConstants";
import WorkshopBulkUpdate from "../../pages/workshop/workshopBulkUpdate.vue";
import { useTableNames } from "../../use/utils/useConstants";

export const Fabrication = defineComponent({
  name: "Fabrication",
  components: {
    DashletTable,
    TeklaImport,
    FabricationNew,
    ColourSelector,
    FabricationEdit,
    DashboardOverview,
    WorkshopBulkUpdate,
  },
  setup() {
    const upvise = useState().upvise;
    const controller = useControllerFabrication(upvise);
    const workshop = useWorkshopController(upvise);
    const useBackingField = backingField();
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const slicingInformation = ref(controller.getSlicingInformation());
    const dashboardOverviewRef = ref();
    const selectedRows = ref<{ row: Record<string, any>; group: string }[]>([]);
    const backingFieldDictionary = ref({});
    const backingFieldData = ref({});
    const showEdit = ref(false);
    const showNew = ref(false);
    const showTeklaImport = ref(false);
    const showWorkshopBulkUpdate = ref(false);
    const selectedId = ref();
    const uploadSuccessful = ref();
    const initialSortArray = ref(controller.getInitialSort());
    const alreadyInitialised = ref(false);
    const removeAddButtons = ref([
      {
        currentGroupType: "lot",
        field: "",
        value: undefined,
      },
    ]);
    const qualifiedWelders = ref();
    const paintTypes = ref();
    const allLots = ref();
    const colourSelectorRef = ref();
    const customRow = ref({ using: true, level: "lot" });
    const forageData = ref();
    const stageProjects = ref<IRecord[]>([]);
    const importUserMessage = ref(
      "(You cannot use this screen for Tekla Imports, please use the Tekla Import Interface)"
    );
    const headerActionButtons = ref(workshop.headerButtons);
    const currentRecords = ref<Record<string, any>[]>([]);
    const removeNameColumnMinWidth = ref({
      [useTableNames.WORKSHOP_FABRICATION]: true,
    });

    onMounted(async () => {
      await controller.getMetadata().then((m) => (metadata.value = m));
      await controller.getForageData().then((f) => {
        forageData.value = f;
        workshop.setTemplateId(forageData.value["system.user.settings"]);
      });
      backingFieldDictionary.value = useBackingField.getDictionary(
        metadata.value
      );
      qualifiedWelders.value = controller.getQualifiedWelders(
        forageData.value["unybiz.contacts.contacts"]
      );
      await useBackingField
        .getData(backingFieldDictionary.value)
        .then((d) => (backingFieldData.value = d));
      stageProjects.value = workshop.getStageProjects(forageData.value);
      await controller.fetch();
      colourSelectorRef.value.initialColour();
    });

    function getFilteredRows(event: unknown) {
      const fabrication = event as Record<string, any>[];
      if (upvise.isFetchComplete) currentRecords.value = fabrication;
      //console.log(currentRecords.value);
    }

    function getSelectedRows(
      rows: { row: Record<string, any>; group: string }[]
    ) {
      selectedRows.value = rows;
    }

    function groupedItemClick(
      action: string,
      groupName: string,
      itemId: string,
      parentId: string
    ) {
      if (action) console.log(action, groupName, parentId);
      if (action === "Edit") {
        selectedId.value = itemId;
        showEdit.value = true;
      } else if (action === "Add") {
        showNew.value = true;
      }
    }

    function headerActionClicked(action: string) {
      if (action === "teklaImport") {
        showTeklaImport.value = true;
      } else if (action === "bulkUpdate") {
        showWorkshopBulkUpdate.value = true;
      }
    }

    function closeFabrication() {
      setTimeout(() => {
        showEdit.value = false;
        showNew.value = false;
        showTeklaImport.value = false;
        showWorkshopBulkUpdate.value = false;
      }, 200);
      uploadSuccessful.value = true;
    }

    function saveImport(importData: IFabricationRecord[]) {
      uploadSuccessful.value = undefined;

      const payload = workshop.processImportData(
        importData,
        false,
        stageProjects.value as IRecord[]
      );

      if (payload) {
        if (workshop.getValidSave(payload))
          workshop
            .doSaveModelEntities(payload)
            .then(() => (uploadSuccessful.value = true))
            .catch(() => (uploadSuccessful.value = false));
        else uploadSuccessful.value = false;
      } else uploadSuccessful.value = false;
    }

    watch(
      () => upvise.isFetchComplete,
      () => {
        controller.initialiseData(forageData.value);
        alreadyInitialised.value = true;
        allLots.value = Object.values(upvise.entityData(workshop.lotTable));
        paintTypes.value = Object.values(
          upvise.entityData(workshop.paintTypeTable)
        );
      }
    );

    watchEffect(() => {
      if (upvise.isFetchComplete && alreadyInitialised.value) {
        useBackingField.setData(
          backingFieldDictionary.value,
          backingFieldData.value
        );
        controller.notPersistedCalcs(forageData.value);
      }
    });

    return {
      ModuleNames,
      metadata,
      slicingInformation,
      dashboardOverviewRef,
      selectedRows,
      currentRecords,
      showEdit,
      showNew,
      showTeklaImport,
      showWorkshopBulkUpdate,
      selectedId,
      uploadSuccessful,
      initialSortArray,
      removeAddButtons,
      qualifiedWelders,
      paintTypes,
      allLots,
      colourSelectorRef,
      customRow,
      forageData,
      stageProjects,
      importUserMessage,
      headerActionButtons,
      removeNameColumnMinWidth,
      getFilteredRows,
      getSelectedRows,
      groupedItemClick,
      headerActionClicked,
      closeFabrication,
      saveImport,
    };
  },
});
export default Fabrication;
</script>

<template>
  <dashboard-overview
    ref="dashboardOverviewRef"
    title="Fabrication Schedule"
    moduleName="fabrication"
    :upvise-data-message="metadata"
    :show-header-toggle="true"
    :show-view-toggle="false"
    :force-show-details="true"
    :initial-sort-array="initialSortArray"
    :remove-add="removeAddButtons"
    :custom-row-colours="customRow"
    :show-file-import="true"
    :custom-import-message="importUserMessage"
    :show-file-export="true"
    :upload-successful="uploadSuccessful"
    :header-action-buttons="headerActionButtons"
    :slicing-information="slicingInformation"
    :start-expanded="true"
    :show-left-right-header="false"
    :hide-childless-parents="true"
    :enable-header-summary-background="false"
    :removeNameColumnMinWidth="removeNameColumnMinWidth"
    @saveToUpvise="saveImport"
    @groupedItemClick="groupedItemClick"
    @headerActionClicked="headerActionClicked"
    @rowsShown="getFilteredRows"
    @rowsSelected="getSelectedRows"
  >
    <template v-slot:header-middle>
      <dashlet-table
        :current-records="currentRecords"
        title="fabrication"
      ></dashlet-table>
    </template>
  </dashboard-overview>

  <fabrication-edit
    v-if="showEdit"
    :fabrication-id="selectedId"
    :qualified-welders="qualifiedWelders"
    :all-paint-types="paintTypes"
    :all-lots="allLots"
    :stage-projects="stageProjects"
    @closeFabrication="closeFabrication"
  ></fabrication-edit>

  <fabrication-new
    v-if="showNew"
    :qualified-welders="qualifiedWelders"
    :all-paint-types="paintTypes"
    :forage-data="forageData"
    :is-fabrication="true"
    @closeLot="closeFabrication"
  />

  <tekla-import
    v-if="showTeklaImport"
    :forage-data="forageData"
    @closeTekla="closeFabrication"
  />

  <workshop-bulk-update
    v-if="showWorkshopBulkUpdate"
    :module="ModuleNames.FABRICATION"
    :selectedRows="selectedRows"
    @closeWorkshopBulkUpdate="closeFabrication"
  />

  <colour-selector
    ref="colourSelectorRef"
    :upvise-data-message="metadata"
  ></colour-selector>
</template>

<style lang="scss" scoped></style>
