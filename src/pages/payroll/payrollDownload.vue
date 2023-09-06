<script lang="ts">
import { defineComponent, ref } from "vue";
import Sidebar from "primevue/sidebar";
import Button from "primevue/button";
import { stateSymbol } from "../../store";
import AutoCompleteTextBox from "../../components/input/autoCompleteTextBox.vue";

export const PayrollDownload = /*#__PURE__*/ defineComponent({
  name: "PayrollDownload",
  inject: [stateSymbol.description!],
  components: {
    AutoCompleteTextBox,
    Sidebar,
    Button,
  },
  props: {
    data: {
      type: String,
      required: false,
    },
  },
  setup(props, { emit }) {
    const showPayrollDownload = ref(true);
    const randomData = ref(props.data);
    const selectedPurchaseOrder = ref<string>();
    const downloadType = ref();
    const downloadOptions = [
      { name: "Export as Report in DEBUG MODE", id: "report_debug" },
      { name: "Export for MYOB in DEBUG MODE", id: "myob_debug" },
      { name: "Export as Report", id: "report" },
      { name: "Export for MYOB Advanced", id: "myob_advanced" },
    ];

    function closePayrollDownload() {
      showPayrollDownload.value = false;
      emit("closePayrollDownload");
    }

    function startDownload() {
      closePayrollDownload();

      switch (downloadType.value) {
        case "report_debug":
          window.eval("executePayrollIntegration(true, false)");
          break;
        case "myob_debug":
          window.eval("executePayrollIntegration(false, true)");
          break;
        case "report":
          window.eval("executePayrollIntegration(true)");
          break;
        case "myob_advanced":
          window.eval("executePayrollIntegration()");
          break;
      }
      console.log(downloadType.value);
    }

    function updateOptionsValue(fieldName: string, value: string) {
      console.log(fieldName);
      downloadType.value = value;
    }

    return {
      showPayrollDownload,
      closePayrollDownload,
      downloadOptions,
      selectedPurchaseOrder,
      startDownload,
      downloadType,
      updateOptionsValue,
      randomData,
    };
  },
});

export default PayrollDownload;
</script>

<template>
  <div>
    <sidebar
      class="export-screen"
      :visible="showPayrollDownload"
      position="right"
    >
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name">Download Options</span>
            </div>
          </div>
        </div>

        <div class="p-col-5 sidebar-options">
          <div class="option" @click="closePayrollDownload()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>
      </div>
      <div class="p-grid sidebar-grid">
        <div class="p-col-12">
          <span class="header-name">
            Create Download of Export From Approved Timesheets
          </span>
        </div>

        <div class="p-col-12">
          <span
            >Choose through the range of options for downloading approved
            timesheets.</span
          >
        </div>

        <div class="p-col-2 input-label">Download Type</div>
        <div class="p-col-6">
          <auto-complete-text-box
            :options="downloadOptions"
            :selected="downloadType"
            :multi-select="false"
            display-field="name"
            field-name="downloadType"
            @updateOptionsValue="updateOptionsValue"
          >
          </auto-complete-text-box>
        </div>
        <div class="p-col-4">
          <Button @click="startDownload()"
            >Download Export For Selected
          </Button>
        </div>
      </div>
    </sidebar>
  </div>
</template>

<style scoped></style>
