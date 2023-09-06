<script lang="ts">
import { defineComponent } from "vue";
import MenuSidebar from "@/components/sidebar/MenuSidebar.vue";

/* eslint-disable */
export const Forms = /*#__PURE__*/ defineComponent({
  name: "Forms",
  components: {
    MenuSidebar,
  },
  setup() {},
});
export default Forms;
</script>
<template>
  <MenuSidebar panel="form_template" />
  <router-view />
</template>
<style lang="scss"></style>
