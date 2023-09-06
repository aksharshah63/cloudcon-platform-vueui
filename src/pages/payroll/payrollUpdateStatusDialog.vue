<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import Dialog from "primevue/dialog";

import { TimesheetsStatus } from "../../use/utils/useConstants";
import { IPayrollCell } from "../../use/controller/payroll/payroll.d";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";

export const PayrollUpdateStatusDialog = defineComponent({
  name: "PayrollUpdateStatusDialog",
  components: {
    Button,
    Dialog,
    ProgressSpinner,
  },
  props: {
    showDialog: {
      type: Boolean,
      required: true,
    },
    status: {
      type: Number as PropType<TimesheetsStatus>,
      required: true,
    },
    selectedCells: {
      type: Array as PropType<IPayrollCell[]>,
      required: true,
    },
    isSaving: {
      type: Boolean,
      required: false,
      default: false,
    }
  },
  setup(props, { emit }) {
    const headerText = computed (() => {
      switch (props.status) {
        case TimesheetsStatus.APPROVED:
          return "Approve";
        case TimesheetsStatus.REJECTED:
          return "Reject";
        case TimesheetsStatus.SENT:
          return "Mark as sent";
        default:
          return undefined;
      }
    });

    const statusIcon = computed(() => {
      switch (props.status) {
        case TimesheetsStatus.APPROVED:
          return "check";
        case TimesheetsStatus.REJECTED:
          return "times";
        case TimesheetsStatus.SENT:
          return "paper-plane";
        default:
          return undefined;
      }
    });

    const bodyText = computed (() => {
      switch (props.status) {
        case TimesheetsStatus.APPROVED:
          return `Are you sure you want to approve ${props.selectedCells?.length || 0} cells?`;
        case TimesheetsStatus.REJECTED:
          return `Are you sure you want to reject ${props.selectedCells?.length || 0} cells?`;
        case TimesheetsStatus.SENT:
          return `Are you sure you want to mark ${props.selectedCells?.length || 0} cells as sent?`;
        default:
          return undefined;
      }
    });

    function closeDialog() {
      emit("closeDialog");
    }

    function onYesClick() {
      emit("yes", props.status);
    }


    return {
      props,
      headerText,
      statusIcon,
      bodyText,
      closeDialog,
      onYesClick
    };
  },
});

export default PayrollUpdateStatusDialog;
</script>

<template>
  <Dialog
    class="payroll-update-status-dialog"
    position="top"
    :visible="props.showDialog"
    :modal="true"
    :draggable="false"
    :show-header="false"
  >
    <div class="p-grid sidebar-grid">
      <div class="p-col-7">
        <div class="p-grid">
          <div class="p-col-12">
            <span class="header-name"> {{ headerText }}</span>
          </div>
        </div>
      </div>
      <div class="p-col-5 sidebar-options">
        <div class="option" @click="closeDialog()">
          <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
        </div>
      </div>

      <div class="p-col-12 divider"></div>

      <div class="p-col-12 body">
        <div>
          <font-awesome-icon
            :class="{
              [`${statusIcon}-icon`]: true,
            }"
            :icon="['fa', statusIcon]"
          />
        </div>
        <div>
          <span>{{ bodyText }}</span>
        </div>
      </div>

      <div class="p-col-12 divider"></div>
    </div>

    <div class="p-col-12 footer">
      <div v-if="props.isSaving" class="spinner-container">
        <ProgressSpinner class="spinner"></ProgressSpinner>
      </div>

      <template v-else>
        <div class="button-container">
          <Button class="no-button" @click="closeDialog()">
            No
          </Button>
        </div>
        <div class="button-container">
          <Button @click="onYesClick()">
            Yes
          </Button>
        </div>
      </template>
    </div>
  </Dialog>
</template>

<style scoped lang="scss">
.payroll-update-status-dialog {
  .body {
    display: flex;
    font-size: 16px;

    > div {
      display: flex;
      align-items: center;
      justify-content: center;

      .check-icon,
      .times-icon,
      .paper-plane-icon {
        font-size: 30px;
        margin-right: 10px;
      }
    }
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: end;

    .button-container {
      margin: 0 2px;

      .no-button {
        background: #ffffff;
        color: #007fff;
      }
    }

    .spinner-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;

      .spinner {
        height: 30px;
        width: 30px;
      }
    }
  }
}
</style>
