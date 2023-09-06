<script lang="ts">
import useControllerEquipment from "../../use/controller/equipment/equipment";
import DashboardOverview from "../../controls/dashboard/overview.vue";
import EditSidebarDynamic from "../../components/sidebar/editSidebarDynamic.vue";
import { defineComponent, onMounted, ref, watchEffect } from "vue";

import backingField from "../../use/utils/useBackingField";
import {
  IMetadata,
  Metadata,
} from "../../../cloudconLibrary/store/modules/tableData/tableDataModule";
import { ClaimsType } from "../../../cloudconLibrary/utilities/useConstants";
/* eslint-disable */

export const EquipmentList = /*#__PURE__*/ defineComponent({
  name: "EquipmentList",
  components: {
    DashboardOverview,
    EditSidebarDynamic,
  },
  setup() {
    const controller = useControllerEquipment();
    const useBackingField = backingField();
    const metadata = ref<IMetadata>(new Metadata());
    const backingFieldDictionary = ref({});
    const backingFieldData = ref({});
    const showEdit = ref(false);
    const showEditNew = ref(true);
    const clickedItemId = ref("");
    const entityType = "TableToolsTools";
    const isLoading = ref(true);
    const claimsAvailable = {
      create: ClaimsType.RESTRICTED,
      read: ClaimsType.RESTRICTED,
      update: ClaimsType.RESTRICTED,
      delete: ClaimsType.RESTRICTED,
    };

    let headerActionButtons = [
      {
        action: "exportToPDF",
        tooltip: "Export Projects as CSV",
        protocol: "create",
        icon: "file-export",
      },
      {
        action: "importFromPDF",
        tooltip: "Import Projects from Excel CSV",
        protocol: "create",
        icon: "file-import",
      },
      {
        action: "addEquipment",
        tooltip: "Add Equipment",
        protocol: "create",
        icon: "plus",
      },
    ];

    headerActionButtons = headerActionButtons.filter((action) => {
      if (
        claimsAvailable?.create === ClaimsType.RESTRICTED &&
        action.protocol === "create"
      )
        return false;
      return true;
    });

    const filteredEquipmentData: any[] = [];

    onMounted(async () => {
      controller.fetch().then(async () => {
        // metadata.value = controller.getMetadata();
        console.log("METADATA:", metadata.value);
        backingFieldDictionary.value = useBackingField.getDictionary(
          metadata.value
        );
        await useBackingField
          .getData(backingFieldDictionary.value)
          .then((d) => (backingFieldData.value = d));
        isLoading.value = false;
      });
    });

    function headerActionClicked(action: string) {
      switch (action) {
        case "exportToPDF":
          window.Engine.eval("Projects.exportAllExcel(0)", 0);
          break;
        case "importFromPDF":
          window.Engine.eval("Projects.showImport()", 0);
          break;
        case "addEquipment":
          showEditNew.value = true;
          if (showEdit.value === false) showEdit.value = true;
          break;
      }
    }

    function equipmentClicked(
      _action: string,
      _groupName: string,
      itemId: string,
      _parentId: string
    ) {
      clickedItemId.value = itemId;
      showEditNew.value = false;
      if (showEdit.value === false) showEdit.value = true;
    }

    function closeEdit() {
      setTimeout(() => {
        showEdit.value = false;
      }, 200);
    }

    watchEffect(() => {
      useBackingField.setData(
        backingFieldDictionary.value,
        backingFieldData.value
      );
    });

    return {
      metadata,
      headerActionButtons,
      filteredEquipmentData,
      clickedItemId,
      entityType,
      isLoading,
      closeEdit,
      equipmentClicked,
      headerActionClicked,
      showEdit,
      showEditNew,
    };
  },
});

export default EquipmentList;
</script>

<template>
  <dashboard-overview
    ref="dashboardRef"
    title="Equipment"
    :upvise-data-message="metadata"
    module-name="equipment"
    :hide-center-header="true"
    :showHeaderToggle="false"
    :showTabs="false"
    :header-action-buttons="headerActionButtons"
    @groupedItemClick="equipmentClicked"
    :isLoading="isLoading"
    @headerActionClicked="headerActionClicked"
  >
  </dashboard-overview>

  <EditSidebarDynamic
    :moduleName="'equipment'"
    :title="'Equipment'"
    :titlePropertyKey="'name'"
    :showSidebar="showEdit"
    :isNew="showEditNew"
    :itemId="clickedItemId"
    :metadata="metadata?.persistence?.TableToolsTools?.Schema ?? []"
    :entityLookup="entityType"
    @closeSidebar="closeEdit"
  />
</template>

<style lang="scss" scoped></style>
