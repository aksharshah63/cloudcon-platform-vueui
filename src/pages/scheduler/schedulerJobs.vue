<script lang="ts">
import { IUpviseDataMessage } from "../../store/modules/upvise.d";
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import InputText from "primevue/inputtext";
// import Calendar from "primevue/calendar";
import moment from "moment-timezone";
import JobScheduleItem from "../../components/chart/jobScheduleItem.vue";
import JobsSchedulerPanel from "../../components/panel/jobsSchedulerPanel.vue";
import {
  IJobDetails,
  IProjectDetails,
  IRecordPlannerTask,
} from "../../use/controller/project/planner.d";


// eslint-disable-next-line @typescript-eslint/no-var-requires
// import mockSchedulerData from "../../store/mock/schedulerData.json";

export const SchedulerJobs = /*#__PURE__*/ defineComponent({
  name: "SchedulerJobs",
  components: {
    JobScheduleItem,
    InputText,
    JobsSchedulerPanel,
    // Calendar,
  },
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
    currentView: {
      type: String,
      default: "",
      required: true,
    },
  },
  setup(props: Record<string, unknown>) {
    const hiddenRows = ref<string[]>([]);
    const headers = ref([
      {
        name: "",
        date: 0,
      },
    ]);
    const isDayView = ref(true);
    const isDatePickerShown = ref(false);
    const isRightPanelOpen = ref(true);
    const startTimestamp = ref(0);
    const endTimestamp = ref(0);
    const currentTime = ref("-");
    const currentDate = ref(0);
    const currentDatePosition = ref(300);
    const currentMonth = ref(0);
    const selectedDate = ref(0);
    const dateRange = ref({
      start: "",
      end: "",
    });

    const projectsData = ref<IProjectDetails[]>([]);

    onMounted(() => {
      // getting the initial date range
      currentDate.value = moment().unix();
      currentMonth.value = moment().unix();

      // start of the leftmost timeline
      selectedDate.value = moment("2021-06-25T12:00:00Z").startOf("day").unix();

      // making sure the timeline is scaled properly when window is resized
      window.addEventListener("resize", windowResizeHandler);

      // do the initial draw of date range and grids
      changeDateRange();

      // initial update of the time with blue line
      updateTime();
      // then update every 5 secs which will also update the line position
      setInterval(updateTime, 5000);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", windowResizeHandler);
    });

    function windowResizeHandler() {
      changeDateRange();
    }

    const updateTime = () => {
      currentTime.value = moment().format("HH:mm");
      updateCurrentDateTimeLinePosition();
    };

    const updateCurrentDateTimeLinePosition = () => {
      let box = document.querySelector(".timeline-wrapper");
      let width = box?.clientWidth || 0;

      const startDiff = currentDate.value - startTimestamp.value;
      const rangeDiff = endTimestamp.value - startTimestamp.value;
      // const t = endTimestamp.value - start;

      // startVal comes from the fix width of tasks name column + the border-left value
      let startVal = 308;
      const left = (startDiff / rangeDiff) * (width - startVal);

      currentDatePosition.value = startVal + left;
    };

    // this will draw the date range and set the headers for the grid look
    function changeDateRange() {
      startTimestamp.value = moment(selectedDate.value, "X").unix();

      endTimestamp.value = moment(selectedDate.value, "X")
        .add(isDayView.value ? 1 : 7, "d")
        .unix();

      // dateRange is the text you see between chevron controls
      dateRange.value.start = moment(selectedDate.value, "X")
        .startOf("day")
        .format("DD MMM YYYY");

      dateRange.value.end = moment(selectedDate.value, "X")
        .startOf("day")
        .add(isDayView.value ? 1 : 6, "d")
        .format("DD MMM YYYY");

      // depending of number of headers, that is the count of the grid
      headers.value = [];
      if (isDayView.value) {
        let currentHour = moment(selectedDate.value, "X").hour();

        // make sure we get 24 items pushed into headers
        for (let i = 0; i < 24; i++) {
          let hour = currentHour;
          if (hour >= 24) {
            hour = hour - 24;
          }
          headers.value.push({
            // name: hour + "",
            name: (hour < 10 ? "0" + hour : hour) + ":00",
            date: 0,
          });
          currentHour++;
          // console.log(week[i % 7]);
        }
      } else {
        let week: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        let currentDay = moment(selectedDate.value, "X").day();

        let daysInMonth = moment(selectedDate.value, "X").daysInMonth();

        headers.value = [];
        let date = moment(selectedDate.value, "X").date();

        for (let i = date; i < date + 7; i++) {
          let day = i;
          if (day > daysInMonth) {
            day = day - daysInMonth;
          }
          headers.value.push({
            name: week[currentDay % 7],
            date: day,
          });
          currentDay++;
          // console.log(week[i % 7]);
        }
      }

      // this is the blue line for today/time
      updateCurrentDateTimeLinePosition();
    }

    function getAllTasks() {
      let tasks: IRecordPlannerTask[] = [];

      // tasks = tasks.filter(
      //   (task: IRecordPlannerTask) => task.milestoneid === milestoneId
      // );

      return tasks;
    }

    function getTimelinePosition(item: IJobDetails) {
      // do not show the item if no startdate
      if (!item.startDate || !item.endDate) return { display: "none" };

      const start = parseInt(item.startDate) / 1000;
      const end = parseInt(item.endDate) / 1000;

      // todo: this should be filtered out instead of just hiding
      // -- unless we only show tasks/timelines that have overlapping dates with range
      // check if dates are outside of current range
      if (start > endTimestamp.value) return { display: "none" };
      if (end < startTimestamp.value) return { display: "none" };

      // calculate the size of the item in timeline
      const dateWidth = endTimestamp.value - startTimestamp.value;
      const itemWidth = end - start;
      const percent = (itemWidth / dateWidth) * 100;

      // calculating the position from left
      const startDiff = start - startTimestamp.value;
      const rangeDiff = endTimestamp.value - startTimestamp.value;

      const left = (startDiff / rangeDiff) * 100;

      return {
        left: left + "%",
        width: percent + "%",
        overflow: "hidden",
      };
    }

    function previousRange(isLong: boolean) {
      const selected = moment(selectedDate.value, "X");

      if (isDayView.value) {
        selected.subtract(isLong ? 24 : 4, "h");
      } else {
        selected.subtract(isLong ? 7 : 1, "d");
      }

      selectedDate.value = selected.unix();
      changeDateRange();
    }

    function nextRange(isLong: boolean) {
      const selected = moment(selectedDate.value, "X");

      if (isDayView.value) {
        selected.add(isLong ? 24 : 4, "h");
      } else {
        selected.add(isLong ? 7 : 1, "d");
      }

      selectedDate.value = selected.unix();
      changeDateRange();
    }

    function getHeaderStyle() {
      let headerCount = headers.value.length;

      return { "grid-template-columns": `300px repeat(${headerCount}, 1fr)` };
    }

    watch(isDayView, () => {
      changeDateRange();
    });

    const getTimelineItems = computed(() => {
      let projects = projectsData.value;

      projects = projectsData.value.map((project: IProjectDetails) => {
        const jobsWithLevels = getProjectJobsListWithLevel(project);
        return {
          ...project, // add the old data
          jobs: jobsWithLevels.jobs, // overwrite jobs
          levels: jobsWithLevels.levels, // levels
        };
      });
      return projects;
    });

    const calculateLevelCount = (project: IProjectDetails) => {
      project.jobs?.forEach((job) => {
        job.startDate;
      });
      return 8;
    };

    const findMissingNumbers = (arr: number[]) => {
      // Create sparse array with a 1 at each index equal to a value in the input.
      let sparse = arr.reduce(
        (sparse: number[], i) => ((sparse[i] = 1), sparse),
        []
      );
      // Create array 0..highest number, and retain only those values for which
      // the sparse array has nothing at that index (and eliminate the 0 value).
      return [...sparse.keys()].filter((i) => i && !sparse[i]);
    };

    const getProjectJobsListWithLevel = (project: IProjectDetails) => {
      let jobsList: IJobDetails[] = [];

      let allLevels: number[] = [1];

      let jobs = project.jobs || [];

      // if it is not dayView, we add a minimum width to the item by increasing the endDate.
      // we do this instead of css to still make the item leveling work based in date overlaps
      let millisecondsToAdd = isDayView.value ? 10800000 : 43200000;
      jobs = jobs.map((job) => {
        const difference = Math.abs(
          parseInt(job.endDate) - parseInt(job.startDate)
        );

        return {
          ...job,
          endDate:
            difference < millisecondsToAdd
              ? (parseInt(job.startDate) + millisecondsToAdd).toString()
              : job.endDate,
        };
      });

      jobs.forEach((currentJob: IJobDetails) => {
        let currentLevel = 1;
        let overlaps: number[] = [];

        for (let i = 0; i < jobsList.length; i++) {
          // check for overlaps
          if (
            parseInt(currentJob.startDate) < parseInt(jobsList[i].endDate) &&
            parseInt(currentJob.endDate) >= parseInt(jobsList[i].startDate)
          ) {
            overlaps.push(jobsList[i].level || currentLevel);
          }
        }

        // removing duplicate in preparation for finding the best level for this item
        overlaps = [...new Set(overlaps)];

        const availableLevels = findMissingNumbers(overlaps);
        // checking for levels that are available that's not in overlap
        if (availableLevels.length > 0) {
          // if we find missing numbers in the range, we get the first level available
          currentLevel = availableLevels[0];
        } else {
          // if there are no missing numbers, we just get last level that has overlaps and add 1
          let availableLevel = overlaps[overlaps.length - 1] + 1;
          // and if there are no overlaps, we set it to the startinglevel for 1
          currentLevel = availableLevel || currentLevel;
        }
        allLevels.push(currentLevel);
        const final = { ...currentJob, level: currentLevel };
        // add job with the currentlevel
        jobsList.push(final);
      });

      // return the jobslist with the proper levels
      return {
        levels: Math.max(...allLevels),
        jobs: jobsList,
      };
    };

    return {
      props,
      isDatePickerShown,
      getTimelineItems,
      isRightPanelOpen,
      getProjectJobsListWithLevel,
      calculateLevelCount,
      currentTime,
      projectsData,
      selectedDate,
      getHeaderStyle,
      isDayView,
      currentDatePosition,
      headers,
      dateRange,
      currentDate,
      startTimestamp,
      endTimestamp,
      getTimelinePosition,
      getAllTasks,
      previousRange,
      nextRange,
      hiddenRows,
    };
  },
});
export default SchedulerJobs;
</script>

<template>
  <div class="jobs-schedule">
    <div class="p-grid">
      <div class="p-col-4">
        <!-- toggle for day and week -->
        <div class="toggle toggle-small">
          <div
            @click="isDayView = true"
            :class="{ selected: isDayView }"
            class="toggle-option"
          >
            Day
          </div>

          <div
            @click="isDayView = false"
            :class="{ selected: !isDayView }"
            class="toggle-option"
          >
            Week
          </div>
        </div>
      </div>
      <div class="p-col-4 timeline-months p-d-flex p-ai-center p-jc-center">
        <!-- date/month selector -->
        <div
          @click="previousRange(true)"
          class="pointer p-mr-3 p-d-flex"
          v-tooltip.top="`Go back ${isDayView ? '1 day' : '1 week'}`"
        >
          <font-awesome-icon class="pointer" :icon="['fa', 'chevron-left']" />
          <font-awesome-icon class="pointer" :icon="['fa', 'chevron-left']" />
        </div>
        <span v-tooltip.top="`Go back ${isDayView ? '4 hours' : '1 day'}`">
          <font-awesome-icon
            class="pointer"
            @click="previousRange()"
            :icon="['fa', 'chevron-left']"
          />
        </span>
        <span class="p-mx-4">
          {{ dateRange.start }}
          <span v-if="!isDayView"> - {{ dateRange.end }}</span>
        </span>
        <span v-tooltip.top="`Go forward ${isDayView ? '4 hours' : '1 day'}`">
          <font-awesome-icon
            class="pointer"
            @click="nextRange()"
            :icon="['fa', 'chevron-right']"
          />
        </span>
        <div
          @click="nextRange(true)"
          class="pointer p-ml-3 p-d-flex"
          v-tooltip.top="`Go forward ${isDayView ? '1 day' : '1 week'}`"
        >
          <font-awesome-icon class="pointer" :icon="['fa', 'chevron-right']" />
          <font-awesome-icon class="pointer" :icon="['fa', 'chevron-right']" />
        </div>

        <div
          class="p-ml-4 pointer"
          @click="isDatePickerShown = !isDatePickerShown"
        >
          <font-awesome-icon class="pointer" :icon="['fa', 'calendar-alt']" />
        </div>
        <!-- <Calendar :touchUI="true"> </Calendar> -->
      </div>
      <div class="p-col-4 p-d-flex p-jc-end p-ai-center">
        <!-- job item search -->
        <span class="p-input-icon-right p-mr-3">
          <i class="pi pi-search" />
          <InputText type="text" placeholder="Search" />
        </span>

        <div class="small-btn" @click="isRightPanelOpen = !isRightPanelOpen">
          <font-awesome-icon
            class="pointer"
            :icon="[
              'fa',
              isRightPanelOpen
                ? 'arrow-alt-circle-right'
                : 'arrow-alt-circle-left',
            ]"
          />
        </div>
      </div>
    </div>

    <div class="timeline-wrapper">
      <div class="timeline-header" :style="getHeaderStyle()">
        <div class="p-pl-4"></div>
        <div class="header-items" v-for="(header, h) in headers" :key="h">
          <div class="header-names" :class="{ 'header-day-name': isDayView }">
            {{ header.name }}
          </div>
          <div v-if="!isDayView" class="header-dates">
            {{ header.date }}
          </div>
        </div>
      </div>
      <div class="timeline-content">
        <div
          class="timeline-content-task"
          :class="'levels-' + project.levels"
          v-for="(project, j) in getTimelineItems"
          :key="j"
        >
          <div class="project-name">
            <h6>{{ project.name }}</h6>
            <div>
              <span>{{ project.jobs.length }} Jobs - 4 Staff - 10 Plants</span>
            </div>
          </div>
          <div class="timeline-item-wrapper">
            <div
              v-for="(job, j) in project.jobs"
              :key="j"
              class="timeline-container"
              :class="'level-' + job.level"
              :style="getTimelinePosition(job)"
            >
              <JobScheduleItem :job="job" :showMinimum="!isDayView" />
            </div>

            <div
              class="timeline-item-grid"
              :style="{
                'grid-template-columns': `repeat(${headers.length}, 1fr)`,
              }"
            >
              <div v-for="k in headers.length" :key="k"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- timeline-today is the blue line -->
      <div
        class="timeline-today"
        v-if="currentDatePosition > 308"
        :style="{ left: currentDatePosition + 'px' }"
      >
        <span>{{ currentTime }}</span>
      </div>
    </div>
  </div>
  <div v-if="isRightPanelOpen" class="right-panel-content">
    <JobsSchedulerPanel :currentView="props.currentView" />
  </div>
</template>

<style scoped lang="scss">


.small-btn {
  width: 32px;
  height: 32px;
  background: #ffffff;
  border: 1px solid #dddddd;
  box-sizing: border-box;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background: $grey;
  }
}

.right-panel-content {
  // padding: 24px;
  background: #ffffff;
  border-radius: 8px;
  margin-left: 24px;
  width: 450px;
  padding: 24px;
}

.jobs-schedule {
  font-family: "Poppins", serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  color: $grey3;
  padding: 24px;
  background-color: $white;
  flex-grow: 1;

  .timeline-months {
    font-weight: 600;
    font-size: 18px;
    line-height: 120%;
    text-align: center;
    user-select: none;
    word-wrap: nowrap;
  }

  .timeline-toggle {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 24px;
    box-shadow: 0 0 0 1px $grey8 inset;
    border-radius: 8px;
    margin-left: 12px;
    width: 100px;

    .timeline-toggle-option {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1 1 auto;
      height: 100%;
      width: 50px;
      font-size: 8px;
      font-weight: 700;
      border-radius: 8px;
      cursor: pointer;

      &.selected {
        color: $white;
        background-color: $blue;
      }
    }
  }

  .timeline-wrapper {
    position: relative;
    overflow: hidden;
    margin-top: 13px;

    .timeline-header {
      height: 50px;
      display: grid;
      // grid-template-columns: 400px 1fr 1fr 1fr;
      background: $grey;
      border-radius: 8px;
      // margin-bottom: 16px;
      border-left: 8px solid transparent;

      div {
        // border: 1px solid green;
        order: 2;
        border-right: 1px solid $grey5;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 12px;
        line-height: 16px;
        text-transform: uppercase;
        color: $grey3;

        &:first-of-type {
          justify-content: flex-start;
        }

        &:last-of-type {
          border-right: none;
        }
      }

      .header-items {
        display: flex;
        flex-direction: column;
        justify-content: center;
        .header-names {
          order: 1;

          &.header-day-name {
            font-style: normal;
            font-weight: normal;
            font-size: 10px;
            line-height: 140%;
            text-align: center;
            margin-top: 24px;
            color: $grey9;
          }
        }
        .header-dates {
          order: 0;
        }
      }
    }

    .timeline-content {
      .timeline-content-milestone {
        background: $grey2;
        margin-top: 16px;

        font-weight: 600;
        font-size: 12px;
        line-height: 120%;
        color: $grey3;
        border-left: 8px solid $blue;
        border-radius: 8px;

        .row-inactive {
          transform: rotate(90deg);
        }
      }
      .timeline-content-task {
        // border-bottom: 1px solid $grey;
        border-left: 8px solid transparent;
        font-size: 12px;
        line-height: 16px;
        color: $grey9;

        .project-name {
          padding-left: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start !important;
          font-style: normal;
          font-weight: normal;
          font-size: 12px;
          line-height: 16px;
          color: #000000;

          & > div {
            text-align: left;
          }
        }

        &:nth-child(even) {
          background: rgba(0, 0, 0, 0.02);
        }

        &:last-of-type {
          border-bottom: none;
        }
      }

      .timeline-content-milestone,
      .timeline-content-task {
        display: grid;

        grid-template-columns: 300px auto;
        border-radius: 8px;

        border-radius: 8px;

        @for $i from 1 through 20 {
          &.levels-#{$i} {
            height: #{(60 * ($i)) + 4}px;
          }
        }

        // height: 150px;

        & > div {
          border-right: 1px solid $grey5;

          &:first-of-type {
            display: flex;
            align-items: center;
          }

          &:nth-of-type(2) {
            display: flex;
            align-items: center;
            overflow: hidden;
          }

          &:last-of-type {
            border-right: none;
          }
        }
      }
    }

    .timeline-item-wrapper {
      position: relative;

      .timeline-container {
        position: absolute;
        left: 10px;
        height: 56px;
        border-radius: 4px;
        display: block;
        // min-width: 130px;
        background-color: rgba(51, 51, 51, 0.15);
        z-index: 2;

        // setting the levels top position
        @for $i from 1 through 20 {
          &.level-#{$i} {
            top: #{(60 * ($i - 1)) + 4}px;
          }
        }
      }

      .timeline-item-grid {
        position: absolute;
        width: 100%;
        height: 100%;
        display: grid !important;
        div {
          height: 100%;
          border-right: 1px solid $grey;
        }
        z-index: 1;
      }
    }

    .timeline-today {
      height: 100000px;
      width: 3px;
      background-color: $blue;
      position: absolute;
      display: block;
      // right: calc(100% - (400px + 8px));
      top: 8px;
      z-index: 10;

      span {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 47px;
        height: 18px;
        left: calc(50% - 47px / 2 + 1px);
        top: 0px;
        background: $blue;
        border-radius: 8px;
        font-size: 10px;
        line-height: 140%;
        color: $white;
      }
    }
  }
  .add-button {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 20px 8px;
    color: $blue;

    .add-label {
      margin-left: 5px;
      font-weight: 700;
    }
  }

  .p-input-icon-right i {
    padding-right: 8px;
  }

  .p-inputtext {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 32px;
    padding-left: 20px;
    height: 32px;
    // padding-right: 10px;
  }
}
</style>
