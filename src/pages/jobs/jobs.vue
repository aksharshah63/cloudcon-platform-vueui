<script lang="ts">
import { UpviseDataMessage } from "../../store/modules/upvise";
import DashboardOverview from "../../controls/dashboard/overview.vue";
import JobsButtons from "../../../src/pages/jobs/jobsButtons.vue";
import { IJobRecord } from "../../use/controller/jobs/jobs.d";
import { computed, defineComponent, onMounted, ref, watchEffect } from "vue";

import useControllerJobs from "../../use/controller/jobs/jobs";
import { stateSymbol, useState } from "../../store/index";
import utils from "../../use/function/useUtils";
import { IUpviseDataMessage } from "../../store/modules/upvise.d";
import backingField from "../../use/utils/useBackingField";

export const Jobs = /*#__PURE__*/ defineComponent({
  name: "Jobs",
  inject: [stateSymbol.description!],
  components: {
    DashboardOverview,
    JobsButtons,
  },
  props: {
    currentDate: {
      type: Number,
      required: false,
    },
    enableDate: {
      type: Boolean,
      required: false,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const upvise = useState().upvise;
    const useBackingField = backingField();
    const backingFieldDictionary = ref({});
    const backingFieldData = ref({});

    const controller = useControllerJobs(upvise);
    const slicingInformation = ref();
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const dashboardOverviewRef = ref();
    const selectedEmployee = ref();
    const currentRow = ref();
    const disabled = ref(false);
    const totalJobs = ref(0);
    const jobsWithGeo = ref(0);
    const iteratedDate = ref(
      props.currentDate !== undefined && props.currentDate !== null
        ? props.currentDate
        : 0
    );
    const nextDate = ref(
      props.currentDate !== undefined && props.currentDate !== null
        ? utils.addDaysToDate(props.currentDate, 1)
        : 0
    );
    const dateSelection = ref(
      props.currentDate !== undefined && props.currentDate !== null
        ? true
        : false
    );
    const enableDateSelection = computed(() => {
      return props.currentDate !== undefined &&
        upvise.isFetchComplete &&
        props.currentDate !== null &&
        props.enableDate !== undefined &&
        props.enableDate !== null
        ? props.enableDate
        : false;
    });
    if (dateSelection.value)
      slicingInformation.value = controller.getSlicingInformation(
        new Date(iteratedDate.value)
      );

    onMounted(async () => {
      await controller.getMetadata().then((m) => (metadata.value = m));
      backingFieldDictionary.value = useBackingField.getDictionary(
        metadata.value
      );
      await useBackingField
        .getData(backingFieldDictionary.value)
        .then((d) => (backingFieldData.value = d));

      controller.fetch();
    });

    watchEffect(() => {
      controller.initialiseStore();
      controller.makeAddress();
      controller.showStatus();
      controller.showPriority();
      currentRow.value = dashboardOverviewRef.value?.getAllSelectedRows() ?? [];
      useBackingField.setData(
        backingFieldDictionary.value,
        backingFieldData.value
      );
    });

    function groupedItemClick(
      action: string,
      groupName: string,
      itemId: string,
      _: string
    ) {
      if (action === "Edit" && groupName === "TableJobsJobs") {
        window.Engine.eval("Jobs.viewJob('" + itemId + "')", 0);
      }
    }
    function getFilteredRows(event: unknown) {
      const jobs = event as Record<string, any>[];
      totalJobs.value = jobs.length;
      jobsWithGeo.value = jobs.filter((x) => x.geo !== "").length;
      emit("newRowValues", event);
    }

    function emitDay(data: number) {
      iteratedDate.value = data;
      nextDate.value = utils.addDaysToDate(data, 1);
      slicingInformation.value = controller.getSlicingInformation(
        new Date(iteratedDate.value)
      );

      emit("filteredDay", data);
    }

    async function saveJobs(data: unknown) {
      disabled.value = true;
      await controller
        .doSaveJobs(data as IJobRecord[])
        .then(() => {
          alert("Successfully updated the job/jobs");
          disabled.value = false;
        })
        .catch(() => {
          disabled.value = false;
          alert("Could not update the field to the job/jobs");
        });
    }

    return {
      disabled,
      metadata,
      groupedItemClick,
      slicingInformation,
      dashboardOverviewRef,
      selectedEmployee,
      currentRow,
      dateSelection,
      enableDateSelection,
      totalJobs,
      jobsWithGeo,
      iteratedDate,
      getFilteredRows,
      saveJobs,
      emitDay,
    };
  },
});

export default Jobs;
</script>
<template>
  <dashboard-overview
    ref="dashboardOverviewRef"
    title="Jobs"
    module-name="jobs"
    :upvise-data-message="metadata"
    :show-view-toggle="false"
    :show-header-toggle="false"
    :slicing-information="slicingInformation"
    :show-file-export="true"
    @filteredValue="getFilteredRows"
    @groupedItemClick="groupedItemClick"
  >
    <template v-slot:header-actions-left>
      <jobs-buttons
        :disabledButton="disabled"
        :selected-rows="currentRow"
        @saveJobs="saveJobs"
        @filteredDay="emitDay"
        :enableDateRange="enableDateSelection"
        :totalJobs="totalJobs"
        :mapJobs="jobsWithGeo"
        :enable-date="dateSelection"
        :current-date="iteratedDate"
      ></jobs-buttons>
    </template>
  </dashboard-overview>
</template>

<style lang="scss" scoped></style>
