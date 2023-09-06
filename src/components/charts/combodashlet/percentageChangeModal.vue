<script lang="ts">
import { computed, defineComponent } from "vue";

export const PercentageChangeModal = /*#__PURE__*/ defineComponent({
  name: "PercentageChangeModal",
  props: {
    value: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const negColor = "#F14D29";
    const posColor = "#08C3EC";
    const zeroColor = "#000000";

    const color = computed(() =>
      props.value === 0 ? zeroColor : props.value > 0 ? posColor : negColor
    );
    const arrowIcon = computed(() =>
      props.value >= 0 ? "pi-arrow-up" : "pi-arrow-down"
    );
    const text = computed(() => (props.value >= 0 ? "UP" : "DOWN"));

    return {
      color,
      arrowIcon,
      text,
    };
  },
});

export default PercentageChangeModal;
</script>

<template>
  <div class="percentage-modal p-d-inline-flex p-flex-row" :style="{ color }">
    <div class="p-mx-1">
      {{ Math.abs(value) + "%" }}
    </div>
    <i v-if="value" :class="['pi', arrowIcon, 'p-mx-1', 'arrow']" />
    <div v-if="value" class="direction-text p-mx-1">
      {{ text }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.percentage-modal {
  background: #ffffff;
  border-radius: 8px;
  padding: 10px;
}
.direction-text {
  color: #000000;
}
// .arrow {
//   vertical-align: bottom;
// }
</style>
