<script lang="ts">
import { defineComponent, ref } from "vue";
import InputText from "primevue/inputtext";
import JobsSchedulerPanelStaff from "../panel/jobsSchedulerPanelStaff.vue";
import JobsSchedulerPanelPlant from "../panel/jobsSchedulerPanelPlant.vue";
import JobsSchedulerPanelJob from "../panel/jobsSchedulerPanelJob.vue";

export const JobsSchedulerPanel = /*#__PURE__*/ defineComponent({
  name: "JobsSchedulerPanel",
  components: {
    InputText,
    JobsSchedulerPanelStaff,
    JobsSchedulerPanelPlant,
    JobsSchedulerPanelJob,
  },
  props: {
    currentView: {
      type: String,
      default: "",
      required: true,
    },
  },
  setup(props: Record<string, any>) {
    const currentPanelView = ref("plant");

    return {
      props,
      currentPanelView,
    };
  },
});
export default JobsSchedulerPanel;
</script>

<template>
  <div class="job-scheduler-panel">
    <div class="toggle">
      <div
        v-if="['jobs'].includes(props.currentView)"
        @click="currentPanelView = 'staff'"
        :class="{ selected: currentPanelView === 'staff' }"
        class="toggle-option"
      >
        Staff
      </div>

      <div
        v-if="['jobs', 'staff'].includes(props.currentView)"
        @click="currentPanelView = 'plant'"
        :class="{ selected: currentPanelView === 'plant' }"
        class="toggle-option"
      >
        Plant
      </div>
      <div
        v-if="['jobs', 'staff'].includes(props.currentView)"
        @click="currentPanelView = 'jobs'"
        :class="{ selected: currentPanelView === 'jobs' }"
        class="toggle-option"
      >
        Jobs
      </div>
    </div>

    <span class="p-input-icon-right p-mr-3">
      <i class="pi pi-search" />
      <InputText type="text" placeholder="Search" />
    </span>

    <JobsSchedulerPanelStaff v-if="currentPanelView === 'staff'" />

    <JobsSchedulerPanelPlant v-if="currentPanelView === 'plant'" />

    <JobsSchedulerPanelJob v-if="currentPanelView === 'jobs'" />
  </div>
</template>

<style scoped lang="scss">


.job-scheduler-panel {
  font-family: "Poppins";
  font-style: normal;
  font-weight: normal;

  .toggle {
    margin: 0 auto;
    margin-bottom: 16px;
  }

  .p-input-icon-right {
    width: 100%;
    margin-bottom: 16px;
    i {
      padding-right: 8px;
    }
  }

  .p-inputtext {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 32px;
    padding-left: 20px;
    height: 32px;
    width: 100%;
  }
}
</style>
