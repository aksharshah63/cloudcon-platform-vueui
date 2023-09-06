<!--suppress JSUnfilteredForInLoop -->
<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-explicit-any */
import Sidebar from "primevue/sidebar";
import InputText from "primevue/inputtext";
import Calendar from "primevue/calendar";
import InputSwitch from "primevue/inputswitch";
import InputNumber from "primevue/inputnumber";
import Dropdown from "primevue/dropdown";
import ProgressSpinner from "primevue/progressspinner";
import moment from "moment";
import {
  computed,
  defineComponent,
  reactive,
  ref,
  watch,
  watchEffect,
} from "vue";
import DisplayStyle from "../../../components/display/style.vue";
import ProgressBarItem from "../../../components/chart/progressBarItem.vue";
import useControllerProjectPlanner from "../../../use/controller/project/planner";
import {
  IRecordPlannerBudget,
  IRecordPlannerMilestone,
  IRecordPlannerOriginalBudget,
  IRecordPlannerResourceCategory,
  ITaskLog,
} from "../../../use/controller/project/planner.d";
import utils from "../../../use/function/useUtils";
import { IRecord, IUpviseDataMessage } from "../../../store/modules/upvise.d";
import { stateSymbol, useState } from "../../../store/index";

import { useToast } from "primevue/usetoast";
import useUtils from "../../../use/function/useUtils";
import maths from "../../../use/utils/useNumberOperations";
import OverlayPanel from "primevue/overlaypanel";
import ProgressHistoryLogTable from "../planner/progressHistoryLogTable.vue";
import { useTableNames } from "../../../use/utils/useConstants";

export const PlannerTaskEdit = /*#__PURE__*/ defineComponent({
  name: "PlannerTaskEdit",
  inject: [stateSymbol.description!],
  components: {
    Sidebar,
    InputText,
    Calendar,
    InputSwitch,
    InputNumber,
    Dropdown,
    DisplayStyle,
    ProgressBarItem,
    ProgressSpinner,
    OverlayPanel,
    ProgressHistoryLogTable,
  },
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
    taskId: {
      type: String,
      required: true,
    },
    parentId: {
      type: String,
      required: true,
    },
    projectWbscode: {
      type: String,
      required: true,
    },
    budgetDataOptions: {
      type: Object as () => Record<string, IRecord[]>,
      required: true,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const upvise = useState().upvise;
    const upviseDataMessage = ref<IUpviseDataMessage>(props.upviseDataMessage);
    const controller = useControllerProjectPlanner(upvise);
    const awaitingResponse = ref(false);
    const copyModelTask = props.taskId
      ? controller.getEditTask(props.taskId)
      : controller.getNewTask(props.parentId);
    const originalTask = utils.deepCopy(copyModelTask);
    const copyModelBudget = parseBudgets(
      props.taskId
        ? controller.getBudgetsForTask(props.taskId)
        : reactive<IRecordPlannerBudget[]>([])
    );
    const originalBudgets = utils.deepCopy(copyModelBudget);
    const progressLogs = props.taskId
      ? controller.getProgressLogsForTask(props.taskID)
      : reactive<ITaskLog[]>([]);

    const taskLogs = props.taskId
      ? controller.getTaskLogs(props.taskId)
      : reactive<ITaskLog[]>([]);

    const showTask = ref(true);
    const showSave = ref(false);

    const isProgressChanged = computed(() => {
      return (
        originalTask.progress != copyModelTask.progress ||
        originalTask.progresstype != copyModelTask.progresstype
      );
    });

    const concatWbscode = computed(() => {
      const wbsCodes = [copyModelTask.wbscode];
      if (props.parentId) {
        let previousMilestone: IRecordPlannerMilestone | null =
          controller.getEditMilestone(props.parentId);
        while (previousMilestone) {
          wbsCodes.push(previousMilestone.wbscode);
          previousMilestone = previousMilestone.milestoneid
            ? controller.getEditMilestone(previousMilestone.milestoneid!)
            : null;
        }
      }

      return props.projectWbscode + " / " + wbsCodes.reverse().join(" / ");
    });

    const startDateFormatted = computed({
      get: () => {
        if (!copyModelTask.startdate || copyModelTask.startdate === "") {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          copyModelTask.startdate = Date.now().toString();
        }
        return moment(parseInt(copyModelTask.startdate)).format("YYYY-MM-DD");
      },
      set: (val) => {
        copyModelTask.startdate = moment(val).valueOf().toString();
      },
    });

    const endDateFormatted = computed({
      get: () => {
        if (!copyModelTask.enddate || copyModelTask.enddate === "") {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          copyModelTask.enddate = Date.now().toString();
        }
        return moment(parseInt(copyModelTask.enddate)).format("YYYY-MM-DD");
      },
      set: (val) => {
        copyModelTask.enddate = moment(val).valueOf().toString();
      },
    });

    const isBudgetCalculated = computed({
      get: () => {
        return copyModelTask.budgettype === 0;
      },
      set: (val) => {
        if (val) copyModelTask.budgettype = 0;
        else copyModelTask.budgettype = 1;
      },
    });

    const isProgressPercentage = computed({
      get: () => {
        return copyModelTask.progresstype === 0;
      },
      set: (val) => {
        if (val) {
          // Progress can't be above 100%
          if (copyModelTask.progress > 100) copyModelTask.progress = 100;
          copyModelTask.progresstype = 0;
        } else {
          // Progress can't be greater than the output amount
          if (copyModelTask.progress > copyModelTask.outputamount)
            copyModelTask.progress = copyModelTask.outputamount;
          copyModelTask.progresstype = 1;
        }
      },
    });

    const outputuomOptions = computed(() => {
      return Object.values(upvise.entityData("_taskUom"));
    });

    const labourOptions = computed(() => {
      return props.budgetDataOptions["Labour"].map((o: IRecord) => ({
        option: o.name,
        value: o.id,
        unitprice: o.purchaseprice,
      }));
    });

    const plantOptions = computed(() => {
      return props.budgetDataOptions["Plant"].map((o: IRecord) => ({
        option: o.name,
        value: o.id,
        unitprice: o.purchaseprice,
      }));
    });

    const plantSubOptions = computed(() => {
      const result = [];
      const plantSubOptions = Object.values(
        upvise.entityData("TableToolsTools.Sub_Type")
      ) as IRecord[];

      for (const plant in plantSubOptions) {
        result.push({ option: plantSubOptions[plant].value });
      }

      return result;
    });

    const subcontractorOptions = computed(() => {
      return props.budgetDataOptions["Subcontractor"].map((o: IRecord) => ({
        option: o.name,
        value: o.id,
      }));
    });

    const labourBudget = computed(() => {
      let labourBudget = 0;

      for (const labour of copyModelBudget) {
        if (
          labour.resourcetype === "Labour" &&
          utils.IsActive(labour as IRecord)
        ) {
          labourBudget += Number(
            (labour.qty * (labour?.unitprice || 0)).toFixed(2)
          );
        }
      }

      return Number(labourBudget.toFixed(2));
    });

    const plantBudget = computed(() => {
      let plantBudget = 0;

      for (const plant of copyModelBudget) {
        if (
          plant.resourcetype === "Plant" &&
          utils.IsActive(plant as IRecord)
        ) {
          plantBudget += Number(
            (plant.qty * (plant.unitprice || 0)).toFixed(2)
          );
        }
      }

      return Number(plantBudget.toFixed(2));
    });

    const subcontractorBudget = computed(() => {
      let subcontractorBudget = 0;

      for (const subcontractor of copyModelBudget) {
        if (
          subcontractor.resourcetype === "Subcontractor" &&
          utils.IsActive(subcontractor as IRecord)
        ) {
          subcontractorBudget += Number(
            (subcontractor.qty * (subcontractor.unitprice || 0)).toFixed(2)
          );
        }
      }

      return Number(subcontractorBudget.toFixed(2));
    });

    const materialBudget = computed(() => {
      let materialBudget = 0;

      for (const material of copyModelBudget) {
        if (
          material.resourcetype === "Materials" &&
          utils.IsActive(material as IRecord)
        ) {
          materialBudget += Number(
            (material.qty * (material.unitprice || 0)).toFixed(2)
          );
        }
      }

      return Number(materialBudget.toFixed(2));
    });

    const labourCost = computed(() => {
      let labourCost = 0;

      for (const labour of copyModelBudget) {
        if (
          labour.resourcetype === "Labour" &&
          typeof labour.original === "object" &&
          typeof labour.resourcecategory === "object" &&
          utils.IsActive(labour as IRecord)
        ) {
          labourCost = maths.sum(labourCost, labour.purchaseTotal);
        }
      }

      return labourCost;
    });

    const plantCost = computed(() => {
      let plantCost = 0;

      for (const plant of copyModelBudget) {
        if (
          plant.resourcetype === "Plant" &&
          typeof plant.original === "object" &&
          typeof plant.resourcecategory === "object" &&
          utils.IsActive(plant as IRecord)
        ) {
          plantCost = maths.sum(plantCost, plant.purchaseTotal);
        }
      }

      return plantCost;
    });

    const subcontractorCost = computed(() => {
      let subcontractorCost = 0;

      for (const subcontractor of copyModelBudget) {
        if (
          subcontractor.resourcetype === "Subcontractor" &&
          typeof subcontractor.original === "object" &&
          typeof subcontractor.resourcecategory === "object" &&
          utils.IsActive(subcontractor as IRecord)
        ) {
          subcontractorCost = maths.sum(
            subcontractorCost,
            subcontractor.purchaseTotal
          );
        }
      }

      return subcontractorCost;
    });

    const materialCost = computed(() => {
      let materialCost = 0;

      for (const material of copyModelBudget) {
        if (
          material.resourcetype === "Materials" &&
          typeof material.original === "object" &&
          typeof material.resourcecategory === "object" &&
          utils.IsActive(material as IRecord)
        ) {
          materialCost = maths.sum(materialCost, material.purchaseTotal);
        }
      }

      return materialCost;
    });

    function parseBudgets(budgets: IRecordPlannerBudget[]) {
      budgets.forEach((b) => {
        if (b.resourcecategory)
          b.resourcecategory = JSON.parse(b.resourcecategory as string);
        else b.resourcecategory = {};

        if (b.original) b.original = JSON.parse(b.original as string);
        else b.original = {};
      });
      return reactive(budgets);
    }

    function stringifyBudgets(budgets: IRecordPlannerBudget[]) {
      budgets.forEach((b) => {
        if (Object.keys(b.resourcecategory).length > 0)
          b.resourcecategory = JSON.stringify(
            b.resourcecategory as IRecordPlannerResourceCategory
          );
        else b.resourcecategory = "";

        if (Object.keys(b.original).length > 0)
          b.original = JSON.stringify(
            b.original as IRecordPlannerOriginalBudget
          );
        else b.original = "";
      });
      return budgets;
    }

    // TODO found where to get charge type options from for every budget type
    function getChargeTypeOptions(category: string, equipmentName: string) {
      const sellRates = getSellRatesOptions(category, equipmentName);
      const result = [];

      for (const sellRate of sellRates) {
        if (
          sellRate.value &&
          typeof sellRate.value == "number" &&
          !isNaN(sellRate.value)
        ) {
          result.push(sellRate);
        }
      }

      return result;
    }

    // get the sell rates for a specific category and equipment e.g. category: labourType, equipmentName: Boilermaker
    function getSellRatesOptions(category: string, equipmentName: string) {
      for (const rates of Object.values(
        upvise.entityData("TablePlannerRatesDynamic")
      ) as IRecord[]) {
        if (
          rates.category === category &&
          rates.equipmentName === equipmentName
        ) {
          return rates.sellRates as unknown as Record<string, unknown>[];
        }
      }
      return [];
    }

    // get category from resourcetype
    function getCategory(resourceType: string) {
      switch (resourceType) {
        case "Labour":
          return "labourType";
        case "Plant":
          return "plantType";
        default:
          return "";
      }
    }

    function addNewField(resourceType: string) {
      const newField = controller.getNewBudget(copyModelTask.id, resourceType);
      copyModelBudget.push(newField);
    }

    function deleteField(_: unknown, index: number) {
      copyModelBudget[index]._type = "DELETE";
    }

    async function saveTask() {
      if (
        controller.doValidateTask(
          copyModelTask,
          copyModelBudget as unknown as IRecordPlannerBudget[]
        )
      ) {
        awaitingResponse.value = true;
        await controller
          .doSaveModelEntities({
            TableSchedulerTasks: [copyModelTask],
            [useTableNames.PROJECT_PLANNER_BUDGETS]: stringifyBudgets(
              JSON.parse(
                JSON.stringify(copyModelBudget)
              ) as IRecordPlannerBudget[]
            ),
            TableSchedulerTasklogs: isProgressChanged.value
              ? [
                  controller.createTaskLog(
                    utils.deepCopy(originalTask),
                    utils.deepCopy(copyModelTask),
                    ""
                  ),
                ]
              : [],
          })
          .then(() => {
            awaitingResponse.value = false;
            closeTask();
          })
          .catch(() => {
            awaitingResponse.value = false;
            useToast().add({
              severity: "error",
              summary: "Operation unsuccesful",
              detail: "Could not save the milestone",
              life: 1570,
            });
          });
      }
    }

    async function deleteTask() {
      awaitingResponse.value = true;
      await controller
        .doDeleteTask(copyModelTask, upviseDataMessage.value)
        .then(() => {
          awaitingResponse.value = false;
          closeTask();
        })
        .catch(() => {
          awaitingResponse.value = false;
          useToast().add({
            severity: "error",
            summary: "Operation unsuccesful",
            detail: "Could not save the milestone",
            life: 1570,
          });
        });
    }

    function closeTask() {
      showTask.value = false;
      emit("closeTask");
    }

    function onOutputAmountChange(event: any) {
      if (
        copyModelTask.progresstype === 1 &&
        event.value < copyModelTask.progress
      )
        copyModelTask.progress = event.value;
    }

    function updateBudgetUnitPrice(event: any, budget: IRecordPlannerBudget) {
      let unitPrice;
      switch (budget.resourcetype) {
        case "Labour":
          unitPrice = labourOptions.value?.find(
            (o: Record<string, unknown>) => o.value === event.value
          )?.unitprice;
          if (unitPrice) budget.unitprice = maths.round(unitPrice);
          break;
        case "Plant":
          unitPrice = plantOptions.value?.find(
            (o: Record<string, unknown>) => o.value === event.value
          )?.unitprice;
          if (unitPrice) budget.unitprice = maths.round(unitPrice);
          break;
      }
    }

    watchEffect(() => {
      if (isBudgetCalculated.value) {
        const sum =
          labourBudget.value +
          plantBudget.value +
          subcontractorBudget.value +
          materialBudget.value;
        copyModelTask.budget = Number(sum.toFixed(2));
      }
    });

    watch(
      [copyModelTask, copyModelBudget],
      utils.debounce(() => {
        let budgetsChanged = false;
        //const task = stateModel.value["TableSchedulerTasks"][copyModelTask.id];

        if (copyModelBudget.length !== originalBudgets.length) {
          budgetsChanged = true;
        } else {
          stringifyBudgets(JSON.parse(JSON.stringify(copyModelBudget))).some(
            (b) => {
              const budget = originalBudgets.find((ob) => ob.id === b.id);

              if (!budget || !utils.equalObjects(budget, b)) {
                budgetsChanged = true;
                return true;
              }
              return false;
            }
          );
        }

        showSave.value =
          budgetsChanged || !utils.equalObjects(copyModelTask, originalTask);
      }, 1000),
      { deep: true }
    );

    watchEffect(() => {
      copyModelBudget.forEach((b) => {
        if (b.resourcetype === "Labour" || b.resourcetype === "Plant") {
          const category = getCategory(b.resourcetype);
          const sellRates = getSellRatesOptions(category, b.resourcetype);
          const sellRateKey = sellRates.find(
            (s) => s.value === b.unitprice
          )?.key;

          if (sellRateKey) b.unitprice = sellRateKey as number;
          else
            (b.resourcecategory as IRecordPlannerResourceCategory).chargeType =
              "";
        }
      });
    });

    const ProgressHistoryPanel = ref();
    const showProgressHistoryLog = (event: any) => {
      ProgressHistoryPanel.value.toggle(event);
    };

    return {
      // eslint-disable-next-line
      useUtils,
      copyModelTask,
      copyModelBudget,
      progressLogs,
      taskLogs,
      showTask,
      showSave,
      concatWbscode,
      startDateFormatted,
      endDateFormatted,
      isBudgetCalculated,
      isProgressPercentage,
      outputuomOptions,
      labourOptions,
      plantOptions,
      plantSubOptions,
      subcontractorOptions,
      labourBudget,
      plantBudget,
      subcontractorBudget,
      materialBudget,
      labourCost,
      plantCost,
      subcontractorCost,
      materialCost,

      getChargeTypeOptions,
      getSellRatesOptions,
      addNewField,
      deleteField,
      getCategory,
      saveTask,
      deleteTask,
      closeTask,
      onOutputAmountChange,
      updateBudgetUnitPrice,
      IsActive: utils.IsActive,
      awaitingResponse,
      ProgressHistoryPanel,
      showProgressHistoryLog,
    };
  },
});
export default PlannerTaskEdit;
</script>

<template>
  <div>
    <sidebar class="task-screen" :visible="showTask" position="right">
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name">
                {{ copyModelTask.name ? copyModelTask.name : "Task Name" }}
              </span>
            </div>

            <div class="p-col-12">
              <span class="header-wbscode">{{ concatWbscode }}</span>
            </div>
          </div>
        </div>

        <div class="p-col-5 sidebar-options">
          <div class="loading-spinner" v-if="awaitingResponse">
            <ProgressSpinner class="spinner"></ProgressSpinner>
          </div>
          <div v-if="showSave" class="option" @click="saveTask()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <div class="option" @click="deleteTask()">
            <font-awesome-icon class="trash-icon" :icon="['fa', 'trash']" />
          </div>
          <div class="option" @click="closeTask()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>
        <div class="p-col-12 header-chart">
          <ProgressBarItem
            :actualsApproved="copyModelTask.approvedActualsTotal"
            :actualsNotApproved="copyModelTask.unapprovedActualsTotal"
            :forecast="copyModelTask.forecast"
            :target="copyModelTask.budget"
            :budget="copyModelTask.purchaseTotal"
            :width="'100%'"
            :showLabels="true"
          />
        </div>

        <div class="p-col-12">
          <span class="header-description">
            {{
              copyModelTask.description
                ? copyModelTask.description
                : "description"
            }}
          </span>
        </div>

        <div class="p-col-12 divider"></div>
        <div class="p-col-2 input-label">Name</div>
        <div class="p-col-4">
          <input-text
            class="input-text-field"
            type="text"
            v-model="copyModelTask.name"
          >
          </input-text>
        </div>

        <div class="p-col-2 input-label">WBS Code</div>
        <div class="p-col-4">
          <input-text
            class="input-text-field"
            type="text"
            v-model="copyModelTask.wbscode"
          >
          </input-text>
        </div>

        <div class="p-col-2 input-label">Description</div>
        <div class="p-col-10">
          <textarea
            class="input-textarea"
            rows="2"
            v-model="copyModelTask.description"
          >
          </textarea>
        </div>

        <div class="p-col-2 input-label">Start Date</div>
        <div class="p-col-4">
          <calendar
            class="input-date"
            dateFormat="yyyy-mm-dd"
            v-model="startDateFormatted"
            :manualInput="false"
          >
          </calendar>
        </div>

        <div class="p-col-2 input-label">End Date</div>
        <div class="p-col-4">
          <calendar
            class="input-date"
            dateFormat="yyyy-mm-dd"
            v-model="endDateFormatted"
            :manualInput="false"
          >
          </calendar>
        </div>

        <div class="p-col-2 input-label">Target</div>
        <div class="p-col-1 input-switch">
          <input-switch
            v-model="isBudgetCalculated"
            v-tooltip.top="
              isBudgetCalculated
                ? 'Target is being calculated'
                : 'Target is manually set'
            "
          />
        </div>
        <div :class="[`p-col-${copyModelTask.purchaseTotal ? 2 : 3}`]">
          <input-number
            class="input-number-field"
            mode="currency"
            currency="AUD"
            locale="en-AU"
            v-model="copyModelTask.budget"
            :disabled="isBudgetCalculated"
            :allowEmpty="false"
          >
          </input-number>
        </div>
        <div
          v-if="copyModelTask.purchaseTotal"
          class="p-col-1"
          style="display: flex; align-items: center"
        >
          <display-style
            class="original-budget"
            v-tooltip.top="'Cost/Budget Amount'"
            :data="copyModelTask.purchaseTotal"
            type-specialisation="currency"
          />
        </div>

        <div class="p-col-2 input-label">Forecast</div>
        <div class="p-col-4">
          <input-number
            class="input-number-field"
            mode="currency"
            currency="AUD"
            locale="en-AU"
            v-model="copyModelTask.forecast"
            :allowEmpty="false"
          >
          </input-number>
        </div>

        <div class="p-col-2 input-label">Output</div>
        <div class="p-col-2">
          <input-text
            class="input-text-field"
            type="text"
            v-model="copyModelTask.output"
          >
          </input-text>
        </div>
        <div class="p-col-1">
          <input-number
            class="input-number-field"
            v-model="copyModelTask.outputamount"
            :allowEmpty="false"
            :minFractionDigits="1"
            :maxFractionDigits="10"
            @input="onOutputAmountChange($event)"
          >
          </input-number>
        </div>
        <div class="p-col-1">
          <dropdown
            class="input-dropdown-field"
            :options="outputuomOptions"
            optionLabel="key"
            optionValue="value"
            v-model="copyModelTask.outputuom"
          >
          </dropdown>
        </div>

        <div class="p-col-2 input-label">Progress</div>
        <div class="p-col-1 input-switch">
          <input-switch
            v-model="isProgressPercentage"
            v-tooltip.top="
              isProgressPercentage
                ? 'Progress is represented as a percentage'
                : 'Progress is represented as a unit value'
            "
          />
        </div>
        <div class="p-col-2">
          <input-number
            class="input-number-field"
            v-model="copyModelTask.progress"
            :allowEmpty="false"
            :minFractionDigits="1"
            :maxFractionDigits="10"
            :max="isProgressPercentage ? 100 : copyModelTask.outputamount"
            :suffix="isProgressPercentage ? '%' : null"
          >
          </input-number>
        </div>
        <div
          class="p-col-1 history-icon-container"
          @click="showProgressHistoryLog"
        >
          <font-awesome-icon class="history-icon" :icon="['fa', 'history']" />
          <OverlayPanel
            ref="ProgressHistoryPanel"
            :showCloseIcon="true"
            :dismissable="true"
            :style="{ width: '700px' }"
          >
            <ProgressHistoryLogTable :data="taskLogs"></ProgressHistoryLogTable>
          </OverlayPanel>
        </div>

        <div class="p-col-12 divider"></div>

        <div class="p-col-6 budget-label">
          Labour
          <font-awesome-icon
            class="plus-circle-icon"
            :icon="['fa', 'plus-circle']"
            @click="addNewField('Labour')"
          />
        </div>
        <div class="p-col-6" style="padding: 0">
          <div class="p-grid" style="width: 100%; margin: 0">
            <div class="p-col-11 budget-total">
              <div class="budget-total-container">
                <display-style
                  class="budget"
                  :data="labourBudget"
                  type-specialisation="currency"
                />
                <display-style
                  v-if="labourCost"
                  v-tooltip.top="'Cost/Budget Amount'"
                  class="original-budget"
                  :data="labourCost"
                  type-specialisation="currency"
                />
              </div>
            </div>
            <div class="p-col-1" />
          </div>
        </div>

        <div class="p-col-12">
          <div
            v-for="(Item, index) in copyModelBudget"
            :key="'labour_' + index"
          >
            <div
              v-if="Item.resourcetype === 'Labour' && IsActive(Item)"
              class="p-grid budget-item"
            >
              <div class="p-col-3">
                <dropdown
                  class="input-dropdown-field"
                  v-model="Item.resourceid"
                  :options="labourOptions"
                  optionLabel="option"
                  optionValue="value"
                  placeholder="Labour"
                  @change="updateBudgetUnitPrice($event, Item)"
                />
              </div>

              <div class="p-col-4"></div>

              <div class="p-col-5" style="padding: 0">
                <div class="p-grid" style="margin: 0">
                  <div class="p-col-4">
                    <dropdown
                      class="input-dropdown-field"
                      v-model="Item.resourcecategory.chargeType"
                      :options="
                        getChargeTypeOptions('labourType', Item.resourceid)
                      "
                      optionLabel="key"
                      optionValue="key"
                      :placeholder="Item.unitprice ? '-' : 'Charge Type'"
                    />
                  </div>

                  <div class="p-col-3">
                    <input-number
                      class="input-number-field"
                      v-model="Item.unitprice"
                      mode="currency"
                      currency="AUD"
                      locale="en-AU"
                      :allowEmpty="false"
                    />
                  </div>

                  <div class="p-col-1 multiplication-icon">
                    <font-awesome-icon
                      class="times-icon"
                      :icon="['fa', 'times']"
                    />
                  </div>

                  <div class="p-col-3">
                    <input-number
                      class="input-number-field"
                      v-model="Item.qty"
                      :minFractionDigits="1"
                      :maxFractionDigits="2"
                      suffix="h"
                      :allowEmpty="false"
                    >
                    </input-number>
                  </div>

                  <div class="p-col-1 budget-delete">
                    <font-awesome-icon
                      class="trash-icon"
                      :icon="['fa', 'trash']"
                      @click="deleteField($event, index)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-col-12 divider"></div>

        <div class="p-col-6 budget-label">
          Plant
          <font-awesome-icon
            class="plus-circle-icon"
            :icon="['fa', 'plus-circle']"
            @click="addNewField('Plant')"
          />
        </div>
        <div class="p-col-6" style="padding: 0">
          <div class="p-grid" style="width: 100%; margin: 0">
            <div class="p-col-11 budget-total">
              <div class="budget-total-container">
                <display-style
                  class="budget"
                  :data="plantBudget"
                  type-specialisation="currency"
                />
                <display-style
                  v-if="plantCost"
                  v-tooltip.top="'Cost/Budget Amount'"
                  class="original-budget"
                  :data="plantCost"
                  type-specialisation="currency"
                />
              </div>
            </div>
            <div class="p-col-1" />
          </div>
        </div>

        <div class="p-col-12">
          <div v-for="(Item, index) in copyModelBudget" :key="'plant_' + index">
            <div
              v-if="Item.resourcetype === 'Plant' && IsActive(Item)"
              class="p-grid budget-item"
            >
              <div class="p-col-3">
                <dropdown
                  class="input-dropdown-field"
                  v-model="Item.resourceid"
                  :options="plantOptions"
                  optionLabel="option"
                  optionValue="value"
                  placeholder="Plant"
                  @change="updateBudgetUnitPrice($event, Item)"
                />
              </div>

              <div class="p-col-4" style="padding: 0">
                <div class="p-grid" style="margin: 0">
                  <div class="p-col-6">
                    <dropdown
                      class="input-dropdown-field"
                      v-model="Item.resourcecategory.subtype"
                      :options="plantSubOptions"
                      optionLabel="option"
                      optionValue="option"
                      placeholder="Plant Subtype"
                    />
                  </div>
                  <div class="p-col-3">
                    <input-number
                      class="input-number-field"
                      v-model="Item.resourcecategory.mincap"
                      placeholder="Min"
                    />
                  </div>
                  <div class="p-col-3">
                    <input-number
                      class="input-number-field"
                      v-model="Item.resourcecategory.maxcap"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              <div class="p-col-5" style="padding: 0">
                <div class="p-grid" style="margin: 0">
                  <div class="p-col-4">
                    <dropdown
                      class="input-dropdown-field"
                      v-model="Item.resourcecategory.chargeType"
                      :options="
                        getChargeTypeOptions('plantType', Item.resourceid)
                      "
                      optionLabel="key"
                      optionValue="key"
                      :placeholder="Item.unitprice ? '-' : 'Charge Type'"
                    />
                  </div>

                  <div class="p-col-3">
                    <input-number
                      class="input-number-field"
                      v-model="Item.unitprice"
                      mode="currency"
                      currency="AUD"
                      locale="en-AU"
                      :allowEmpty="false"
                    />
                  </div>

                  <div class="p-col-1 multiplication-icon">
                    <font-awesome-icon
                      class="times-icon"
                      :icon="['fa', 'times']"
                    />
                  </div>

                  <div class="p-col-3">
                    <input-number
                      class="input-number-field"
                      v-model="Item.qty"
                      :minFractionDigits="1"
                      :maxFractionDigits="2"
                      suffix="h"
                      :allowEmpty="false"
                    >
                    </input-number>
                  </div>

                  <div class="p-col-1 budget-delete">
                    <font-awesome-icon
                      class="trash-icon"
                      :icon="['fa', 'trash']"
                      @click="deleteField($event, index)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-col-12 divider"></div>

        <div class="p-col-6 budget-label">
          Subcontractor
          <font-awesome-icon
            class="plus-circle-icon"
            :icon="['fa', 'plus-circle']"
            @click="addNewField('Subcontractor')"
          />
        </div>
        <div class="p-col-6" style="padding: 0">
          <div class="p-grid" style="width: 100%; margin: 0">
            <div class="p-col-11 budget-total">
              <div class="budget-total-container">
                <display-style
                  class="budget"
                  :data="subcontractorBudget"
                  type-specialisation="currency"
                />
                <display-style
                  v-if="subcontractorCost"
                  v-tooltip.top="'Cost/Budget Amount'"
                  class="original-budget"
                  :data="subcontractorCost"
                  type-specialisation="currency"
                />
              </div>
            </div>
            <div class="p-col-1" />
          </div>
        </div>

        <div class="p-col-12">
          <div
            v-for="(Item, index) in copyModelBudget"
            :key="'subcontractor_' + index"
          >
            <div
              v-if="Item.resourcetype === 'Subcontractor' && IsActive(Item)"
              class="p-grid budget-item"
            >
              <div class="p-col-3">
                <dropdown
                  class="input-dropdown-field"
                  :options="subcontractorOptions"
                  optionLabel="option"
                  optionValue="value"
                  placeholder="Subcontractor"
                  v-model="Item.resourceid"
                >
                </dropdown>
              </div>

              <div class="p-col-4"></div>

              <div class="p-col-5" style="padding: 0">
                <div class="p-grid" style="margin: 0">
                  <div class="p-col-4">
                    <!-- <dropdown
                      class="input-dropdown-field"
                      v-model="Item.resourcecategory.chargeType"
                      :options="
                        getChargeTypeOptions('SubcontractorType', Item.resourceid)
                      "
                      optionLabel="key"
                      optionValue="key"
                      :placeholder="
                        Item.unitprice ? '-' : 'Charge Type'
                      "
                    /> -->
                  </div>

                  <div class="p-col-3">
                    <input-number
                      class="input-number-field"
                      v-model="Item.unitprice"
                      mode="currency"
                      currency="AUD"
                      locale="en-AU"
                      :allowEmpty="false"
                    />
                  </div>

                  <div class="p-col-1 multiplication-icon">
                    <font-awesome-icon
                      class="times-icon"
                      :icon="['fa', 'times']"
                    />
                  </div>

                  <div class="p-col-3">
                    <input-number
                      class="input-number-field"
                      v-model="Item.qty"
                      :minFractionDigits="1"
                      :maxFractionDigits="2"
                      :allowEmpty="false"
                    >
                    </input-number>
                  </div>

                  <div class="p-col-1 budget-delete">
                    <font-awesome-icon
                      class="trash-icon"
                      :icon="['fa', 'trash']"
                      @click="deleteField($event, index)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-col-12 divider"></div>

        <div class="p-col-6 budget-label">
          Material
          <font-awesome-icon
            class="plus-circle-icon"
            :icon="['fa', 'plus-circle']"
            @click="addNewField('Materials')"
          />
        </div>
        <div class="p-col-6" style="padding: 0">
          <div class="p-grid" style="width: 100%; margin: 0">
            <div class="p-col-11 budget-total">
              <div class="budget-total-container">
                <display-style
                  class="budget"
                  :data="materialBudget"
                  type-specialisation="currency"
                />
                <display-style
                  v-if="materialCost"
                  v-tooltip.top="'Cost/Budget Amount'"
                  class="original-budget"
                  :data="materialCost"
                  type-specialisation="currency"
                />
              </div>
            </div>
            <div class="p-col-1" />
          </div>
        </div>

        <div class="p-col-12">
          <div
            v-for="(Item, index) in copyModelBudget"
            :key="'material_' + index"
          >
            <div
              v-if="Item.resourcetype === 'Materials' && IsActive(Item)"
              class="p-grid budget-item"
            >
              <div class="p-col-3">
                <input-text
                  class="input-text-field"
                  type="text"
                  v-model="Item.resourceid"
                />
              </div>

              <div class="p-col-4"></div>

              <div class="p-col-5" style="padding: 0">
                <div class="p-grid" style="margin: 0">
                  <div class="p-col-4">
                    <!-- <dropdown
                      class="input-dropdown-field"
                      v-model="Item.resourcecategory.chargeType"
                      :options="
                        getChargeTypeOptions('MaterialsType', Item.resourceid)
                      "
                      optionLabel="key"
                      optionValue="key"
                      :placeholder="
                        Item.unitprice ? '-' : 'Charge Type'
                      "
                    /> -->
                  </div>

                  <div class="p-col-3">
                    <input-number
                      class="input-number-field"
                      v-model="Item.unitprice"
                      mode="currency"
                      currency="AUD"
                      locale="en-AU"
                      :allowEmpty="false"
                    />
                  </div>

                  <div class="p-col-1 multiplication-icon">
                    <font-awesome-icon
                      class="times-icon"
                      :icon="['fa', 'times']"
                    />
                  </div>

                  <div class="p-col-3">
                    <input-number
                      class="input-number-field"
                      v-model="Item.qty"
                      :minFractionDigits="1"
                      :maxFractionDigits="2"
                      :allowEmpty="false"
                    >
                    </input-number>
                  </div>

                  <div class="p-col-1 budget-delete">
                    <font-awesome-icon
                      class="trash-icon"
                      :icon="['fa', 'trash']"
                      @click="deleteField($event, index)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </sidebar>
  </div>
</template>

<style scoped>

.history-icon-container {
  cursor: pointer;
}
</style>
