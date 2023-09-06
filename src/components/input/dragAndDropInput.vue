<script lang="ts">
import { defineComponent } from "vue";

export const DragAndDropInput = /*#__PURE__*/ defineComponent({
  name: "DragAndDropInput",
  components: {},
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    function onDragEnter(event: DragEvent) {
      event.preventDefault();
    }

    function onDragOver(event: DragEvent) {
      event.preventDefault();
      console.log("dragged over onto target", event);
    }

    function onDrop(event: DragEvent) {
      event.preventDefault();
      console.log("dropped onto target", event);
    }

    return {
      props,
      onDragEnter,
      onDragOver,
      onDrop,
    };
  },
});
export default DragAndDropInput;
</script>

<template>
  <div
    @dragenter="onDragEnter($event)"
    @dragover="onDragOver($event)"
    @drop="onDrop($event)"
  >
    <span>{{ label }}</span>
  </div>
</template>

<style lang="scss" scoped>

</style>
