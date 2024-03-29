<script lang="ts">
/* eslint-disable */
import { defineComponent, ref, computed, reactive } from "vue";
import { IUpviseDataMessage, IRecord } from "../../store/modules/upvise.d";
import ColumnPicker from "../../components/column/picker.vue";

import "../../assets/styles/global.scss";
// import { exportAllData } from "../../use/function/exportAllData";
import ImportDataSidebar from "../../components/input/importDataSidebar.vue";
import ProgressSpinner from "primevue/progressspinner";

export const HeaderActions = /*#__PURE__*/ defineComponent({
  name: "HeaderActions",
  components: {
    ImportDataSidebar,
    ColumnPicker,
    ProgressSpinner,
  },
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: false,
    },
    //Has icon, tooltip and action
    actionButtons: {
      type: [Object],
      required: false,
    },
    useColumnPicker: {
      type: Boolean,
      required: false,
      default: true,
    },
    showFileExport: {
      type: Boolean,
      required: false,
      default: false,
    },
    useFavouriteManager: {
      type: Boolean,
      required: false,
      default: true,
    },
    showFileImport: {
      type: Boolean,
      required: false,
      default: false,
    },
    uploadSuccessful: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    showFavouriteManagerLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
    exportFilter: {
      type: Object as () => IRecord,
      required: false,
    },
    customImportMessage: {
      type: String,
      required: false,
    },
    // useEdit: {
    //   type: Boolean,
    //   required: false,
    //   default: false,
    // },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(props, { emit }) {
    // const state = useState();
    const showColumnPicker = ref(false);
    const columnPickerButton = {
      action: "columnPicker",
      tooltip: "Show, Hide and Recorder Columns",
      icon: "columns",
    };
    // Will only need this if there's some kind of sidebar component to this function
    //const showFileExport = ref(false);
    const fileExportButton = {
      action: "fileExport",
      tooltip: "Export to CSV",
      icon: "file-export",
    };

    const showImportData = ref(false);
    const fileImportButton = {
      action: "fileImport",
      tooltip: "Import from CSV",
      icon: "file-import",
    };

    const buttons = computed(() => {
      const buttons: any = [];
      if (props.actionButtons) {
        Array.prototype.push.apply(buttons, props.actionButtons as any[]);
      }
      if (props.useColumnPicker) {
        buttons.push(columnPickerButton);
      }
      if (props.showFileImport) {
        buttons.push(fileImportButton);
      }
      if (props.showFileExport) {
        buttons.push(fileExportButton);
      }

      return buttons;
    });

    document.getElementById("one")?.addEventListener("scroll", () => {
      //handle the scroll event
      repositionHeader();
    });

    function repositionHeader() {
      var actionList = document.getElementById("actions-list");
      var header = document.getElementById("header");
      var kui = document.getElementById("kui");

      var usableBottom =
        header != undefined ? header.getBoundingClientRect().bottom : 0;

      if (actionList == null || kui == null) return;

      if (
        kui.getBoundingClientRect().top < usableBottom &&
        !actionList.classList.contains("sticky")
      ) {
        actionList.style.right =
          window.innerWidth -
          actionList.getBoundingClientRect().right +
          13 +
          "px";
        actionList.style.top = usableBottom + 10 + "px";
        actionList?.classList.add("sticky");
      }
      if (
        kui.getBoundingClientRect().top > usableBottom &&
        actionList.classList.contains("sticky")
      )
        actionList?.classList.remove("sticky");
    }

    function open(name: string) {
      switch (name) {
        case "favourites":
          // console.log("open favourites");
          break;
      }
    }

    function calculateTooltip(inputText: string) {
      return `<table class="progress-tooltip">
                <tr><td>${inputText}</td></tr>
              </table>`;
    }

    function actionClicked(action: string) {
      switch (action) {
        case "columnPicker":
          showColumnPicker.value = true;
          break;
        case "fileImport":
          showImportData.value = true;
          break;
          // case "fileExport":
          //   exportAllData(
          //     props?.upviseDataMessage,
          //     state.upvise,
          //     props.exportFilter as IRecord
          //   );
          break;
        default:
          emit("actionClicked", action);
      }
    }

    function closeColumnPicker() {
      setTimeout(() => {
        showColumnPicker.value = false;
      }, 200);
    }

    function closeImportData() {
      setTimeout(() => {
        showImportData.value = false;
      }, 200);
    }

    function saveToUpvise(data: IRecord[]) {
      const updated = data.map((record) =>
        reactive(JSON.parse(JSON.stringify(record)))
      );
      emit("saveToUpvise", updated);
    }

    return {
      showColumnPicker,
      // eslint-disable-next-line vue/no-dupe-keys
      buttons,
      showImportData,
      open,
      // headerChange,
      calculateTooltip,
      actionClicked,
      closeColumnPicker,
      closeImportData,
      saveToUpvise,
    };
  },
});
export default HeaderActions;
</script>

<template>
  <div class="actions-list" id="actions-list">
    <div class="actions-group left">
      <slot name="actionsLeft"></slot>
    </div>
    <div class="actions-group">
      <slot name="actionsMiddle"></slot>
    </div>
    <div class="actions-group right">
      <div
        v-if="useFavouriteManager"
        v-bind:key="'favouriteScreen'"
        class="action"
        v-tooltip.top="calculateTooltip('Favourite Manager')"
        @click="actionClicked('favouriteScreen')"
      >
        <font-awesome-icon
          class="action-icon"
          :class="'heart-icon'"
          :icon="['fa', 'heart']"
        />
        <ProgressSpinner
          class="loading-spinner"
          v-if="showFavouriteManagerLoading"
        />
      </div>
      <div
        v-for="button of buttons"
        v-bind:key="button.action"
        class="action"
        v-tooltip.top="calculateTooltip(button.tooltip)"
        @click="actionClicked(button.action)"
      >
        <div
          v-if="button.icon.includes('.svg')"
          style="
            height: 28px;
            width: 28px;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="180"
            height="180"
            viewBox="0 0 180 180"
          >
            <image
              id="Background_copy"
              data-name="Background copy"
              x="22"
              y="19"
              width="135"
              height="102"
              xlink:href="data:img/png;base64,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"
            />
            <image
              id="icons8-upload-100"
              x="48"
              y="87"
              width="84"
              height="84"
              xlink:href="data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAABlUlEQVR4nO3cvU3DQByG8TfghoYhGIEqULBFNmACxBiIudwwAUJU0AdRIoIiGcmK+HB8r53/3T2PdKXP55/d2T5l0kU3yNAWci3pXdIVoGl9Y266AWpCu5igJvQbJqgj+g8T1D0aignqgPbFBPWPxmKC+kOpmKD2cmGCOgFm1ahTYVaJOjVmVahzYVaBOjdm0aiHwiwS9dCYRaFGwSwCNRpm1qhRMbNEjY6ZFWoumFmg5oYZGjVXTDtq45hE0qmk64Tjl5JuEtdwL6lNOP4k8fyhWhmeslWECzoKsIaiAtQcoOYANQeoOUDNAWoOUHOAmgPUHKDmADUHqDlAzQFqDlBzgJoD1Byg5gA1B6g5QM0Bag5Qc4CaA9QcoOYANQeoOUDNAWouCuhnkDmSiwL6apjjxTBHMW0/TX9K+Hr5UdJx7Yi7XUp6G4G5jrTR4CLAGvqdSbqVdD7gh4oPSQ+S7iQ9z7tMIiIiIiIiIiqlRbeTwpI7aqltOswQuyGUEO+UzAFqDlBzgJoD1Byg5prE3bion9R+AUAVm8thB56HAAAAAElFTkSuQmCC"
            />
          </svg>
        </div>

        <font-awesome-icon
          v-else-if="!('isSaving' in button) || button['isSaving'] === false"
          class="action-icon"
          :class="button.icon + '-icon'"
          :icon="['fa', button.icon]"
        />
        <ProgressSpinner v-else class="loading-spinner" />
      </div>
    </div>
    <!-- <favourite-manager></favourite-manager> -->

    <column-picker
      v-if="showColumnPicker"
      :upvise-data-message="upviseDataMessage"
      @columnsUpdated="actionClicked('columnLayoutUpdated')"
      @closeColumnPicker="closeColumnPicker"
    />

    <import-data-sidebar
      v-if="showImportData"
      :upvise-data-message="upviseDataMessage"
      :upload-response="uploadSuccessful"
      :custom-message="customImportMessage"
      @closeImportData="closeImportData"
      @saveToUpvise="saveToUpvise"
    />
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/global.scss";

.sticky {
  position: fixed;
  z-index: 3;
  background: #cfd5da;
  width: 600px;
  opacity: 0.8;
  border-radius: 20px;
  transition: all 1s ease;
}

.actions-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 15px, 0, 15px, 0;
  padding-top: 5px;
  padding-right: 10px;
  padding-bottom: 10px;
  padding-left: 10px;
  cursor: default;
  transition: all 1s ease;

  .actions-group {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1 1 0;
    height: 100%;
    &.left {
      border-radius: 8px 0 0 8px;
      justify-content: start;
    }

    &.right {
      border-radius: 0 8px 8px 0;
      justify-content: flex-end;
    }

    .action {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 48px;
      width: 48px;
      background-color: $white;
      box-shadow: 0 0 0 1px $grey5 inset;
      border-radius: 16px;
      margin: 0 8px;
      cursor: pointer;
      position: relative;

      &:last-child {
        margin-right: 0;
      }

      .loading-spinner {
        position: relative;
        height: 24px;
        width: 24px;
      }

      .action-icon {
        color: $grey3;
        position: absolute;
      }

      .save-icon {
        font-size: 16px;
      }

      .times-icon {
        font-size: 20px;
      }

      .pen-icon {
        font-size: 13px;
      }

      .paperclip-icon {
        color: $grey3;
      }

      .cloud-upload-alt-icon {
        color: $grey3;
        font-size: 16px;
      }

      .cloud-download-alt-icon {
        color: $grey3;
        font-size: 16px;
      }

      .exchange-alt-icon {
        color: $grey3;
      }

      .heart-icon {
        color: $grey3;
      }

      .sync-alt-icon {
        color: $grey3;
      }

      .check-circle-icon {
        color: $grey3;
        font-size: 16px;
      }

      .times-circle-icon {
        color: $grey3;
        font-size: 16px;
      }

      .paper-plane-icon {
        color: $grey3;
        font-size: 16px;
      }
    }
  }
}
</style>

<!--.header-item {
display: flex;
justify-content: center;
align-items: center;
flex: 1 1 0;
height: 100%;
padding: 8px;

&.left {
border-radius: 8px 0 0 8px;
justify-content: start;
}

&.right {
border-radius: 0 8px 8px 0;
justify-content: flex-end;
}
}-->
