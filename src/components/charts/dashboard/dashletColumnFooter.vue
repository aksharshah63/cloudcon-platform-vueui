<script lang="ts">
import { defineComponent, ref, computed } from "vue";

export const DashletColumnFooter = /*#__PURE__*/ defineComponent({
  name: "DashletColumnFooter",
  setup(_, context) {
    const dragCounter = ref(0);
    const showIndicator = computed(() => dragCounter.value > 0);

    function dropHandler(event: DragEvent) {
      event.preventDefault();
      context.emit("dropped");
      dragCounter.value = 0;
    }

    function dragoverHandler(event: DragEvent) {
      event.preventDefault();
    }

    return {
      dropHandler,
      dragoverHandler,
      showIndicator,
      dragCounter,
    };
  },
});
export default DashletColumnFooter;
</script>

<template>
  <div
    class="columnEndDiv"
    @drop="dropHandler($event)"
    @dragover="dragoverHandler($event)"
    @dragenter="dragCounter += 1"
    @dragleave="dragCounter -= 1"
  >
    <div v-if="showIndicator" class="columnEndInsertIndicator" />
  </div>
</template>

<style lang="scss" scoped>


.columnEndDiv {
  min-height: 20px;
  height: 100%;
}
.columnEndInsertIndicator {
  background: $blue;
  border-radius: 5px;
  height: 10px;
  width: 100%;
}
</style>
