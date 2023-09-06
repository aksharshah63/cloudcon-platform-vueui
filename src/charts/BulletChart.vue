<template>
  <generic-chart
    :series="series"
    :config="newConfig"
    :optionsOverride="optionsOverwrite"
  ></generic-chart>
</template>

<script lang="ts">
import { defineComponent, PropType, watch, computed } from "vue";
import GenericChart from "../components/charts/GenericChart.vue";
import { IChartConfig } from "../components/charts/types/ChartInterfaces";
import _ from "lodash";
import { PointOptionsObject, YAxisPlotBandsOptions } from "highcharts";

const BulletChart = /*#__PURE__*/ defineComponent({
  name: "BulletChart",
  components: {
    GenericChart,
  },
  props: {
    // value: {
    //   type: Number,
    //   required: true,
    // },
    // target: {
    //   type: Number,
    //   required: true,
    // },
    data: {
      type: Object as PropType<Array<PointOptionsObject>>,
    },
    bands: {
      type: Object as PropType<Array<YAxisPlotBandsOptions>>,
      default: () => undefined,
    },
    config: {
      type: Object as PropType<IChartConfig>,
      default: () => ({}),
    },
  },
  setup(props) {
    // const generateSeries = computed(() => {
    //   return [
    //     {
    //       data: [{
    //         y: props.value,
    //         target: props.target
    //       }]
    //     },
    //   ];
    // });

    const generateSeries = computed(() => {
      return [
        {
          name: "Value",
          data: props.data,
        },
      ];
    });

    const generateConfig = computed(() => {
      let tempConfig: IChartConfig = props.config;
      tempConfig.type = "bullet";

      return tempConfig;
    });

    const target = computed(() =>
      props.data ? props.data[0]?.target ?? 0 : 0
    );

    const optionsOverwrite = computed(() => ({
      chart: {
        inverted: true,
      },
      yAxis: {
        plotBands: props.bands ?? [
          {
            from: 0,
            to: target.value * 0.5,
            color: "#666",
          },
          {
            from: target.value * 0.5,
            to: target.value * 1.5,
            color: "#999",
          },
          {
            from: target.value * 1.5,
            to: 9e9,
            color: "#bbb",
          },
        ],
        gridLineWidth: "0px",
        title: null,
      },
      xAxis: {
        visible: false,
      },
      plotOptions: {
        series: {
          pointPadding: 0.25,
          borderWidth: 0,
          color: "#000",
          targetOptions: {
            width: "200%",
            height: 10,
          },
        },
      },
    }));

    let series = generateSeries;
    let newConfig = generateConfig;

    watch(props, () => {
      newConfig = generateConfig;
      series = generateSeries;
    });

    return {
      series,
      newConfig,
      optionsOverwrite,
    };
  },
});
export default BulletChart;
</script>
