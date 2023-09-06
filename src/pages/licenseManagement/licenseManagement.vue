<script lang="ts">
import { UpviseDataMessage } from "../../store/modules/upvise";
import { IUpviseDataMessage } from "../../store/modules/upvise.d";
import DashboardOverview from "../../controls/dashboard/overview.vue";
import { defineComponent, onMounted, ref, watchEffect } from "vue";
import useControllerLicenseManagement from "../../use/controller/licenseManagement/licenseManagement";
import LicenseManagementEdit from "./licenseManagementEdit.vue";
import { stateSymbol, useState } from "../../store/index";
import backingField from "../../use/utils/useBackingField";

export const LicenseManagement = /*#__PURE__*/ defineComponent({
  name: "LicenseManagement",
  inject: [stateSymbol.description!],
  components: {
    DashboardOverview,
    LicenseManagementEdit,
  },
  setup() {
    const upvise = useState().upvise;
    const controller = useControllerLicenseManagement(upvise);
    const upviseDataMessage = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const useBackingField = backingField();
    const backingFieldDictionary = ref({});
    const backingFieldData = ref({});
    const licenseManagementId = ref();
    const showLicenseManagement = ref(false);
    const slicingInformation = ref([]);

    onMounted(async () => {
      await controller.getMetadata().then((m) => (upviseDataMessage.value = m));
      backingFieldDictionary.value = useBackingField.getDictionary(
        upviseDataMessage.value
      );
      await useBackingField
        .getData(backingFieldDictionary.value)
        .then((d) => (backingFieldData.value = d));
      //console.log("upviseDataMessage:", upviseDataMessage.value);
      controller.fetch();
    });

    function groupedItemClick(
      action: string,
      groupName: string,
      itemId: string,
      parentId: string
    ) {
      if (groupName === "TableEmployeedashboardLicensemanagement") {
        licenseManagementId.value = itemId;
        showLicenseManagement.value = true;
      } else {
        console.log(
          `No valid action for ${action} ${groupName} ${itemId} ${parentId}`
        );
      }
    }

    function closeLicenseManagement() {
      setTimeout(() => {
        showLicenseManagement.value = false;
      }, 200);
    }

    watchEffect(() => {
      controller.setDepartmentNames();
      useBackingField.setData(
        backingFieldDictionary.value,
        backingFieldData.value
      );
    });

    return {
      upviseDataMessage,
      licenseManagementId,
      showLicenseManagement,
      groupedItemClick,
      closeLicenseManagement,
      slicingInformation,
    };
  },
});

export default LicenseManagement;
</script>

<template>
  <dashboard-overview
    title="License Management"
    module-name="licenseManagement"
    :upvise-data-message="upviseDataMessage"
    :show-view-toggle="false"
    :show-header-toggle="false"
    :force-show-add="true"
    :edit-on-click="true"
    :slicing-information="slicingInformation"
    :show-file-export="true"
    @groupedItemClick="groupedItemClick"
    @closeLicenseManagement="closeLicenseManagement"
  >
  </dashboard-overview>

  <license-management-edit
    v-if="showLicenseManagement"
    :license-id="licenseManagementId"
    @closeLicenseManagement="closeLicenseManagement"
  ></license-management-edit>
</template>

<style lang="scss" scoped></style>
