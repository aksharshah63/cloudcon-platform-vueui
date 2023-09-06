<script lang="ts">
import { defineComponent } from "vue";

export const InformationCard = /*#__PURE__*/ defineComponent({
  name: "InformationCard",
  props: {
    valueText: {
      type: String,
      required: false,
      default: "",
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    icon: {
      type: String,
      required: false,
      default: "",
    },
    iconSize: {
      type: String,
      required: false,
      default: "",
    },
    textColour: {
      type: String,
      required: false,
      default: "#666666",
    },
    backgroundColour: {
      type: String,
      required: false,
      default: "#FFFFFF",
    },
    shadowColour: {
      type: String,
      required: false,
      default: "#666666",
    },
  },
  setup(props: Record<string, any>) {
    return {
      props,
    };
  },
});
export default InformationCard;
</script>

<template>
  <div
    class="information-card"
    :style="{
      'background-color': props.backgroundColour,
      'box-shadow': `${props.shadowColour ? '10px 10px 20px ' + props.shadowColour : ''}`,
      'color': props.textColour
    }"
  >
    <div class="content-container p-grid">
      <div class="p-col-10 value-text-container">
        <span class="value-text">{{ props.valueText }}</span>
      </div>
      <div class="p-col-2 icon-container">
        <font-awesome-icon
          v-if="props.icon"
          :style="{
            'font-size': props.iconSize
          }"
          :icon="['fa', props.icon]"
        />
      </div>

      <div class="p-col-12 description-container">
        <span class="description-container">{{ props.description }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">


.information-card {
  font-family: Poppins;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  height: 100%;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  line-height: 120%;

  .content-container {
    margin: 0;

    > div {
      padding: 0;
    }

    .value-text-container {
      font-weight: 600;
      font-size: 24px;
      line-height: 120%;
    }

    .icon-container {
      display: flex;
      justify-content: center;
      margin: 2px 0 0 0;
    }
  }
}
</style>