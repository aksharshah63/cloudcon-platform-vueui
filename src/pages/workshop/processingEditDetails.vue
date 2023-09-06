<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import Calendar from "primevue/calendar";
import InputNumber from "primevue/inputnumber";
import { IProcessingRecord } from "../../use/controller/workshop/processing.d";
import utils from "../../use/function/useUtils";
import { IRecordDealsProduct } from "../../use/controller/sales/deals.d";
import AutoCompleteTextBox from "../../components/input/autoCompleteTextBox.vue";
import InputText from "primevue/inputtext";
import date from "../../use/utils/useDateOperations"

export const ProcessingEditDetails = defineComponent({
  name: "ProcessingEditDetails",
  components: {
    AutoCompleteTextBox,
    Calendar,
    InputNumber,
    InputText,
  },
  props: {
    isManual: {
      type: Boolean,
      required: true,
    },
    processRecord: {
      type: Object as () => IProcessingRecord,
      required: true,
    },
    isNewProcess: {
      type: Boolean,
      required: false,
      default: false,
    },
    isArchived: {
      type: Boolean,
      required: false,
      default: false,
    },
    traceabilityOptions: {
      type: Array as () => IRecordDealsProduct[],
      required: false,
      default: () => [],
    },
  },
  setup(props) {
    const copyProcess = ref(props.processRecord as IProcessingRecord);

    const totalProcessingTime = computed(
      () =>
        copyProcess.value.processingtime * (copyProcess.value.totalMetres ?? 0)
    );

    function updateOptionsValue(fieldName: string, value: string) {
      if (fieldName === "traceabilityrequiredid")
        copyProcess.value.traceabilityrequired = value;
    }

    return {
      utils,
      date,
      props,
      copyProcess,
      totalProcessingTime,
      updateOptionsValue,
    };
  },
});
export default ProcessingEditDetails;
</script>

<template>
  <div class="p-grid">
    <div class="p-col-3 input-label">Work Date</div>
    <div class="p-col-9">
      <calendar
        class="input-date"
        dateFormat="yy-mm-dd"
        :model-value="
          copyProcess.installdate
            ? utils.getDate(copyProcess.installdate.toString())
            : ''
        "
        :manualInput="false"
        :disabled="isArchived"
        @update:model-value="copyProcess.installdate = utils.getEpoch($event)"
      />
    </div>

    <div class="p-col-3 input-label">Steel Delivery Date</div>
    <div class="p-col-9">
      <calendar
        class="input-date"
        dateFormat="yy-mm-dd"
        :model-value="
          copyProcess.steeldeliverydate
            ? utils.getDate(copyProcess.steeldeliverydate)
            : ''
        "
        :manualInput="false"
        :disabled="isArchived"
        @update:model-value="
          copyProcess.steeldeliverydate = utils.getEpoch($event)
        "
      />
    </div>

    <!-- <div class="p-col-3 input-label">Total Metres</div>
    <div class="p-col-9">
      <input-number
        class="input-number-field"
        mode="decimal"
        v-model="copyProcess.totalMetres"
        disabled
      />
    </div> -->

    <div class="p-col-3 input-label">Estimated Processing Time/Meter</div>
    <div class="p-col-9">
      <input-number
        class="input-number-field"
        mode="decimal"
        :minFractionDigits="2"
        :maxFractionDigits="2"
        suffix=" m"
        v-model="copyProcess.processingtime"
        :disabled="isArchived"
        :allowEmpty="false"
      />
    </div>

    <div v-if="!isNewProcess" class="p-col-3 input-label">
      Total Processing Time
    </div>
    <div v-if="!isNewProcess" class="p-col-9">
      <input-text
        class="input-text-field"
        :model-value="date.getDuration(totalProcessingTime, 'minutes')"
        disabled
      />
    </div>

    <div class="p-col-3 input-label">Traceability Required</div>
    <div class="p-col-9">
      <auto-complete-text-box
        :options="traceabilityOptions"
        :selected="copyProcess.traceabilityrequired"
        :multi-select="false"
        display-field="name"
        field-name="traceabilityrequiredid"
        :disabled="isArchived"
        @updateOptionsValue="updateOptionsValue"
      />
    </div>

    <div class="p-col-3 input-label">Notes</div>
    <div class="p-col-9">
      <textarea
        class="input-textarea"
        rows="2"
        v-model="copyProcess.notes"
        :disabled="isArchived"
      >
      </textarea>
    </div>

    <div class="p-col-3 input-label">Priority</div>
    <div class="p-col-9">
      <input-number
        class="input-number-field"
        v-model="copyProcess.sort"
        :disabled="isArchived"
      />
    </div>
  </div>
</template>

<style scoped></style>
