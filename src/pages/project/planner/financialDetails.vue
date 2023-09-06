<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineComponent, PropType } from "vue";
import { IProjectDetails } from "../../../use/controller/project/planner.d";
import DisplayStyle from "../../../components/display/style.vue";
import { stateSymbol } from "../../../store/index";


export const ProjectFinancialDetails = /*#__PURE__*/ defineComponent({
  name: "ProjectFinancialDetails",
  inject: [stateSymbol.description!],
  components: {
    DisplayStyle,
  },
  props: {
    projectDetails: {
      type: Object as PropType<IProjectDetails>,
      required: false,
      default: () => ({} as IProjectDetails),
    },
  },
  setup() {
    return {};
  },
});
export default ProjectFinancialDetails;
</script>

<template>
  <div class="project-financials">
    <div>
      <div class="financial-label">DURATION</div>
      <div class="financial-value">
        {{ projectDetails.duration ? projectDetails.duration : "" }}
      </div>
    </div>

    <div>
      <div class="financial-label">ACTUAL</div>
      <div class="financial-value">
        <display-style
          :data="projectDetails.actualsTotal || 0"
          style="padding-right: 0"
          type-specialisation="currency"
          :type-options="{ fixedDecimals: 0 }"
        />
      </div>
    </div>

    <div>
      <div class="financial-label">TARGET</div>
      <div class="financial-value">
        <display-style
          :data="projectDetails.budget || 0"
          style="padding-right: 0"
          type-specialisation="currency"
          :type-options="{ fixedDecimals: 0 }"
        />
      </div>
    </div>

    <div>
      <div class="financial-label">BUDGET</div>
      <div class="financial-value">
        <display-style
          :data="projectDetails.purchaseTotal || 0"
          style="padding-right: 0"
          type-specialisation="currency"
          :type-options="{ fixedDecimals: 0 }"
        />
      </div>
    </div>

    <div>
      <div class="financial-label">QUOTED</div>
      <div class="financial-value">
        <display-style
          :data="projectDetails.originalTotal || 0"
          style="padding-right: 0"
          type-specialisation="currency"
          :type-options="{ fixedDecimals: 0 }"
        />
      </div>
    </div>

    <div>
      <div class="financial-label">FORECAST</div>
      <div class="financial-value">
        <display-style
          :data="projectDetails.forecast || 0"
          style="padding-right: 0"
          type-specialisation="currency"
          :type-options="{ fixedDecimals: 0 }"
        />
      </div>
    </div>

    <div>
      <div class="financial-label budget-label">Actual Profitability %</div>
      <div class="financial-value">
        <display-style
          :data="projectDetails.actualsProfitabilityPercentage"
          type-specialisation="percent"
        />
      </div>
    </div>

    <div>
      <div class="financial-label budget-label">Estimated Profitability %</div>
      <div class="financial-value">
        <display-style
          :data="projectDetails.targetProfitabilityPercentage"
          type-specialisation="percent"
        />
      </div>
    </div>

    <div>
      <div class="financial-label budget-label">Projected Profitability %</div>
      <div class="financial-value">
        <display-style
          :data="projectDetails.purchaseProfitabilityPercentage"
          type-specialisation="percent"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>


.project-financials {
  display: flex;
  font-family: "Poppins";
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 140%;
  text-transform: uppercase;
  color: #000000;

  & > div {
    display: flex;
    flex-direction: column;
    margin-left: 16px;

    .financial-value {
      text-align: right;
      font-size: 14px;
      line-height: 20px;
    }
    .financial-label {
      text-align: right;
    }
  }
}
</style>
