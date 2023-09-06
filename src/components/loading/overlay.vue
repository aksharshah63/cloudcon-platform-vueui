<script lang="ts">
import { defineComponent } from "vue";

import ProgressSpinner from "primevue/progressspinner";

export const Overlay = /*#__PURE__*/ defineComponent({
  name: "Overlay",
  components: {
    ProgressSpinner,
  },
});

export default Overlay;
</script>

<template>
  <div>
    <div class="loading-overlay">
      <progress-spinner strokeWidth="4" />
    </div>
  </div>
</template>

<style lang="scss" scoped>

::v-deep(.loading-overlay) {
  z-index: 12000;
  position: absolute;
  background: rgba(0, 0, 0, 0.4);
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  .p-progress-spinner {
    .p-progress-spinner-svg {
      .p-progress-spinner-circle {
        stroke: $blue;
        animation: p-progress-spinner-dash 1.5s ease-in-out infinite;
        -webkit-animation: p-progress-spinner-dash 1.5s ease-in-out infinite;
      }
    }
  }
}
</style>
