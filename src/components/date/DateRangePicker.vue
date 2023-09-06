<script lang="ts">
import dateOperation from "../../use/utils/useDateOperations";
import Calendar from "primevue/calendar";
import { defineComponent, ref, computed } from "vue";
import utils from "../../use/function/useUtils";

export const DateRangePicker = /*#__PURE__*/ defineComponent({
  name: "DateRangePicker",
  components: {
    Calendar,
  },
  props: {
    startEpoch: {
      type: Number,
      required: true,
    },
    range: {
      type: Number,
      required: false,
      default: 1,
    },
    allowRange: {
      type: Boolean,
      required: true,
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(props: Record<string, any>, { emit }) {
    //TO-DO Create singular intervals
    const toggleCalendar = ref(false);

    const currentDuration = computed(() => {
      return props.range - 1 ?? 6;
    });

    const dateRange = computed(() => {
      return [
        props.startEpoch,
        dateOperation.getNextEpoch(
          props.startEpoch,
          currentDuration.value,
          "day"
        ),
      ];
    });

    function toggleCal() {
      toggleCalendar.value = !toggleCalendar.value;
    }

    function closeCal() {
      toggleCalendar.value = false;
    }

    function emitDates(newDate: Date) {
      const newEpoch = utils.getEpoch(newDate);
      //console.log("EMITTING", newDate);
      emit(
        "dateInterval",
        props.allowRange
          ? {
              start: newEpoch,
              end: dateOperation.getNextEpoch(
                newEpoch,
                currentDuration.value,
                "day"
              ),
            }
          : {
              start: newEpoch,
              end: 0,
            }
      );
    }

    return {
      utils,
      closeCal,
      emitDates,
      currentDuration,
      dateRange,
      toggleCal,
      toggleCalendar,
    };
  },
});

export default DateRangePicker;
</script>

<template>
  <div v-click-outside="closeCal" class="dateRangeContainer p-ml-4 pointer">
    <div class="dateCalendarContainer" v-if="toggleCalendar">
      <Calendar
        @date-select="emitDates"
        :model-value="dateRange.map((date) => utils.getDate(date))"
        :inline="true"
        selection-mode="range"
      ></Calendar>
    </div>
    <font-awesome-icon
      @click="toggleCal"
      class="pointer"
      :icon="['fa', 'calendar-alt']"
    />
  </div>
</template>

<style lang="scss" scoped>

.dateRangeContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  .dateCalendarContainer {
    width: auto;
    position: absolute;
    top: 30px;
    z-index: 100;
    ::v-deep(.p-datepicker) {
      border-radius: 16px !important;
    }
  }
}
</style>
