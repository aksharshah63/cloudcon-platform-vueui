<script lang="ts">
import { LegendIconTypes } from "../../use/utils/useConstants";
import { defineComponent, PropType } from "vue";
import { ILegendOption } from "../../use/customInterfaces.d";

export const Legend = /*#__PURE__*/ defineComponent({
  name: "Legend",
  props: {
    options: {
      type: Array as PropType<ILegendOption[]>,
      required: true,
    },
    iconType: {
      type: String as PropType<LegendIconTypes>,
      required: false,
      default: LegendIconTypes.SQUARE
    }
  },
  setup(props) {

    function iconStyleObject(option: ILegendOption) {
      const borderColour = option.borderColour ?? option.backgroundColour;
      const styleObject = {
        "background-color": option.backgroundColour,
        "border": `2px solid ${borderColour}`
      }

      switch (props.iconType) {
        case LegendIconTypes.SQUARE:
          return Object.assign(styleObject, {
            "width": "20px",
            "height": "20px",
            "border-radius": "8px",
          });
      }
    }

    return {
      props,
      iconStyleObject
    };
  },
});
export default Legend;
</script>

<template>
  <div class="legend">
    <div
      v-for="(option, index) in props.options"
      :key="index"
    >
      <div class="icon" :style="iconStyleObject(option)"></div>
      <span class="label">{{ option.name }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">

.legend {
  display: flex;
  flex-wrap: wrap;

  > div {
    width: 200px;
    display: flex;
    justify-content: start;
    align-items: center;
    padding: 6px 0;

    .icon {
      margin-right: 6px;
    }
  }
}
</style>
