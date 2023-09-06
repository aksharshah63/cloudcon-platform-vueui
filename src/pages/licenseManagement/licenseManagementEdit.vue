<script lang="ts">
import useControllerLicenseManagement from "../../use/controller/licenseManagement/licenseManagement";
import Sidebar from "primevue/sidebar";
import ProgressSpinner from "primevue/progressspinner";
import utils from "../../use/function/useUtils";
import { useToast } from "primevue/usetoast";
import { defineComponent, ref, watch } from "vue";

import AutoCompleteTextBox from "../../components/input/autoCompleteTextBox.vue";
import { stateSymbol, useState } from "../../store/index";

export const licenseManagementEdit = /*#__PURE__*/ defineComponent({
  name: "LicenseManagementEdit",
  inject: [stateSymbol.description!],
  components: {
    Sidebar,
    ProgressSpinner,
    AutoCompleteTextBox,
  },
  props: {
    licenseId: {
      type: String,
      required: true,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const id = ref(props.lookupId);
    const showLicenseManagement = ref(true);
    const showSave = ref(false);
    const controller = useControllerLicenseManagement(useState().upvise);
    const copyLicenseManagement = props.licenseId
      ? controller.getEditLicenseManagement(props.licenseId)
      : controller.getNewLicenseManagement();
    const originalLicense = utils.deepCopy(copyLicenseManagement);
    const awaitingResponse = ref(false);
    function closeLicenseManagement() {
      showLicenseManagement.value = false;
      emit("closeLicenseManagement");
    }

    const lookupsData = Object.values(
      useState().upvise.entityData("TableEmployeedashboardLookups")
    );
    const departmentOptions = lookupsData.filter(
      (l) => l.lookuptype === "Department"
    );
    const roleOptions = lookupsData.filter((l) => l.lookuptype === "Roles");
    const qualificationOptions = lookupsData.filter(
      (l) => l.lookuptype === "Qualification"
    );

    async function saveLicenseManagement() {
      // email will give the email of the user if preferred
      // displayName will give the name if preferred (eg. Cloudcon Pty Ltd)
      awaitingResponse.value = true;
      await controller
        .doSaveLicenseManagement([copyLicenseManagement])
        .then(() => {
          awaitingResponse.value = false;
          closeLicenseManagement();
        })
        .catch(() => {
          awaitingResponse.value = false;
          useToast().add({
            severity: "error",
            summary: "Operation Unsuccessful",
            detail: "Could not save the lookup",
            life: 1500,
          });
        });
    }
    function updateOptionsValue(fieldName: string, value: string) {
      switch (fieldName) {
        case "departmentid":
          copyLicenseManagement.departmentid = value;
          break;
        case "roleid":
          copyLicenseManagement.roleid = value;
          break;
        case "qualificationid":
          copyLicenseManagement.qualificationid = value;
          break;
      }
      console.log(copyLicenseManagement);
    }
    async function deleteLicenseManagement() {
      awaitingResponse.value = true;
      await controller
        .doDeleteLicenseManagement(copyLicenseManagement)
        .then(() => {
          awaitingResponse.value = false;
          closeLicenseManagement();
        })
        .catch(() => {
          awaitingResponse.value = false;
          useToast().add({
            severity: "error",
            summary: "Operation Unsuccessful",
            detail: "Could not save the lookup",
            life: 1500,
          });
        });
    }

    watch(
      [copyLicenseManagement],
      utils.debounce(() => {
        showSave.value = !utils.equalObjects(
          copyLicenseManagement,
          originalLicense
        );
      }),
      { deep: true }
    );

    return {
      id,
      showLicenseManagement,
      showSave,
      copyLicenseManagement,
      closeLicenseManagement,
      saveLicenseManagement,
      deleteLicenseManagement,
      departmentOptions,
      qualificationOptions,
      roleOptions,
      updateOptionsValue,
      awaitingResponse,
    };
  },
});
export default licenseManagementEdit;
</script>

<template>
  <div>
    <sidebar
      class="milestone-screen"
      :visible="showLicenseManagement"
      position="right"
    >
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name">
                {{ "License Management" }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-col-5 sidebar-options">
          <div class="loading-spinner" v-if="awaitingResponse">
            <ProgressSpinner class="spinner"></ProgressSpinner>
          </div>
          <div v-if="showSave" class="option" @click="saveLicenseManagement()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <div class="option" @click="deleteLicenseManagement()">
            <font-awesome-icon class="trash-icon" :icon="['fa', 'trash']" />
          </div>
          <div class="option" @click="closeLicenseManagement()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>

        <div class="p-col-12 divider"></div>
        <div class="p-col-12 input-label">Department Name</div>
        <div class="p-col-12">
          <auto-complete-text-box
            :options="departmentOptions"
            :selected="copyLicenseManagement.departmentid"
            :multi-select="false"
            display-field="lookupvalue"
            field-name="departmentid"
            @updateOptionsValue="updateOptionsValue"
          ></auto-complete-text-box>
        </div>
        <div class="p-col-12 input-label">Roles</div>
        <div class="p-col-12">
          <auto-complete-text-box
            :options="roleOptions"
            :selected="copyLicenseManagement.roleid"
            :multi-select="true"
            display-field="lookupvalue"
            field-name="roleid"
            @updateOptionsValue="updateOptionsValue"
          ></auto-complete-text-box>
        </div>
        <div class="p-col-12 input-label">Qualifications</div>
        <div class="p-col-12">
          <auto-complete-text-box
            :options="qualificationOptions"
            :selected="copyLicenseManagement.qualificationid"
            :multi-select="true"
            display-field="lookupvalue"
            field-name="qualificationid"
            @updateOptionsValue="updateOptionsValue"
          ></auto-complete-text-box>
        </div>
      </div>
    </sidebar>
  </div>
</template>

<style scoped></style>
