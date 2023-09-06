<script lang="ts">
import { IShiftTypes } from "../../use/controller/payroll/payroll.d";
import { defineComponent, PropType } from "vue";
import PayrollCell from "./payrollCell.vue";

export const PayrollGroupRow = /*#__PURE__*/ defineComponent({
  name: "PayrollGroupRow",
  components: {
    PayrollCell
  },
  props: {
    groupName: {
      type: String,
      required: false,
      default: "",
    },
    totalDetails: {
      type: Object as PropType<IShiftTypes>,
      required: false,
      default: () => ({} as IShiftTypes),
    },
    isExpanded : {
      type: Boolean,
      required: false,
      default: false,
    }
  },
  setup(props) {
    function getTotal() {
      return (
        props.totalDetails?.regular ??
        0 + props.totalDetails?.overtime1 ??
        0 + props.totalDetails?.overtime2 ??
        0
      );
    }

    return {
      props,
      getTotal,
    };
  },
});
export default PayrollGroupRow;
</script>

<template>
  <div class="project-header pointer">
    <div class= "chevron">
      <font-awesome-icon
        :icon="['fa', 'caret-right']"
        class="caret-right"
        :class="{
          'expanded': props.isExpanded,
        }"
      />
    </div>
    <div class="label">
      {{ props.groupName }}
    </div>
    <div />
    <div class="total">
      <PayrollCell
        :isTotal="true"
        :showBottom="false"
        :totalDetails="props.totalDetails"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">


.project-header {
  height: 32px;
  display: grid;
  grid-template-columns: 20px 400px auto 260px;
  max-width: 100%;
  background: $grey3;
  border-radius: 8px;
  margin-top: 16px;
  border: 2px solid transparent;

  & > div {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: #ffffff;
    overflow: hidden;

    &.chevron {
       .caret-right {
        font-size: 16px;
        transition: 0.2s;

        &.expanded {
          transform: rotate(90deg);
        }
       }
    }

    &.label {
      justify-content: flex-start;
    }

    &.total {
      padding: 0 6px;

      ::v-deep(.staff-schedule-item) {
        min-height: 28px;
        border-color: transparent;
        padding-top: 0;
        padding-bottom: 0;
        background: none;

        > div {
          margin-bottom: 0;

          > div {
            border: none;
            padding: 0;
            line-height: normal;
          }
        }
      }
    }
  }
}
</style>
