<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import maths from "../../../cloudconLibrary/utilities/useNumberOperations";

export const ProgressBarItem = /*#__PURE__*/ defineComponent({
  name: "ProgressBarItem",
  props: {
    actualsApproved: {
      type: Number,
      default: 0,
    },
    actualsNotApproved: {
      type: Number,
      default: 0,
    },
    forecast: {
      type: Number,
      default: 0,
    },
    target: {
      type: Number,
      default: 0,
    },
    budget: {
      type: Number,
      default: 0,
    },
    width: {
      type: String,
      default: "30px",
    },
    showLabels: {
      type: Boolean,
      default: false,
    },
    showBudgetLabel: {
      type: Boolean,
      default: true,
    },
    showTooltipDate: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: String,
      default: "",
    },
    endDate: {
      type: String,
      default: "",
    },
    isProgressBar: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
    },
    required: {
      type: Number,
      default: 0,
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(props: Record<string, any>) {
    const progressBarElement = ref<HTMLElement>();
    const targetElement = ref<HTMLElement>();
    const budgetElement = ref<HTMLElement>();
    const forecastElement = ref<HTMLElement>();
    const actualsApprovedElement = ref<HTMLElement>();
    const actualsUnapprovedElement = ref<HTMLElement>();
    const targetTextElement = ref<HTMLElement>();
    const budgetTextElement = ref<HTMLElement>();
    const forecastTextElement = ref<HTMLElement>();
    const actualsTextElement = ref<HTMLElement>();

    const actuals = computed(() => {
      return maths.sum(props.actualsApproved, props.actualsNotApproved);
    });

    const largestValue = computed(() => {
      return Math.max(
        actuals.value,
        props.forecast,
        props.target,
        props.budget
      );
    });

    const budgetWidth = computed(() => {
      return largestValue.value ? (props.budget / largestValue.value) * 100 : 0;
    });

    const targetWidth = computed(() => {
      return largestValue.value
        ? (props.target / largestValue.value) * 100
        : 100;
    });

    const forecastWidth = computed(() => {
      return largestValue.value
        ? (props.forecast / largestValue.value) * 100
        : 0;
    });

    const actualsApprovedWidth = computed(() => {
      return largestValue.value
        ? (props.actualsApproved / largestValue.value) * 100
        : 0;
    });

    const actualsNotApprovedWidth = computed(() => {
      return largestValue.value
        ? actualsApprovedWidth.value +
            (props.actualsNotApproved / largestValue.value) * 100
        : 0;
    });

    const isForecastMoreThanTarget = computed(() => {
      return props.forecast > props.target ? true : false;
    });

    const isActualsMoreThanTarget = computed(() => {
      return actuals.value > props.target ? true : false;
    });

    const startDateTooltipText = computed(() => {
      return `<tr><td>Start Date</td><td>${props.startDate}</td></tr>`;
    });

    const endDateTooltipText = computed(() => {
      return `<tr><td>End Date</td><td>${props.endDate}</td></tr>`;
    });

    const tooltipHtml = computed(() => {
      return !props.isProgressBar
        ? `<table class="progress-tooltip">
            <tr>
              <td>Unapproved Actuals</td>
              <td>$${formatNumber(props.actualsNotApproved)}</td>
            </tr>
            <tr>
              <td>Approved Actuals</td>
              <td>$${formatNumber(props.actualsApproved)}</td>
            </tr>
            <tr>
              <td>Forecast</td>
              <td>$${formatNumber(props.forecast)}</td>
            </tr>
            <tr>
              <td>Target</td>
              <td>$${formatNumber(props.target)}</td>
            </tr>
            <tr>
              <td>Budget</td>
              <td>$${formatNumber(props.budget)}</td>
            </tr>
            ${props.showTooltipDate ? startDateTooltipText.value : ""}
            ${props.showTooltipDate ? endDateTooltipText.value : ""}
          </table>`
        : `<table class="progress-tooltip">
            <tr>
              <td>Progress</td>
              <td>${formatNumber(props.progress)}</td>
            </tr>
            <tr>
              <td>Required</td>
              <td>${formatNumber(props.required)}</td>
            </tr>
          </table>`;
    });

    function formatNumber(n: number) {
      let num = Math.floor(n || 0);
      return num.toLocaleString();
    }

    watch(
      () => [
        props.actualsApproved,
        props.actualsNotApproved,
        props.forecast,
        props.target,
        props.budget,
        props.width,
        progressBarElement.value,
        targetElement.value,
        actualsUnapprovedElement.value,
        forecastElement.value,
      ],
      () => {
        const barWidth = progressBarElement.value?.offsetWidth;
        const targetWidth = targetElement.value?.offsetWidth;
        const budgetWidth = budgetElement.value?.offsetWidth;
        const actualsWidth = actualsUnapprovedElement.value?.offsetWidth;
        const forecastWidth = forecastElement.value?.offsetWidth;

        if (
          barWidth !== undefined &&
          targetWidth !== undefined &&
          budgetWidth !== undefined &&
          actualsWidth !== undefined &&
          forecastWidth !== undefined
        ) {
          if (targetTextElement.value) {
            // if the width of the target is too small or there is not enough space between the target and actuals, hide target text
            if (
              targetWidth > (targetTextElement.value.offsetWidth || 55) + 65 &&
              targetWidth - actualsWidth >
                targetTextElement.value.offsetWidth + 10
            )
              targetTextElement.value.style.display = "flex";
            else {
              targetTextElement.value.style.display = "none";
            }
          }

          if (budgetTextElement.value) {
            if (
              budgetWidth - actualsWidth >
                budgetTextElement.value.offsetHeight + 5 &&
              budgetWidth - targetWidth >
                budgetTextElement.value.offsetHeight + 5 &&
              budgetWidth - forecastWidth >
                budgetTextElement.value.offsetHeight + 5
            )
              budgetTextElement.value.style.display = "flex";
            else {
              budgetTextElement.value.style.display = "none";
            }
          }
        }
      },
      { deep: true, flush: "post" }
    );

    return {
      props,
      progressBarElement,
      targetElement,
      budgetElement,
      forecastElement,
      actualsApprovedElement,
      actualsUnapprovedElement,
      targetTextElement,
      budgetTextElement,
      forecastTextElement,
      actualsTextElement,
      tooltipHtml,
      isForecastMoreThanTarget,
      isActualsMoreThanTarget,
      budgetWidth,
      targetWidth,
      forecastWidth,
      actualsApprovedWidth,
      actualsNotApprovedWidth,
    };
  },
});
export default ProgressBarItem;
</script>

<template>
  <div
    class="progress-bar-item"
    v-tooltip.top="tooltipHtml"
    :style="{ minWidth: width, width: width }"
    ref="progressBarElement"
  >
    <template v-if="!isProgressBar">
      <div
        class="budget"
        :style="{ width: budgetWidth + '%' }"
        ref="budgetElement"
      >
        <span
          class="label"
          :class="{ 'p-d-none': !showLabels || !showBudgetLabel }"
          ref="budgetTextElement"
          >Budget
        </span>
      </div>

      <div
        class="target"
        :style="{ width: targetWidth + '%' }"
        ref="targetElement"
      >
        <span
          class="label"
          :class="{ 'p-d-none': !showLabels }"
          ref="targetTextElement"
          >Target</span
        >
      </div>

      <div
        class="actuals-approved"
        :class="{ 'actuals-approved-danger': isActualsMoreThanTarget }"
        :style="{
          width: actualsApprovedWidth + '%',
          'min-width': actualsApprovedWidth > 0 ? '8px' : 0,
        }"
        ref="actualsApprovedElement"
      >
        <span
          class="label"
          :class="{ 'p-d-none': !showLabels }"
          ref="actualsTextElement"
          >Actuals</span
        >
      </div>

      <div
        class="actuals-not-approved"
        :class="{ 'actuals-not-approved-danger': isActualsMoreThanTarget }"
        :style="{
          width: actualsNotApprovedWidth + '%',
          'min-width':
            actualsNotApprovedWidth > 0
              ? actualsApprovedWidth > 0
                ? '16px'
                : '8px'
              : 0,
        }"
        ref="actualsUnapprovedElement"
      ></div>

      <div
        class="forecast"
        :class="{ 'forecast-danger': isForecastMoreThanTarget }"
        :style="{
          width: forecastWidth + '%',
          'min-width': forecastWidth > 0 ? '8px' : 0,
        }"
        ref="forecastElement"
      >
        <span
          class="label"
          :class="{ 'p-d-none': !showLabels }"
          ref="forecastTextElement"
          >Forecast</span
        >
      </div>
    </template>

    <template v-else>
      <div class="target" :style="{ width: 100 + '%' }"></div>

      <div
        class="progress"
        :style="{
          width:
            progress > required
              ? '100%'
              : (progress / required || 0) * 100 + '%',
        }"
      ></div>
    </template>

    <!-- <div class="progress-border"></div> -->
  </div>
</template>

<style scoped lang="scss">
.progress-bar-item {
  font-family: "Poppins";
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 140%;
  max-height: 50px;
  position: relative;
  // overflow: hidden;
  height: 100%;
  color: $grey3;

  .target {
    background-image: linear-gradient(
      135deg,
      $white 45.45%,
      $grey8 45.45%,
      $grey8 50%,
      $white 50%,
      $white 95.45%,
      $grey8 95.45%,
      $grey8 100%
    );
    background-size: 15.56px 15.56px;
    border: 1px solid $grey8;
    border-radius: 4px;
    min-width: 70px;
    height: 100%;
    box-sizing: border-box;
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 1;

    .label {
      height: 50%;
      right: 0px;
    }
  }

  .budget {
    background: $grey4;
    border: 1px solid $grey8;
    border-radius: 4px;
    min-width: 70px;
    height: 100%;
    box-sizing: border-box;
    position: absolute;
    top: 0px;
    left: 0px;

    .label {
      font-size: 10px;
      right: 0px;
      height: auto;
      transform: rotate(90deg) translate(50%, -100%);
      transform-origin: 50% 0;
    }
  }

  .actuals-approved {
    background: $blue;
    border-radius: 4px 4px 4px 0;
    height: 50%;
    color: $grey3;
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 3;

    &.actuals-approved-danger {
      background: $red;
    }
  }

  .actuals-not-approved {
    background: $blue3;
    border-radius: 4px 4px 4px 4px;
    height: 50%;
    color: $grey3;
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 2;

    &.actuals-not-approved-danger {
      background: $red2;
    }
  }

  .forecast {
    background: $green;
    border-radius: 0 4px 4px 4px;
    height: 50%;
    color: $grey3;
    position: absolute;
    left: 0px;
    bottom: 0px;
    z-index: 2;

    &.forecast-danger {
      background: $red;
    }
  }

  .progress {
    background: $blue;
    border-radius: 4px 4px 4px 4px;
    height: 100%;
    color: $grey3;
    position: absolute;
    top: 0px;
    left: 0px;
    z-index: 2;
  }

  .label {
    display: flex;
    align-items: center;
    position: absolute;
    height: 100%;
    padding: 0 5px;
  }
}
</style>
