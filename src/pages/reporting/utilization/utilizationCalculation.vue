<script lang="ts">
import Sidebar from "primevue/sidebar";
import { defineComponent, ref, watchEffect } from "vue";
import InputNumber from "primevue/inputnumber";

export const utilizationCalculation = /*#__PURE__*/ defineComponent({
  name: "UtilizationCalculation",
  components: {
    Sidebar,
    InputNumber,
  },
  props: {
    perDayHours: {
      type: Number,
      required: true,
    },
    perWeekDays: {
      type: Number,
      required: true,
    },
    perYearWeeks: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const showCalculation = ref(true);
    const showSave = ref(false);
    const hourBase = ref(props.perDayHours);
    const dayBase = ref(props.perWeekDays);
    const weekBase = ref(props.perYearWeeks);

    function saveCalculation() {
      emit("saveCalculation", hourBase.value, dayBase.value, weekBase.value);
    }

    function closeCalculation() {
      showCalculation.value = false;
      emit("closeCalculation");
    }

    watchEffect(() => {
      if (
        hourBase.value != props.perDayHours ||
        dayBase.value != props.perWeekDays ||
        weekBase.value != props.perYearWeeks
      ) {
        showSave.value = true;
      } else {
        showSave.value = false;
      }
    });

    return {
      saveCalculation,
      showSave,
      closeCalculation,
      showCalculation,
      hourBase,
      dayBase,
      weekBase,
    };
  },
});
export default utilizationCalculation;
</script>

<template>
  <div>
    <sidebar
      class="milestone-screen"
      :visible="showCalculation"
      position="right"
    >
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name">
                {{ "Edit Calculation" }}
              </span>
            </div>
          </div>
        </div>

        <div class="p-col-5 sidebar-options">
          <div v-if="showSave" class="option" @click="saveCalculation()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <div class="option" @click="closeCalculation()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>

        <div class="p-col-12 divider"></div>

        <div class="p-col-12 input-label">Base Hours per Day</div>
        <div class="p-col-12">
          <input-number
            class="input-number-field"
            v-model="hourBase"
            mode="decimal"
            showButtons
            :min="1"
            :max="24"
          >
          </input-number>
        </div>

        <div class="p-col-12 input-label">Working Days per Week</div>
        <div class="p-col-12">
          <input-number
            class="input-number-field"
            v-model="dayBase"
            mode="decimal"
            showButtons
            :min="1"
            :max="7"
          >
          </input-number>
        </div>

        <div class="p-col-12 input-label">Working Weeks per Year</div>
        <div class="p-col-12">
          <input-number
            class="input-number-field"
            v-model="weekBase"
            mode="decimal"
            showButtons
            :min="1"
            :max="52"
          >
          </input-number>
        </div></div
    ></sidebar>
  </div>
</template>

<style scoped></style>
