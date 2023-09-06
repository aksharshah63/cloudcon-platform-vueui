<script lang="ts">
import { defineComponent, PropType, computed } from "vue";
import ComboDashletLayout from "../components/charts/combodashlet/comboDashletLayout.vue";
import BarChart from "./BarChart.vue";
import SolidGauge from "./SolidGauge.vue";
import PercentageChangeModal from "../components/charts/combodashlet/percentageChangeModal.vue";
import { PointOptionsObject } from "highcharts";

export interface IComboMainInfo {
  title: string;
  value: string;
  subvalue: string;
  changevalue: number;
}

export interface IComboGaugeData {
  title?: string;
  percentage: number;
  value: number;
}

export interface IComboLastMonthInfo {
  title: string;
  value: string;
}

export interface IComboBarData {
  title?: string;
  data: { [key: string]: number };
}

export const ComboDashlet = /*#__PURE__*/ defineComponent({
  name: "ComboDashlet",
  components: {
    ComboDashletLayout,
    BarChart,
    SolidGauge,
    PercentageChangeModal,
  },
  props: {
    mainInfo: {
      type: Object as PropType<IComboMainInfo>,
      required: false,
    },
    gaugeData: {
      type: Object as PropType<IComboGaugeData>,
      required: false,
    },
    lastMonthInfo: {
      type: Object as PropType<IComboLastMonthInfo>,
      required: false,
    },
    barData: {
      type: Object as PropType<IComboBarData>,
      required: false,
    },
  },
  setup(props) {
    const styledData = computed(() => {
      if (props?.barData) {
        const keys = Object.keys(props.barData.data);
        let lastKey = keys[keys.length - 1];

        let out: { [key: string]: number | PointOptionsObject } = {
          ...props.barData.data,
        };

        out[lastKey] = {
          y: props.barData.data[lastKey],
          dataLabels: {
            className: "last-column-label",
          },
          className: "last-column",
        };

        return out;
      }

      return null;
    });

    return { styledData };
  },
});

export default ComboDashlet;
</script>

<template>
  <combo-dashlet-layout class="combo-dashlet">
    <!-- left -->
    <template v-slot:left>
      <div v-if="mainInfo">
        <div class="title">
          {{ mainInfo.title }}
        </div>
        <div class="large-value">
          {{ mainInfo.value }}
        </div>
        <div class="subvalue">
          {{ mainInfo.subvalue }}
        </div>
        <div class="percentage-modal">
          <percentage-change-modal :value="mainInfo.changevalue" />
        </div>
      </div>
    </template>
    <!-- bottom -->
    <template v-slot:bottom>
      <div>
        <div class="bottom-header p-d-flex">
          <div>Last Month</div>
          <hr class="div-line" />
        </div>
        <div class="bottom-title">
          {{ lastMonthInfo.title }}
        </div>
        <div class="bottom-value">
          {{ lastMonthInfo.value }}
        </div>
      </div>
    </template>
    <!-- middle -->
    <template v-slot:middle>
      <solid-gauge
        v-if="gaugeData"
        :percentage="gaugeData.percentage"
        :value="gaugeData.value"
        :config="{
          title: gaugeData?.title ?? '',
          styledMode: true,
          className: 'highcharts-color-1',
        }"
      />
    </template>
    <!-- right -->
    <template v-slot:right>
      <bar-chart
        v-if="barData"
        :data="styledData"
        :config="{
          title: barData?.title ?? '',
          legend: false,
          yAxisTitle: null,
          yAxisVisible: false,
          columnRadius: 10,
          dataLabels: {
            enabled: true,
            align: 'center',
            y: 30,
          },
          pointPadding: 0,
          groupPadding: 0.15,
          className: 'highcharts-color-2',
          styledMode: true,
        }"
      />
    </template>
  </combo-dashlet-layout>
</template>

<style lang="scss" scoped>


::v-deep(.highcharts-background) {
  fill: rgba(0, 0, 0, 0);
}

::v-deep(.highcharts-point) {
  stroke-width: 0px;
}

::v-deep(.highcharts-color-0) {
  fill: none;
}

::v-deep(.highcharts-color-1) {
  fill: #ffffff;
}

::v-deep(.highcharts-color-2) {
  fill: rgba(0, 0, 0, 0.15);
}

::v-deep(.highcharts-pane) {
  fill: rgba(0, 0, 0, 0);
  stroke: rgba(255, 255, 255, 0.4);
  stroke-width: 1px;
}

::v-deep(.highcharts-container) {
  font-family: unset;
}

::v-deep(.highcharts-axis-line) {
  stroke-width: 0;
}

::v-deep(.highcharts-title) {
  font-size: 10px;
  text-align: left;
  font-weight: 400;
  line-height: 14px;
  margin-bottom: 20px;
}

.title {
  font-size: 10px;
  text-align: left;
  font-weight: 400;
  line-height: 14px;
  margin-bottom: 20px;
}

.large-value {
  font-size: 80px;
  font-weight: 200;
  line-height: 64px;
  margin-bottom: 10px;
}

.subvalue {
  font-size: 16px;
  font-weight: 400;
  line-height: 22.4px;
  color: rgba(255, 255, 255, 0.7);
}

.bottom-header {
  font-size: 10px;
  line-height: 11px;
  font-weight: 400;
}

.bottom-title {
  font-size: 10px;
  line-height: 14px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
}

.bottom-value {
  font-size: 18px;
  line-height: 28.8px;
  font-weight: 400;
}

.combo-dashlet {
  border-radius: 25px;
  background: #007fff;
  color: #ffffff;
  padding: 15px 20px 20px 15px;
  font-family: Poppins, serif;
  color: #ffffff;
}

.percentage-modal {
  margin: 15px 0px 15px 0px;
}

.bottom-header {
  margin: 5px 0px 25px 0px;
}

.bottom-title {
  margin-bottom: 5px;
}

.div-line {
  flex-grow: 1;
  margin-left: 20px;
  border-color: rgba(255, 255, 255, 0.3);
}

::v-deep(.highcharts-data-label text) {
  font-family: Poppins, serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  fill: #ffffff;
}

::v-deep(.highcharts-axis-labels) {
  font-family: Poppins, serif;
  font-size: 10px;
  font-weight: 400;
  line-height: 14px;
  fill: rgba(255, 255, 255, 0.5);
}

::v-deep(.last-column) {
  fill: rgba(255, 255, 255, 1);
}

::v-deep(.last-column-label.highcharts-data-label text) {
  fill: rgba(0, 127, 255, 1);
  font-weight: 600;
}
</style>
