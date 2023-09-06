<script lang="ts">
import { useState } from "../../../store";
import { UpviseDataMessage } from "../../../store/modules/upvise";
import { IUpviseDataMessage } from "../../../store/modules/upvise.d";
import useControllerUtilization from "../../../use/controller/reporting/utilization/utilization";
import {
  defineComponent,
  onMounted,
  ref,
  watchEffect,
  watch,
  computed,
} from "vue";
import backingField from "../../../use/utils/useBackingField";
import DashboardOverview from "../../../controls/dashboard/overview.vue";
import DateChooser from "../../../components/date/DateChooser.vue";
import dateOperations from "../../../../cloudconLibrary/utilities/useDateOperations";
import utils from "../../../use/function/useUtils";
import SearchBar from "../../../components/input/searchBar.vue";
import Card from "primevue/card";
import UtilizationFilter from "../../../components/filter/utilizationFilter.vue";
import UtilizationCalculation from "../utilization/utilizationCalculation.vue";

// import { IMappedUtilizationlogs } from "../../../use/controller/reporting/utilization/utilization.d";

export const Utilization = /*#__PURE__*/ defineComponent({
  name: "Utilization",
  components: {
    DashboardOverview,
    DateChooser,
    SearchBar,
    Card,
    UtilizationFilter,
    UtilizationCalculation,
  },
  setup() {
    const upvise = useState().upvise;
    const controller = useControllerUtilization(upvise);
    const useBackingField = backingField();
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const backingFieldDictionary = ref({});
    const backingFieldData = ref({});
    const disableButtons = ref(true);
    const onSearchfilter = ref();
    const selectedGroupNames = ref();
    const selectedProjectNames = ref();
    const currentDate = ref<number>(utils.getStartOfDay(new Date()));

    const startOfMonth = ref<number>(
      dateOperations.getStartOfMonth(currentDate.value)
    );
    const endOfMonth = ref<number>(
      dateOperations.getEndOfMonth(currentDate.value)
    );

    const lastMonthDate = ref<number>(
      dateOperations.getPreviousMonth(startOfMonth.value)
    );
    const startOfLastMonth = ref<number>(
      dateOperations.getStartOfMonth(lastMonthDate.value)
    );
    const endOfLastMonth = ref<number>(
      dateOperations.getEndOfMonth(lastMonthDate.value)
    );
    const slicingInformation = ref();
    // const mappedUtilizationLogs = ref<IMappedUtilizationlogs>();

    const showFilters = ref(false);

    const placeholderText = ref("Search Equipment Name");

    onMounted(async () => {
      await controller.getMetadata().then((m: any) => (metadata.value = m));
      // console.log("METADATA:", metadata.value);
      backingFieldDictionary.value = useBackingField.getDictionary(
        metadata.value
      );
      await useBackingField
        .getData(backingFieldDictionary.value)
        .then((d) => (backingFieldData.value = d));
      controller.fetch();
    });

    const utilizationPercentage = ref();
    const lastMonthUtlizationPercentage = ref();
    const infoCards = ref();

    const headerActionButtons = [
      {
        action: "exportReport",
        tooltip: "Export Report",
        icon: "cloud-download-alt",
      },
      {
        action: "editUtilizationCalculation",
        tooltip: "Edit Utilization Calculation",
        icon: "pen",
      },
    ];

    const showCalculation = ref(false);
    const perDayHours = ref(8);
    const perWeekDays = ref(5);
    const perYearWeeks = ref(52);

    watch([utilizationPercentage, lastMonthUtlizationPercentage], () => {
      infoCards.value = [
        {
          count:
            utilizationPercentage.value == "NaN%"
              ? 0 + "%"
              : utilizationPercentage.value,
          label: "Utilisation",
          textColour: "#FFFFFF",
          backgroundColour: "#007FFF",
          shadowColour: "rgba(0,127,255, 0.3)",
        },
        {
          count: controller.getEquipmentCount(),
          label: "Plant Available",
          textColour: "#FFFFFF",
          backgroundColour: "#007FFF",
          shadowColour: "rgba(0,127,255, 0.3)",
        },
        {
          count:
            lastMonthUtlizationPercentage.value == "NaN%"
              ? 0 + "%"
              : lastMonthUtlizationPercentage.value,
          label: "Utilisation Last Month",
          textColour: "#FFFFFF",
          backgroundColour: "#007FFF",
          shadowColour: "rgba(0,127,255, 0.3)",
        },
      ];
    });

    watchEffect(() => {
      useBackingField.setData(
        backingFieldDictionary.value,
        backingFieldData.value
      );
    });

    // const test = ref();
    watchEffect(() => {
      if (upvise.isFetchComplete) {
        disableButtons.value = false;
        // test.value = controller.getMappedUtilizationLogs();
        controller.generateMappedUtilizationLogs();
      }
    });

    watchEffect(() => {
      if (upvise.isFetchComplete) {
        controller.calUtilization(startOfMonth.value, endOfMonth.value);
        slicingInformation.value = controller.getSlicingInformation(
          startOfMonth.value,
          endOfMonth.value
        );
        utilizationPercentage.value =
          controller.calInformationCardUtilization(
            startOfMonth.value,
            endOfMonth.value,
            perDayHours.value,
            perWeekDays.value
          ) + "%";
        lastMonthUtlizationPercentage.value =
          controller.calLastMonthInformationCardUtilization(
            startOfLastMonth.value,
            endOfLastMonth.value,
            perDayHours.value,
            perWeekDays.value
          ) + "%";
      }
    });

    function setNextDateRange(data: string) {
      switch (data) {
        case "prev":
          currentDate.value = dateOperations.getPreviousMonth(
            startOfMonth.value
          );
          break;
        case "next":
          currentDate.value = dateOperations.getNextMonth(endOfMonth.value);
          break;
      }
      startOfMonth.value = dateOperations.getStartOfMonth(currentDate.value);
      endOfMonth.value = dateOperations.getEndOfMonth(currentDate.value);

      lastMonthDate.value = dateOperations.getPreviousMonth(startOfMonth.value);

      startOfLastMonth.value = dateOperations.getStartOfMonth(
        lastMonthDate.value
      );
      endOfLastMonth.value = dateOperations.getEndOfMonth(lastMonthDate.value);
    }

    function toggleFilters() {
      // overlayElement.value!.show(event);
      showFilters.value = !showFilters.value;
    }

    watchEffect(() => {
      slicingInformation.value = controller.getSlicingInformation(
        startOfMonth.value,
        endOfMonth.value,
        onSearchfilter.value,
        selectedGroupNames.value,
        selectedProjectNames.value
      );
    });

    function onSearchInput(input: string) {
      onSearchfilter.value = input;
    }

    function changeFilter(selectedFilters: Record<string, unknown>) {
      // console.log("Selected Filters: ", selectedFilters);
      selectedGroupNames.value = selectedFilters.selectedGroups;
      selectedProjectNames.value = selectedFilters.selectedProjects;
    }

    function clearSelectedFilters() {
      selectedGroupNames.value = [];
      selectedProjectNames.value = [];
    }

    const groupNameOptions = computed(() => {
      const options = new Set();
      Object.values(useState().upvise.entityData("TableToolsTools")).forEach(
        (tool) => {
          options.add(tool.groupName);
        }
      );
      const optionsArray: { groupname: string }[] = [];
      options.forEach((option) =>
        optionsArray.push({ groupname: option as string })
      );
      return optionsArray;
    });

    const projectNameOptions = computed(() => {
      const options = new Set();
      Object.values(useState().upvise.entityData("TableToolsTools")).forEach(
        (tool) => options.add(tool.projectname)
      );
      const optionsArray: { projectname: string }[] = [];
      options.forEach((option) =>
        optionsArray.push({ projectname: option as string })
      );
      return optionsArray;
    });

    function closeCalculation() {
      setTimeout(() => {
        showCalculation.value = false;
      }, 200);
    }

    function saveCalculation(hours: number, days: number, _: number) {
      perDayHours.value = hours;
      perWeekDays.value = days;
    }

    function editUtilizationCalculation() {
      showCalculation.value = true;
    }

    function onHeaderActionClicked(action: string) {
      switch (action) {
        case "exportReport":
          // updateActiveStatus(rowsSelected.value, 1);
          break;
        case "editUtilizationCalculation":
          editUtilizationCalculation();
      }
    }

    function groupedItemClick(
      action: string,
      _groupName: string,
      itemId: string,
      _: string
    ) {
      if (action === "Edit") {
        window.Engine.eval("Tools.viewTool('" + itemId + "')", 0);
      }
    }

    return {
      metadata,
      infoCards,
      startOfMonth,
      endOfMonth,
      setNextDateRange,
      disableButtons,
      slicingInformation,
      toggleFilters,
      showFilters,
      onSearchInput,
      groupNameOptions,
      groupedItemClick,
      projectNameOptions,
      changeFilter,
      clearSelectedFilters,
      placeholderText,
      headerActionButtons,
      onHeaderActionClicked,
      showCalculation,
      closeCalculation,
      saveCalculation,
      perDayHours,
      perWeekDays,
      perYearWeeks,
    };
  },
});

export default Utilization;
</script>

<template>
  <dashboard-overview
    ref="dashboardRef"
    title="Utilization"
    :upvise-data-message="metadata"
    module-name="equipment"
    :show-view-toggle="true"
    :hide-center-header="true"
    :showHeaderToggle="false"
    :showTabs="false"
    :information-cards="infoCards"
    :slicing-information="slicingInformation"
    :header-action-buttons="headerActionButtons"
    @groupedItemClick="groupedItemClick"
    @headerActionClicked="onHeaderActionClicked"
  >
    <template v-slot:grid-actions-middle>
      <div class="p-grid">
        <div class="p-col-3"></div>
        <date-chooser
          @setNext="setNextDateRange"
          :start-of-week="startOfMonth"
          :end-of-week="endOfMonth"
          :disable-buttons="disableButtons"
          :is-month="true"
          class="dateChooser p-col-6"
        >
        </date-chooser>
        <div class="utilization-sarch-container p-col-3 p-grid">
          <div class="searchbar p-col-10">
            <SearchBar
              @onSearchInput="onSearchInput"
              :placeholder-text="placeholderText"
            />
          </div>
          <div
            class="filterbutton p-col-2"
            @click="toggleFilters()"
            id="testid"
          >
            <font-awesome-icon class="filter-icon" :icon="['fa', 'filter']" />
            <span> FILTER </span>
          </div>
          <Card v-show="showFilters" class="overlay-card utilizationFilter">
            <template #content>
              <utilization-filter
                :group-name-options="groupNameOptions"
                :project-name-options="projectNameOptions"
                @filterValues="changeFilter"
                @closeFilter="toggleFilters()"
                @clearFilter="clearSelectedFilters"
              ></utilization-filter>
            </template>
          </Card>
        </div>
      </div>
    </template>
  </dashboard-overview>
  <utilization-calculation
    v-if="showCalculation"
    :per-day-hours="perDayHours"
    :per-week-days="perWeekDays"
    :per-year-weeks="perYearWeeks"
    @closeCalculation="closeCalculation"
    @saveCalculation="saveCalculation"
  >
  </utilization-calculation>
</template>
<style lang="scss" scoped>
@import "../../../assets/styles/global";
</style>
