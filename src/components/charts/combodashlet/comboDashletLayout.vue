<script lang="ts">
import { defineComponent } from "vue";


export const ComboDashletLayout = /*#__PURE__*/ defineComponent({
  name: "ComboDashletLayout",
});

export default ComboDashletLayout;
</script>

<template>
  <div
    :style="{
      height: '100%',
      width: '100%',
      position: 'relative',
      display: 'flex',
      'flex-direction': 'column',
    }"
  >
    <div :style="{ 'flex-grow': '1' }" class="p-d-flex">
      <div class="p-d-flex p-as-stretch p-col-12" :style="{}">
        <div
          class="p-col-7 p-flex-column"
          :style="{ display: 'flex', 'flex-direction': 'column' }"
        >
          <div class="p-grid" :style="{ 'flex-grow': 1 }">
            <div class="p-col-6">
              <slot name="left" />
            </div>
            <div class="p-col-6 p-pr-0">
              <slot name="middle" />
            </div>
          </div>
          <div class="">
            <slot name="bottom-header"></slot>
            <slot name="bottom" />
          </div>
        </div>
        <div class="p-col-5 p-as-stretch">
          <slot name="right" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
