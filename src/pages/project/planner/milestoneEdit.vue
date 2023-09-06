<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-non-null-assertion */
import useControllerProjectPlanner from "../../../use/controller/project/planner";
import { IRecordPlannerMilestone } from "../../../use/controller/project/planner.d";
import Sidebar from "primevue/sidebar";
import InputText from "primevue/inputtext";
import Calendar from "primevue/calendar";
import InputSwitch from "primevue/inputswitch";
import InputNumber from "primevue/inputnumber";
import ProgressSpinner from "primevue/progressspinner";
import moment from "moment";
import DisplayStyle from "../../../components/display/style.vue";
import ProgressBarItem from "../../../components/chart/progressBarItem.vue";
import { computed, defineComponent, reactive, ref, watch } from "vue";
import { stateSymbol, useState } from "../../../store/index";

import { useToast } from "primevue/usetoast";
import { IUpviseDataMessage } from "../../../store/modules/upvise.d";
import utils from "../../../use/function/useUtils";

export const PlannerMilestoneEdit = /*#__PURE__*/ defineComponent({
  name: "PlannerMilestoneEdit",
  inject: [stateSymbol.description!],
  components: {
    Sidebar,
    InputText,
    Calendar,
    InputSwitch,
    InputNumber,
    ProgressSpinner,
    ProgressBarItem,
    DisplayStyle,
  },
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
    milestoneId: {
      type: String,
      required: true,
    },
    parentId: {
      type: String,
      required: false,
    },
    projectWbscode: {
      type: String,
      required: true,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const upviseDataMessage = ref<IUpviseDataMessage>(props.upviseDataMessage);
    const controller = useControllerProjectPlanner(useState().upvise);
    const copyModelMilestone = props.milestoneId
      ? controller.getEditMilestone(props.milestoneId)
      : controller.getNewMilestone(props.parentId);
    const originalMilestone = utils.deepCopy(copyModelMilestone);
    const copyModelTasks = props.milestoneId
      ? controller.getEditTasksForMilestone(props.milestoneId)
      : reactive([]);
    const copySubMilestones = props.milestoneId
      ? controller.getEditMilestonesForMilestone(props.milestoneId)
      : reactive([]);
    const showMilestone = ref(true);
    const showSave = ref(false);
    const awaitingResponse = ref(false);

    const concatWbscode = computed(() => {
      const wbsCodes = [copyModelMilestone.wbscode];
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
        if (
          !copyModelMilestone.startdate ||
          copyModelMilestone.startdate === ""
        ) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          copyModelMilestone.startdate = Date.now().toString();
        }
        return moment(parseInt(copyModelMilestone.startdate)).format(
          "YYYY-MM-DD"
        );
      },
      set: (val) => {
        copyModelMilestone.startdate = moment(val).valueOf().toString();
      },
    });

    const endDateFormatted = computed({
      get: () => {
        if (!copyModelMilestone.enddate || copyModelMilestone.enddate === "") {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          copyModelMilestone.enddate = Date.now().toString();
        }
        return moment(parseInt(copyModelMilestone.enddate)).format(
          "YYYY-MM-DD"
        );
      },
      set: (val) => {
        copyModelMilestone.enddate = moment(val).valueOf().toString();
      },
    });

    const isBudgetCalculated = computed({
      get: () => {
        return copyModelMilestone.budgettype === 0;
      },
      set: (val) => {
        if (val) copyModelMilestone.budgettype = 0;
        else copyModelMilestone.budgettype = 1;
      },
    });

    async function saveMilestone() {
      if (controller.doValidateMilestone(copyModelMilestone)) {
        awaitingResponse.value = true;
        await controller
          .doSaveModelEntities({
            TableSchedulerMilestones: [copyModelMilestone],
          })
          .then(() => {
            awaitingResponse.value = false;
            closeMilestone();
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

    async function deleteMilestone() {
      awaitingResponse.value = true;
      await controller
        .doDeleteMilestone(copyModelMilestone, upviseDataMessage.value)
        .then(() => {
          awaitingResponse.value = false;
          closeMilestone();
        })
        .catch(() => {
          awaitingResponse.value = false;
          useToast().add({
            severity: "error",
            summary: "Operation unsuccesful",
            detail: "Could not delete the milestone",
            life: 1570,
          });
        });
    }

    function closeMilestone() {
      showMilestone.value = false;
      emit("closeMilestone");
    }

    watch(
      isBudgetCalculated,
      utils.debounce(() => {
        if (isBudgetCalculated.value) {
          let totalBudget = 0;

          copyModelTasks.forEach((task) => {
            if (task.milestoneid === copyModelMilestone.id && task.budget) {
              totalBudget += task.budget;
            }
          });

          copySubMilestones.forEach((milestone) => {
            if (milestone.budget) totalBudget += milestone.budget;
          });

          copyModelMilestone.budget = Number(totalBudget.toFixed(2));
        }
      })
    );

    watch(
      [copyModelMilestone],
      utils.debounce(() => {
        showSave.value = !utils.equalObjects(
          copyModelMilestone,
          originalMilestone
        );
      }),
      { deep: true }
    );

    return {
      // eslint-disable-next-line
      copyModelMilestone,
      showMilestone,
      showSave,
      concatWbscode,
      startDateFormatted,
      endDateFormatted,
      isBudgetCalculated,

      saveMilestone,
      deleteMilestone,
      closeMilestone,
      awaitingResponse,
      //inputDebounce,
    };
  },
});
export default PlannerMilestoneEdit;
</script>

<template>
  <div>
    <sidebar class="milestone-screen" :visible="showMilestone" position="right">
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name">
                {{ copyModelMilestone?.name || "Milestone Name" }}
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
          <div v-if="showSave" class="option" @click="saveMilestone()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <div class="option" @click="deleteMilestone()">
            <font-awesome-icon class="trash-icon" :icon="['fa', 'trash']" />
          </div>
          <div class="option" @click="closeMilestone()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>

        <div class="p-col-12 header-chart">
          <ProgressBarItem
            :actualsApproved="copyModelMilestone.approvedActualsTotal"
            :actualsNotApproved="copyModelMilestone.unapprovedActualsTotal"
            :forecast="copyModelMilestone.forecast"
            :target="copyModelMilestone.budget"
            :budget="copyModelMilestone.purchaseTotal"
            :width="'100%'"
            :showLabels="true"
          />
        </div>

        <div class="p-col-12">
          <span class="header-description">
            {{
              copyModelMilestone.description
                ? copyModelMilestone.description
                : "description"
            }}
          </span>
        </div>

        <div class="p-col-12 divider"></div>

        <div class="p-col-3 input-label">Name</div>
        <div class="p-col-9">
          <input-text
            class="input-text-field"
            type="text"
            v-model="copyModelMilestone.name"
          >
          </input-text>
        </div>

        <div class="p-col-3 input-label">WBS Code</div>
        <div class="p-col-9">
          <input-text
            class="input-text-field"
            type="text"
            v-model="copyModelMilestone.wbscode"
          >
          </input-text>
        </div>

        <div class="p-col-3 input-label">Description</div>
        <div class="p-col-9">
          <textarea
            class="input-textarea"
            rows="2"
            v-model="copyModelMilestone.description"
          >
          </textarea>
        </div>

        <div class="p-col-3 input-label">Start Date</div>
        <div class="p-col-9">
          <calendar
            class="input-date"
            dateFormat="yyyy-mm-dd"
            v-model="startDateFormatted"
            :manualInput="false"
          >
          </calendar>
        </div>

        <div class="p-col-3 input-label">End Date</div>
        <div class="p-col-9">
          <calendar
            class="input-date"
            dateFormat="yyyy-mm-dd"
            v-model="endDateFormatted"
            :manualInput="false"
          >
          </calendar>
        </div>

        <div class="p-col-3 input-label">Target</div>
        <div class="p-col-2 input-switch">
          <input-switch
            v-model="isBudgetCalculated"
            v-tooltip.top="
              isBudgetCalculated
                ? 'Target is being calculated'
                : 'Target is manually set'
            "
          />
        </div>
        <div :class="[`p-col-${copyModelMilestone.purchaseTotal ? 4 : 7}`]">
          <input-number
            class="input-number-field"
            mode="currency"
            currency="AUD"
            locale="en-AU"
            v-model="copyModelMilestone.budget"
            :disabled="isBudgetCalculated"
            :allowEmpty="false"
          >
          </input-number>
        </div>
        <div
          v-if="copyModelMilestone.purchaseTotal"
          class="p-col-3"
          style="display: flex; align-items: center"
        >
          <display-style
            class="original-budget"
            v-tooltip.top="'Cost/Budget Amount'"
            :data="copyModelMilestone.purchaseTotal"
            type-specialisation="currency"
          />
        </div>
      </div>
    </sidebar>
  </div>
</template>

<style lang="scss" scoped>

</style>
