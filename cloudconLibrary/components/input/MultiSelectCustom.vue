<script lang="ts">
import { defineComponent } from "vue";
import MultiSelect from "primevue/multiselect";

export const MultiSelectCustom = /*#__PURE__*/ defineComponent({
  name: "MultiSelectCustom",
  emits: ["update:modelValue"],
  components: {
    MultiSelect,
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
      emit("update:modelValue", newValue);
    }

    return {
      onInput,
    };
  },
});
export default MultiSelectCustom;
</script>

<template>
  <MultiSelect
    :modelValue="modelValue"
    :options="options"
    :optionLabel="optionLabel"
    :optionValue="optionValue"
    :filter="filter"
    :dataKey="dataKey"
    @update:modelValue="onInput"
  />
</template>

<style scoped lang="scss"></style>
