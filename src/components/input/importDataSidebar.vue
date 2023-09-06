<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
import { IUpviseDataMessage } from "../../store/modules/upvise.d";
import Sidebar from "primevue/sidebar";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import FileUpload from "primevue/fileupload";
import ProgressSpinner from "primevue/progressspinner";
import PapaParse from "papaparse";
import { processImportData } from "../../use/function/processImportData";
import { stateSymbol, useState } from "../../store/index";

export const ImportDataSidebar = /*#__PURE__*/ defineComponent({
  name: "ImportDataSidebar",
  inject: [stateSymbol.description!],
  components: {
    Sidebar,
    Accordion,
    AccordionTab,
    FileUpload,
    ProgressSpinner,
  },
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
    uploadResponse: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    customMessage: {
      type: String,
      required: false,
    },
  },
  setup(props, { emit }) {
    const state = useState();
    const uploadResponse = computed(() => props.uploadResponse);
    const showSidebar = ref(true);
    const parsedFile = ref();
    const parsingStarted = ref(false);
    const parsingComplete = ref(false);
    const preprocessingComplete = ref(false);
    const preprocessingResponse = ref();
    const preprocessingSuccessful = ref(false);
    const uploadComplete = ref(false);
    const uploadSuccessful = ref(false);

    const config = {
      complete: function (results: any) {
        parsedFile.value = results.data;
      },
    };

    function closeImportData() {
      showSidebar.value = false;
      emit("closeImportData");
    }

    function uploadFile(event: any) {
      clearFile();
      parsingStarted.value = true;
      PapaParse.parse(event.files[0], config);
    }

    function clearFile() {
      parsedFile.value = null;
      parsingStarted.value = false;
      parsingComplete.value = false;
      preprocessingComplete.value = false;
      preprocessingResponse.value = undefined;
      preprocessingSuccessful.value = false;
      uploadComplete.value = false;
      uploadSuccessful.value = false;
    }

    watch(parsedFile, () => {
      if (parsedFile.value) {
        parsingComplete.value = true;
        preprocessingComplete.value = false;
        processImportData(
          props.upviseDataMessage,
          state.upvise,
          parsedFile.value
        ).then((response) => (preprocessingResponse.value = response));
      }
    });

    watch(preprocessingResponse, () => {
      if (preprocessingResponse.value) {
        preprocessingComplete.value = true;
        if (preprocessingResponse.value[0]) {
          preprocessingSuccessful.value = true;
          // Commenting out the upvise save for now
          emit("saveToUpvise", preprocessingResponse.value[1]);
          //console.log("Saving to Upvise: ", preprocessingResponse.value[1]);
        } else {
          preprocessingSuccessful.value = false;
        }
      }
    });

    watch(uploadResponse, () => {
      if (typeof uploadResponse.value === "undefined") {
        uploadComplete.value = false;
        uploadSuccessful.value = false;
      } else {
        uploadComplete.value = true;
        uploadSuccessful.value = uploadResponse.value;
      }
    });

    function forceSingleFileUpload(event: any) {
      if (event.files.length > 1) {
        event.files.shift();
        clearFile();
      }
    }

    return {
      showSidebar,
      parsingStarted,
      parsingComplete,
      preprocessingComplete,
      preprocessingResponse,
      preprocessingSuccessful,
      uploadComplete,
      uploadSuccessful,
      closeImportData,
      uploadFile,
      clearFile,
      forceSingleFileUpload,
    };
  },
});

export default ImportDataSidebar;
</script>

<template>
  <div>
    <Sidebar class="milestone-screen" :visible="showSidebar" position="right">
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name">Import Data</span>
            </div>
          </div>
        </div>

        <div class="p-col-5 sidebar-options">
          <div class="option" @click="closeImportData()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>
      </div>

      <!-- Just added this as a usability feature. Will need updating. -->
      <Accordion>
        <AccordionTab header="Help getting started">
          <p>
            The file type you upload must be a CSV type. If there are any typos
            your upload will be rejected. If your file fails for whatever reason
            a download should begin, this file will contain your data as well as
            all the errors found. Please note: Only one file can be uploaded at
            a time.
          </p>
          <p>Here's some quick points to get you started:</p>
          <ul>
            <li>
              Use the export feature first to get an idea of how your data
              should look
            </li>
            <li>Your file must be a CSV</li>
            <li>Make sure the id field is the first column</li>
            <li>Leave the id field empty if you are adding a new item</li>
            <li>
              When you're not on the catalogue screen: ensure any catalogue
              items exist before attempting to use them.
            </li>
            <li>
              When adding a new item to the catalogue the name field cannot
              contain a semicolon (;)
            </li>
          </ul>
        </AccordionTab>
      </Accordion>

      <FileUpload
        name="uploads[]"
        accept=".csv"
        :customUpload="true"
        :multiple="false"
        :showCancelButton="false"
        @uploader="uploadFile"
        @clear="clearFile"
        @remove="clearFile"
        @select="forceSingleFileUpload($event)"
      >
        <template #empty>
          <p>Drag and drop files here to upload</p>
        </template>
      </FileUpload>
      <div v-show="customMessage" class="p-grid sidebar-grid">
        <div class="p-col-12">{{ customMessage }}</div>
      </div>

      <div v-show="parsingStarted" class="p-grid sidebar-grid">
        <div class="p-col-3"></div>
        <div class="p-col-1">
          <div>
            <font-awesome-icon
              v-if="parsingComplete"
              class="complete-icon"
              :icon="['fa', 'check-circle']"
            />
            <progress-spinner v-else class="spinner" strokeWidth="8" />
          </div>
        </div>
        <div class="p-col-8">
          <div class="input-label">File imported</div>
        </div>

        <div class="p-col-3"></div>
        <div class="p-col-1">
          <div>
            <font-awesome-icon
              v-if="preprocessingSuccessful && preprocessingComplete"
              class="complete-icon"
              :icon="['fa', 'check-circle']"
            />
            <progress-spinner
              v-else-if="parsingComplete && !preprocessingComplete"
              class="spinner"
              strokeWidth="8"
            />
            <font-awesome-icon
              v-else-if="!preprocessingSuccessful && preprocessingComplete"
              class="failed-icon"
              :icon="['fa', 'times-circle']"
            />
          </div>
        </div>
        <div class="p-col-8">
          <div class="input-label">File Preprocessed</div>
        </div>

        <div class="p-col-3"></div>
        <div class="p-col-1">
          <div>
            <font-awesome-icon
              v-if="uploadSuccessful && uploadComplete"
              class="complete-icon"
              :icon="['fa', 'check-circle']"
            />
            <progress-spinner
              v-else-if="preprocessingSuccessful && !uploadComplete"
              class="spinner"
              strokeWidth="8"
            />
            <font-awesome-icon
              v-else-if="!uploadSuccessful && uploadComplete"
              class="failed-icon"
              :icon="['fa', 'times-circle']"
            />
          </div>
        </div>
        <div class="p-col-8">
          <div class="input-label">File Uploaded</div>
        </div>
      </div>

      <span v-show="parsingComplete">
        <div v-if="!preprocessingComplete">
          Your file is being preprocessed, please do not close this screen. This
          may take a while depending on the size of your file.
        </div>
        <div v-if="preprocessingComplete">
          <div v-if="!preprocessingSuccessful">
            File failed to preprocess. A file should have downloaded with errors
            logged. Please correct your file before attempting to import again.
          </div>
          <div v-if="!uploadComplete">
            Your file is now being uploaded to Upvise, please do not close this
            screen. This may take a while depending on the size of your file.
          </div>
        </div>
        <div v-if="uploadComplete">
          <div v-if="!uploadSuccessful">
            File failed to upload. Please check your internet settings. Contact
            support if this issue persists.
          </div>
          <div v-else>
            Upload has completed. It is now safe to close this panel.
          </div>
        </div>
      </span>
    </Sidebar>
  </div>
</template>

<style scoped>


.spinner {
  width: 20px;
  height: 20px;
  float: left;
  margin-right: 10px;
}

.complete-icon {
  width: 20px;
  height: 20px;
  float: left;
  margin-right: 10px;
  color: #61e24b;
}

.failed-icon {
  width: 20px;
  height: 20px;
  float: left;
  margin-right: 10px;
  color: #f14d29;
}
</style>
