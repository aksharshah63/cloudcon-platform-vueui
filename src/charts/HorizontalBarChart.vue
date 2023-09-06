<template>
  <generic-chart
    :series="series"
    :config="newConfig"
    :optionsOverride="{}"
  ></generic-chart>
</template>

<script lang="ts">
import { defineComponent, PropType, watch, computed } from "vue";
import GenericChart from "../components/charts/GenericChart.vue";
import { IChartConfig } from "../components/charts/types/ChartInterfaces";
import _ from "lodash";

export interface IBarChartConfig extends IChartConfig {
  seriesName?: string;
}

const HorizontalBarChart = /*#__PURE__*/ defineComponent({
  name: "HorizontalBarChart",
  components: {
    GenericChart,
  },
  props: {
    data: {
      type: Object as PropType<{ [key: string]: number }>,
      required: true,
    },
    config: {
      type: Object as PropType<IBarChartConfig>,
      default: () => ({}),
    },
  },
  setup(props) {
    const defaultSeriesName = "Value";

    const generateSeries = computed(() => {
      let tempConfig: IBarChartConfig = props.config;

      return [
        {
          data: Object.values(props.data),
          name:
            "seriesName" in tempConfig
              ? tempConfig.seriesName
              : defaultSeriesName,
        },
      ];
    });

    const generateConfig = computed(() => {
      let tempConfig: IBarChartConfig = props.config;
      tempConfig = _.omit(tempConfig, "seriesName");

      tempConfig.type = "bar";
      tempConfig.categories = Object.keys(props.data);

      return tempConfig;
    });

    let series = generateSeries;
    let newConfig = generateConfig;

    watch(props, () => {
      newConfig = generateConfig;
      series = generateSeries;
    });

    return {
      series,
      newConfig,
    };
  },
});
export default HorizontalBarChart;
</script>
