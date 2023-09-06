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
import { IPieChartConfig } from "../components/charts/types/ChartInterfaces";
import _ from "lodash";

const PieChart = /*#__PURE__*/ defineComponent({
  name: "PieChart",
  components: {
    GenericChart,
  },
  props: {
    data: {
      type: Object as PropType<{ [key: string]: number }>,
      required: true,
    },
    config: {
      type: Object as PropType<IPieChartConfig>,
      default: () => ({}),
    },
    // categories: {
    //   type: Array as PropType<string[]>,
    //   default: () => [],
    // },
  },
  setup(props) {
    const defaultSeriesName = "Value";

    const generateSeries = computed(() => {
      let tempConfig: IPieChartConfig = props.config;
      let categories = props.data?.series as unknown as Record<string, any>[];
      let properData = categories[0].data as Record<string, any>[];
      return [
        Object.assign(
          {
            data: properData.map((cat) => ({
              name: cat.name as string,
              y: cat.y as number,
            })),
            name:
              "name" in categories[0] ? categories[0]?.name : defaultSeriesName,
          },
          tempConfig.series
        ),
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
export default PieChart;
</script>
