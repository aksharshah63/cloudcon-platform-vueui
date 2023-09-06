<template>
  <div :style="{ width: '100%', height: '100%', position: 'relative' }">
    <div
      ref="chartDiv"
      :style="{ width: '100%', height: '100%', position: 'absolute' }"
    ></div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  onMounted,
  ref,
  watch,
  computed,
} from "vue";

import Highcharts, { Chart, Options, SeriesOptionsType } from "highcharts";
import SolidGauge from "highcharts/modules/solid-gauge";
import HighchartsMore from "highcharts/highcharts-more";
import Bullet from "highcharts/modules/bullet";

HighchartsMore(Highcharts);
SolidGauge(Highcharts);
Bullet(Highcharts);

window.Highcharts = Highcharts;

Highcharts.setOptions({
  chart: {
    style: {
      fontFamily: "Poppins",
    },
  },
});

export interface IBaseChartOptions extends Options {
  chart: Highcharts.ChartOptions;
  credits?: {
    enabled?: boolean;
  };
}

const BaseChart = /*#__PURE__*/ defineComponent({
  name: "Chart",
  props: {
    series: Object as PropType<Array<SeriesOptionsType>>,
    options: Object as PropType<IBaseChartOptions>,
  },
  setup(props) {
    const chartDiv = ref<HTMLElement>();
    let chart: Chart;

    // const optionsObject = computed(() => ({...(options.value as Options), ...{series: (series.value as Series)}}));
    const optionsObject = computed(() => {
      let out = { ...(props.options as IBaseChartOptions) };
      out.series = props.series as Array<SeriesOptionsType>;
      out.chart.renderTo = chartDiv.value as HTMLElement;

      return out;
    });

    onMounted(() => {
      chart = Highcharts.chart(optionsObject.value);
    });

    watch(props, () => {
      chart.update(optionsObject.value);
    });

    return {
      chartDiv,
    };
  },
});
export default BaseChart;
</script>
