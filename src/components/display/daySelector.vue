<script lang="ts">
import { defineComponent, PropType, ref } from "vue";

export const DaySelector = /*#__PURE__*/ defineComponent({
  name: "DaySelector",
  components: {},
  props: {
    isToggle: {
      type: Boolean,
      default: false,
    },
    availableDays: {
      type: Array as PropType<number[]>,
      required: false,
      default: () => [0, 1, 2, 3, 4, 5, 6] as number[],
    },
    selectedDays: {
      type: Array as PropType<number[]>,
      required: false,
      default: () => [] as number[],
    },
  },
  setup(props) {
    const daysInWeek = ref<string[]>(["Su", "M", "T", "W", "Th", "F", "S"]);

    const selected = ref<number[]>(props.selectedDays);

    const getDayClass = (dayAsNum: number) => {
      return selected.value.includes(dayAsNum) ? "selected" : "";
    };

    const toggleDay = (item: number) => {
      // do nothing if isToggle is false
      if (!props.isToggle) return;

      let index = selected.value.indexOf(item);

      if (index === -1) {
        selected.value.push(item);
      } else {
        selected.value.splice(index, 1);
      }
    };

    return { props, daysInWeek, getDayClass, toggleDay, selected };
  },
});
export default DaySelector;
</script>

<template>
  {{ selected }}
  <div class="day-selector" :class="props.isToggle ? 'selectable' : ''">
    <div class="day-toggle-text" v-if="props.isToggle">Select Days</div>
    <div
      class="day-toggle"
      v-for="(item, i) in props.availableDays"
      :key="i"
      :class="getDayClass(item)"
      @click="toggleDay(item)"
    >
      {{ daysInWeek[item] }}
    </div>
  </div>
</template>

<style scoped lang="scss">


.day-selector {
  display: flex;
  align-items: center;

  &.selectable {
    .day-toggle {
      cursor: pointer;
    }
  }

  .day-toggle {
    background: #ffffff;
    border: 1px solid #007fff;
    box-sizing: border-box;
    border-radius: 4px;
    color: #007fff;
    margin-left: 8px;
    width: 20px;
    height: 20px;

    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    user-select: none;
    &.selected {
      background: #007fff;
      color: #ffffff;
    }
  }

  .day-toggle-text {
    width: auto;
    border-color: transparent;
    font-style: normal;
    font-weight: normal;
    font-size: 10px;
    color: #999999;
  }
}
</style>
