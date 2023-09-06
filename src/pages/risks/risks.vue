<script lang="ts">
import DashboardOverview from "../../controls/dashboard/overview.vue";
import { defineComponent, onMounted, ref, watchEffect } from "vue";

import useControllerRisks from "../../use/controller/risks/risks";
import backingField from "../../use/utils/useBackingField";
import { IRiskRecord } from "../../use/controller/risks/risks.d";
import RiskEdit from "../../../src/pages/risks/riskEdit.vue";
import { useToast } from "primevue/usetoast";
import { UpviseDataMessage } from "../../store/modules/upvise";
import { IUpviseDataMessage } from "../../store/modules/upvise.d";
import { useState } from "../../store";

export const Risks = /*#__PURE__*/ defineComponent({
  name: "Risks",
  components: {
    DashboardOverview,
    RiskEdit,
  },
  setup() {
    const upvise = useState().upvise;
    const controller = useControllerRisks(upvise);
    const useBackingField = backingField();
    const riskId = ref();
    const showRisk = ref(false);
    const dashboardOverviewRef = ref();
    const slicingInformation = ref();
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const backingFieldDictionary = ref({});
    const backingFieldData = ref({});
    const uploadSuccessful = ref();

    console.log("GOOD VIBES ONLY FOR RISKS");
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

    const exportCSV = () => {
      dashboardOverviewRef.value.getCurrentItems().value.exportCSV();
    };

    function groupedItemClick(
      action: string,
      groupName: string,
      itemId: string,
      parentId: string
    ) {
      if (groupName === "TableQhseRisks") {
        riskId.value = itemId;
        showRisk.value = true;
      } else {
        console.log(
          `No valid action for ${action} ${groupName} ${itemId} ${parentId}`
        );
      }
    }

    function closeRisk() {
      setTimeout(() => {
        showRisk.value = false;
      }, 200);
      uploadSuccessful.value = true;
    }

    function headerActionClicked(action: string) {
      switch (action) {
        case "export":
          exportCSV();
      }
    }

    async function saveRisk(data: unknown) {
      uploadSuccessful.value = undefined;
      await controller
        .doSaveRisk(data as IRiskRecord)
        .then(() => closeRisk())
        .catch(() =>
          useToast().add({
            severity: "error",
            summary: "Operation Unsuccessful",
            detail: "Could not save the risk",
            life: 1500,
          })
        );
    }

    watchEffect(() => {
      console.log("state has changed");
      controller.getInitialNames();
      useBackingField.setData(
        backingFieldDictionary.value,
        backingFieldData.value
      );
      slicingInformation.value = controller.getSlicingInformation();
    });

    return {
      riskId,
      showRisk,
      dashboardOverviewRef,
      uploadSuccessful,
      headerActionClicked,
      groupedItemClick,
      closeRisk,
      saveRisk,
      slicingInformation,
      metadata,
    };
  },
});

export default Risks;
</script>

<template>
  <dashboard-overview
    ref="dashboardOverviewRef"
    title="Risks"
    module-name="risks"
    :upvise-data-message="metadata"
    :show-view-toggle="false"
    :show-header-toggle="false"
    :force-show-add="true"
    :slicing-information="slicingInformation"
    :upload-successful="uploadSuccessful"
    :show-file-export="true"
    :show-file-import="true"
    @groupedItemClick="groupedItemClick"
    @headerActionClicked="headerActionClicked"
    @saveToUpvise="saveRisk"
  >
  </dashboard-overview>

  <risk-edit
    v-if="showRisk"
    :risk-id="riskId"
    @closeRisk="closeRisk"
    @saveRisk="saveRisk"
  ></risk-edit>
</template>

<style lang="scss" scoped></style>
