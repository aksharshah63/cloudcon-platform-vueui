<template>
  <generic-chart
    :series="series"
    :config="newConfig"
    :optionsOverride="{ plotOptions: { column: { stacking: 'normal' } } }"
  ></generic-chart>
</template>

<script lang="ts">
import { defineComponent, PropType, watch, computed } from "vue";
import { SeriesOptionsType } from "highcharts";
import GenericChart from "../components/charts/GenericChart.vue";
import { IChartConfig } from "../components/charts/types/ChartInterfaces";

const MultiBarChart = /*#__PURE__*/ defineComponent({
  name: "MultiBarChart",
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
      tempConfig.type = "column";
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
    let newConfig = generateConfig;
    let series = generateSeries;
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
export default MultiBarChart;
</script>
