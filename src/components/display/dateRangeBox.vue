<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

import moment from "moment-timezone";

export const DateRangeBox = /*#__PURE__*/ defineComponent({
  name: "DateRangeBox",
  props: {
    startTimestamp: {
      type: String,
      default: "",
    },
    endTimestamp: {
      type: String,
      default: "",
    },
    isTime: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: Record<string, any>) {
    const start = ref({
      digit: "-",
      word: "-",
    });
    const end = ref({
      digit: "-",
      word: "-",
    });

    onMounted(() => {
      const startMoment = moment(props.startTimestamp, "x");
      const endMoment = moment(props.endTimestamp, "x");

      if (props.isTime) {
        start.value.digit = startMoment.format("h");
        start.value.word = startMoment.format("A");

        end.value.digit = endMoment.format("h");
        end.value.word = endMoment.format("A");
      } else {
        start.value.digit = startMoment.format("D");
        start.value.word = startMoment.format("MMM");

        end.value.digit = endMoment.format("D");
        end.value.word = endMoment.format("MMM");
      }
    });

    return {
      start,
      end,
    };
  },
});
export default DateRangeBox;
</script>

<template>
  <div class="job-date-range">
    <div v-if="icon" class="icon-box">
      <font-awesome-icon :icon="['fa', icon]" />
    </div>
    <div class="job-date">
      <div>{{ start.digit }}</div>
      <div>{{ start.word }}</div>
    </div>
    <div class="date-range-divider">-</div>
    <div class="job-date">
      <div>{{ end.digit }}</div>
      <div>{{ end.word }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">


.job-date-range {
  margin-left: 10px;
  display: flex;
  background: #ffffff;
  border: 1px solid #dddddd;
  box-sizing: border-box;
  border-radius: 8px;
  padding: 6px 5px;
  align-items: center;

  .icon-box {
    background: #eeeeee;
    border-radius: 8px;
    display: flex;
    align-items: center;
    height: 24px;
    width: 24px;
    justify-content: center;
    margin-right: 8px;
    font-size: 12px;
  }

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
</style>
