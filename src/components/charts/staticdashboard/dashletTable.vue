<script lang="ts">
/* eslint-disable no-undef */
import { watch, defineComponent, ref } from "vue";
import StaticDashlet from "../../../components/charts/staticdashboard/staticDashlet.vue";
import ProgressSpinner from "primevue/progressspinner";
import useControllerDashboard from "../../../use/controller/dashboard/staticdashboard";
import {
  stateSymbol,
  useState, //useState
} from "../../../store/index";
//To-Do: Make sure that the metadata is fed from here, make it dynamic, maybe 3 first  guess
export const DashletTable = /*#__PURE__*/ defineComponent({
  name: "DashletTable",
  inject: [stateSymbol.description!],
  props: {
    currentRecords: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: "",
    },
  },
  components: {
    StaticDashlet,
    ProgressSpinner,
  },
  setup: function (props: Record<string, any>) {
    const upvise = useState().upvise;
    //This is for when we get data from metadata! Remember to implement!
    //fetchChartSettings
    const controller = useControllerDashboard(upvise);
    const recordsUsed = ref<Record<string, any>[]>([]);
    const listOfCharts = ref<Record<string, any>[]>([]);
    const gettingSettings = ref(true);

    watch(
      () => listOfCharts.value,
      () => {
        if (listOfCharts.value.length > 0) gettingSettings.value = false;
      }
    );

    watch(
      () => [props.currentRecords, props.title],
      async () => {
        if (listOfCharts.value.length == 0 && props.title !== "")
          listOfCharts.value = await grabChartSettings(props.title);
        if (!!props.currentRecords && !!props.title) {
          if (props.title !== "fabrication" && props.title !== "processing")
            recordsUsed.value = props.currentRecords;
          else {
            const allRecords =
              props.title === "fabrication"
                ? upvise.entityData("TableWorkshopFabrication")
                : upvise.entityData("TableWorkshopProcessing");
            recordsUsed.value = await controller.getFabProcessingRecords(
              allRecords,
              props.currentRecords
            );
          }
        }
      }
    );

    async function grabChartSettings(title: string) {
      if (title !== "")
        return JSON.parse(await controller.fetchChartSettings(props.title));
      else return [];
    }
    return {
      gettingSettings,
      recordsUsed,
      listOfCharts,
      controller,
    };
  },
});

export default DashletTable;
</script>
<template>
  <div class="dashlet-table-row">
    <ProgressSpinner
      v-if="gettingSettings"
      :style="{ height: '420px', width: '100%' }"
    ></ProgressSpinner>
    <div
      v-else
      class="p-col dashlet-sections"
      v-for="chart in listOfCharts"
      :key="chart"
    >
      <StaticDashlet
        :chart-config="chart"
        :current-records="recordsUsed"
      ></StaticDashlet>
    </div>
  </div>
</template>

<style lang="scss" scoped>


.dashlet-table-row {
  display: flex;
  width: 100%;

  //height: 200vh;
  flex-direction: row;
  .dashlet-sections {
    text-align: center;
  }
}
</style>
