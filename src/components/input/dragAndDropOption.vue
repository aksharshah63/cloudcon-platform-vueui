<script lang="ts">
import { defineComponent } from "vue";

export const DragAndDropOption = /*#__PURE__*/ defineComponent({
  name: "DragAndDropOption",
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
  setup(props, context) {
    function onDrop(event: DragEvent) {
      event.preventDefault();
      console.log("on drop event", event);
      context.emit("dropped", props.id);
    }

    function onDragStart() {
      context.emit("dragged", props.id);
    }

    return {
      props,
      onDrop,
      onDragStart,
    };
  },
});
export default DragAndDropOption;
</script>

<template>
  <div
    class="drag-option"
    :draggable="true"
    @drop="onDrop($event)"
    @dragstart="onDragStart($event)"
  >
    <span>{{ label }}</span>
  </div>
</template>

<style lang="scss" scoped>


.drag-option {
  font-family: Poppins, serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $grey8;
  padding: 4px;
  border: 1px $black solid;
  border-radius: 14px;
  min-height: 28px;
}
</style>
