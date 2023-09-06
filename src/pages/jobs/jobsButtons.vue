<script lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import JobsBulkUpdate from "../../../src/pages/jobs/jobsBulkUpdate.vue";
import utils from "../../use/function/useUtils";
import {
  defineComponent,
  //onMounted,
  ref,
  onMounted,
  computed,
  //watch,
} from "vue";

import useControllerJobs from "../../use/controller/jobs/jobs";
import { stateSymbol, useState } from "../../store/index";
import { IJobRecord } from "../../use/controller/jobs/jobs.d";
import ProgressSpinner from "primevue/progressspinner";
import Knob from "primevue/knob";

export const JobsButtons = /*#__PURE__*/ defineComponent({
  name: "JobsButtons",
  inject: [stateSymbol.description!],
  components: {
    JobsBulkUpdate,
    Button,
    ProgressSpinner,
    Knob,
    Card,
  },
  props: {
    disabledButton: {
      type: Boolean,
      required: true,
    },
    selectedRows: {
      type: Array,
      required: true,
    },
    enableDate: {
      type: Boolean,
      required: true,
    },
    enableDateRange: {
      type: Boolean,
      required: true,
    },
    mapJobs: {
      type: Number,
      required: false,
    },
    totalJobs: {
      type: Number,
      required: false,
    },
    currentDate: {
      type: Number,
      required: true,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const upvise = useState().upvise;
    const controller = useControllerJobs(upvise);
    //const selectedEmployee = ref();
    const employeeList = ref();
    const workedDate = ref(props.currentDate);
    const showBulkUpdate = ref(false);

    const jobsOnMap = computed(() => {
      return props.mapJobs;
    });

    const dateRange = computed(() => {
      return props.enableDateRange;
    });

    onMounted(async () => {
      employeeList.value = await controller.getEmployees();
    });

    const viewCurrentDate = computed(() => {
      return utils.getDate(workedDate.value, "DD MMMM YYYY");
    });

    function previousDay() {
      workedDate.value = utils.addDaysToDate(workedDate.value, -1);
      emit("filteredDay", workedDate.value);
    }

    function nextDay() {
      workedDate.value = utils.addDaysToDate(workedDate.value, 1);
      emit("filteredDay", workedDate.value);
    }

    function toggleBulkUpdate() {
      // overlayElement.value!.show(event);
      showBulkUpdate.value = !showBulkUpdate.value;
    }

    function deleteOnUpvise() {
      const jobsSelected: Record<string, any>[] = JSON.parse(
        JSON.stringify(props.selectedRows)
      );
      let idArray: string[] = [];
      jobsSelected.forEach((record) => {
        if (record.row.id !== undefined) idArray.push(record.row.id);
      });
      const idString = idArray.join("|");
      if (jobsSelected.length > 0)
        window.Engine.eval("deleteSelectedJobs('" + idString + "')", 0);
      else alert("No Job Selected for Deletion");
    }

    function bulkUpdateJobs(data: Record<string, any>) {
      toggleBulkUpdate();
      const dataField = data.field.split(":");
      let isCustom = data.field.includes("custom:");
      let field = isCustom ? dataField[1] + ":" + dataField[2] : data.field;
      let value = data.value;
      updateJobs(field, value, isCustom);
    }

    function updateJobs(
      field: string,
      value: string | number,
      isCustom: boolean
    ) {
      const jobsSelected: Record<string, any>[] = JSON.parse(
        JSON.stringify(props.selectedRows)
      );
      if (controller.doValidateJobs(jobsSelected)) {
        const rowsOnly: IJobRecord[] = [];
        jobsSelected.forEach((job: Record<string, any>) => {
          const upviseJob = JSON.parse(
            JSON.stringify(upvise.recordData("TableJobsJobs", job.row.id))
          );
          if (!isCustom) upviseJob[field] = value;
          else {
            const fieldSplit = field.split(":");
            const customFieldString = fieldSplit[0];
            const fieldString = fieldSplit[1];
            const customValue =
              upviseJob.custom != "" ? JSON.parse(upviseJob.custom) : {};
            customValue[customFieldString] = value;
            upviseJob[fieldString] = value;
            upviseJob.custom = JSON.stringify(customValue);
          }
          rowsOnly.push(upviseJob);
        });
        //console.log(rowsOnly);
        emit("saveJobs", rowsOnly);
      }
    }

    return {
      toggleBulkUpdate,
      showBulkUpdate,
      bulkUpdateJobs,
      deleteOnUpvise,
      employeeList,
      viewCurrentDate,
      previousDay,
      nextDay,
      jobsOnMap,
      dateRange,
    };
  },
});

export default JobsButtons;
</script>
<template>
  <div class="jobButtons">
    <div
      v-if="!disabledButton"
      class="bulk-update-button"
      @click="toggleBulkUpdate()"
    >
      <font-awesome-icon class="filter-icon" :icon="['fa', 'pen']" />
      <span> Bulk Update </span>
    </div>
    <ProgressSpinner
      style="width: 30px; height: 30px"
      v-if="disabledButton"
    ></ProgressSpinner>
    <Card v-show="showBulkUpdate" class="bulk-update-overlay">
      <template #content>
        <JobsBulkUpdate
          @closeOverlay="toggleBulkUpdate"
          @updatedFieldValue="bulkUpdateJobs"
        >
        </JobsBulkUpdate>
      </template>
    </Card>

    <div class="bulk-delete" @click="deleteOnUpvise">
      <font-awesome-icon class="filter-icon" :icon="['fa', 'trash']" />
      <span> Bulk Delete </span>
    </div>
    <div class="dateSection" v-if="enableDate">
      <Button @click="previousDay" :disabled="!dateRange">
        <font-awesome-icon class="pointer" :icon="['fa', 'chevron-left']" />
      </Button>
      <p>{{ viewCurrentDate }}</p>
      <Button @click="nextDay" :disabled="!dateRange">
        <font-awesome-icon class="pointer" :icon="['fa', 'chevron-right']" />
      </Button>
    </div>
    <div class="jobsKnob" v-if="enableDate">
      <h5>Jobs On Map</h5>
      <Knob
        :readonly="true"
        v-model="jobsOnMap"
        :min="0"
        :max="totalJobs"
      ></Knob>
    </div>
  </div>
</template>

<style lang="scss" scoped>


.jobButtons {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  .assignButton {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin: auto 50px auto 13px;
    .assignDropDown {
      margin-right: 8px;
      width: 200px;
    }
  }
  .bulk-update-button {
    margin-right: 8px;
    display: flex;
    padding: 10px 15px;
    height: 48px;
    font-weight: bold;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 0 1px $grey5 inset;
    border-radius: 8px;
    background-color: white;
    cursor: pointer;
    .filter-icon {
      color: $grey7;
      font-size: 10px;
      margin-right: 7px;
    }
  }
  .bulk-delete {
    padding: 10px 15px;
    margin: 0 8px;
    min-width: 48px;
    display: flex;
    height: 48px;
    font-weight: bold;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 0 1px $grey5 inset;
    border-radius: 8px;
    background-color: white;
    cursor: pointer;
    .filter-icon {
      margin-right: 7px;
      color: $grey7;
      font-size: 10px;
      height: 10.5px;
      width: 12px;
    }
  }
  .bulk-update-overlay {
    font-family: Poppins, serif;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    color: $grey6;
    background-color: $white;
    position: absolute;
    z-index: 1;
    height: auto;
    border-radius: 15px;
    top: 58px;
    left: 0;
    width: 400px;
  }
  .dateSection {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    p {
      margin: auto 8px auto 8px;
      font-size: 24px;
    }
    pointer {
      width: 20px;
      height: 20px;
    }
  }
  .jobsKnob {
    margin-left: 50px;
    display: flex;
    align-items: center;
    flex-direction: column;
  }
}
</style>
