<script lang="ts">
import dateOperation from "../../use/utils/useDateOperations";
import { defineComponent, watch, ref, computed } from "vue";
export const DateChooserRedux = /*#__PURE__*/ defineComponent({
  name: "DateChooserRedux",
  props: {
    startEpoch: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    durationType: {
      type: String,
      required: true,
    },
    shortInterval: {
      type: Number,
      required: false,
      default: 1,
    },
    longInterval: {
      type: Number,
      required: false,
      default: 1,
    },
    longIntervalType: {
      type: String,
      required: false,
      default: "month",
    },
    showEndDate: {
      type: Boolean,
      required: false,
      default: true,
    },
    enableLongInterval: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(props: Record<string, any>, { emit }) {
    const startEpoch = ref(props.startEpoch !== null ? props.startEpoch : 0);
    const dateMap: Record<string, string> = {
      week: "Week/s",
      day: "Day/s",
      hour: "Hour/s",
      month: "Month/s",
      year: "Year/s",
    };
    function setWeek(addWeek: string) {
      emit("setNext", addWeek);
    }
    watch(
      () => props.startEpoch,
      () => {
        startEpoch.value = props.startEpoch;
      }
    );
    const currentDuration = computed(() => {
      return props.duration - 1 ?? 7;
    });

    const currentDateFormat = computed(() => {
      return props.durationType ?? "week";
    });

    const endEpoch = computed(() => {
      return dateOperation.getNextEpoch(
        startEpoch.value,
        currentDuration.value,
        currentDateFormat.value
      );
    });

    const startString = computed(() => {
      return dateOperation.getDateString(startEpoch.value, "DD MMM YY");
    });

    const endString = computed(() => {
      return dateOperation.getDateString(endEpoch.value, "DD MMM YY");
    });

    function nextRange(longInterval = false) {
      startEpoch.value = dateOperation.getNextEpoch(
        startEpoch.value,
        longInterval ? props.longInterval : props.shortInterval,
        longInterval ? props.longIntervalType : currentDateFormat.value
      );
      emit("nextDateObj", {
        start: startEpoch.value,
        end: endEpoch.value,
        isLong: longInterval,
      });
    }
    function previousRange(longInterval = false) {
      startEpoch.value = dateOperation.getNextEpoch(
        startEpoch.value,
        -1 * (longInterval ? props.longInterval : props.shortInterval),
        longInterval ? props.longIntervalType : currentDateFormat.value
      );
      emit("prevDateObj", {
        start: startEpoch.value,
        end: endEpoch.value,
        isLong: longInterval,
      });
    }

    return {
      setWeek,
      currentDuration,
      dateMap,
      startString,
      endString,
      currentDateFormat,
      nextRange,
      previousRange,
    };
  },
});

export default DateChooserRedux;
</script>

<template>
  <div class="calendar-months p-d-flex p-ai-center p-jc-center">
    <div
      @click="previousRange(true)"
      class="pointer p-mr-3 p-d-flex p-ai-center p-jc-center"
      v-if="enableLongInterval"
      v-tooltip.top="`Go back ${longInterval} ${dateMap[longIntervalType]}`"
    >
      <font-awesome-icon class="pointer" :icon="['fa', 'chevron-left']" />
      <font-awesome-icon class="pointer" :icon="['fa', 'chevron-left']" />
    </div>
    <div
      v-tooltip.top="`Go back ${shortInterval} ${dateMap[currentDateFormat]}`"
      class="p-d-flex p-ai-center p-jc-center"
    >
      <font-awesome-icon
        class="pointer"
        @click="previousRange()"
        :icon="['fa', 'chevron-left']"
      />
    </div>
    <span class="date-range-text p-mx-4">
      {{ startString }}
      <span v-if="showEndDate"> - {{ endString }}</span>
    </span>
    <div
      v-tooltip.top="
        `Go forward ${shortInterval} ${dateMap[currentDateFormat]}`
      "
      class="p-d-flex p-ai-center p-jc-center"
    >
      <font-awesome-icon
        class="pointer"
        @click="nextRange()"
        :icon="['fa', 'chevron-right']"
      />
    </div>
    <div
      @click="nextRange(true)"
      class="pointer p-ml-3 p-d-flex p-ai-center p-jc-center"
      v-tooltip.top="`Go forward ${longInterval} ${dateMap[longIntervalType]}`"
      v-if="enableLongInterval"
    >
      <font-awesome-icon class="pointer" :icon="['fa', 'chevron-right']" />
      <font-awesome-icon class="pointer" :icon="['fa', 'chevron-right']" />
    </div>
  </div>
</template>

<style lang="scss" scoped>

.calendar-months {
  font-weight: 600;
  font-size: 18px;
  line-height: 120%;
  text-align: center;
  user-select: none;
}

.date-range-text {
  text-align: center;
  white-space: nowrap;
}
</style>
