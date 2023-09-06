<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import labels from "../../use/function/labels";
import SelectButton from "primevue/selectbutton";
//import Button from "primevue/button";

export const SeverityButtons = /*#__PURE__*/ defineComponent({
  name: "SeverityButtons",
  components: {
    SelectButton,
    //Button,
  },
  props: {
    fieldName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: false,
    },
    current: {
      type: Number,
      required: false,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const buttonType = ref(props.type);
    const options = ref(getButtons());
    const selection = ref(
      props.current !== 0 && options.value
        ? options.value[props.current - 1]
        : null
    );

    // function optionClicked(option: number) {
    //   selection.value = option;
    // }

    function getButtons() {
      const buttonLabels = labels[buttonType.value];
      if (!buttonLabels) return null;
      return Object.entries(buttonLabels).map(([key, label]) => {
        return { name: label, value: parseInt(key) };
      });
    }

    watch(selection, (newValue) => {
      emit("updateButtonValue", props.fieldName, newValue?.value);
    });

    return { selection, options };
  },
});
export default SeverityButtons;
</script>

<template>
  <div>
    <SelectButton
      class="severity-buttons"
      v-model="selection"
      :options="options"
      optionLabel="value"
    >
      <template #option="{ option }">
        <span class="p-button-label">
          {{ option.name }}
        </span>
      </template>
    </SelectButton>

    <!-- A different style of button input in case select button is difficult to style with colours -->
    <!--    <Button label="VERY LOW" @click="optionClicked(1)" />-->
    <!--    <Button label="LOW" @click="optionClicked(2)" />-->
    <!--    <Button label="MEDIUM" @click="optionClicked(3)" />-->
    <!--    <Button label="HIGH" @click="optionClicked(4)" />-->
    <!--    <Button label="EXTREME" @click="optionClicked(5)" />-->
  </div>
</template>

<style lang="scss" scoped>


::v-deep(.severity-buttons.p-buttonset) {
  .p-button {
    &.p-highlight {
      &[aria-label="1"] {
        background-color: $veryLowSeverityColor;
      }

      &[aria-label="2"] {
        background-color: $lowSeverityColor;
      }

      &[aria-label="3"] {
        background-color: $mediumSeverityColor;
      }

      &[aria-label="4"] {
        background-color: $highSeverityColor;
      }

      &[aria-label="5"] {
        background-color: $ExtremeSeverityColor;
      }
    }
  }
}
</style>
