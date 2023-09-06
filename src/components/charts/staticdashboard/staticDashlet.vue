<script lang="ts">
// eslint-disable @typescript-eslint/no-unused-vars
import {
  defineComponent,
  ref,
  watch,
  //computed,
  //toRefs,
  //onMounted,
  computed,
  PropType,
  //onUnmounted,
} from "vue";
import Card from "primevue/card";
//import BarChart from "../../../charts/BarChart.vue";
import PieChart from "../../../charts/PieChart.vue";
import GroupedBarChart from "../../../charts/GroupedBarChart.vue";
import LineChart from "../../../charts/LineChart.vue";
import useControllerDashboard from "../../../use/controller/dashboard/staticdashboard";
//import DashletConfig from "./dashletConfig.vue";
import MultiBarChart from "../../../charts/MultiBarChart.vue";
import ProgressSpinner from "primevue/progressspinner";
import { stateSymbol, useState } from "../../../store/index";

// export interface IDashlet {
//   id: string;
//   component: any;
//   options: any;
// }

export const StaticDashlet = /*#__PURE__*/ defineComponent({
  name: "Static Dashlet",
  inject: [stateSymbol.description!],
  components: {
    Card,
    ProgressSpinner,
  },
  props: {
    currentRecords: {
      type: Array,
      required: true,
    },
    chartConfig: {
      type: Object as PropType<{ [key: string]: any }>,
      required: true,
    },
  },
  setup(props) {
    //Keep config
    //Categories is like the x axis for things

    const exampleData = computed(() => props.chartConfig);
    const dashletMap = {
      "bar-chart": MultiBarChart,
      "grouped-bar-chart": GroupedBarChart,
      "line-chart": LineChart,
      "multi-bar-chart": MultiBarChart,
      "pie-chart": PieChart,
    };

    const type = exampleData.value.type;
    const dataConfig = JSON.parse(exampleData.value.dataconfig);

    const data = ref({});
    const categories = ref();
    //const currentData = ref({})
    const previousRecord = ref<Record<string, any>[] | null>(null);
    //const currentlyMarking = ref(false)

    const options = computed(() => ({
      data: data.value,
      config: JSON.parse(exampleData.value.config),
      categories: categories.value,
    }));

    const controller = useControllerDashboard(useState().upvise);
    const awaitingResponse = ref(true);
    watch(
      () => props.currentRecords,
      async () => {
        awaitingResponse.value = true;
        if (previousRecord.value == null) {
          previousRecord.value = JSON.parse(
            JSON.stringify(props.currentRecords)
          );

          await controller
            .fetchChartData(
              previousRecord.value as Record<string, any>[],
              dataConfig,
              exampleData.value.type
            )
            .then((value) => {
              if (type === "pie-chart") {
                data.value = value;
              } else {
                data.value =
                  dataConfig.type === "series" ? value.series : value.data;
                categories.value = value.categories ?? [];
              }
            });
        } else {
          if (
            JSON.stringify(props.currentRecords) !=
            JSON.stringify(previousRecord.value)
          ) {
            previousRecord.value = JSON.parse(
              JSON.stringify(props.currentRecords)
            );
            await controller
              .fetchChartData(
                previousRecord.value as Record<string, any>[],
                dataConfig,
                exampleData.value.type
              )
              .then((value) => {
                if (type === "pie-chart") {
                  data.value = value;
                } else {
                  data.value =
                    dataConfig.type === "series" ? value.series : value.data;
                  categories.value = value.categories ?? [];
                }
              });
          }
        }
        awaitingResponse.value = false;
        //console.log(data.value);
      }
    );

    return {
      dashletMap,
      type,
      options,
      awaitingResponse,
    };
  },
});
export default StaticDashlet;
</script>

<template>
  <div>
    <Card class="dashletCard">
      <template #content>
        <ProgressSpinner
          v-if="awaitingResponse"
          :style="{ height: '420px', width: '100%' }"
        ></ProgressSpinner>
        <component
          v-else
          :is="dashletMap[type]"
          v-bind="options"
          :style="{ height: '420px', width: '100%' }"
        />
      </template>
    </Card>
  </div>
</template>

<style lang="scss" scoped>


.insertIndicator {
  margin-bottom: 1px;
  background: $blue;
  border-radius: 5px;
  height: 10px;
  width: 100%;
}

.pi {
  cursor: pointer;
}

.dashletCard {
  width: 100%;
  border-radius: 15px;
}
</style>
