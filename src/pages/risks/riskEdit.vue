<script lang="ts">
import useControllerRisks from "../../use/controller/risks/risks";
import Sidebar from "primevue/sidebar";
import InputText from "primevue/inputtext";
import ProgressSpinner from "primevue/progressspinner";
import utils from "../../use/function/useUtils";
import { useToast } from "primevue/usetoast";
import { defineComponent, ref, watch } from "vue";
import AutoCompleteTextBox from "../../../src/components/input/autoCompleteTextBox.vue";
import SeverityButtons from "../../../src/components/input/severityButtons.vue";
import { IRecord } from "../../store/modules/upvise.d";
import { useState } from "../../store";

export const RiskEdit = /*#__PURE__*/ defineComponent({
  name: "RiskEdit",
  components: {
    Sidebar,
    InputText,
    AutoCompleteTextBox,
    SeverityButtons,
    ProgressSpinner,
  },
  props: {
    riskId: {
      type: String,
      required: true,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const upvise = useState().upvise;
    const id = ref(props.riskId);
    const showRisk = ref(true);
    const showSave = ref(false);
    const controller = useControllerRisks(upvise);
    const awaitingResponse = ref(false);
    const copyRisk = props.riskId
      ? controller.getEditRisk(props.riskId)
      : controller.getNewRisk();
    const originalRisk = utils.deepCopy(copyRisk);

    console.log(originalRisk);

    const lookupsData: IRecord[] = Object.values(
      upvise.entityData("TableEmployeedashboardLookups")
    );
    const riskTypeOptions = lookupsData.filter(
      (l) => l.lookuptype === "Risk Type"
    );
    const hazardOptions = lookupsData.filter((l) => l.lookuptype === "Hazard");
    const departmentOptions = lookupsData.filter(
      (l) => l.lookuptype === "Department"
    );
    const activityOptions = lookupsData.filter(
      (l) => l.lookuptype === "Activity"
    );
    const controlMeasureOptions = lookupsData.filter(
      (l) => l.lookuptype === "Control Measure"
    );

    const testOptions = [
      { id: "0", name: "Test1" },
      { id: "1", name: "Test2" },
      { id: "2", name: "Fake" },
    ];

    function updateButtonValue(fieldName: string, value: number) {
      if (fieldName === "consequence") copyRisk.consequence = value;
      if (fieldName === "likelihood") copyRisk.likelihood = value;
      if (fieldName === "postconsequence") copyRisk.postconsequence = value;
      if (fieldName === "postlikelihood") copyRisk.postlikelihood = value;
    }

    function updateOptionsValue(fieldName: string, value: string) {
      if (fieldName === "hazardid") copyRisk.hazardid = value;
      if (fieldName === "activityid") copyRisk.activityid = value;
      if (fieldName === "controlmeasureid") copyRisk.controlmeasureid = value;
      if (fieldName === "departmentid") copyRisk.departmentid = value;
      if (fieldName === "risktypeid") copyRisk.risktypeid = value;
    }

    function closeRisk() {
      showRisk.value = false;
      emit("closeRisk");
    }

    async function saveRisk() {
      awaitingResponse.value = true;
      if (controller.doValidateRisk(copyRisk)) {
        emit("saveRisk", [copyRisk]);
      }
    }

    async function deleteRisk() {
      awaitingResponse.value = true;
      await controller
        .doDeleteRisk(copyRisk)
        .then(() => {
          awaitingResponse.value = false;
          closeRisk();
        })
        .catch(() => {
          awaitingResponse.value = false;
          useToast().add({
            severity: "error",
            summary: "Operation Unsuccessful",
            detail: "Could not delete the risk",
            life: 1500,
          });
        });
    }

    watch(
      [copyRisk],
      utils.debounce(() => {
        showSave.value = !utils.equalObjects(copyRisk, originalRisk);
      }),
      { deep: true }
    );

    return {
      id,
      showRisk,
      showSave,
      copyRisk,
      riskTypeOptions,
      hazardOptions,
      departmentOptions,
      activityOptions,
      controlMeasureOptions,
      testOptions,
      updateButtonValue,
      updateOptionsValue,
      closeRisk,
      saveRisk,
      deleteRisk,
      awaitingResponse,
    };
  },
});
export default RiskEdit;
</script>

<template>
  <div>
    <sidebar class="risk-screen" :visible="showRisk" position="right">
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name">
                {{ "Risk" }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-col-5 sidebar-options">
          <div class="loading-spinner" v-if="awaitingResponse">
            <ProgressSpinner class="spinner"></ProgressSpinner>
          </div>
          <div v-if="showSave" class="option" @click="saveRisk()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <div class="option" @click="deleteRisk()">
            <font-awesome-icon class="trash-icon" :icon="['fa', 'trash']" />
          </div>
          <div class="option" @click="closeRisk()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>

        <div class="p-col-12 divider"></div>

        <div class="p-col-12 input-label">Activity Name</div>
        <div class="p-col-12">
          <input-text
            class="input-text-field"
            type="text"
            v-model="copyRisk.name"
          >
          </input-text>
        </div>

        <div class="p-col-12 input-label">Risk Category</div>
        <div class="p-col-12">
          <auto-complete-text-box
            :options="riskTypeOptions"
            :selected="copyRisk.risktypeid"
            :multi-select="false"
            display-field="lookupvalue"
            field-name="risktypeid"
            @updateOptionsValue="updateOptionsValue"
          ></auto-complete-text-box>
        </div>

        <div class="p-col-12 input-label">Department(s)</div>
        <div class="p-col-12">
          <auto-complete-text-box
            :options="departmentOptions"
            :selected="copyRisk.departmentid"
            display-field="lookupvalue"
            field-name="departmentid"
            @updateOptionsValue="updateOptionsValue"
          ></auto-complete-text-box>
        </div>

        <div class="p-col-12 input-label">Hazard</div>
        <div class="p-col-12">
          <auto-complete-text-box
            :options="hazardOptions"
            :selected="copyRisk.hazardid"
            @updateOptionsValue="updateOptionsValue"
            display-field="lookupvalue"
            field-name="hazardid"
          ></auto-complete-text-box>
        </div>

        <div class="p-col-12 input-label">Risks Identified</div>
        <div class="p-col-12">
          <auto-complete-text-box
            :options="activityOptions"
            :selected="copyRisk.activityid"
            display-field="lookupvalue"
            field-name="activityid"
            @updateOptionsValue="updateOptionsValue"
          ></auto-complete-text-box>
        </div>

        <div class="p-col-12 input-label">Consequence</div>
        <severity-buttons
          class="p-col-12"
          :current="copyRisk.consequence"
          field-name="consequence"
          type="consequence"
          @updateButtonValue="updateButtonValue"
        />

        <div class="p-col-12 input-label">Likelihood</div>
        <severity-buttons
          class="p-col-12"
          :current="copyRisk.likelihood"
          field-name="likelihood"
          type="likelihood"
          @updateButtonValue="updateButtonValue"
        />

        <div class="p-col-12 input-label">Control Measure(s)</div>
        <div class="p-col-12">
          <auto-complete-text-box
            :options="controlMeasureOptions"
            :selected="copyRisk.controlmeasureid"
            display-field="lookupvalue"
            field-name="controlmeasureid"
            @updateOptionsValue="updateOptionsValue"
          ></auto-complete-text-box>
        </div>

        <div class="p-col-12 input-label">Post Control Consequence</div>
        <severity-buttons
          class="p-col-12"
          :current="copyRisk.postconsequence"
          field-name="postconsequence"
          type="consequence"
          @updateButtonValue="updateButtonValue"
        />

        <div class="p-col-12 input-label">Post Control Likelihood</div>
        <severity-buttons
          class="p-col-12"
          :current="parseInt(copyRisk.postlikelihood)"
          field-name="postlikelihood"
          type="likelihood"
          @updateButtonValue="updateButtonValue"
        />
      </div>
    </sidebar>
  </div>
</template>

<style scoped></style>
