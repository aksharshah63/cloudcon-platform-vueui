<script lang="ts">
import { UpviseDataMessage } from "../../store/modules/upvise";
import { defineComponent, onMounted, ref, watch, watchEffect } from "vue";
import useControllerProcessing from "../../use/controller/workshop/processing";
import useWorkshopController from "../../use/controller/workshop/workshop";
import DashletTable from "../../components/charts/staticdashboard/dashletTable.vue";
import ColourSelector from "../../components/display/colourSelector.vue";
import DashboardOverview from "../../controls/dashboard/overview.vue";
import ProcessingEditScreen from "./processingEdit.vue";
import ProcessingNew from "../../pages/workshop/newLot.vue";
import WorkshopBulkUpdate from "../../pages/workshop/workshopBulkUpdate.vue";
import { IRecord, IUpviseDataMessage } from "../../store/modules/upvise.d";
import { IProcessingRecord } from "../../use/controller/workshop/processing.d";
import { stateSymbol, useState } from "../../store/index";
import { IRecordDealsProduct } from "../../use/controller/sales/deals.d";
import backingField from "../../use/utils/useBackingField";
import { ModuleNames } from "../../use/utils/useConstants";
import { useTableNames } from "../../use/utils/useConstants";

export const Processing = defineComponent({
  name: "Processing",
  inject: [stateSymbol.description!],
  components: {
    ColourSelector,
    DashboardOverview,
    ProcessingEditScreen,
    ProcessingNew,
    DashletTable,
    WorkshopBulkUpdate,
  },
  setup() {
    const upvise = useState().upvise;
    const controller = useControllerProcessing(upvise);
    const workshop = useWorkshopController(upvise);
    const useBackingField = backingField();
    const upviseDataMessage = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const slicingInformation = ref(controller.getSlicingInformation());
    const backingFieldDictionary = ref({});
    const backingFieldData = ref({});
    const alreadyInitialised = ref(false);
    const dashboardOverviewRef = ref();
    const selectedRows = ref<{ row: Record<string, any>; group: string }[]>([]);
    const showEditScreen = ref(false);
    const showNew = ref(false);
    const showWorkshopBulkUpdate = ref(false);
    const uploadSuccessful = ref();
    const selectedProcessId = ref();
    const initialSortArray = ref(controller.getInitialSort());
    const customRow = ref({ using: true, level: "TableWorkshopProcessing" });
    const colourSelectorRef = ref();
    const forageData = ref();
    const traceabilityOptions = ref<IRecordDealsProduct[]>([]);
    const stageProjects = ref<IRecord[]>([]);
    const currentRecords = ref<Record<string, any>[]>([]);
    const removeAddButtons = ref([
      {
        currentGroupType: "_Mappedrelease",
        field: "",
        value: undefined,
      },
      {
        currentGroupType: "TableWorkshopProcessinginfo",
        field: "",
        value: undefined,
      },
    ]);
    const headerActionButtons = ref(workshop.headerButtons);
    const colourTheme = ref({
      primaryBackground: "#DECB00",
      primaryText: "#FFFFFF",
    });
    const removeNameColumnMinWidth = ref({
      [useTableNames.WORKSHOP_PROCESSING]: true,
    });

    onMounted(async () => {
      await controller.getMetadata().then((m) => (upviseDataMessage.value = m));
      await controller.getForageData().then((f) => {
        forageData.value = f;
        workshop.setTemplateId(forageData.value["system.user.settings"]);
      });
      backingFieldDictionary.value = useBackingField.getDictionary(
        upviseDataMessage.value
      );
      traceabilityOptions.value = controller.getTraceabilityOptions(
        forageData.value["unybiz.sales.products"] || []
      );
      await useBackingField
        .getData(backingFieldDictionary.value)
        .then((d) => (backingFieldData.value = d));
      stageProjects.value = workshop.getStageProjects(forageData.value);
      await controller.fetch();
    });

    function getFilteredRows(event: unknown) {
      const processing = event as Record<string, any>[];
      if (upvise.isFetchComplete) currentRecords.value = processing;
      //console.log(currentRecords.value);
    }

    function getSelectedRows(
      rows: { row: Record<string, any>; group: string }[]
    ) {
      selectedRows.value = rows;
    }

    function closeEditScreen() {
      setTimeout(() => {
        selectedProcessId.value = null;
        showEditScreen.value = false;
        showNew.value = false;
        showWorkshopBulkUpdate.value = false;
      }, 200);
      uploadSuccessful.value = true;
    }

    function groupedItemClick(
      action: string,
      groupName: string,
      itemId: string,
      parentId: string
    ) {
      if (action) console.log(action, groupName, parentId);
      if (action === "Edit" && groupName === "TableWorkshopProcessing") {
        selectedProcessId.value = itemId;
        showEditScreen.value = true;
      } else if (action === "Add") {
        showNew.value = true;
      }
    }

    function headerActionClicked(action: string) {
      if (action === "teklaImport") {
        workshop.openTeklaImportForm();
      } else if (action === "bulkUpdate") {
        showWorkshopBulkUpdate.value = true;
      }
    }

    function saveImport(importData: IProcessingRecord[]) {
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

    function clearSelectedRows() {
      if (dashboardOverviewRef.value) {
        dashboardOverviewRef.value.clearSelectedRows();
      }
    }

    watch(
      () => upvise.isFetchComplete,
      () => {
        controller.populateProcessingData(forageData.value);
        alreadyInitialised.value = true;
        console.log("watch has been triggered");
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
      groupedItemClick,
      currentRecords,
      upviseDataMessage,
      slicingInformation,
      dashboardOverviewRef,
      selectedRows,
      showEditScreen,
      showNew,
      showWorkshopBulkUpdate,
      uploadSuccessful,
      initialSortArray,
      selectedProcessId,
      customRow,
      colourSelectorRef,
      forageData,
      traceabilityOptions,
      stageProjects,
      removeAddButtons,
      headerActionButtons,
      colourTheme,
      removeNameColumnMinWidth,
      getFilteredRows,
      getSelectedRows,
      closeEditScreen,
      headerActionClicked,
      saveImport,
      clearSelectedRows,
    };
  },
});
export default Processing;
</script>

<template>
  <!--  module-name="TBD"-->
  <dashboard-overview
    ref="dashboardOverviewRef"
    module-name="processing"
    title="Processing"
    :upvise-data-message="upviseDataMessage"
    :show-header-toggle="true"
    :show-left-right-header="false"
    :show-view-toggle="false"
    :force-show-details="true"
    :initial-sort-array="initialSortArray"
    :custom-row-colours="customRow"
    :remove-add="removeAddButtons"
    :show-file-export="true"
    :show-file-import="true"
    :header-action-buttons="headerActionButtons"
    :slicing-information="slicingInformation"
    :upload-successful="uploadSuccessful"
    :colour-theme="colourTheme"
    :start-expanded="true"
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
        title="processing"
      ></dashlet-table>
    </template>
  </dashboard-overview>

  <processing-edit-screen
    v-if="showEditScreen"
    :processing-id="selectedProcessId"
    :traceability-options="traceabilityOptions"
    :stage-projects="stageProjects"
    @closeEditScreen="closeEditScreen"
  ></processing-edit-screen>

  <processing-new
    v-if="showNew"
    :forage-data="forageData"
    :traceability-options="traceabilityOptions"
    :is-fabrication="false"
    @closeLot="closeEditScreen"
  />

  <workshop-bulk-update
    v-if="showWorkshopBulkUpdate"
    :module="ModuleNames.PROCESSING"
    :selectedRows="selectedRows"
    @closeWorkshopBulkUpdate="closeEditScreen"
    @clearSelected="clearSelectedRows"
  />

  <colour-selector
    ref="colourSelectorRef"
    :upvise-data-message="upviseDataMessage"
  ></colour-selector>
</template>
<style scoped></style>
