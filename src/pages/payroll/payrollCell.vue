<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from "vue";
import moment from "moment-timezone";
import {
  IPayrollCell,
  IShiftTypes,
} from "../../use/controller/payroll/payroll.d";
import ContextMenu from "primevue/contextmenu";
import date from "../../use/utils/useDateOperations";
import {
  TimesheetsShiftTypes,
  TimesheetsStatus,
} from "../../use/utils/useConstants";
import maths from "../../use/utils/useNumberOperations";

export const PayrollCell = /*#__PURE__*/ defineComponent({
  name: "PayrollCell",
  components: {
    ContextMenu,
  },
  props: {
    isTotal: {
      type: Boolean,
      default: false,
    },
    shiftDetails: {
      type: Object as PropType<IPayrollCell | null>,
      required: false,
      default: null,
    },
    totalDetails: {
      type: Object as PropType<IShiftTypes>,
      required: false,
      default: () => ({} as IShiftTypes),
    },
    showBottom: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const payrollCell = ref(props.shiftDetails);
    const hasError = ref(!!payrollCell.value?._hasError);
    const leaveTypes = [
      TimesheetsShiftTypes.ANNUAL_LEAVE,
      TimesheetsShiftTypes.OTHER_LEAVE,
      TimesheetsShiftTypes.PERSONAL_LEAVE,
      TimesheetsShiftTypes.RDO_TAKEN,
      TimesheetsShiftTypes.SICK_LEAVE,
      TimesheetsShiftTypes.UNPAID_LEAVE,
    ];

    const regularTypes = [TimesheetsShiftTypes.REGULAR];

    const overtimeTypes = [
      TimesheetsShiftTypes.OVERTIME_1,
      TimesheetsShiftTypes.OVERTIME_2,
    ];

    const otherTypes = [
      TimesheetsShiftTypes.ALLOWANCE,
      TimesheetsShiftTypes.OTHER,
    ];

    const totalMapString: Record<string, string> = {
      annualLeave: "Annual Leave",
      otherLeave: "Other Leave",
      overtime1: "Overtime 1",
      overtime2: "Overtime 2",
      personalLeave: "Personal Leave",
      rdoTaken: "Rdo Taken",
      regular: "Regular",
      sickLeave: "Sick Leave",
      unpaidLeave: "Unpaid Leave",
    };

    const getClassFromText = (type: string) => {
      let text = type || "";
      return text
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    };
    const viewReport = () => {
      menu.value.visible = false;
      if (payrollCell.value) {
        //console.log(payrollCell.value?.contactid);
        //console.log(props.shiftDetails?.start);
        //console.log("test");
        if (payrollCell.value.start === 0) {
          window.alert("No Timesheets Found");
          return;
        } else {
          const dateString = moment(payrollCell.value.start).format(
            "ddd MMM DD YYYY"
          );
          //console.log(dateString);
          window.Engine.eval(
            "PayrollProcessor.viewCalculationsFromVue('" +
              payrollCell.value.contactid +
              "','" +
              dateString +
              "')",
            0
          );
        }
      }
    };
    const menu = ref();
    const items = ref([
      {
        label: "View Calculations",
        icon: "pi pi-fw pi-file",
        onclick: viewReport,
      },
    ]);

    // pattern for testing valid 24hr string format
    const pattern = /^([01][0-9]|2[0-3])([0-5][0-9])$/;

    const reformatTimeFormat = (time: string) => {
      let final = "-";

      // check if we follow the format "HHMM" (eg. 1700 = 5:00pm)
      if (!pattern.test(time)) {
        return final;
      }

      return moment(time, "HHmm").format("hh.mm a");
    };

    const onRightClick = (event: unknown) => {
      if (!props.isTotal) {
        //console.log(menu.value);
        menu.value.show(event);
      }
    };

    const numberOfShiftTypes = computed(() => {
      return props.totalDetails
        ? Object.values(props.totalDetails).filter(
            (shiftHours) => !!Number(shiftHours)
          ).length
        : 0;
    });

    const tooltipHtml = computed(() => {
      if (hasError.value) {
        return (
          `<div class="payroll-calendar-item"> <div class="payroll-calendar-tooltip-header">Error Found</div>` +
          `<div class="p-d-flex p-justify-between payroll-calendar-tooltip-content">` +
          `<div>This cell has a time sheet with no associated hourly information.\nPlease manually edit the timesheet record to correct this issue. \nYou can right-click the cell to view the calculations</div></div></div>`
        );
      }
      if (!props.isTotal) {
        if (payrollCell.value) {
          let stringExample = `<div class="payroll-calendar-item"> <div class="payroll-calendar-tooltip-header">Project / Task</div>`;
          payrollCell.value?.projectTimes.forEach((projTime) => {
            stringExample += `<div class="p-d-flex p-justify-between payroll-calendar-tooltip-content"> <div>${projTime.projectName}:</div>
                      <div class="p-pl-2">${projTime.hours}</div></div>`;
          });
          stringExample += `</div>`;
          return stringExample;
        } else
          return `<div class="payroll-calendar-item">
            <div class="payroll-calendar-tooltip-header"></div>
                      <div class="p-d-flex">
              <div>No Projects</div>
            </div>
            </div>`;
      } else {
        let stringExample = `<div class="payroll-calendar-item"> <div class="payroll-calendar-tooltip-header">Total Values</div>`;
        Object.entries(props.totalDetails).forEach(([key, value]) => {
          if (value !== 0) {
            stringExample += `<div class="p-d-flex p-justify-between payroll-calendar-tooltip-content"> <div>${
              totalMapString[key as string] ?? ""
            }:</div>
                      <div class="p-pl-2">${value}</div></div>`;
          }
        });
        stringExample += `</div>`;
        return stringExample;
      }
    });

    function getCellClass() {
      if (props.isTotal) return "total";
      else {
        if (payrollCell.value === null) return "";
        else if (payrollCell.value._selected) return "selected";
        else {
          switch (payrollCell.value.status) {
            case TimesheetsStatus.APPROVED:
              return "approved";
            case TimesheetsStatus.WARNING:
              return "warning";
            case TimesheetsStatus.REJECTED:
              return "rejected";
            case TimesheetsStatus.CONFLICTING_STATUS:
              return "conflict";
            default:
              return "";
          }
        }
      }
    }

    function toggleCellSelect() {
      if (payrollCell.value !== null)
        payrollCell.value._selected = !payrollCell.value._selected;
    }

    // get total hours for shiftType. If no shiftType specified, get total for all shiftTypes
    function getTotal(shiftType?: string) {
      let shiftTypes: TimesheetsShiftTypes[] = [];

      switch (shiftType) {
        case "leave":
          shiftTypes = leaveTypes;
          break;
        case "regular":
          shiftTypes = regularTypes;
          break;
        case "overtime":
          shiftTypes = overtimeTypes;
          break;
        case "other":
          shiftTypes = otherTypes;
          break;
        default:
          shiftTypes = Object.values(TimesheetsShiftTypes);
      }

      return Object.entries(props.totalDetails)
        .filter(
          (shift) =>
            !shiftType || shiftTypes.includes(shift[0] as TimesheetsShiftTypes)
        )
        .reduce((total, shift) => maths.sum(total, shift[1]), 0);
    }

    function shiftAbbreviation(shiftType: string) {
      switch (shiftType) {
        case "annualLeave":
          return "AL";
        case "otherLeave":
          return "OL";
        case "personalLeave":
          return "PL";
        case "rdoTaken":
          return "RDO";
        case "sickLeave":
          return "SL";
        case "unpaidLeave":
          return "UL";
        default:
          return "";
      }
    }

    watch(
      () => props.shiftDetails,
      () => {
        payrollCell.value = props.shiftDetails;
        hasError.value = !!payrollCell.value?._hasError;
      },
      { deep: true }
    );

    return {
      payrollCell,
      hasError,
      leaveTypes,
      TimesheetsStatus,
      menu,
      items,
      props,
      date,
      numberOfShiftTypes,
      tooltipHtml,
      reformatTimeFormat,
      getClassFromText,
      getCellClass,
      toggleCellSelect,
      getTotal,
      shiftAbbreviation,
      onRightClick,
    };
  },
});
export default PayrollCell;
</script>

<template>
  <!-- TODO: currently no hovers on items that shows projects done and shifts as specified in figma design. -->
  <ContextMenu v-if="!isTotal" ref="menu" :model="items">
    <template #item="{ item }">
      <a @click="item.onclick" class="p-menuitem-link">
        <span class="p-menuitem-icon" :class="item.icon"></span>
        <span class="p-menu-item-text">{{ item.label }}</span>
      </a>
    </template>
  </ContextMenu>
  <div
    @contextmenu="onRightClick"
    v-tooltip.bottom="tooltipHtml"
    class="staff-schedule-item"
    :class="{
      [getCellClass()]: true,
      pointer: !isTotal,
    }"
    @click="!isTotal ? toggleCellSelect() : null"
  >
    <template v-if="!props.isTotal">
      <div class="top-level">
        <template v-if="hasError">
          <div class="error">
            <div>
              <font-awesome-icon
                class="warning-icon"
                :icon="['fa', 'exclamation-triangle']"
              />
            </div>
            <div>Error</div>
          </div>
        </template>
        <template v-else-if="payrollCell">
          <template
            v-for="(hours, shiftType, i) in payrollCell?.shiftTimes"
            :key="shiftType"
          >
            <div v-if="hours" :class="shiftType">
              <div>{{ hours }}</div>
              <div v-if="leaveTypes.includes(shiftType)" class="abbreviation">
                {{ shiftAbbreviation(shiftType) }}
              </div>
              <div v-if="i === 0 && payrollCell?.lunchBreak">
                <font-awesome-icon
                  class="utensils-icon"
                  :icon="['fa', 'utensils']"
                />
              </div>
              <div v-if="i === 0 && payrollCell?.smokoBreak">
                <font-awesome-icon
                  class="smoking-icon"
                  :icon="['fa', 'smoking']"
                />
              </div>
            </div>
          </template>
        </template>
        <div v-else>-</div>
      </div>

      <div v-if="props.showBottom" class="bottom-level">
        <div class="start-time">
          <span>
            {{
              payrollCell?.start
                ? date.getDateString(payrollCell.start, "h.mm a")
                : "-"
            }}
          </span>
        </div>
        <div class="end-time">
          <span>
            {{
              payrollCell?.end
                ? date.getDateString(payrollCell.end, "h.mm a")
                : "-"
            }}
          </span>
        </div>
        <div
          v-if="payrollCell && payrollCell?.numberOfTimesheets > 1"
          class="number-of-timesheets"
        >
          <span>
            {{ payrollCell?.numberOfTimesheets ?? 0 }}
          </span>
        </div>
      </div>

      <div v-if="payrollCell?.status === TimesheetsStatus.SENT" class="checked">
        <font-awesome-icon :icon="['fa', 'check-double']" />
      </div>
    </template>

    <template v-else-if="props.isTotal">
      <div class="top-level">
        <div class="regular">
          {{ getTotal("regular") }}
        </div>

        <div class="all-overtime">
          {{ getTotal("overtime") }}
        </div>

        <div class="all-leave">
          {{ getTotal("leave") }}
        </div>

        <div class="all-other">
          {{ getTotal("other") }}
        </div>

        <div class="total">
          {{ getTotal() }}
        </div>
      </div>

      <div v-if="props.showBottom" class="bottom-level">
        <div class="regular">
          <span>Ord</span>
        </div>

        <div class="all-overtime">
          <span>Ot</span>
        </div>

        <div class="all-leave">
          <span>Leave</span>
        </div>

        <div class="all-other">
          <span>Other</span>
        </div>

        <div class="total">
          <span>Total</span>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="top-level">
        <div>-</div>
      </div>
      <div class="bottom-level">
        <div>-</div>
        <div>-</div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">


.staff-schedule-item {
  font-family: "Poppins";
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 20px;
  color: #333333;
  min-height: 53px;
  height: 100%;
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 4px;
  /* Grey / Grey 3 */

  border: 2px solid transparent;
  // box-sizing: border-box;
  border-radius: 8px;

  ::v-deep(.contextItem) {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &.total {
    background: #ffffff;
    border-color: #999999;
  }

  &.selected {
    background: #ffffff;
    border-color: #007fff;
  }

  &.approved {
    background: #ffffff;
    border-color: #61e24b;

    .start-time,
    .end-time {
      background: #61e24b;
      color: #ffffff;
    }
  }

  &.warning {
    background: #ffffff;
    border-color: #edbd13;

    .start-time,
    .end-time {
      background: #edbd13;
      color: #ffffff;
    }
  }

  &.rejected {
    background: #ffffff;
    border-color: #f14d29;

    .start-time,
    .end-time {
      background: #f14d29;
      color: #ffffff;
    }
  }

  &.conflict {
    background: #ffffff;
    border-color: #999999;
  }

  .top-level,
  .bottom-level {
    & > div {
      &.overtime1 {
        background: #e6f9fd;
        border-color: #e6f9fd;
      }

      &.overtime2 {
        background: #b5edf9;
        border-color: #b5edf9;
      }

      &.all-overtime {
        background: #e6f9fd;
        border-color: #e6f9fd;
      }

      &.all-other,
      &.allowance,
      &.other {
        background: #fff8ef;
        border-color: #784200;
      }

      &.all-leave,
      &.annualLeave,
      &.otherLeave,
      &.personalLeave,
      &.rdoTaken,
      &.sickLeave,
      &.unpaidLeave {
        background: #fbf6fc;
        border-color: #dd66ff;
      }

      &.error {
        background: #f7d8d2;
        border-color: #f14d29;
      }

      &.total {
        background: #333333;
        border-color: #333333;
        color: #ffffff;
      }
    }
  }

  .top-level {
    display: flex;
    flex-grow: 1;
    margin-bottom: 2px;

    & > div {
      flex: 1;
      margin-right: 2px;

      border-radius: 8px;

      background: #ffffff;

      border: 1px solid #f5f5f5;
      box-sizing: border-box;

      display: flex;
      justify-content: center;
      align-items: center;

      padding: 8px 0;

      &:last-of-type {
        margin-right: 0px;
      }

      > div {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 2px;

        &:first-child {
          margin-left: 0;
        }

        &:last-child {
          margin-right: 0;
        }

        &.abbreviation {
          font-size: 12px;
          line-height: 140%;
          text-align: center;
          color: #ffffff;
          background: rgba(221, 102, 255, 0.5);
          border-radius: 4px;
          text-align: center;
          padding: 2px;
        }

        .utensils-icon {
          font-size: 12px;
          color: $grey8;
        }

        .smoking-icon {
          font-size: 12px;
          color: $grey8;
        }

        .warning-icon {
          font-size: 12px;
          color: #f14d29;
        }
      }
    }
  }

  .bottom-level {
    display: flex;
    font-size: 10px;
    line-height: 140%;
    color: #666666;

    & > div {
      margin-right: 2px;
      background: #f5f5f5;
      border-radius: 8px;
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      white-space: nowrap;
      overflow: hidden;

      &.number-of-timesheets {
        max-width: fit-content;
        padding: 0 6px;
        color: #ffffff;
        background: #08c3ec;
        border-color: #08c3ec;
      }

      &:last-of-type {
        margin-right: 0px;
      }

      > span {
        overflow: hidden;
        margin: 0 4px;
      }
    }
  }

  .checked {
    position: absolute;
    top: 3px;
    right: 3px;
    color: $grey6;
  }
}

.pointer {
  cursor: pointer;
}
</style>
