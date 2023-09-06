<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import Dialog from "primevue/dialog";
import Calendar from "primevue/calendar";
import InputText from "primevue/inputtext";
import ProgressSpinner from "primevue/progressspinner";

import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import ChangeDateLogTable from "../../components/workshop/changeDateLogTable.vue";
import utils from "../../use/function/useUtils";
import date from "../../use/utils/useDateOperations";

export const InstallDateEdit = defineComponent({
  name: "InstallDateEdit",
  components: {
    ChangeDateLogTable,
    Dialog,
    Calendar,
    InputText,
    ProgressSpinner,
    Accordion,
    AccordionTab,
  },
  props: {
    details: {
      type: Object,
      required: true,
    },
    awaitingResponse: {
      type: Boolean,
      required: false,
      default: false,
    },
    isArchived: {
      type: Boolean,
      required: false,
      default: false,
    },
    auditLogs: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const showPopup = ref(true);
    const copyDetails = ref(utils.deepCopy(props.details));
    const reason = ref("");
    const statusText = ref("");
    const installDate = ref(copyDetails.value?.installdate || Date.now());

    const showSave = computed(() => {
      return (
        date.getStartOfDay(copyDetails.value?.installdate) !=
        date.getStartOfDay(installDate.value)
      );
    });

    const name = computed(() => {
      return copyDetails.value?.name;
    });

    const source = computed(() => {
      return copyDetails.value?.source;
    });

    function saveNewDate() {
      if (reason.value == "") {
        statusText.value =
          "A valid reason must be given to change install date";
      } else {
        emit("saveNewDate", installDate.value, reason.value, source);
      }
    }
    function closePopup() {
      showPopup.value = false;
      emit("closePopup");
    }
    return {
      showPopup,
      copyDetails,
      showSave,
      installDate,
      reason,
      name,
      source,
      statusText,
      saveNewDate,
      closePopup,
      utils,
    };
  },
});

export default InstallDateEdit;
</script>

<template>
  <Dialog
    position="top"
    class="install-date-edit"
    :show-header="false"
    :visible="showPopup"
    :modal="true"
    :draggable="false"
  >
    <div class="p-grid sidebar-grid">
      <div class="p-col-7">
        <div class="p-grid">
          <div class="p-col-12">
            <span class="header-name"> {{ name }}</span>
          </div>
        </div>
      </div>
      <div class="p-col-5 sidebar-options">
        <div class="loading-spinner" v-if="awaitingResponse">
          <ProgressSpinner class="spinner"></ProgressSpinner>
        </div>
        <div v-if="showSave" class="option" @click="saveNewDate()">
          <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
        </div>
        <div class="option" @click="closePopup()">
          <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
        </div>
      </div>
    </div>
    <Accordion :multiple="true" :activeIndex="[0, 1]">
      <AccordionTab>
        <template #header>
          <span>Change Install Date</span>
        </template>
        <div>
          <div class="p-grid sidebar-grid">
            <div class="p-col-12">
              <div class="p-grid">
                <div class="p-col-3 input-label">Install Date</div>
                <div class="p-col-9">
                  <calendar
                    class="input-date"
                    dateFormat="yy-mm-dd"
                    :model-value="installDate ? utils.getDate(installDate) : ''"
                    :manualInput="false"
                    :disabled="isArchived"
                    @update:model-value="installDate = utils.getEpoch($event)"
                  ></calendar>
                </div>
                <div class="p-col-3 input-label">Source</div>
                <div class="p-col-9">
                  <input-text
                    class="input-text-field"
                    v-model="source"
                    disabled
                  ></input-text>
                </div>
                <div class="p-col-3 input-label">Reason</div>
                <div class="p-col-9">
                  <input-text
                    class="input-text-field"
                    v-model="reason"
                    :disabled="isArchived"
                  ></input-text>
                </div>
                {{ statusText }}
              </div>
            </div>
          </div>
        </div>
      </AccordionTab>

      <AccordionTab>
        <template #header>
          <span>Change Log</span>
        </template>
        <div>
          <change-date-log-table :data="auditLogs" />
        </div>
      </AccordionTab>
    </Accordion>
  </Dialog>
</template>

<style scoped lang="scss"></style>
