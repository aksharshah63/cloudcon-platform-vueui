<script lang="ts">
import { UpviseDataMessage } from "../../../store/modules/upvise";
import DashboardOverview from "../../../controls/dashboard/overview.vue";
import {
  defineComponent,
  onMounted,
  ref,
  watch,
  computed,
  watchEffect,
} from "vue";

import useControllerSalesQuotesConfirmed from "../../../use/controller/sales/confirmedQuotes";
import DateChooser from "../../../components/date/DateChooser.vue";
import dateOperations from "../../../use/utils/useDateOperations";
import utils from "../../../use/function/useUtils";
import { stateSymbol, useState } from "../../../store/index";
//import SelectButton from "primevue/selectbutton";
import ToggleOptions from "../../../components/input/toggleOptions.vue";
import { IUpviseDataMessage } from "../../../store/modules/upvise.d";

export const SalesQuotesConfirmed = /*#__PURE__*/ defineComponent({
  name: "SalesQuotesConfirmed",
  inject: [stateSymbol.description!],
  components: {
    DashboardOverview,
    DateChooser,
    ToggleOptions,
    //SelectButton,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  setup(props: Record<string, any>) {
    const upvise = useState().upvise;
    const controller = useControllerSalesQuotesConfirmed(upvise, props.type);
    const slicingInformation = ref();
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const viewExport = ref(true);
    const dashboardOverviewRef = ref();
    const currentDate = ref<number>(utils.getStartOfDay(new Date()));
    const startOfWeek = ref<number>(
      dateOperations.getStartOfWeek(currentDate.value)
    );
    const previousStartWeekVal = ref<number>(0);
    const previousEndWeekVal = ref<number>(0);
    const endOfWeek = ref<number>(
      dateOperations.getEndOfWeek(currentDate.value)
    );
    const disableButtons = ref(true);

    const toggleOptions = ["Week", "Month"];
    const isMonth = ref(false);
    const selectedDateType = ref("Week");

    const headerActionButtons = [
      {
        action: "exportToPDF",
        tooltip: "Export Selected Quote as PDF",
        icon: "cloud-download-alt",
      },
    ];
    const removeAddButtons = ref([
      {
        currentGroupType: "_Datequoteconfirmed",
        field: "",
        value: undefined,
      },
    ]);

    function headerActionClicked(action: string) {
      let selectedRows = dashboardOverviewRef.value.getAllSelectedRows();
      let quotesToSelect = "";
      switch (action) {
        case "exportToPDF":
          quotesToSelect = controller.chooseTheProperQuotes(selectedRows);
          if (
            quotesToSelect !== "" &&
            window.confirm(
              "Exporting " + quotesToSelect.split("|").length + " quotes?"
            )
          )
            window.Engine.eval(
              "exportSalesCompletedPDF('" + quotesToSelect + "')",
              0
            );
          else if (quotesToSelect == "")
            window.alert("Please select quotes to export!");
          break;
      }
    }

    watch(
      () => metadata.value.definition,
      () => {
        slicingInformation.value = controller.getSlicingInformation(
          //metadata.value
          startOfWeek.value,
          endOfWeek.value
        );
      }
    );
    watch(
      () => upvise.isFetchComplete,
      () => {
        if (upvise.isFetchComplete) disableButtons.value = false;
      }
    );

    watch(
      () => selectedDateType.value,
      () => {
        if (selectedDateType.value === "Week") {
          startOfWeek.value = previousStartWeekVal.value;
          endOfWeek.value = previousEndWeekVal.value;
          isMonth.value = false;
          slicingInformation.value = controller.getSlicingInformation(
            //metadata.value
            startOfWeek.value,
            endOfWeek.value
          );
        } else {
          previousStartWeekVal.value = startOfWeek.value;
          previousEndWeekVal.value = endOfWeek.value;
          isMonth.value = true;

          startOfWeek.value = dateOperations.getStartOfMonth(
            previousStartWeekVal.value
          );
          endOfWeek.value = dateOperations.getEndOfMonth(startOfWeek.value);

          slicingInformation.value = controller.getSlicingInformation(
            //metadata.value
            startOfWeek.value,
            endOfWeek.value
          );
        }
      }
    );

    function getDataType(event: string) {
      if (selectedDateType.value !== event) selectedDateType.value = event;
    }

    watchEffect(() => {
      slicingInformation.value = controller.getSlicingInformation(
        //metadata.value
        startOfWeek.value,
        endOfWeek.value
      );
    });
    onMounted(async () => {
      await controller.getMetadata().then((m) => (metadata.value = m));
      controller.fetch();
    });

    const pageName = computed(() => {
      return metadata.value.definition?.Grouping[0]?.Name ?? null;
    });

    function groupedItemClick(
      action: string,
      _groupName: string,
      itemId: string,
      _: string
    ) {
      if (action === "Edit") {
        window.Engine.eval("Sales.viewQuote('" + itemId + "')", 0);
      }
    }
    function setNextDateRange(data: string) {
      switch (data) {
        case "prev":
          if (isMonth.value)
            currentDate.value = dateOperations.getPreviousMonth(
              startOfWeek.value
            );
          else
            currentDate.value = dateOperations.getPreviousDay(
              startOfWeek.value
            );
          break;
        case "next":
          if (isMonth.value)
            currentDate.value = dateOperations.getNextMonth(endOfWeek.value);
          else currentDate.value = dateOperations.getNextDay(endOfWeek.value);
          break;
      }
      if (isMonth.value) {
        startOfWeek.value = dateOperations.getStartOfMonth(currentDate.value);
        endOfWeek.value = dateOperations.getEndOfMonth(currentDate.value);
      } else {
        startOfWeek.value = dateOperations.getStartOfWeek(currentDate.value);
        endOfWeek.value = dateOperations.getEndOfWeek(currentDate.value);
      }
      //console.log(currentDate.value);
    }

    watchEffect(() => {
      controller.initialiseStore();
    });

    return {
      getDataType,
      viewExport,
      metadata,
      pageName,
      groupedItemClick,
      slicingInformation,
      headerActionButtons,
      headerActionClicked,
      dashboardOverviewRef,
      removeAddButtons,
      startOfWeek,
      endOfWeek,
      disableButtons,
      setNextDateRange,
      selectedDateType,
      toggleOptions,
      isMonth,
    };
  },
});

export default SalesQuotesConfirmed;
</script>

<template>
  <dashboard-overview
    ref="dashboardOverviewRef"
    :show-tabs="false"
    :title="pageName + 's'"
    :module-name="type"
    :upvise-data-message="metadata"
    :hide-center-header="true"
    :show-view-toggle="false"
    :slicing-information="slicingInformation"
    :forceShowDetails="true"
    :header-action-buttons="headerActionButtons"
    :use-column-picker="false"
    :disable-tick="true"
    :remove-add="removeAddButtons"
    :show-header-toggle="false"
    :show-file-export="true"
    @headerActionClicked="headerActionClicked"
    @groupedItemClick="groupedItemClick"
  >
    <template v-slot:header-actions-left>
      <div class="dateToggle">
        <!--        <SelectButton
          v-model="selectedDateType"
          :options="toggleOptions"
        ></SelectButton>-->
        <toggle-options
          :toggle-options="toggleOptions"
          :current-option="selectedDateType"
          @option-selected="getDataType"
        ></toggle-options>
      </div>
    </template>
    <template v-slot:header-actions-middle>
      <div class="dateSection">
        <date-chooser
          @setNext="setNextDateRange"
          :start-of-week="startOfWeek"
          :end-of-week="endOfWeek"
          :disable-buttons="disableButtons"
          :is-month="isMonth"
        >
        </date-chooser>
      </div>
    </template>
  </dashboard-overview>
</template>

<style lang="scss" scoped>

</style>
