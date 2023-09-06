<script lang="ts">
import { defineComponent, ref } from "vue";

export const LargeIconButton = /*#__PURE__*/ defineComponent({
  name: "LargeIconButton",
  props: {
    text: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: Record<string, any>) {
    const currentPanelView = ref("staff");
    return {
      props,
      currentPanelView,
    };
  },
});
export default LargeIconButton;
</script>

<template>
  <div class="large-icon-button" :class="{ active: isActive }">
    <div>
      <font-awesome-icon
        v-if="!props.icon"
        :icon="['fa', 'heart']"
        size="lg"
      />
    </div>
    <div class="button-text">{{ props.text }}</div>
  </div>
</template>

<style scoped lang="scss">


.large-icon-button {
  font-family: "Poppins";
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 140%;
  text-align: center;
  color: #333333;
  cursor: pointer;
  border-radius: 14px;
  height: 66px;
  background: $white;
  transition: 0.3s;
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #dddddd;
  box-sizing: border-box;
  min-width: 90px;

  .button-text {
    margin-top: 7px;
    white-space: nowrap;
  }

  &:hover {
    background: $grey;
  }

  &.active {
    background: #007fff;
    border-color: #007fff;
    color: $white;
  }
}
</style>
