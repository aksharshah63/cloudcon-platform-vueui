<script lang="ts">
import { defineComponent } from "vue";
import "../../assets/styles/global.scss";

export const HeaderSummary = /*#__PURE__*/ defineComponent({
  name: "HeaderSummary",
  props: {
    enableLeftAndRight: {
      type: Boolean,
      required: false,
      default: true,
    },
    enableWhiteBackground: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
});

export default HeaderSummary;
</script>

<template>
  <div
    class="header-group"
    :style="{ backgroundColor: enableWhiteBackground ? '#FFFFFF' : '#E8E8E8' }"
  >
    <div>
      <slot name="top"></slot>
    </div>

    <div v-if="enableLeftAndRight" class="header-item left">
      <slot name="left"></slot>
    </div>

    <div class="header-item">
      <slot name="middle"></slot>
    </div>

    <div v-if="enableLeftAndRight" class="header-item right">
      <slot name="right"></slot>
    </div>

    <div>
      <slot name="top"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/global.scss";

.header-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  //height: 500px;
  border-radius: 8px;
  padding: 0 24px;
  cursor: default;
  min-height: 104px;
  max-height: 500px;

  .header-item {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1 1 0;
    height: 100%;
    //padding: 8px;

    &.left {
      border-radius: 8px 0 0 8px;
      justify-content: start;
    }

    &.right {
      border-radius: 0 8px 8px 0;
      justify-content: flex-end;
    }
  }
}
</style>
