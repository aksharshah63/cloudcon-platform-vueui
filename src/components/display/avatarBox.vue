<script lang="ts">
import { computed, defineComponent } from "vue";

export const AvatarBox = /*#__PURE__*/ defineComponent({
  name: "AvatarBox",
  props: {
    name: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    small: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const initials = computed(() => {
      var names = props.name.split(" "),
        nameInitials = names[0].substring(0, 1).toUpperCase();

      if (names.length > 1) {
        nameInitials += names[names.length - 1].substring(0, 1).toUpperCase();
      }
      return nameInitials;
    });

    const getStyle = computed(() => {
      if (props.image.length > 0) {
        return { background: `url(${props.image})` };
      }
      return {};
    });
    return { initials, getStyle };
  },
});
export default AvatarBox;
</script>

<template>
  <div class="avatar-box" :style="getStyle" :class="small ? 'small-box' : ''">
    <span>{{ initials || "-" }}</span>
  </div>
</template>

<style scoped lang="scss">


.avatar-box {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 10px;
  line-height: 120%;
  text-align: center;
  text-transform: uppercase;
  min-width: 32px;
  min-height: 32px;
  width: 32px;
  height: 32px;
  background-color: #ffffff;
  border: 1px solid #cccccc;
  box-sizing: border-box;
  border-radius: 12px;

  &.small-box {
    min-width: 24px;
    min-height: 24px;
    width: 24px;
    height: 24px;
    border-radius: 8px;
  }
}
</style>
