<script lang="ts">
import { stateSymbol, useState } from "../../../store";
import { UpviseDataMessage } from "../../../store/modules/upvise";
import { IUpviseDataMessage } from "../../../store/modules/upvise.d";
import useControllerSalesDeal from "../../../use/controller/sales/deals";
import DashboardOverview from "../../../controls/dashboard/overview.vue";
import { defineComponent, onMounted, ref, watch, watchEffect } from "vue";
/*
import BarChart from "../../../charts/BarChart.vue";
import HorizontalBarChart from "../../../charts/HorizontalBarChart.vue";
*/

/*import { IBarChartConfig } from "../../../charts/BarChart.vue";
import ButtonControl from "../../../components/button/button.vue";
import PieChart from "../../../charts/PieChart.vue";
import { IPieChartConfig } from "../../../charts/PieChart.vue";*/
/*import {
  getForecastChartData,
  getOverdueOpportunities,
  getTopCompaniesChartData,
  getForecastEveryoneValue,
  getNewDealsLastMonth,
  getForecastByStaff,
  getForecastByStage,
} from "../../../use/function/salesGraphDataCollection";*/
//import { IChartConfig } from "../../../components/charts/types/ChartInterfaces";
export const SalesDeals = /*#__PURE__*/ defineComponent({
  name: "SalesDeals",
  inject: [stateSymbol.description!],
  components: {
    DashboardOverview,
    /*BarChart,
    ButtonControl,
    HorizontalBarChart,
    PieChart,*/
  },
  setup() {
    const controller = useControllerSalesDeal(useState().upvise);
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());

    const slicingInformation = ref();
    watch(
      () => metadata.value.definition,
      () => {
        slicingInformation.value = controller.getSlicingInformation(
          metadata.value
        );
      }
    );

    const topDealChartData = ref({});
    const forecastChartData = ref({});
    const forecastByStaffData = ref({});
    const forecastByStageData = ref({});
    const overdueDealQuoteCount = ref(0);
    const forecastEveryoneValue = ref("0");
    const forecastPipelineValue = ref("0");
    const newDealsLastMonthValue = ref(0);
    const pipelineEveroneTitle = ref("Pipeline Everyone");

    onMounted(async () => {
      await controller.getMetadata().then((m) => (metadata.value = m));
      console.log("METADATA:", metadata.value);
      controller.fetch();
    });

    function headerActionClicked(action: string) {
      console.log("No header actions exist for " + action);
    }

    function groupedItemClick(
      action: string,
      _groupName: string,
      itemId: string,
      _: string
    ) {
      if (action === "Edit") {
        window.Engine.eval("Sales.viewOpp('" + itemId + "')", 0);
      }
    }

    watchEffect(() => {
      console.log("state has changed");
      controller.initialiseStore();
    });

    return {
      metadata,
      slicingInformation,
      forecastEveryoneValue,
      forecastPipelineValue,
      groupedItemClick,
      headerActionClicked,
      forecastChartData,
      overdueDealQuoteCount,
      topDealChartData,
      forecastByStaffData,
      forecastByStageData,
      newDealsLastMonthValue,
      pipelineEveroneTitle,
    };
  },
});

export default SalesDeals;
</script>

<template>
  <dashboard-overview
    ref="dashboardRef"
    title="Deals"
    :upvise-data-message="metadata"
    module-name="salesDeals"
    :hide-center-header="true"
    :show-view-toggle="false"
    :slicing-information="slicingInformation"
    :show-file-export="true"
    @groupedItemClick="groupedItemClick"
    @headerActionClicked="headerActionClicked"
  >
  </dashboard-overview>
</template>

<style lang="scss" scoped>
::v-deep(.chart-style .highcharts-color-0) {
  fill: #5794da;
}
::v-deep(.normal-column) {
  fill: #5794da;
}
::v-deep(.chart-style .overdue-column) {
  fill: #f1524c;
}
::v-deep(.chart-style .highcharts-background) {
  fill: #f5f5f5;
}

::v-deep(.green-column .highcharts-point) {
  fill: #32e534;
}
::v-deep(.normal-column .highcharts-point) {
  fill: #32e534;
}
::v-deep(.stack1) {
  fill: rgba(0, 255, 0, 1);
}

</style>
