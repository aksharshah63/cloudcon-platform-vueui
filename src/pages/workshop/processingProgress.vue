<script lang="ts">
import { IRecord, IUpviseDataMessage } from "../../store/modules/upvise.d";
import { defineComponent, onMounted, Ref, ref, watchEffect } from "vue";
import { UpviseDataMessage } from "../../store/modules/upvise";
import DashboardOverview from "../../controls/dashboard/overview.vue";
import { useState } from "../../store/index";
import useControllerProcessingProgress from "../../use/controller/workshop/processingProgress";
import useMetadata from "../../use/utils/useMetadata";
import utils from "../../use/function/useUtils";
import ProcessingProgressEdit from "./processingProgressEdit.vue"
import { useTableNames } from "../../use/utils/useConstants";

export const ProcessingProgress = /*#__PURE__*/ defineComponent({
  name: "ProcessingProgress",
  components: {
    DashboardOverview,
    ProcessingProgressEdit
  },
  setup() {
    const upvise = useState().upvise;
    const controller = useControllerProcessingProgress(upvise);
    const metadataController = useMetadata();
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const forageData: Ref<Record<string, IRecord[]>> = ref({});
    const slicingInformation = ref(controller.getSlicingInformation());
    const selectedProcessingId = ref<string>("");
    const showEditScreen = ref<boolean>(false)

    onMounted(async () => {
      await controller.getMetadata().then((m) => (metadata.value = m));
      await controller.getForageData().then((f) => (forageData.value = f));

      const equipmentColumnTemplate = metadataController.getColumn(metadata.value, "_Equipment", "id");
      const processingEquipmentData = getProcessingEquipment();

      console.log("equipmentColumnTemplate", equipmentColumnTemplate);
      console.log("processingEquipmentData", processingEquipmentData)

      if (equipmentColumnTemplate && processingEquipmentData) {
        const customColumns = metadataController.getCustomColumnsFromRecords(equipmentColumnTemplate, processingEquipmentData, useTableNames.CONTACTS, 2);
        metadataController.addColumns(customColumns, metadata.value, useTableNames.WORKSHOP_PROCESSING);
      }

      controller.fetch();
    });

    function groupedItemClick(
      action: string,
      _groupName: string,
      itemId: string,
      _parentId: string
    ) {
      if (action === "Edit") {
        selectedProcessingId.value = itemId;
        showEditScreen.value = true;
      }
    }

    function closeEditScreen() {
      setTimeout(() => {
        showEditScreen.value = false;
      }, 200);
    }

    function getProcessingEquipment(): IRecord[] | undefined {
      const processingMachineryGroupId = utils.getSetting(forageData.value?.["system.user.settings"] ?? [], "PROCESSING_MACHINERY_CONTACTS_GROUP_ID");
      console.log("processingMachineryGroupId", processingMachineryGroupId)

      if (processingMachineryGroupId) {
        return forageData.value?.["unybiz.contacts.contacts"]?.filter(
          (contact) => (contact.groupid as string).split("|").includes(processingMachineryGroupId)
        );
      }
      else return undefined;
    }

    watchEffect(() => {
      if (upvise.isFetchComplete)
        controller.notPersistedCalcs(forageData.value);
    });

    return {
      upvise,
      metadata,
      selectedProcessingId,
      showEditScreen,
      groupedItemClick,
      closeEditScreen,
      slicingInformation,
    };
  },
});
export default ProcessingProgress;
</script>

<template>
  <dashboard-overview
    title="Processing Progress"
    moduleName="processingProgress"
    :upvise-data-message="metadata"
    :show-view-toggle="false"
    :show-header-toggle="false"
    :slicing-information="slicingInformation"
    :show-tabs="false"
    @groupedItemClick="groupedItemClick"
  >
  </dashboard-overview>

  <ProcessingProgressEdit
    v-if="showEditScreen"
    :processing-id="selectedProcessingId"
    @closeEditScreen="closeEditScreen"
  />
</template>

<style lang="scss" scoped>

</style>