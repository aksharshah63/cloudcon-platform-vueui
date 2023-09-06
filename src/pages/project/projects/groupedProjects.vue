<script lang="ts">
import { useState } from "../../../store";
import { UpviseDataMessage } from "../../../store/modules/upvise";
import { IRecord, IUpviseDataMessage } from "../../../store/modules/upvise.d";
import useControllerGroupedProjects from "../../../use/controller/project/groupedProjects";
import DashboardOverview from "../../../controls/dashboard/overview.vue";
import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watch,
  watchEffect,
} from "vue";

import backingField from "../../../use/utils/useBackingField";
import utils from "../../../use/function/useUtils";
import { useTableNames } from "../../../use/utils/useConstants";

export const GroupedProjects = /*#__PURE__*/ defineComponent({
  name: "GroupedProjects",
  components: {
    DashboardOverview,
  },
  setup() {
    const upvise = useState().upvise;
    const controller = useControllerGroupedProjects(upvise);
    const useBackingField = backingField();
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const backingFieldDictionary = ref({});
    const backingFieldData = ref({});
    const forageData = ref();
    const linkedProjectCustomField = ref("");
    const isTopLevelProjectCustomField = ref("");
    const viewToggleOptions = ref(["data", "timeline"]);
    const headerActionButtons = [
      {
        action: "exportToPDF",
        tooltip: "Export Projects as CSV",
        icon: "file-export",
      },
      {
        action: "importFromPDF",
        tooltip: "Import Projects from Excel CSV",
        icon: "file-import",
      },
    ];

    onMounted(async () => {
      await controller.getMetadata().then((m) => (metadata.value = m));
      console.log("METADATA:", metadata.value);
      await controller.getForageData().then((f) => {
        forageData.value = f;
        linkedProjectCustomField.value =
          utils.getSetting(
            forageData.value?.["system.user.settings"] ?? [],
            "PROJECTS_LINKED_PROJECT_CUSTOM_FIELD"
          ) ?? "";
        isTopLevelProjectCustomField.value =
          utils.getSetting(
            forageData.value?.["system.user.settings"] ?? [],
            "PROJECTS_IS_TOP_LEVEL_PROJECT_CUSTOM_FIELD"
          ) ?? "";
      });
      backingFieldDictionary.value = useBackingField.getDictionary(
        metadata.value
      );
      await useBackingField
        .getData(backingFieldDictionary.value)
        .then((d) => (backingFieldData.value = d));
      controller.fetch();
    });

    const projectsData = computed(() => {
      return Object.values(upvise.entityData(useTableNames.PROJECTS));
    });

    function headerActionClicked(action: string) {
      switch (action) {
        case "exportToPDF":
          window.Engine.eval("Projects.exportAllExcel(0)", 0);
          break;
        case "importFromPDF":
          window.Engine.eval("Projects.showImport()", 0);
      }
    }

    function groupedItemClick(
      action: string,
      _groupName: string,
      itemId: string,
      _: string
    ) {
      if (action === "Edit") {
        window.Engine.eval("Projects.viewProject('" + itemId + "')", 0);
      }
    }

    watchEffect(() => {
      useBackingField.setData(
        backingFieldDictionary.value,
        backingFieldData.value
      );
      controller.notPersistedCalcs(
        linkedProjectCustomField.value,
        isTopLevelProjectCustomField.value
      );
    });

    watch(
      () => upvise.isFetchComplete,
      () => {
        upvise.updateStore({
          [useTableNames.PROJECTS]: [
            controller.createUnlinkedProject() as unknown as IRecord,
          ],
        });
      }
    );

    return {
      metadata,
      viewToggleOptions,
      headerActionButtons,
      groupedItemClick,
      headerActionClicked,

      projectsData,
    };
  },
});

export default GroupedProjects;
</script>

<template>
  <dashboard-overview
    ref="dashboardRef"
    title="Grouped Projects"
    :upvise-data-message="metadata"
    module-name="groupedProjects"
    :hide-center-header="true"
    :showHeaderToggle="false"
    :showTabs="false"
    :view-toggle-options="viewToggleOptions"
    :is-projects-timeline="true"
    :header-action-buttons="headerActionButtons"
    :excluded-level="1"
    @groupedItemClick="groupedItemClick"
    @headerActionClicked="headerActionClicked"
  >
  </dashboard-overview>
</template>

<style lang="scss" scoped></style>
