<script lang="ts">
import ProgressSpinner from "primevue/progressspinner";
import Sidebar from "primevue/sidebar";
import { computed, defineComponent } from "vue";
import { ClaimsType } from "../../../cloudconLibrary/utilities/useConstants";

export const EditSidebar = /*#__PURE__*/ defineComponent({
  name: "EditSidebar",
  emits: ["save", "delete", "closeSidebar"],
  components: {
    ProgressSpinner,
    Sidebar,
  },
  props: {
    moduleName: {
      type: String,
      required: true,
    },
    showSidebar: {
      type: Boolean,
      required: true,
    },
    saveButton: {
      type: Boolean,
      required: false,
      default: true,
    },
    deleteButton: {
      type: Boolean,
      required: false,
      default: true,
    },
    width: {
      type: String,
      required: false,
      default: "500px",
    },
    title: {
      type: String,
      required: false,
      default: "",
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    isUpdating: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props, { emit }) {
    const claimsAvailable = computed(() => {
      return {
        create: ClaimsType.RESTRICTED,
        read: ClaimsType.RESTRICTED,
        update: ClaimsType.RESTRICTED,
        delete: ClaimsType.RESTRICTED,
      };
    });

    const enableSaveButton = computed(() => {
      return (
        (claimsAvailable.value.update as ClaimsType) > ClaimsType.RESTRICTED &&
        props.saveButton &&
        !props.isUpdating
      );
    });

    const enableDeleteButton = computed(() => {
      return (
        (claimsAvailable.value.delete as ClaimsType) > ClaimsType.RESTRICTED &&
        props.deleteButton &&
        !props.isUpdating
      );
    });

    const sideBarStyle = computed(() => {
      return { width: props.width };
    });

    function onSave() {
      emit("save");
    }

    function onDelete() {
      emit("delete");
    }

    function closeSidebar() {
      emit("closeSidebar");
    }

    return {
      enableSaveButton,
      enableDeleteButton,
      sideBarStyle,
      onSave,
      onDelete,
      closeSidebar,
    };
  },
});
export default EditSidebar;
</script>

<template>
  <Sidebar
    class="edit-sidebar"
    :style="sideBarStyle"
    :visible="showSidebar"
    position="right"
  >
    <div class="level edit-sidebar-header p-4 m-0 is-align-items-flex-start">
      <div class="level-left is-flex-shrink-1">
        <div
          class="
            level-item
            is-flex-shrink-1 is-flex-direction-column is-align-items-flex-start
          "
        >
          <h4 v-if="title" class="title is-4 is-spaced">{{ title }}</h4>
          <h6 v-if="description" class="subtitle is-6">{{ description }}</h6>
        </div>
      </div>

      <div class="level-right edit-sidebar-header-right-container">
        <div
          class="level-item edit-sidebar-loading-spinner-container"
          v-if="isUpdating"
        >
          <ProgressSpinner
            class="edit-sidebar-loading-spinner"
          ></ProgressSpinner>
        </div>
        <div
          v-if="enableSaveButton"
          class="
            level-item
            edit-sidebar-option
            is-flex is-justify-content-center is-align-items-center is-clickable
          "
          @click="onSave"
        >
          <font-awesome-icon
            class="edit-sidebar-save-icon"
            :icon="['fa', 'save']"
          />
        </div>
        <div
          v-if="enableDeleteButton"
          class="
            level-item
            edit-sidebar-option
            is-flex is-justify-content-center is-align-items-center is-clickable
          "
          @click="onDelete"
        >
          <font-awesome-icon
            class="edit-sidebar-delete-icon"
            :icon="['fa', 'trash']"
          />
        </div>
        <div
          class="
            level-item
            edit-sidebar-option
            is-flex is-justify-content-center is-align-items-center is-clickable
          "
          @click="closeSidebar()"
        >
          <font-awesome-icon
            class="edit-sidebar-close-icon"
            :icon="['fa', 'times']"
          />
        </div>
      </div>
    </div>

    <div class="edit-sidebar-body p-4">
      <slot name="body"></slot>
    </div>
  </Sidebar>
</template>

<style lang="scss" scoped>
.p-sidebar.edit-sidebar {
  .edit-sidebar-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: var(--edit-sidebar-header-background);
    border-bottom: var(--edit-sidebar-header-bottom-border);

    .edit-sidebar-header-right-container {
      .edit-sidebar-loading-spinner-container {
        .edit-sidebar-loading-spinner {
          height: var(--edit-sidebar-loading-spinner-height);
          width: var(--edit-sidebar-loading-spinner-width);
        }
      }

      .edit-sidebar-option {
        border-radius: var(--edit-sidebar-header-options-border-radius);
        border: var(--edit-sidebar-header-options-border);
        height: var(--edit-sidebar-header-options-height);
        width: var(--edit-sidebar-header-options-width);

        .edit-sidebar-save-icon {
          font-size: var(--edit-sidebar-header-options-save-icon-font-size);
          color: var(--edit-sidebar-header-options-icon-colour);
        }

        .edit-sidebar-delete-icon {
          font-size: var(--edit-sidebar-header-options-delete-icon-font-size);
          color: var(--edit-sidebar-header-options-icon-colour);
        }

        .edit-sidebar-close-icon {
          font-size: var(--edit-sidebar-header-options-close-icon-font-size);
          color: var(--edit-sidebar-header-options-icon-colour);
        }
      }
    }
  }
}
</style>
