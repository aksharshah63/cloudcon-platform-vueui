<script lang="ts">
import { defineComponent, PropType } from "vue";

export const ToggleOptions = /*#__PURE__*/ defineComponent({
  name: "ToggleOptions",
  props: {
    toggleOptions: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
    currentOption: {
      type: String,
      required: false,
      default: "",
    },
  },
  setup(_, context) {
    function optionSelected(option: string) {
      context.emit("option-selected", option);
    }

    return {
      optionSelected,
    };
  },
});
export default ToggleOptions;
</script>

<template>
  <div class="grid-toggle">
    <template v-for="(option, index) of toggleOptions" :key="option + index">
      <div
        :class="{ selected: currentOption === option }"
        class="grid-toggle-option"
        @click="optionSelected(option)"
      >
        {{ option.toUpperCase() }}
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>


.grid-toggle {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 24px;
  box-shadow: 0 0 0 1px $grey8 inset;
  border-radius: 8px;
  margin-left: 24px;
  background-color: white;

  .grid-toggle-option {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1 1 auto;
    height: 100%;
    padding: 0 10px;
    border-radius: 8px;
    cursor: pointer;

    &.selected {
      color: $white;
      background-color: $blue;
    }
  }
}
</style>
