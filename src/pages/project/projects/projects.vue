<script lang="ts">
import { stateSymbol, useState } from "../../../store";
import { UpviseDataMessage } from "../../../store/modules/upvise";
import { IUpviseDataMessage } from "../../../store/modules/upvise.d";
import useControllerProjects from "../../../use/controller/project/projects";
import DashboardOverview from "../../../controls/dashboard/overview.vue";
import { defineComponent, onMounted, ref, watchEffect } from "vue";

import backingField from "../../../use/utils/useBackingField";

export const Projects = /*#__PURE__*/ defineComponent({
  name: "Projects",
  inject: [stateSymbol.description!],
  components: {
    DashboardOverview,
  },
  setup() {
    const upvise = useState().upvise;
    const controller = useControllerProjects(upvise);
    const useBackingField = backingField();
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const backingFieldDictionary = ref({});
    const backingFieldData = ref({});
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
      backingFieldDictionary.value = useBackingField.getDictionary(
        metadata.value
      );
      await useBackingField
        .getData(backingFieldDictionary.value)
        .then((d) => (backingFieldData.value = d));
      controller.fetch();
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
      controller.notPersistedCalcs();
    });

    return {
      metadata,
      viewToggleOptions,
      headerActionButtons,
      groupedItemClick,
      headerActionClicked,
    };
  },
});

export default Projects;
</script>

<template>
  <dashboard-overview
    ref="dashboardRef"
    title="Projects"
    :upvise-data-message="metadata"
    module-name="projects"
    :hide-center-header="true"
    :showHeaderToggle="false"
    :showTabs="false"
    :view-toggle-options="viewToggleOptions"
    :is-projects-timeline="true"
    :header-action-buttons="headerActionButtons"
    @groupedItemClick="groupedItemClick"
    @headerActionClicked="headerActionClicked"
  >
  </dashboard-overview>
</template>

<style lang="scss" scoped></style>
