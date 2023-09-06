<script lang="ts">
import { defineComponent } from "vue";

export const SubHeaderAction = /*#__PURE__*/ defineComponent({
  name: "SubHeaderAction",
  components: {},
});
export default SubHeaderAction;
</script>

<template>
  <div class="actions-list">
    <div class="actions-group left">
      <slot name="actionsLeft"></slot>
    </div>
    <div class="actions-group">
      <slot name="actionsMiddle"></slot>
    </div>
    <div class="actions-group right">
      <slot name="actionsRight"></slot>
    </div>
  </div>
</template>

<style lang="scss">
.actions-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 15px, 0, 15px, 0;
  cursor: default;
  transition: all 1s ease;
  margin-bottom: 15px;

  .actions-group {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1 1 0;
    height: 100%;
    &.left {
      border-radius: 8px 0 0 8px;
      justify-content: start;
      font-weight: 600;
      font-size: 32px;
      line-height: 120%;
      color: $grey3;
      flex-direction: column;
      align-items: start;
    }

    &.right {
      border-radius: 0 8px 8px 0;
      justify-content: flex-end;
    }

    .action {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 48px;
      width: 48px;
      background-color: $white;
      box-shadow: 0 0 0 1px $grey5 inset;
      border-radius: 16px;
      margin: 0 8px;
      cursor: pointer;
      position: relative;

      &:last-child {
        margin-right: 0;
      }

      .loading-spinner {
        position: relative;
        height: 24px;
        width: 24px;
      }

      .action-icon {
        color: $grey3;
      }
    }
  }
}
</style>
