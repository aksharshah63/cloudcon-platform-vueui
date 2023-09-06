<template>
  <base-chart :series="series" :options="options"></base-chart>
</template>

<script lang="ts">
import { defineComponent, PropType, watch, computed } from "vue";
import { Options, SeriesOptionsType } from "highcharts";
import BaseChart, { IBaseChartOptions } from "./BaseChart.vue";
import getOptionsFromConfig from "./composables/getOptionsFromConfig";
import { IGenericChartConfig } from "./types/ChartInterfaces";
import _ from "lodash";

const GenericChart = /*#__PURE__*/ defineComponent({
  name: "GenericChart",
  components: {
    BaseChart,
  },
  props: {
    series: {
      type: Object as PropType<Array<SeriesOptionsType>>,
      required: true,
    },
    config: {
      type: Object as PropType<IGenericChartConfig>,
      required: true,
    },
    optionsOverride: {
      type: Object as PropType<Options>,
      default: () => ({}),
    },
  },
  setup(props) {
    const baseConfig: IBaseChartOptions = {
      chart: {
        type: undefined,
      },
      credits: {
        enabled: false,
      },
    };

    const generateOptions = computed(() => {
      let tempOptions: Options = baseConfig;
      _.merge(tempOptions, getOptionsFromConfig(props.config));
      _.merge(tempOptions, props.optionsOverride);

      return tempOptions;
    });

    let options = generateOptions;

    watch(props, () => {
      options = generateOptions;
    });

    return {
      // series: props.series,
      options,
    };
  },
});
export default GenericChart;
</script>
