<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { IRecord } from "../../store/modules/upvise.d";
import { IFabricationRecord } from "../../use/controller/workshop/fabrication.d";
import AutoCompleteTextBox from "../../components/input/autoCompleteTextBox.vue";
import Calendar from "primevue/calendar";
import InputNumber from "primevue/inputnumber";
import moment from "moment";
import InputText from "primevue/inputtext";
import utils from "../../use/function/useUtils";

export const FabricationEditDetails = defineComponent({
  name: "FabricationEditDetails",
  components: {
    AutoCompleteTextBox,
    Calendar,
    InputNumber,
    InputText,
  },
  props: {
    fabricationRecord: {
      type: Object as () => IFabricationRecord,
      required: true,
    },
    manual: {
      type: Boolean,
      required: true,
    },
    qualifiedWelders: {
      type: Object as () => IRecord[],
      required: true,
    },
    allPaintTypes: {
      type: Object as () => IRecord[],
      required: true,
    },
    archived: {
      type: Boolean,
      required: false,
      default: false,
    },
    newLot: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const copyFab = ref(props.fabricationRecord as IFabricationRecord);
    const isManual = ref(props.manual);
    const allWelders = ref(props.qualifiedWelders);
    const paintTypes = ref(props.allPaintTypes);

    const installDateFormatted = computed({
      get: () => {
        if (!copyFab.value?.installdate) {
          return moment(0).format("YYYY-MM-DD");
        }
        return moment(copyFab.value?.installdate).format("YYYY-MM-DD");
      },
      set: (val) => {
        if (isManual.value) copyFab.value.installdate = moment(val).valueOf();
      },
    });

    const totalFabricationTime = computed(
      () => copyFab.value.estimatedtime * (copyFab.value.memberCount ?? 0)
    );

    function updateOptionsValue(fieldName: string, value: string) {
      if (fieldName === "welder") copyFab.value.welderid = value;
      if (fieldName === "treatmentid") copyFab.value.treatmentid = value;
    }

    return {
      utils,
      copyFab,
      isManual,
      allWelders,
      paintTypes,
      installDateFormatted,
      totalFabricationTime,
      updateOptionsValue,
    };
  },
});
export default FabricationEditDetails;
</script>

<template>
  <div class="p-grid">
    <div class="p-col-3 input-label">Work Date</div>
    <div class="p-col-9">
      <calendar
        class="input-date"
        dateFormat="yy-mm-dd"
        :model-value="
          copyFab.installdate
            ? utils.getDate(copyFab.installdate.toString())
            : ''
        "
        :manualInput="false"
        :disabled="archived"
        @update:model-value="copyFab.installdate = utils.getEpoch($event)"
      />
    </div>

    <div class="p-col-3 input-label">Treatment</div>
    <div class="p-col-9">
      <auto-complete-text-box
        v-if="!archived"
        :options="paintTypes"
        :selected="copyFab.treatmentid"
        display-field="title"
        field-name="treatmentid"
        @updateOptionsValue="updateOptionsValue"
        :disabled="!isManual"
      />
      <input-text
        v-else
        class="input-text-field"
        :disabled="true"
        :model-value="(copyFab.treatment ?? '').split('|').join(', ')"
      />
    </div>

    <div class="p-col-3 input-label">Qualified Welder Assigned</div>
    <div class="p-col-9">
      <auto-complete-text-box
        v-if="!archived"
        :options="allWelders"
        :selected="copyFab.welderid"
        :multi-select="false"
        display-field="name"
        field-name="welder"
        @updateOptionsValue="updateOptionsValue"
      />
      <input-text
        v-else
        class="input-text-field"
        :disabled="true"
        :model-value="copyFab.welderName"
      />
    </div>

    <div class="p-col-3 input-label">Estimated Fab Time/Member</div>
    <div class="p-col-9">
      <input-number
        class="input-number-field"
        mode="decimal"
        :minFractionDigits="2"
        :maxFractionDigits="2"
        v-model="copyFab.estimatedtime"
        :disabled="archived"
      />
    </div>

    <div v-if="!newLot" class="p-col-3 input-label">Total Fabrication Time</div>
    <div v-if="!newLot" class="p-col-9">
      <input-number
        class="input-number-field"
        mode="decimal"
        :maxFractionDigits="2"
        v-model="totalFabricationTime"
        disabled
      />
    </div>

    <div class="p-col-3 input-label">Priority</div>
    <div class="p-col-9">
      <input-number
        class="input-number-field"
        mode="decimal"
        v-model="copyFab.sort"
        :disabled="archived"
      />
    </div>

    <div class="p-col-3 input-label">Notes</div>
    <div class="p-col-9">
      <textarea
        class="input-textarea"
        rows="3"
        v-model="copyFab.notes"
        :disabled="archived"
      >
      >
      </textarea>
    </div>
  </div>
</template>

<style scoped></style>
