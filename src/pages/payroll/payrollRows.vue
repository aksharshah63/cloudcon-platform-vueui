<script lang="ts">
import {
  IContactTimesheets,
  IPayrollCell,
} from "../../use/controller/payroll/payroll.d";
import { computed, defineComponent, PropType, ref, watch } from "vue";
import { useState } from "../../store/index";
import useControllerPayroll from "../../use/controller/payroll/payroll";
import PayrollCell from "./payrollCell.vue";

export const PayrollRows = /*#__PURE__*/ defineComponent({
  name: "PayrollRows",
  components: {
    PayrollCell,
  },
  props: {
    contactDataProp: {
      type: Array as PropType<IContactTimesheets[]>,
      required: true,
    },
    slidingAction: {
      type: Number,
      required: true,
    },
    shiftDetailsKey: {
      type: String,
      required: false,
      default: "_calendar",
    },
  },
  setup(props) {
    const upvise = useState().upvise;
    const controller = useControllerPayroll(upvise);
    const contactData = ref<IContactTimesheets[]>(props.contactDataProp);
    const shiftKey = ref(props.shiftDetailsKey);

    const selectedColumns = computed(() => {
      const result = Array(7).fill(false);
      const selected = contactData.value.map((contact) => {
        return controller.getCurrentWeek(contact.payrollCellsInRange[shiftKey.value])
      });

      return result.map((_, index) => {
        let atLeastOnceCellExists = false;
        let allCellsSelected = true;

        for (const payrollCells of selected) {
          const cell = payrollCells[index];

          if (cell) {
            atLeastOnceCellExists = true;
            if (!cell._selected) {
              allCellsSelected = false;
              break;
            }
          }
        }

        return atLeastOnceCellExists && allCellsSelected;
      });
    });

    function isAllCellsInRangeSelected(
      payrollCellsInRange: (IPayrollCell | null)[]
    ) {
      if (!payrollCellsInRange) return false;
      const cells = controller.getCurrentWeek(payrollCellsInRange);
      let cellsExist = false;
      let allCellsSelected = true;

      cells.forEach((cell) => {
        if (!cellsExist && cell?._selected === true) cellsExist = true;
        if (allCellsSelected && cell && cell._selected === false)
          allCellsSelected = false;
      });

      if (cellsExist && allCellsSelected) return true;
      else return false;
    }

    function toggleRowCells(contact: IContactTimesheets) {
      const cells = controller.getCurrentWeek(
        contact.payrollCellsInRange[shiftKey.value]
      );

      if (cells) {
        // remove all selection
        if (cells.every((cell) => cell == null || cell._selected))
          controller.deselectEntireRow(contact, shiftKey.value);
        else {
          controller.deselectEntireRow(contact, shiftKey.value);
          cells.forEach((cell) => {
            if (cell) cell._selected = true;
          });
        }
      }
    }

    function getHeaderStyle() {
      // let headerCount = headers.value.length;

      return { "grid-template-columns": `repeat(${21}, 1fr)` };
    }

    function totalWeek(contact: IContactTimesheets) {
      return controller.combinePayrollCellShiftTimes(
        ...controller.getCurrentWeek(
          contact.payrollCellsInRange[shiftKey.value]
        )
      );
    }

    watch(
      () => props.contactDataProp,
      () => (contactData.value = props.contactDataProp)
    );

    watch (
      () => props.shiftDetailsKey,
      () => (shiftKey.value = props.shiftDetailsKey)
    )

    return {
      props,
      contactData,
      shiftKey,
      selectedColumns,
      isAllCellsInRangeSelected,
      toggleRowCells,
      getHeaderStyle,
      totalWeek,
    };
  },
});
export default PayrollRows;
</script>

<template>
  <div class="calendar-content">
    <div
      class="calendar-content-item"
      v-for="staff in contactData"
      :key="staff.id"
      :class="{
        selected: isAllCellsInRangeSelected(
          staff.payrollCellsInRange[shiftKey]
        ),
      }"
    >
      <div class="text-b4 pointer" @click="toggleRowCells(staff)">
        {{ staff.name }}
      </div>
      <div class="grid-slider-wrapper">
        <div
          class="grid-slider-parent"
          :style="getHeaderStyle()"
          :class="{
            slidebackward: props.slidingAction === -1,
            slideforward: props.slidingAction === 1,
            slidebackward2: props.slidingAction === -2,
            slideforward2: props.slidingAction === 2,
          }"
        >
          <div
            v-for="(item, j) in staff.payrollCellsInRange[shiftKey]"
            :key="j"
            class="calendar-container"
            :class="{
              selected: j > 6 && j < 14 && selectedColumns[j-7]
            }"
          >
            <PayrollCell :shiftDetails="item" />
          </div>
        </div>
      </div>

      <div class="calendar-container">
        <PayrollCell :isTotal="true" :totalDetails="totalWeek(staff)" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">


.calendar-content {
  .calendar-content-item {
    display: grid;
    max-width: 100%;
    grid-template-columns: 150px auto 260px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 16px;
    color: $grey9;

    .text-b4 {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0 12px;
      font-size: 14px;
    }

    .calendar-container {
      padding: 6px;
      overflow: hidden;

      &.selected {
        padding-right: 4px;
        padding-left: 4px;
        border-right: 2px solid #007fff;
        border-left: 2px solid #007fff;
        background: #f0f7ff;
      }
    }

    &:first-child {
      .calendar-container {
        &.selected {
          padding-top: 4px;
          border-top: 2px solid #007fff;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }
      }
    }

    &:last-child {
      .calendar-container {
        &.selected {
          padding-bottom: 4px;
          border-bottom: 2px solid #007fff;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
      }
    }

    &:nth-child(even) {
      background: #fafafa;
    }

    &.selected {
      margin: 0;
      box-shadow: 0 0 0 2px #007fff inset;
      background: #f0f7ff;

      .calendar-container {
        &.selected {
          padding-top: 4px;
          padding-bottom: 4px;
          border-top: 2px solid #007fff;
          border-bottom: 2px solid #007fff;
        }
      }
    }
  }
}
</style>
