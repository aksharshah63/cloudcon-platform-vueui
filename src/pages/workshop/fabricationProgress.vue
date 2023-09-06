<script lang="ts">
import { IUpviseDataMessage } from "../../store/modules/upvise.d";
import { computed, defineComponent, onMounted, ref, watchEffect } from "vue";
import { UpviseDataMessage } from "../../store/modules/upvise";
import DashboardOverview from "../../controls/dashboard/overview.vue";
import { useState } from "../../store/index";
import useControllerFabricationProgress from "../../use/controller/workshop/fabricationProgress";
import AutoCompleteTextBox from "../../components/input/autoCompleteTextBox.vue";
import { IFabricationProgressRecord } from "../../use/controller/workshop/fabricationProgress.d";
import maths from "../../use/utils/useNumberOperations";
import date from "../../use/utils/useDateOperations";
import { ProgressStatus } from "../../use/utils/useConstants";

export const FabricationProgress = /*#__PURE__*/ defineComponent({
  name: "FabricationProgress",
  components: {
    AutoCompleteTextBox,
    DashboardOverview
  },
  setup() {
    const upvise = useState().upvise;
    const controller = useControllerFabricationProgress(upvise);
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const forageData = ref();
    const selectedLot = ref();
    const fabricationProgressRows = ref<IFabricationProgressRecord[]>([]);
    const removeDetailsButton = { 0: true };

    const lotOptions = computed(() => {
      return controller.getLotOptions(forageData.value);
    });

    const slicingInformation = computed(() => {
      return controller.getSlicingInformation(selectedLot.value);
    });

    const totalTimeSpent = computed(() => {
      let time = 0;

      fabricationProgressRows.value.forEach((row) => {
        time = maths.sum(time, row.totalTime);
      });

      return time;
    });

    const estimatedTimeSpent = computed(() => {
      return lotOptions.value.find((lot) => lot.id === selectedLot.value)?.estimatedTimeSpent ?? 0;
    });

    const totalNumberOfDrawings = computed(() => {
      return fabricationProgressRows.value.length;
    });

    const completedNumberOfDrawings = computed(() => {
      return fabricationProgressRows.value
        .filter((row) => row.status === ProgressStatus.COMPLETED)
        .length;
    });

    function updateOptionsValue(fieldName: string, value: string) {
      if (fieldName === "lotid")
        selectedLot.value = value;
    }

    function currentRowsChanged(rows: IFabricationProgressRecord[]) {
      fabricationProgressRows.value = rows;
    }

    onMounted(async () => {
      await controller.getMetadata().then((m) => (metadata.value = m));
      await controller.getForageData().then((f) => (forageData.value = f));
      controller.fetch();
    });

    watchEffect(() => {
      if (upvise.isFetchComplete)
        controller.notPersistedCalcs();
    });

    return {
      date,
      upvise,
      metadata,
      selectedLot,
      removeDetailsButton,
      lotOptions,
      slicingInformation,
      totalTimeSpent,
      estimatedTimeSpent,
      totalNumberOfDrawings,
      completedNumberOfDrawings,
      updateOptionsValue,
      currentRowsChanged,
    };
  },
});
export default FabricationProgress;
</script>

<template>
  <dashboard-overview
    title="Fabrication Progress"
    moduleName="fabricationProgress"
    :upvise-data-message="metadata"
    :show-view-toggle="false"
    :slicing-information="slicingInformation"
    :show-tabs="false"
    :removeDetailsButton="removeDetailsButton"
    @currentRowsChanged="currentRowsChanged"
  >
    <template v-if="upvise.isFetchComplete" v-slot:header-actions-left>
      <AutoCompleteTextBox
        class="lot-selection"
        :options="lotOptions"
        :fieldName="'lotid'"
        :displayField="'name'"
        :multiSelect="false"
        :selected="selectedLot"
        @updateOptionsValue="updateOptionsValue"
      ></AutoCompleteTextBox>
    </template>

    <template v-slot:header-left>
      <div class="lot-details-container">
        <div>
          <span class="label">Drawing Completion:</span>
          <span>{{ `${completedNumberOfDrawings} / ${totalNumberOfDrawings}` }}</span>
          <span class="percentage">{{ `(${totalNumberOfDrawings ? Math.floor(completedNumberOfDrawings / totalNumberOfDrawings * 100) : 0}%)` }}</span>
        </div>
        <div>
          <span class="label">Time Spent:</span>
          <span>{{ `${date.getDuration(totalTimeSpent)} / ${date.getDuration(estimatedTimeSpent)}` }}</span>
          <span class="percentage">{{ `(${estimatedTimeSpent ? Math.floor(totalTimeSpent / estimatedTimeSpent * 100) : 0}%)` }}</span>
        </div>
      </div>
    </template>
  </dashboard-overview>
</template>

<style lang="scss" scoped>


.lot-selection {
  background-color: $white;
  border: 1px $grey5 solid;
  width: 400px;
  border-radius: 8px;

  ::v-deep(.p-autocomplete.p-inputwrapper) {
    box-shadow: none;
    border-radius: 8px;

    .p-inputtext {
      font-size: 16px;
      border-top-left-radius: 8px;
      border-top-right-radius: 0;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 0;
    }

    .p-button {
      padding: 0;
      width: auto;
      align-items: center;
      border: none;

      .p-button-icon {
        font-size: 16px;
        color: $grey3;
        margin: 0 4px;

        .p-button-label {
          display: none;
        }
      }
    }
  }
}

.lot-details-container {
  font-family: Poppins, serif;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;

  > div {
    padding: 4px 0;

    > span {
      display: inline-block;

      &.label {
        width: 200px;
        font-weight: bold;
      }

      &.percentage {
        margin-left: 20px;
      }
    }
  }
}
</style>
