<script lang="ts">
import { defineComponent } from "vue";
import FileUpload from "primevue/fileupload";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
/* eslint-disable */
export const fileUpload = /*#__PURE__*/ defineComponent({
  name: "fileUpload",
  components: { FileUpload, Button },
  setup() {
    const toast = useToast();

    const onAdvancedUpload = () => {
      toast.add({
        severity: "info",
        summary: "Success",
        detail: "File Uploaded",
        life: 3000,
      });
    };

    return {
      onAdvancedUpload,
    };
  },
});
export default fileUpload;
</script>

<template>
  <div class="cm-file-upload">
    <FileUpload
      name="demo[]"
      url="./upload.php"
      @upload="onAdvancedUpload($event)"
      :multiple="true"
      accept="image/*"
      :maxFileSize="1000000"
      class=""
    >
      <template #empty>
        <font-awesome-icon :icon="['fa', 'image']" class="upload-img-icon" />
        <p>Drag & Drop or <span class="p-button-label">Browse</span></p>
      </template>
    </FileUpload>
  </div>
</template>

<style lang="scss" scoped>
.cm-file-upload {
  .p-fileupload {
    position: relative;
    display: flex;
    gap: 10px;
    flex-direction: column-reverse;
    justify-content: center;
    align-items: center;
    height: 200px;
    padding: 20px;
    border-radius: 10px;
    border: 2px dashed $blue;
    color: $grey6;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    background-color: rgba(0, 127, 255, 0.05);
    :deep(.p-fileupload-content) {
      background-color: transparent;
      border: none;
      color: $grey6;
      text-align: center;
      width: 100%;
    }
    :deep(.p-fileupload-files) {
      background-color: $white;
      padding: 10px;
    }
    :deep(.p-fileupload-row > div) {
      padding: 0;
      text-align: left;
      margin-right: 10px;
      &:first-child {
        width: auto;
      }
      &:last-child {
        text-align: right;
      }
    }
    .upload-img-icon {
      font-size: 40px;
      color: $blue;
    }
    :deep(.p-fileupload-buttonbar) {
      background-color: transparent;
      border: none;
    }
  }
}
</style>
