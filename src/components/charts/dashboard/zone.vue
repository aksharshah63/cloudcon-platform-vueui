<script lang="ts">
import { defineComponent, computed } from "vue";
import { Dashlet } from "./dashlet.vue";
import DashletColumnFooter from "./dashletColumnFooter.vue";
import useControllerDashboard from "../../../use/controller/dashboard/dashboard";
import { stateSymbol, useState } from "../../../store";

export const DropZone = /*#__PURE__*/ defineComponent({
  name: "DropZone",
  inject: [stateSymbol.description!],
  components: {
    Dashlet,
    DashletColumnFooter,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props, context) {
    const controller = useControllerDashboard(useState().upvise);
    const width = computed(() => controller.getDropZone(props.id).width);
    let dashlets = computed(() => controller.getLinkedDashletIds(props.id));

    function handleDrop(index: number) {
      context.emit("onDrop", index);
    }

    function handleDrag(dashletid: string) {
      context.emit("onDrag", dashletid);
    }

    function handleDraggingScroll(event: DragEvent) {
      context.emit("onDraggingScroll", event);
    }

    function handleDragendScroll() {
      context.emit("onDragendScroll");
    }

    return {
      handleDrop,
      handleDrag,
      handleDraggingScroll,
      handleDragendScroll,
      width,
      dashlets,
    };
  },
});
export default DropZone;
</script>

<template>
  <div :class="['p-col-' + width, 'p-p-2']">
    <div class="dashletColumn">
      <!-- direct drag events for scroll only  -->
      <dashlet
        class="dashlet"
        v-for="(dashletid, index) in dashlets"
        :key="dashletid"
        :id="dashletid"
        @dropped="handleDrop(index)"
        @dragged="handleDrag(dashletid)"
        @drag="handleDraggingScroll($event)"
        @dragend="handleDragendScroll()"
      />

      <!-- allow adding to end of/empty columns -->
      <dashlet-column-footer @dropped="handleDrop(dashlets.length)" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashlet {
  margin: 15px 0px 15px 0px;
}
.dashletColumn {
  border-radius: 25px;
  background: #f2f2f2;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0px 15px 0px 15px;
}
</style>
