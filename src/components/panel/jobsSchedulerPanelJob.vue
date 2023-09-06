<script lang="ts">
// import schedulerData from "../../store/mock/schedulerData.json";
import { defineComponent, ref } from "vue";
import LargeIconButton from "../display/largeIconButton.vue";
import JobScheduleItem from "../chart/jobScheduleItem.vue";
import { IProjectDetails } from "../../use/controller/project/planner.d";

export const JobsSchedulerPanelJob = /*#__PURE__*/ defineComponent({
  name: "JobsSchedulerPanelJob",
  components: {
    LargeIconButton,
    JobScheduleItem,
  },
  setup() {
    const activeIndex = ref(0);
    const selectedProject = ref(-1);
    const selectedItems = ref<string[]>([]);

    const projectData = ref<IProjectDetails[]>([]);

    const selectProject = (index: number) => {
      selectedProject.value = index;
    };
    const selectItem = (id: string) => {
      var index = selectedItems.value.indexOf(id);

      if (index === -1) {
        selectedItems.value.push(id);
      } else {
        selectedItems.value.splice(index, 1);
      }
    };

    return {
      projectData,
      activeIndex,
      selectProject,
      selectedProject,
      selectedItems,
      selectItem,
    };
  },
});
export default JobsSchedulerPanelJob;
</script>

<template>
  <div class="scheduler-job-panel">
    <div class="job-categories custom-scrollbar">
      <LargeIconButton
        :text="`${project.name}`"
        v-for="(project, i) in projectData"
        :key="i"
        :isActive="selectedProject === i"
        @click="selectProject(i)"
      />
    </div>
    <div class="project-jobs custom-scrollbar">
      <JobScheduleItem
        :job="job"
        v-for="(job, j) in projectData[selectedProject]?.jobs"
        :key="j"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">


.project-jobs {
  & > div {
    margin-bottom: 4px;
    &:last-of-type {
      margin-bottom: 1px;
    }
  }
  padding-right: 8px;
  max-height: 600px;
  overflow-y: auto;
}

.job-categories {
  display: flex;
  padding-bottom: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
  & > div {
    margin-right: 10px;

    &:last-of-type {
      margin-right: 1px;
    }
  }
}
</style>
