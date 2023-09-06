<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import Sidebar from "primevue/sidebar";

import ProgressSpinner from "primevue/progressspinner";
import { useState } from "../../store/index";
import useControllerProcessingProgress from "../../use/controller/workshop/processingProgress";
import utils from "../../use/function/useUtils";
import InputText from "primevue/inputtext";

export const ProcessingProgressEdit = defineComponent({
  name: "ProcessingProgressEdit",
  components: {
    Sidebar,
    ProgressSpinner,
    InputText
  },
  props: {
    processingId: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const upvise = useState().upvise;
    const controller = useControllerProcessingProgress(upvise);
    const showProcessingProgress = ref(true);
    const awaitingResponse = ref(false);
    const showSave = ref(false);
    const copyModelProcessing = controller.getEditProcessing(props.processingId)
    const originalProcessing = utils.deepCopy(copyModelProcessing);

    async function saveProcessingProgress() {
      awaitingResponse.value = true;

      await controller
        .doSaveProcessing([copyModelProcessing])
        .then(() => {
          awaitingResponse.value = false;
          closeProcessingProgress();
        })
        .catch(() => {
          awaitingResponse.value = false;
        });
    }

    function closeProcessingProgress() {
      showProcessingProgress.value = false;
      emit("closeEditScreen");
    }

    watch(
      [copyModelProcessing],
      utils.debounce(() => {
        showSave.value = !utils.equalObjects(
          copyModelProcessing,
          originalProcessing
        );
      }),
      { deep: true }
    );

    return {
      props,
      showProcessingProgress,
      awaitingResponse,
      copyModelProcessing,
      showSave,
      saveProcessingProgress,
      closeProcessingProgress,
    };
  },
});
export default ProcessingProgressEdit;
</script>

<template>
  <div>
    <sidebar
      class="processing-progress-screen"
      :visible="showProcessingProgress"
      position="right"
    >
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name"> Processing </span>
            </div>
          </div>
        </div>
        <div class="p-col-5 sidebar-options">
          <div class="loading-spinner" v-if="awaitingResponse">
            <ProgressSpinner class="spinner"></ProgressSpinner>
          </div>
          <div v-if="showSave" class="option" @click="saveProcessingProgress()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <div class="option" @click="closeProcessingProgress()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>

        <div class="p-col-12 divider"></div>

        <div class="p-col-3 input-label">Comments</div>
        <div class="p-col-9">
          <InputText
            class="input-text-field"
            type="text"
            v-model="copyModelProcessing.comments"
          >
          </InputText>
        </div>
      </div>
    </sidebar>
  </div>
</template>

<style scoped lang="scss">
</style>
