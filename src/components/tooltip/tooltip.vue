<script lang="ts">
import { defineComponent } from "vue";


export const Tooltip = /*#__PURE__*/ defineComponent({
  name: "Tooltip",
  props: {
    divWidth: {
      type: String,
      required: false,
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup() {
    return {};
  },
});
export default Tooltip;
</script>

<template>
  <div class="tooltipContainer">
    <slot name="tooltipContent"></slot>
  </div>
</template>

<style scoped lang="scss">


.tooltipContainer {
  bottom: 50px;
  width: auto;
  position: absolute;
  z-index: 999999;
  background: $white;
  display: flex;
  //flex-wrap: wrap;

  /* Shadow / Overlay */
  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}
</style>
