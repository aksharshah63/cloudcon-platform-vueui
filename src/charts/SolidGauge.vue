<template>
  <div v-if="config?.title" class="highcharts-title">
    {{ config.title }}
  </div>
  <div class="square">
    <div class="square-content">
      <generic-chart
        :series="series"
        :config="newConfig"
        :optionsOverride="gaugeOverwrite"
      ></generic-chart>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, watch, computed } from "vue";
import GenericChart from "../components/charts/GenericChart.vue";
import { IChartConfig } from "../components/charts/types/ChartInterfaces";
import _ from "lodash";

export interface IGaugeConfig extends IChartConfig {
  seriesName?: string;
  radius?: string;
  innerRadius?: string;
}

const SolidGauge = /*#__PURE__*/ defineComponent({
  name: "SolidGauge",
  components: {
    GenericChart,
  },
  props: {
    percentage: {
      type: Number,
      required: true,
    },
    value: {
      type: Number,
      required: false,
    },
    config: {
      type: Object as PropType<IGaugeConfig>,
      default: () => ({}),
    },
  },
  setup(props) {
    const defaultSeriesName = "Value";
    const defaultInnerRadius = "88%";

    const gaugeOverwrite = computed(() => ({
      plotOptions: {
        solidgauge: {
          dataLabels: {
            enabled: false,
          },
          linecap: "round",
          stickyTracking: false,
          rounded: true,
        },
      },
      yAxis: {
        min: 0,
        max: 100,
        lineWidth: 0,
        tickPositions: [],
      },
      pane: {
        startAngle: 0,
        endAngle: -360,
        // center: ['50%', '50%'],
        size: "95%",
        // innersize: '10%',
        background: {
          outerRadius: "95%",
          backgroundColor: "rgba(0,0,0,0)",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.4)",
        },
      },
      subtitle: {
        text: props?.value ?? "",
        verticalAlign: "middle",
      },
      title: {
        text: "",
      },
    }));

    const generateSeries = computed(() => {
      let tempConfig: IGaugeConfig = props.config;

      return [
        {
          data: [
            {
              radius: tempConfig?.radius,
              innerRadius: tempConfig?.innerRadius ?? defaultInnerRadius,
              y: props.percentage,
            },
          ],
          name: tempConfig?.seriesName ?? defaultSeriesName,
        },
      ];
    });

    const generateConfig = computed(() => {
      let tempConfig: IGaugeConfig = props.config;
      tempConfig = _.omit(tempConfig, "seriesName");

      tempConfig.type = "solidgauge";

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
      gaugeOverwrite,
    };
  },
});
export default SolidGauge;
</script>

<style lang="scss" scoped>
// format value number
::v-deep(.highcharts-subtitle) {
  font-size: 30px;
  fill: #ffffff;
  font-weight: 300;
}

.square {
  height: 0;
  width: 100%;
  padding-bottom: 100%;
  position: relative;
}

.square-content {
  position: absolute;
  height: 100%;
  width: 100%;
}
</style>
