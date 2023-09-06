<script lang="ts">
import { defineComponent } from "vue";


export const FilterBuilder = /*#__PURE__*/ defineComponent({
  name: "FilterBuilder",
  setup() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function resizeTextArea(event: any) {
      const textarea = event.currentTarget;

      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight - 8 + "px";
      }
    }

    return {
      resizeTextArea,
    };
  },
});

export default FilterBuilder;
</script>

<template>
  <div>
    <div class="filter">
      <font-awesome-icon class="filter-icon" :icon="['fa', 'filter']" />
      <span> FILTER </span>

      <textarea
        class="filter-textarea"
        rows="1"
        @input="resizeTextArea($event)"
      ></textarea>
    </div>
  </div>
</template>

<style lang="scss" scoped>


.filter {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-weight: 700;
  font-size: 8px;

  .filter-icon {
    color: $grey7;
    font-size: 10px;
    margin-right: 7px;
  }

  .filter-textarea {
    display: flex;
    flex: 1 1 auto;
    resize: none;
    height: 15px;
    margin-left: 12px;
    color: $grey3;
    background-color: $grey;
    border-radius: 12px;
    border: none;
    outline: none;
    padding: 4px 16px 4px 16px;
  }
}
</style>
