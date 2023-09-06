<script lang="ts">
import { defineComponent } from "vue";
import Dropdown from "primevue/dropdown";

export const DropdownCustom = /*#__PURE__*/ defineComponent({
  name: "DropdownCustom",
  emits: ['update:modelValue'],
  components: {
    Dropdown
  },
  props: {
    // Primevue Dropdown Props
    modelValue: null,
    options: Array,
    optionLabel: null,
    optionValue: null,
    filter: Boolean,
    dataKey: null,
  },
  setup(_, { emit }) {
    function onInput(newValue: any) {
      emit("update:modelValue", newValue)
    }

    return {
      onInput
    };
  },
});
export default DropdownCustom;
</script>

<template>
  <Dropdown
    :modelValue="modelValue"
    :options="options"
    :optionLabel="optionLabel"
    :optionValue="optionValue"
    :filter="filter"
    :dataKey="dataKey"
    @update:modelValue="onInput"
  />
</template>

<style scoped lang="scss">
</style>
