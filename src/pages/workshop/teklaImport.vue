<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { useState } from "../../store/index";
import { IRecord } from "../../store/modules/upvise.d";
import AutoCompleteTextBox from "../../components/input/autoCompleteTextBox.vue";
import useWorkshopController from "../../use/controller/workshop/workshop";
import Button from "primevue/button";
import Sidebar from "primevue/sidebar";

export const teklaImport = defineComponent({
  name: "TeklaImport",
  components: {
    Button,
    Sidebar,
    AutoCompleteTextBox,
  },
  props: {
    forageData: {
      type: Object as () => Record<string, IRecord[]>,
      required: true,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const upvise = useState().upvise;
    const workshop = useWorkshopController(upvise);
    const showTeklaImport = ref(true);
    const projectId = ref("");
    const allReleases = ref(
      Object.values(upvise.entityData(workshop.releaseTable))
    );
    const allProjects = ref(props.forageData["unybiz.projects.projects"]);

    const hasProjectId = computed(() => {
      return !!projectId.value;
    });

    function closeTekla() {
      showTeklaImport.value = false;
      emit("closeTekla");
    }

    function updateOptionsValue(fieldName: string, value: string) {
      if (fieldName === "projectid") projectId.value = value;
    }

    function forceSingleFileUpload(event: any) {
      if (event.files.length > 1) {
        event.files.shift();
      }
    }

    function openMemberImport() {
      window.Engine.eval(
        "Projects.importMembersPane('" + projectId.value + "')",
        0
      );
      console.log("I am going to open the member import screen");
      closeTekla();
    }

    return {
      showTeklaImport,
      allReleases,
      allProjects,
      hasProjectId,
      closeTekla,
      updateOptionsValue,
      forceSingleFileUpload,
      openMemberImport,
    };
  },
});
export default teklaImport;
</script>

<template>
  <div>
    <sidebar
      class="milestone-screen"
      :visible="showTeklaImport"
      position="right"
    >
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name"> Import Members from Tekla </span>
            </div>
          </div>
        </div>
        <div class="p-col-5 sidebar-options">
          <div class="option" @click="closeTekla()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>
      </div>

      <div class="p-grid sidebar-grid">
        <div class="p-col-12 input-label">
          Select a project to link the members to:
        </div>
        <div class="p-col-3 input-label">Project</div>
        <div class="p-col-9">
          <auto-complete-text-box
            display-field="code"
            field-name="projectid"
            :multi-select="false"
            :options="allProjects"
            @updateOptionsValue="updateOptionsValue"
          />
        </div>
      </div>

      <Button
        label="Open Import Members Screen"
        :disabled="!hasProjectId"
        @click="openMemberImport"
      ></Button>
    </sidebar>
  </div>
</template>

<style scoped>

</style>
