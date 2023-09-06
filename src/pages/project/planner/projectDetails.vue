<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import moment from "moment-timezone";
import { computed, defineComponent, PropType } from "vue";
import { IProjectDetails } from "../../../use/controller/project/planner.d";
import { stateSymbol } from "../../../store/index";


export const PlannerProjectDetails = /*#__PURE__*/ defineComponent({
  name: "PlannerProjectDetails",
  inject: [stateSymbol.description!],
  props: {
    projectDetails: {
      type: Object as PropType<IProjectDetails>,
      required: false,
      default: () => ({} as IProjectDetails),
    },
  },
  setup(props: Record<string, any>) {
    const startDate = computed(() => {
      const startDate = moment(parseInt(props.projectDetails.startdate || ""));
      const date = startDate.format("D");
      const month = startDate.format("MMM");
      return { date: date, month: month };
    });

    const endDate = computed(() => {
      const endDate = moment(parseInt(props.projectDetails.enddate || ""));
      const date = endDate.format("D");
      const month = endDate.format("MMM");
      return { date: date, month: month };
    });

    return { startDate, endDate };
  },
});
export default PlannerProjectDetails;
</script>

<template>
  <div class="project-details">
    <div class="project-dates">
      <div class="calender-box">
        <font-awesome-icon :icon="['fa', 'calendar-alt']" />
      </div>
      <div class="project-date">
        <div class="project-date-bold">{{ startDate.date }}</div>
        <div>{{ startDate.month }}</div>
      </div>

      <div class="project-date-divider">-</div>

      <div class="project-date">
        <div class="project-date-bold">{{ endDate.date }}</div>
        <div>{{ endDate.month }}</div>
      </div>
    </div>
    <div class="project-info">
      <div class="project-code">
        {{ projectDetails.code || "" }}
      </div>
      <div class="project-name">
        {{ projectDetails.name || "" }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>


.project-details {
  display: flex;
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 100%;
  text-transform: uppercase;
  color: #666666;

  .project-dates {
    display: flex;
    align-items: center;
    height: 56px;
    background: #ffffff;
    border: 1px solid #dddddd;
    box-sizing: border-box;
    border-radius: 8px;
    padding: 0 10px;
    margin-right: 16px;

    .calender-box {
      background: #eeeeee;
      border-radius: 8px;
      display: flex;
      align-items: center;
      height: 24px;
      width: 24px;
      justify-content: center;
      margin-right: 8px;
      .fa-calendar-alt {
        font-size: 12px;
      }
    }

    .project-date {
      .project-date-bold {
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 120%;
        text-align: center;
        color: #333333;
      }
    }
    .project-date-divider {
      margin: 0 3px;
    }
  }

  .project-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-style: normal;
    font-size: 18px;
    color: #000000;

    .project-code {
      font-weight: normal;
      line-height: 160%;
    }
    .project-name {
      font-weight: 600;
      line-height: 120%;
    }
  }
}
</style>
