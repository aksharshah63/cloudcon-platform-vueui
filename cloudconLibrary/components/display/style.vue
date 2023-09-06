<!--
All types of typeSpecialisation


percent = Displays the number as a percentage i.e 3 => +3%,  -5 => -5%
percentInvert = Same as above, but with a reversed colour scheme
percentComplete = Adds a percentage to the end of the value, no scheme changes
currency = Displays the value as a currency, currency is set in data?
-->
<script lang="ts">
import { computed, defineComponent } from "vue";
import moment from "moment-timezone";
import useParseRulesController from "../../utilities/useParseRules";

import date from "../../utilities/useDateOperations";
import { ProgressStatus } from "../../utilities/useConstants";

export const DisplayStyle = /*#__PURE__*/ defineComponent({
  name: "DisplayStyle",
  props: {
    data: {
      required: true,
    },
    typeSpecialisation: {
      type: String,
      required: false,
      default: "",
    },
    currency: {
      type: String,
      required: false,
    },
    typeOptions: {
      type: Object,
      required: false,
    },
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(props: Record<string, any>) {
    const currencyDenominator = "$";
    const parseRulesController = useParseRulesController();

    // Handles how different data is displayed
    const displayData = computed(() => {
      switch (props.typeSpecialisation) {
        case "active":
          return formatDataActive();
        case "budgetType":
          return formatDataBudgetType();
        case "completeStatusCellColour":
          return "";
        case "currency":
        case "currencyPlusOrMinus":
        case "currencyPlusOrMinusInvert":
          return formatDataCurrency();
        case "date":
          return formatDataDate();
        case "days":
          return formatDataDays();
        case "duration":
          return formatDataDuration();
        case "hours":
          return formatDataHours();
        case "multiId":
          return formatDataMultiId();
        case "percent":
        case "percentInvert":
          return formatDataPercent();
        case "percentComplete":
          return formatDataPercentComplete();
        case "rules":
          return formatDataRules();
        case "sent":
          return formatDataSent();
        case "progressStatusCellColour":
        case "progressStatusText":
          return formatDataProgressStatusText();
        default:
          return props.data ?? "";
      }
    });

    // Class related computations below
    // Calculates which css class to apply
    const classCalculator = computed(() => {
      switch (props.typeSpecialisation) {
        case "active":
          return activeClass.value;
        case "checkbox":
          return checkboxClass.value;
        case "completeStatusCellColour":
          return completeStatusCellColour.value;
        case "currency":
          return "currency";
        case "currencyPlusOrMinus":
          return currencyPlusOrMinusClass.value;
        case "currencyPlusOrMinusInvert":
          return currencyPlusOrMinusInvertClass.value;
        case "percent":
          return percentClass.value;
        case "percentComplete":
          return "percent";
        case "percentInvert":
          return percentInvertClass.value;
        case "processingStatusCellColour":
          return processingStatusCellColourClass.value;
        case "progressStatusCellColour":
          return progressStatusCellColourClass.value;
        case "text-align-left":
          return "text-align-left";
        default:
          return "";
      }
    });

    const activeClass = computed(() => {
      if (typeof props.data === "number") {
        if (props.data === 1) {
          return "active true";
        } else if (props.data === 0) {
          return "active false";
        } else {
          return "";
        }
      } else {
        return "";
      }
    });

    const checkboxClass = computed(() => {
      if (typeof props.data === "number") {
        if (props.data === 1) {
          return "checkbox true";
        } else if (props.data === 0) {
          return "checkbox false";
        } else {
          return "";
        }
      } else {
        return props.data ? "checkbox true" : "checkbox false";
      }
    });

    const completeStatusCellColour = computed(() => {
      if (typeof props.data === "number") {
        switch (props.data) {
          case 1:
            return "progress-status completed";
          default:
            return "";
        }
      } else return "";
    });

    const currencyPlusOrMinusClass = computed(() => {
      if (typeof props.data === "number") {
        if (props.data > 0) {
          return "currency text-red";
        } else if (props.data < 0) {
          return "currency text-green";
        } else {
          return "currency";
        }
      } else {
        return "";
      }
    });

    const currencyPlusOrMinusInvertClass = computed(() => {
      if (typeof props.data === "number") {
        if (props.data > 0) {
          return "currency text-green";
        } else if (props.data < 0) {
          return "currency text-red";
        } else {
          return "currency";
        }
      } else {
        return "";
      }
    });

    const percentClass = computed(() => {
      if (typeof props.data === "number") {
        if (props.data > 0) {
          return "percent budget-positive";
        } else if (props.data < 0) {
          return "percent budget-negative";
        } else {
          return "percent ";
        }
      } else {
        return "";
      }
    });

    // Returns the style to use on percent inverted
    const percentInvertClass = computed(() => {
      if (typeof props.data === "number") {
        if (props.data > 0) {
          return "percent budget-negative";
        } else if (props.data < 0) {
          return "percent budget-positive";
        } else {
          return "percent";
        }
      } else {
        return "";
      }
    });

    const processingStatusCellColourClass = computed(() => {
      const group = props.typeOptions?.group ?? 0;
      const status = props.typeOptions?.status ?? 0;

      switch (status) {
        case 0:
        case 1:
          switch (group) {
            case 0:
              return "";
            case 1:
              return "processing-status incomplete residential";
            case 2:
            default:
              return "processing-status incomplete commercial";
          }
        case 2:
          return "processing-status completed";
        default:
          return "";
      }
    });

    const progressStatusCellColourClass = computed(() => {
      if (typeof props.data === "number") {
        switch (props.data) {
          case 0:
            return "progress-status not-started";
          case 1:
            return "progress-status in-progress";
          case 2:
            return "progress-status completed";
          default:
            return "";
        }
      } else return "";
    });

    function formatDataActive() {
      return props.data === 1 ? "ACTIVE" : props.data === 0 ? "INACTIVE" : "";
    }

    function formatDataBudgetType() {
      if (typeof props.data === "number") {
        switch (props.data) {
          case 0:
            return "Labour";
          case 1:
            return "Plant";
          case 2:
            return "Subcontractor";
          case 3:
            return "Material";
          default:
            return "";
        }
      } else return "";
    }

    function formatDataCurrency() {
      if (typeof props.data === "number") {
        let plusOrMinusSign = "";
        let currencyValue = props.data.toFixed(2);

        if (
          props.typeOptions &&
          typeof props.typeOptions.fixedDecimals === "number"
        ) {
          currencyValue = props.data.toFixed(props.typeOptions.fixedDecimals);
        }

        if (
          props.typeSpecialisation === "currencyPlusOrMinus" ||
          props.typeSpecialisation === "currencyPlusOrMinusInvert"
        ) {
          if (props.data > 0) plusOrMinusSign = "+";
        }

        if (props.data < 0) plusOrMinusSign = "-";

        return [
          plusOrMinusSign,
          currencyDenominator,
          Math.abs(Number(currencyValue))
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ","),
          " ",
          props.currency,
        ]
          .filter(Boolean)
          .join("");
      } else return "";
    }

    function formatDataDate() {
      return props.data ? moment(props.data).format("DD-MMM-YYYY") : "";
    }

    function formatDataDays() {
      if (typeof props.data === "number") {
        return props.data.toString() + " days";
      } else "";
    }

    function formatDataDuration() {
      if (typeof props.data === "number") {
        return date.getDuration(props.data);
      } else "";
    }

    function formatDataHours() {
      if (typeof props.data === "number") {
        return props.data.toString() + "h";
      } else return "";
    }

    function formatDataMultiId() {
      if (props.data) return props.data.split("|");
      else return "";
    }

    function formatDataPercent() {
      if (typeof props.data === "number") {
        // So if data is a number and less then 0 we add a % to the end before displaying
        // If data is > 0 we add a + before it and a % after it
        // So given the value 15 we will get '+15%' displayed
        return props.data <= 0
          ? String(props.data) + "%"
          : "+" + String(props.data) + "%";
      } else return "";
    }

    function formatDataPercentComplete() {
      if (typeof props.data === "number") {
        return String(props.data) + "%";
      } else return "";
    }

    function formatDataRules() {
      return parseRulesController.getRules(props.data);
    }

    function formatDataSent() {
      if (props.data === 0) {
        return "Not Sent";
      } else return "Sent";
    }

    function formatDataProgressStatusText() {
      if (typeof props.data === "number") {
        switch (props.data) {
          case ProgressStatus.NOT_STARTED:
            return "Not Started";
          case ProgressStatus.IN_PROGRESS:
            return "In Progress";
          case ProgressStatus.COMPLETED:
            return "Completed";
        }
      } else return "";
    }

    return {
      currencyDenominator,
      displayData,
      classCalculator,
      percentInvertClass,
      percentClass,
      activeClass,
      currencyPlusOrMinusClass,
      currencyPlusOrMinusInvertClass,
    };
  },
});

export default DisplayStyle;
</script>

<template>
  <div class="display-style" :class="classCalculator">
    <div class="content-container">
      <ul v-if="Array.isArray(displayData)" class="dot-point">
        <li v-for="(item, index) of displayData" :key="index">
          {{ item }}
        </li>
      </ul>
      <font-awesome-icon
        v-else-if="typeSpecialisation === 'checkbox'"
        :icon="['fa', data ? 'check' : 'times']"
      />
      <span v-else>{{ displayData }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.display-style {
  font-family: Poppins, serif;
  height: 100%;
  width: 100%;
  overflow: hidden;
  text-align: left;

  &.active {
    &.true {
      color: $green;
    }
    &.false {
      color: $red;
    }
  }

  &.checkbox {
    font-size: 16px;

    &.true {
      color: $green;
    }
    &.false {
      color: $red;
    }
  }

  &.currency {
    text-align: right;
    padding-right: 20%;

    &.text-red {
      color: $red;
    }

    &.text-green {
      color: $green;
    }
  }

  &.percent {
    &.budget-positive {
      color: $green;
    }
    &.budget-negative {
      color: $red;
    }
  }

  &.processing-status {
    &.completed {
      color: $black;
      background: $green;
      border: 1px $grey2 solid;
    }

    &.incomplete {
      &.residential {
        color: $black;
        background: $yellow;
        border: 1px $grey2 solid;
      }

      &.commercial {
        color: $black;
        background: $orange;
        border: 1px $grey2 solid;
      }
    }
  }

  &.progress-status {
    &.not-started {
      color: $black;
      background: $red;
      border: 1px $grey2 solid;
    }

    &.in-progress {
      color: $black;
      background: $yellow;
      border: 1px $grey2 solid;
    }

    &.completed {
      color: $black;
      background: $green;
      border: 1px $grey2 solid;
    }
  }

  &.table-data-text {
    color: $grey9;

    &.dark-grey {
      color: $grey3;
    }
    &.green {
      color: $green;
    }
    &.red {
      color: $red;
    }
    &.bold {
      font-weight: 600;
    }
    &.black {
      color: $black !important;
    }
  }

  .content-container {
    display: flex;
    min-height: 18px;
    align-items: center;

    > svg {
      width: 100%;
    }

    .dot-point {
      margin-top: 0;
      margin-bottom: 0;
      list-style-position: inside;
      list-style-type: circle;
    }
  }
}
</style>
