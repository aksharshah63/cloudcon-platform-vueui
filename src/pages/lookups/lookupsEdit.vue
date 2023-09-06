<script lang="ts">
import useControllerLookups from "../../use/controller/lookups/lookups";
import Sidebar from "primevue/sidebar";
import InputText from "primevue/inputtext";
import Calendar from "primevue/calendar";
import InputSwitch from "primevue/inputswitch";
import ProgressSpinner from "primevue/progressspinner";
import utils from "../../use/function/useUtils";
import { useToast } from "primevue/usetoast";
import { defineComponent, ref, watch, computed } from "vue";
import AutoCompleteTextBox from "../../components/input/autoCompleteTextBox.vue";
import { stateSymbol, useState } from "../../store/index";
import moment from "moment";

export const lookupsEdit = /*#__PURE__*/ defineComponent({
  name: "LookupsEdit",
  inject: [stateSymbol.description!],
  components: {
    Sidebar,
    InputText,
    Calendar,
    InputSwitch,
    ProgressSpinner,
    AutoCompleteTextBox,
  },
  props: {
    lookupId: {
      type: String,
      required: true,
    },
    typeOptions: {
      type: [Object],
      required: true,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const id = ref(props.lookupId);
    const showLookup = ref(true);
    const showSave = ref(false);
    const controller = useControllerLookups(useState().upvise);
    const copyLookup = props.lookupId
      ? controller.getEditLookup(props.lookupId)
      : controller.getNewLookup();
    const originalLookup = utils.deepCopy(copyLookup);
    const awaitingResponse = ref(false);
    const startDateFormatted = computed({
      get: () => {
        if (!copyLookup.startdate) {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          copyLookup.startdate = 0;
        }
        return moment(copyLookup.startdate).format("YYYY-MM-DD");
      },
      set: (val) => {
        copyLookup.startdate = moment(val).valueOf();
      },
    });

    const endDateFormatted = computed({
      get: () => {
        return moment(copyLookup.enddate).format("YYYY-MM-DD");
      },
      set: (val) => {
        copyLookup.enddate = moment(val).valueOf();
      },
    });

    const isActiveComputed = computed({
      get: () => {
        return copyLookup.isactive === 1;
      },
      set: (val) => {
        if (val) copyLookup.isactive = 1;
        else copyLookup.isactive = 0;
      },
    });

    function updateOptionsValue(fieldName: string, value: string) {
      if (fieldName === "lookuptype") copyLookup.lookuptype = value;
    }

    function closeLookup() {
      showLookup.value = false;
      emit("closeLookup");
    }

    async function saveLookup() {
      const accountInfo = JSON.parse(
        localStorage.getItem("accounts.current") as string
      );
      // email will give the email of the user if preferred
      // displayName will give the name if preferred (eg. Cloudcon Pty Ltd)
      copyLookup.owner = accountInfo?.email ?? "";

      if (controller.doValidateLookup(copyLookup)) {
        emit("saveLookup", [copyLookup]);
      }
    }

    async function deleteLookup() {
      if (!copyLookup.id) {
        closeLookup();
        return;
      }
      awaitingResponse.value = true;
      await controller
        .doDeleteLookup(copyLookup)
        .then(() => {
          awaitingResponse.value = false;
          closeLookup();
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
      [copyLookup],
      utils.debounce(() => {
        showSave.value = !utils.equalObjects(copyLookup, originalLookup);
      }),
      { deep: true }
    );

    return {
      id,
      showLookup,
      showSave,
      copyLookup,
      startDateFormatted,
      endDateFormatted,
      isActiveComputed,
      updateOptionsValue,
      closeLookup,
      saveLookup,
      deleteLookup,
      awaitingResponse,
    };
  },
});
export default lookupsEdit;
</script>

<template>
  <div>
    <sidebar class="milestone-screen" :visible="showLookup" position="right">
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name">
                {{ "Lookup" }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-col-5 sidebar-options">
          <div class="loading-spinner" v-if="awaitingResponse">
            <ProgressSpinner class="spinner"></ProgressSpinner>
          </div>
          <div v-if="showSave" class="option" @click="saveLookup()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <div class="option" @click="deleteLookup()">
            <font-awesome-icon class="trash-icon" :icon="['fa', 'trash']" />
          </div>
          <div class="option" @click="closeLookup()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>

        <div class="p-col-12 divider"></div>

        <div class="p-col-12 input-label">Name</div>
        <div class="p-col-12">
          <input-text
            class="input-text-field"
            type="text"
            v-model="copyLookup.lookupname"
          >
          </input-text>
        </div>

        <div class="p-col-12 input-label">Type</div>
        <div class="p-col-12">
          <auto-complete-text-box
            :options="typeOptions"
            :selected="copyLookup.lookuptype"
            :multi-select="false"
            field-name="lookuptype"
            display-field="lookuptype"
            @updateOptionsValue="updateOptionsValue"
          ></auto-complete-text-box>
        </div>

        <div class="p-col-12 input-label">Value</div>
        <div class="p-col-12">
          <textarea
            class="input-textarea"
            rows="3"
            type="text"
            v-model="copyLookup.lookupvalue"
          >
          </textarea>
        </div>

        <div class="p-col-12 input-label">Managing Role</div>
        <div class="p-col-12">
          <input-text
            class="input-text-field"
            type="text"
            v-model="copyLookup.managingrole"
          >
          </input-text>
        </div>

        <div class="p-col-3 input-label">Start Date</div>
        <div class="p-col-9">
          <calendar
            class="input-date"
            dateFormat="yyyy-mm-dd"
            v-model="startDateFormatted"
            :manualInput="false"
            :monthNavigator="true"
            :yearNavigator="true"
            yearRange="1970:2100"
          >
          </calendar>
        </div>

        <div class="p-col-3 input-label">End Date</div>
        <div class="p-col-9">
          <calendar
            class="input-date"
            dateFormat="yyyy-mm-dd"
            v-model="endDateFormatted"
            :manualInput="false"
            :monthNavigator="true"
            :yearNavigator="true"
            yearRange="1970:2100"
          >
          </calendar>
        </div>

        <div class="p-col-3 input-label">Active</div>
        <div class="p-col-2">
          <input-switch
            v-model="isActiveComputed"
            v-tooltip.top="isActiveComputed ? 'Currently Active' : 'Inactive'"
          />
        </div>
      </div>
    </sidebar>
  </div>
</template>

<style scoped></style>
