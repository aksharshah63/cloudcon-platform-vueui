<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import PayrollCalendar from "../../payroll/payrollCalendar.vue";
import ProgressTable from "../../../components/chart/progressTable.vue";
import { UpviseDataMessage } from "../../../store/modules/upvise";
import { stateSymbol } from "../../../store";
import JobsSchedule from "../../scheduler/schedulerJobs.vue";

export const CalendarScheduler = /*#__PURE__*/ defineComponent({
  name: "CalendarScheduler",
  inject: [stateSymbol.description!],
  components: {
    JobsSchedule,
    PayrollCalendar,
    ProgressTable,
  },
  // props: {
  //   // title: {
  //   //   type: String,
  //   //   required: true,
  //   // },
  //   // upviseDataMessage: {
  //   //   type: Object as () => IUpviseDataMessage,
  //   //   required: true,
  //   // },
  //   // parentId: {
  //   //   type: String,
  //   //   required: false,
  //   // },
  // },
  setup() {
    const loading = ref(true);
    const currentView = ref("jobs");
    const upviseDataMessage = reactive(new UpviseDataMessage());
    // const project = reactive({});
    // const useModel = useModelProjectPlanner();
    // const stateModel = useModel.state;

    onMounted(async () => {
      // await useModel.updateState();
    });

    // watch(
    //   stateModel,
    //   () => {
    //     loading.value = true;
    //     const copyModel = reactive(
    //       JSON.parse(
    //         JSON.stringify(stateModel.value)
    //       ) as unknown as IUpviseDataMessage
    //     );
    //     useModel.doPlannerCalculationsFor(copyModel);
    //     Object.assign(project, copyModel.persistence!.model["project"].data[0]);
    //     Object.assign(upviseDataMessage, copyModel);
    //     // console.log("WATCH CHANGED", upviseDataMessage, copyModel);
    //     loading.value = false;
    //   },
    //   { deep: true }
    // );

    return { loading, currentView, upviseDataMessage };
  },
});
export default CalendarScheduler;
</script>

<template>
  <div class="calendar-scheduler">
    <!-- <pre>{{ upviseDataMessage }}</pre> -->
    <div class="p-grid">
      <div class="p-col-4">
        <h2>Scheduler</h2>
      </div>

      <div class="p-col-4 p-d-flex p-jc-center">
        <div class="toggle">
          <div
            @click="currentView = 'jobs'"
            :class="{ selected: currentView === 'jobs' }"
            class="toggle-option"
          >
            Jobs
          </div>

          <div
            @click="currentView = 'staff'"
            :class="{ selected: currentView === 'staff' }"
            class="toggle-option"
          >
            Staff
          </div>

          <div
            @click="currentView = 'plant'"
            :class="{ selected: currentView === 'plant' }"
            class="toggle-option"
          >
            Plant
          </div>
        </div>
      </div>

      <div class="p-col-4 actions-group">
        <div class="action">
          <font-awesome-icon :icon="['fa', 'folder-plus']" />
        </div>

        <div class="action">
          <font-awesome-icon :icon="['fa', 'clone']" />
        </div>

        <div class="action">
          <font-awesome-icon :icon="['fa', 'bell']" />
        </div>

        <div class="action add-icon">
          <font-awesome-icon :icon="['fa', 'plus-circle']" />
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- <PayrollCalendar
        :upviseDataMessage="upviseDataMessage"
        :currentView="currentView"
      />
      <ProgressTable
        :upviseDataMessage="upviseDataMessage"
        :currentView="currentView"
      /> -->
      <JobsSchedule
        :upviseDataMessage="upviseDataMessage"
        :currentView="currentView"
      />
      <!-- <div>week view here</div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>


.calendar-scheduler {
  background-color: #f5f5f5;
  font-family: "Poppins";
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: #000000;
  padding: 20px;
}

.main-content {
  // padding: 24px;
  // background: #ffffff;
  border-radius: 8px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
}

.actions-group {
  font-size: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 1 1 auto;
  height: 48px;

  .action {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48px;
    width: 48px;
    background-color: $white;
    box-shadow: 0px 0px 0px 1px $grey5 inset;
    border-radius: 16px;
    margin: 0 8px;
    cursor: pointer;

    &:last-child {
      margin-right: 0;
    }

    &.add-icon {
      background-color: $blue;
      color: $white;
    }
  }
}
</style>
