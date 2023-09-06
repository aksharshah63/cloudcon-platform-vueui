<script lang="ts">
import { computed, defineComponent, PropType } from "vue";

import DateRangeBox from "../display/dateRangeBox.vue";
import AvatarBox from "..//display/avatarBox.vue";
import { IJobDetails } from "../../use/controller/project/planner.d";

export const JobScheduleItem = /*#__PURE__*/ defineComponent({
  name: "JobScheduleItem",
  components: {
    DateRangeBox,
    AvatarBox,
  },
  props: {
    width: {
      type: String,
      default: "30px",
    },
    job: {
      type: Object as PropType<IJobDetails>,
      required: true,
      default: () => ({} as IJobDetails),
    },
    showMinimum: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  //
  setup(props: Record<string, any>) {
    // const showStaffPlant = ref(false);
    // const showAssignees = ref(false);
    // const showDateRange = ref(false);
    // onMounted(() => {
    //   showDateRange.value = end - start > 1000;
    //   showAssignees.value = end - start > 21600;
    //   showStaffPlant.value = end - start > 38000;
    // });

    const start = parseInt(props.job.startDate) / 1000;
    const end = parseInt(props.job.endDate) / 1000;
    const showDateRange = computed(() => end - start > 1000);
    const showAssignees = computed(() => end - start > 21600);
    const showStaffPlant = computed(() => end - start > 38000);

    const getClassFromText = (type: string) => {
      return type
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    };

    return {
      showAssignees,
      showStaffPlant,
      showDateRange,
      getClassFromText,
    };
  },
});
export default JobScheduleItem;
</script>

<template>
  <div class="job-schedule-item" :class="getClassFromText(job.type)">
    <div class="left-side">
      <div class="job-type-indicator" :class="getClassFromText(job.status)">
        &nbsp;
      </div>
      <div
        class="job-details"
        :class="showMinimum ? 'p-jc-center' : 'p-jc-between'"
      >
        <div class="job-name">{{ job.name }}</div>
        <div class="p-d-flex p-ai-center" v-if="!showMinimum">
          <div class="job-type">{{ job.type }}</div>
          <div class="auto-hide" v-if="showStaffPlant">
            <div>{{ job.staff }} staff</div>
            <div class="details-divider"></div>
            <div>{{ job.plant }} plant</div>
          </div>
        </div>
      </div>
    </div>

    <div class="right-side" v-if="!showMinimum">
      <div class="job-assignees" v-if="showAssignees">
        <AvatarBox
          v-for="(assignee, i) in job.assignees"
          :key="i"
          :name="assignee.name"
        />
      </div>
      <DateRangeBox
        v-if="showDateRange"
        :startTimestamp="job.startDate"
        :endTimestamp="job.endDate"
        :isTime="true"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">

@import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

.job-schedule-item {
  font-family: "Poppins";
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 140%;
  max-height: 56px;
  position: relative;
  background: #ffffff;
  // overflow: hidden;
  // width: 130px;
  min-height: 56px;
  height: 100%;

  &.dry-hire {
    background: linear-gradient(
        0deg,
        rgba(106, 28, 24, 0.07),
        rgba(106, 28, 24, 0.07)
      ),
      #ffffff;

    .job-details .job-type {
      color: #6a1c18;
      background: rgba(106, 28, 24, 0.1);
      border: 1px solid #6a1c18;
    }
  }

  &.training {
    background: linear-gradient(
        0deg,
        rgba(47, 77, 203, 0.1),
        rgba(47, 77, 203, 0.1)
      ),
      #ffffff;

    .job-details .job-type {
      color: #32ab94;
      background: rgba(50, 171, 148, 0.1);
      border: 1px solid #32ab94;
    }
  }

  &.wet-hire {
    background: linear-gradient(
        0deg,
        rgba(50, 171, 148, 0.1),
        rgba(50, 171, 148, 0.1)
      ),
      #ffffff;

    .job-details .job-type {
      color: #2f4dcb;
      background: rgba(47, 77, 203, 0.1);
      border: 1px solid #2f4dcb;
    }
  }

  &.induction {
    background: linear-gradient(
        0deg,
        rgba(162, 133, 196, 0.1),
        rgba(162, 133, 196, 0.1)
      ),
      #ffffff;

    .job-details .job-type {
      color: #a285c4;
      background: rgba(162, 133, 196, 0.1);
      border: 1px solid #a285c4;
    }
  }

  &.sub-contractor {
    background: linear-gradient(
        0deg,
        rgba(76, 175, 234, 0.1),
        rgba(76, 175, 234, 0.1)
      ),
      #ffffff;

    .job-details .job-type {
      color: #4cafea;
      background: rgba(76, 175, 234, 0.1);
      border: 1px solid #4cafea;
    }
  }

  &.consignment {
    background: linear-gradient(
        0deg,
        rgba(72, 115, 115, 0.1),
        rgba(72, 115, 115, 0.1)
      ),
      #ffffff;

    .job-details .job-type {
      color: #487373;
      background: rgba(72, 115, 115, 0.1);
      border: 1px solid #487373;
    }
  }

  &.labouring {
    background: linear-gradient(
        0deg,
        rgba(54, 124, 204, 0.1),
        rgba(54, 124, 204, 0.1)
      ),
      #ffffff;

    .job-details .job-type {
      color: #367ccc;
      background: rgba(54, 124, 204, 0.1);
      border: 1px solid #367ccc;
    }
  }

  &.stand-down {
    background: #ffffff;

    .job-details .job-type {
      color: #999999;
      background: rgba(153, 153, 153, 0.1);
      border: 1px solid #999999;
    }
  }

  border: 1px solid rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  border-radius: 8px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 8px 8px;

  .job-type-indicator {
    display: block;
    width: 4px;
    height: 40px;
    background: #61e24b;
    border-radius: 8px;

    &.inactive {
      background: #08c3ec;
    }
    &.hold {
      background: #edbd13;
    }
    &.stop {
      background: $red;
    }
  }

  .job-details {
    display: flex;
    margin-left: 8px;
    flex-direction: column;
    // justify-content: center;
    white-space: nowrap;
    font-size: 12px;
    line-height: 16px;
    color: #000000;

    .job-name {
      font-weight: 600;
      font-size: 14px;
      line-height: 120%;
    }

    .job-type {
      font-size: 10px;
      line-height: 140%;
      text-transform: uppercase;
      padding: 0 8px;
      white-space: nowrap;
      height: 14px;
      margin-right: 8px;

      box-sizing: border-box;
      border-radius: 10px;
      border: 1px solid #999999;
      color: #999999;
    }

    .auto-hide {
      display: flex;
      align-items: center;
      flex-shrink: 1;
    }
  }

  .details-divider {
    background: #c4c4c4;
    width: 3px;
    height: 3px;
    margin: 0 8px;
  }

  .left-side {
    display: flex;
    position: absolute;
    overflow: hidden;
    // background-color: red;
    max-width: 100%;
    top: 8px;
    left: 8px;
    z-index: 3;
  }

  .right-side {
    display: flex;
    align-items: center;
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 1;
  }

  .job-assignees {
    display: flex;

    & > div {
      margin-left: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 10px;
      line-height: 120%;
      text-align: center;
      text-transform: uppercase;
      width: 32px;
      height: 32px;
      background: #ffffff;
      border: 1px solid #cccccc;
      box-sizing: border-box;
      border-radius: 12px;
    }
  }
  .job-date-range {
    margin-left: 10px;
    display: flex;
    background: #ffffff;
    border: 1px solid #dddddd;
    box-sizing: border-box;
    border-radius: 8px;
    padding: 6px 5px;
    align-items: center;

    .date-range-divider {
      margin: 0 3px;
    }

    .job-date {
      & > div:nth-of-type(1) {
        font-weight: 600;
        font-size: 14px;
        line-height: 120%;
        text-align: center;
        color: #333333;
      }
      & > div:nth-of-type(2) {
        font-size: 10px;
        line-height: 100%;
        text-align: center;
        text-transform: uppercase;
        color: #666666;
      }
    }
  }
}
</style>
