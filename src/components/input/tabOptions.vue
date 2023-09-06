<script lang="ts">
import { defineComponent, PropType } from "vue";

export const TabOptions = /*#__PURE__*/ defineComponent({
  name: "TabOptions",
  props: {
    tabOptions: {
      type: Array as PropType<Array<string>>,
      required: true,
    },
    currentTab: {
      type: String,
      required: false,
      default: "",
    },
  },
  setup(props, context) {
    function tabSelected(tab: string) {
      context.emit("tabSelected", tab);
    }

    return {
      props,
      tabSelected,
    };
  },
});
export default TabOptions;
</script>

<template>
  <div v-if="props.tabOptions.length > 0" class="tabs-group">
    <div
      v-for="(tab, index) in props.tabOptions"
      :key="index"
      class="tab"
      :class="{
        selected: props.tabOptions[index] === props.currentTab,
      }"
      @click="tabSelected(props.tabOptions[index])"
    >
      <div class="tab-wrapper">
        <span class="tab-text">{{ tab }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>


.tabs-group {
  display: flex;
  flex-wrap: wrap;
  flex: 1 1 auto;
  height: 44px;

  .tab {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $grey4;
    border-radius: 8px 8px 0 0;
    padding: 12px 12px 12px 12px;
    line-height: 12px;
    font-weight: 700;
    height: 100%;
    box-sizing: border-box;
    min-width: 90px;
    max-width: 140px;
    cursor: pointer;

    .tab-wrapper {
      overflow: hidden;

      .tab-text {
        white-space: nowrap;
        text-align: center;
      }
    }

    .tab-count {
      display: flex;
      align-items: center;
      background-color: $white;
      line-height: 16px;
      font-weight: 400;
      padding: 2px 8px;
      margin-left: 8px;
      border-radius: 8px;
    }

    &.selected {
      background-color: $white;

      .tab-count {
        background-color: $grey4;
        padding: 2px 8px;
      }
    }
  }
}
</style>
