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
import { PointOptionsObject } from "highcharts";

export interface IPieChartConfig extends IChartConfig {
  seriesName?: string;
}

const DashletsPieChart = defineComponent({
  name: "PieChart",
  components: {
    GenericChart,
  },
  props: {
    data: {
      type: Object as PropType<{ [key: string]: PointOptionsObject }>,
      required: true,
    },
    config: {
      type: Object as PropType<IPieChartConfig>,
      default: () => ({}),
    },
  },
  setup(props) {
    const defaultSeriesName = "Value";

    const generateSeries = computed(() => {
      let tempConfig: IPieChartConfig = props.config;
      let categories = Object.keys(props.data);

      return [
        {
          data: categories.map((cat) => ({
            name: cat,
            y: props.data[cat].y,
            className: props.data[cat].className,
          })),
          name:
            "seriesName" in tempConfig
              ? tempConfig.seriesName
              : defaultSeriesName,
        },
      ];
    });

    const generateConfig = computed(() => {
      let tempConfig: IPieChartConfig = props.config;
      tempConfig = _.omit(tempConfig, "seriesName");

      tempConfig.type = "pie";

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
export default DashletsPieChart;
</script>
