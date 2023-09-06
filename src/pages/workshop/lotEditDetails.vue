<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { useState } from "../../store/index";
import { ILot, IRelease } from "../../use/controller/workshop/workshop.d";
import { IRecord } from "../../store/modules/upvise.d";
import useWorkshopController from "../../use/controller/workshop/workshop";
import AutoCompleteTextBox from "../../components/input/autoCompleteTextBox.vue";
import InputNumber from "primevue/inputnumber";
import maths from "../../use/utils/useNumberOperations";
import { WorkshopSource } from "../../use/utils/useConstants";
import date from "../../use/utils/useDateOperations";

export const lotEdit = defineComponent({
  name: "LotEdit",
  components: {
    AutoCompleteTextBox,
    InputNumber,
  },
  props: {
    lotCopy: {
      type: Object as () => ILot,
      required: true,
    },
    stageProjects: {
      type: Object as () => IRecord[],
      required: true,
    },
    archived: {
      type: Boolean,
      required: true,
    },
    isNewLot: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  setup(props) {
    const upvise = useState().upvise;
    const workshop = useWorkshopController(upvise);
    const copyLot = ref(props.lotCopy as ILot);
    const isManual = ref(copyLot.value.source === WorkshopSource.MANUAL);
    const projects = ref(props.stageProjects);
    const releaseName = ref("");
    const releases = ref(
      Object.values(
        upvise.entityData(workshop.releaseTable)
      ) as unknown as IRelease[]
    );

    const projectOptions = computed(() => {
      return projects.value.map((project) => {
        const customObject = project.custom ? JSON.parse(project.custom as string) : {};
        const stage = customObject[workshop.projectStageCodeField] ?? null;
        const installDate = customObject[workshop.projectInstallDateField] ?? null;

        return {
          id: project.id,
          name: project.name,
          code: project.code,
          label: `${project.code}${stage ? ` - Stage ${stage}` : ""}`,
          installDate: installDate, 
        }
      });
    });
    
    const selectedProjectOption = computed(() => {
      return projectOptions.value.find((project) => project.id === copyLot.value.projectid);
    });

    const filteredReleases = computed(() =>
      releases.value.filter((x) => x.projectid === copyLot.value.projectid)
    );

    function updateOptionsValue(fieldName: string, value: string) {
      if (fieldName === "projectid") copyLot.value.projectid = value;
      else if (fieldName === "releaseid") copyLot.value.releaseid = value;
    }

    function updateProjectDetails(id: string) {
      if (!id) return;
      const project = projects.value.find((project) => project.id === id);
      if (!project) {
        return;
      }
      const values = project["custom"]
        ? JSON.parse(project["custom"] as string)
        : null;
      copyLot.value.membercount =
        props.isNewLot && values
          ? "F7" in values
            ? values["F7"]
            : 0
          : copyLot.value.source === WorkshopSource.MANUAL
          ? copyLot.value.membercount
          : workshop.getMemberCount(copyLot.value.id);
      copyLot.value.totalmeters =
        copyLot.value.source === WorkshopSource.MANUAL
          ? copyLot.value.totalmeters
          : maths.round(workshop.getTotalMeters(copyLot.value.id));

      // if (props.isNewLot && values)
      //   copyLot.value.membercount = "F7" in values ? values["F7"] : 0;
    }

    function updateReleaseName(id: string) {
      if (!id) return;
      const release = releases.value.find((release) => release.id === id);
      if (release) releaseName.value = release.name;
    }

    onMounted(() => {
      updateProjectDetails(copyLot.value.projectid);
    });

    watch(
      () => copyLot.value.projectid,
      () => {
        updateProjectDetails(copyLot.value.projectid);
      }
    );

    watch(
      () => copyLot.value.releaseid,
      () => {
        updateReleaseName(copyLot.value.releaseid);
      }
    );

    return {
      date,
      copyLot,
      isManual,
      projects,
      releaseName,
      projectOptions,
      selectedProjectOption,
      filteredReleases,
      updateOptionsValue,
    };
  },
});
export default lotEdit;
</script>

<template>
  <div class="p-grid">
    <div class="p-col-3 input-label">Source</div>
    <div class="p-col-9">
      <div>{{ copyLot.source }}</div>
    </div>

    <div class="p-col-3 input-label">Project Code</div>
    <div class="p-col-9">
      <auto-complete-text-box
        v-if="!archived || !isManual"
        :options="projectOptions"
        :selected="copyLot.projectid"
        :multi-select="false"
        display-field="label"
        field-name="projectid"
        @updateOptionsValue="updateOptionsValue"
      />
      <div v-else class="input-text-field">{{ selectedProjectOption?.label ?? "" }}</div>
    </div>

    <div class="p-col-3 input-label">Project Name</div>
    <div class="p-col-9">
      <div class="input-text-field">{{ selectedProjectOption?.name ?? "" }}</div>
    </div>

    <div class="p-col-3 input-label">Install Date</div>
    <div class="p-col-9">
      <div class="input-text-field">{{ Number(selectedProjectOption?.installDate) ? date.getDateString(Number(selectedProjectOption.installDate), "YYYY-MM-DD") : "" }}</div>
    </div>

    <div
      v-if="(isNewLot && selectedProjectOption?.id) || !isNewLot"
      class="p-col-3 input-label"
    >
      Release
    </div>
    <div v-if="(isNewLot && selectedProjectOption?.id) || !isNewLot" class="p-col-9">
      <auto-complete-text-box
        v-if="!archived || !isManual"
        :options="filteredReleases"
        :selected="copyLot.releaseid"
        :multi-select="false"
        display-field="code"
        field-name="releaseid"
        @updateOptionsValue="updateOptionsValue"
      />
      <div v-else class="input-text-field">{{ releaseName }}</div>
    </div>

    <div class="p-col-3 input-label">Lot Number</div>
    <div class="p-col-9">
      <input-number
        class="input-number-field"
        v-model="copyLot.code"
        :disabled="!isManual || archived"
      />
    </div>

    <div class="p-col-3 input-label">Member Count</div>
    <div class="p-col-9">
      <input-number
        class="input-number-field"
        v-model="copyLot.membercount"
        :disabled="!isManual || archived"
      />
    </div>

    <div class="p-col-3 input-label">Total Meters</div>
    <div class="p-col-9">
      <input-number
        class="input-number-field"
        mode="decimal"
        v-model="copyLot.totalmeters"
        :disabled="!isManual || archived"
        :minFractionDigits="2"
      />
    </div>

    <div class="p-col-3 input-label">Details</div>
    <div class="p-col-9">
      <textarea
        class="input-textarea"
        rows="2"
        v-model="copyLot.description"
        :disabled="archived"
      >
      </textarea>
    </div>
  </div>
</template>

<style scoped></style>
