<script lang="ts">
import { defineComponent } from "vue";
export const SquareIconButton = /*#__PURE__*/ defineComponent({
  name: "SquareIconButton",
  components: {},
  props: {
    iconName: String,
  },
});
export default SquareIconButton;
</script>

<template>
  <a class="menu-icon-link">
    <span class="icon-wrap"
      ><font-awesome-icon class="menu-icon" :icon="['fa', iconName]"
    /></span>
    <slot name="iconWithName"></slot>
  </a>
</template>

<style lang="scss" scoped>
.menu-icon-link {
  .icon-wrap {
    display: inline-block;
    color: var(--primary-colour);
    width: 24px;
    height: 24px;
    background: var(--white);
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    .menu-icon {
      font-size: 12px;
    }
  }
  &:hover {
    color: var(--primary-colour);
  }
  &.md-icon-link {
    .icon-wrap {
      width: 32px;
      height: 32px;
      border-radius: 12px;
      .menu-icon {
        font-size: 16px;
      }
    }
  }
  &.large-icon-link {
    .icon-wrap {
      width: 48px;
      height: 48px;
      background: $white;
      color: $grey3;
      border: 1px solid $grey5;
      border-radius: 16px;
      .menu-icon {
        font-size: 16px;
      }
    }
  }
}
</style>
