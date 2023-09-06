<template>
  <generic-chart
    :series="series"
    :config="newConfig"
    :optionsOverride="{}"
  ></generic-chart>
</template>

<script lang="ts">
import { defineComponent, PropType, watch, computed } from "vue";
import { SeriesOptionsType } from "highcharts";
import GenericChart from "../components/charts/GenericChart.vue";
import { IChartConfig } from "../components/charts/types/ChartInterfaces";

const LineChart = /*#__PURE__*/ defineComponent({
  name: "LineChart",
  components: {
    GenericChart,
  },
  props: {
    data: {
      type: Object as PropType<Array<SeriesOptionsType>>,
      required: true,
    },
    config: {
      type: Object as PropType<IChartConfig>,
      default: () => ({}),
    },
    categories: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  setup(props) {
    const generateConfig = computed(() => {
      let tempConfig: IChartConfig = props.config;
      tempConfig.type = "line";
      tempConfig.categories = props.categories;
      return tempConfig;
    });

    const generateSeries = computed(() => {
      if (!Array.isArray(props.data)) {
        let returnArray = [];
        if (props.config.numberOfSeries) {
          for (let i = 0; i < props.config.numberOfSeries; i++)
            returnArray.push({});
        }
        return returnArray;
      } else {
        return props.data;
      }
    });
    let series = generateSeries;
    let newConfig = generateConfig;
    watch(props, () => {
      newConfig = generateConfig;
      series = generateSeries;
    });
    return {
      newConfig,
      series,
    };
  },
});
export default LineChart;
</script>
