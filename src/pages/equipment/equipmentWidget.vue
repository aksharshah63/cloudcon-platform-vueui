<script lang="ts">
import { defineComponent } from "vue";

// import { IMappedUtilizationlogs } from "../../../use/controller/reporting/utilization/utilization.d";

export const equipmentDetails = /*#__PURE__*/ defineComponent({
  name: "Utilization",
  components: {},
  setup() {
    return {};
  },
});

export default equipmentDetails;
</script>

<template>
  <div class="widget-container">
    <slot name="widget-data"></slot>
  </div>
</template>

<style lang="scss" scoped>
.widget-container {
  height: 300;
  width: 100%;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;

  min-height: 270px;

  /* Primary / Dark Green */
  background: var(--primary-colour);
  box-shadow: 10px 10px 20px rgba(0, 127, 255, 0.3);
  border-radius: 8px;

  /* Inside auto layout */
  flex: none;
  order: 6;
  align-self: stretch;
  flex-grow: 1;

  ::v-deep(.widget-header) {
    font-size: 1rem;
    font-weight: bold;
    color: white;
  }

  ::v-deep(.widget-body) {
    font-size: 0.75rem;
    font-style: bold;
    color: white;
  }

  ::v-deep(.br) {
    border: 1px solid white;
  }

  ::v-deep(.widget-value) {
    font-size: 1.5rem;
    font-weight: bold;
    color: white;
  }
}
</style>
