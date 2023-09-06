<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IRecord, IUpviseDataMessage } from "../../../store/modules/upvise.d";
import { UpviseDataMessage } from "../../../store/modules/upvise";
import useControllerProjectPlanner from "../../../use/controller/project/planner";
import DashboardOverview from "../../../controls/dashboard/overview.vue";
import PlannerMilestoneEdit from "../../../pages/project/planner/milestoneEdit.vue";
import PlannerTaskEdit from "../../../pages/project/planner/taskEdit.vue";
import ProgressBarItem from "../../../components/chart/progressBarItem.vue";
import PlannerProjectDetails from "../../../pages/project/planner/projectDetails.vue";
import ProjectFinancialDetails from "../../../pages/project/planner/financialDetails.vue";

import QuoteImport from "./quoteImport.vue";
import PurchaseOrderExport from "./purchaseOrderExport.vue";
import { useToast } from "primevue/usetoast";
import { computed, defineComponent, onMounted, ref, watchEffect } from "vue";
import { stateSymbol, useState } from "../../../store/index";
import backingField from "../../../use/utils/useBackingField";
import { useTableNames } from "../../../use/utils/useConstants";
import utils from "../../../use/function/useUtils";

export const ProjectPlanner = /*#__PURE__*/ defineComponent({
  name: "ProjectPlanner",
  inject: [stateSymbol.description!],
  components: {
    DashboardOverview,
    PlannerMilestoneEdit,
    PlannerTaskEdit,
    ProgressBarItem,
    PlannerProjectDetails,
    ProjectFinancialDetails,
    PurchaseOrderExport,
    QuoteImport,
  },
  setup() {
    const toast = useToast();
    const loading = ref(true);
    const upvise = useState().upvise;
    const controller = useControllerProjectPlanner(upvise);
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const projectid = controller.projectid;
    const showMilestone = ref(false);
    const milestoneId = ref();
    const showTask = ref(false);
    const taskId = ref();
    const editScreenParentId = ref();
    const dashboardOverviewRef = ref();
    const slicingInformation = ref(controller.getSlicingInformation());
    const showImportQuoteScreen = ref(false);
    const showExportScreen = ref(false);
    const forageData = ref();
    const budgetDataOptions = ref({});
    const useBackingField = backingField();
    const backingFieldDictionary = ref({});
    const backingFieldData = ref({});
    const viewToggleOptions = ref(["data", "chart", "timeline"]);

    onMounted(async () => {
      await controller.getMetadata().then((m) => (metadata.value = m));
      console.log("METADATA:", metadata.value);
      await controller.getForageData().then((f) => (forageData.value = f));

      budgetDataOptions.value = controller.getBudgetOptionsData(
        forageData.value
      );
      console.log("budgetDataOptions:", budgetDataOptions.value);
      backingFieldDictionary.value = useBackingField.getDictionary(
        metadata.value
      );
      await useBackingField
        .getData(backingFieldDictionary.value)
        .then((d) => (backingFieldData.value = d));
      controller.fetch();
    });

    const project = computed(() => {
      return controller.getProject();
    });

    const headerActionButtons = computed(() => {
      const headerActions = [];
      const settings = forageData.value?.["system.user.settings"];

      if (
        utils.getSetting(settings ?? [], "PLANNER_DISABLE_IMPORT_FROM_QUOTE") !=
        "1"
      )
        headerActions.push({
          action: "import",
          tooltip: "Import from Quote",
          icon: "download",
        });

      if (
        utils.getSetting(
          settings ?? [],
          "PLANNER_DISABLE_CREATE_PURCHASE_ORDER_FROM_SELECTED_ITEMS"
        ) != "1" ||
        utils.getSetting(
          settings ?? [],
          "PLANNER_DISABLE_CREATE_QUOTE_FROM_SELECTED_ITEMS"
        ) != "1" ||
        utils.getSetting(
          settings ?? [],
          "PLANNER_DISABLE_CREATE_BLANK_QUOTE"
        ) != "1"
      )
        headerActions.push({
          action: "exportToPOQuote",
          tooltip: "Export to Purchase Order or Quote",
          icon: "upload",
        });

      return headerActions;
    });

    function groupedItemClick(
      action: string,
      groupName: string,
      itemId: string,
      parentId: string
    ) {
      if (action) console.log();
      if (groupName === "TableSchedulerMilestones") {
        milestoneId.value = itemId;
        editScreenParentId.value = parentId;
        showMilestone.value = true;
      } else if (groupName === "TableSchedulerTasks") {
        taskId.value = itemId;
        editScreenParentId.value = parentId;
        showTask.value = true;
      }
    }

    function headerActionClicked(action: string) {
      let selectedRows = dashboardOverviewRef.value.getAllSelectedRows();
      switch (action) {
        case "exportToPOQuote":
          //showImportQuoteScreen.value = true;
          // Mapping the data to the format for the create purchase order function
          // console.log(selectedRows);
          selectedRows = selectedRows.filter(
            (entry: { row: Record<string, unknown>; group: string }) =>
              [
                "TableSchedulerMilestones",
                "TableSchedulerTasks",
                useTableNames.PROJECT_PLANNER_BUDGETS,
              ].includes(entry.group)
          );
          // console.log(selectedRows);
          selectedItemsForExport.value = selectedRows;
          showExportScreen.value = true;
          break;
        case "import":
          showImportQuoteScreen.value = true;
          break;
      }
    }
    const selectedItemsForExport = ref([]);

    function closeMilestone() {
      setTimeout(() => {
        showMilestone.value = false;
      }, 200);
    }

    function closeTask() {
      setTimeout(() => {
        showTask.value = false;
      }, 200);
    }

    function closeImportQuote() {
      setTimeout(() => {
        showImportQuoteScreen.value = false;
      }, 200);
    }
    function closeExportScreen() {
      setTimeout(() => {
        selectedItemsForExport.value = [];
        showExportScreen.value = false;
      }, 200);
    }

    function save(currentGroupType: string, item: IRecord) {
      if (
        currentGroupType === useTableNames.PROJECT_PLANNER_MILESTONES ||
        currentGroupType === useTableNames.PROJECT_PLANNER_TASKS
      ) {
        controller.doSaveModelEntities({
          [currentGroupType]: [item],
        });
      } else {
        console.log(`No valid save for ${currentGroupType}`);
      }
    }

    watchEffect(() => {
      useBackingField.setData(
        backingFieldDictionary.value,
        backingFieldData.value
      );
      controller.notPersistedCalcs(budgetDataOptions.value);
    });

    return {
      loading,
      projectid,
      project,
      metadata,
      showMilestone,
      milestoneId,
      showTask,
      taskId,
      editScreenParentId,
      dashboardOverviewRef,
      slicingInformation,
      showImportQuoteScreen,
      forageData,
      budgetDataOptions,
      viewToggleOptions,
      groupedItemClick,
      closeMilestone,
      closeTask,
      closeImportQuote,
      headerActionClicked,
      headerActionButtons,
      toast,
      showExportScreen,
      closeExportScreen,
      save,
      selectedItemsForExport,
    };
  },
});

export default ProjectPlanner;
</script>

<template>
  <dashboard-overview
    ref="dashboardOverviewRef"
    module-name="projectPlanner"
    title="Planner"
    :upvise-data-message="metadata"
    :parent-id="projectid"
    :header-action-buttons="headerActionButtons"
    :slicing-information="slicingInformation"
    :show-tabs="false"
    :view-toggle-options="viewToggleOptions"
    :tick-icon-field="'iscomplete'"
    @groupedItemClick="groupedItemClick"
    @headerActionClicked="headerActionClicked"
    @save="save"
  >
    <template v-slot:header-left>
      <planner-project-details :projectDetails="project" />
    </template>
    <template v-slot:header-middle>
      <div
        style="
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 104px;
        "
      >
        <ProgressBarItem
          :actualsApproved="project.approvedActualsTotal"
          :actualsNotApproved="project.unapprovedActualsTotal"
          :forecast="project.forecast"
          :target="project.budget"
          :budget="project.purchaseTotal"
          :width="'100%'"
          :showLabels="true"
        />
      </div>
    </template>
    <template v-slot:header-right>
      <project-financial-details :projectDetails="project" />
    </template>
  </dashboard-overview>

  <planner-milestone-edit
    v-if="showMilestone"
    :upvise-data-message="metadata"
    :milestone-id="milestoneId"
    :parent-id="editScreenParentId"
    :projectWbscode="project.code"
    @closeMilestone="closeMilestone"
  />

  <planner-task-edit
    v-if="showTask"
    :upvise-data-message="metadata"
    :task-id="taskId"
    :parent-id="editScreenParentId"
    :projectWbscode="project.code"
    :budget-data-options="budgetDataOptions"
    @closeTask="closeTask"
  />

  <quote-import
    v-if="showImportQuoteScreen"
    @closeImportQuote="closeImportQuote"
    :projectid="projectid"
  />

  <purchase-order-export
    v-if="showExportScreen"
    @closeExport="closeExportScreen"
    :upvise-data-message="metadata"
    :forage-data="forageData"
    :selected-items-for-export="selectedItemsForExport"
    :projectid="projectid"
  />
</template>

<style scoped></style>
