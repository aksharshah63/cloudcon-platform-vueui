<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import userData from "../../../cloudconLibrary/store/modules/userData/userDataAccess";
import { useRoute } from "vue-router";
import HomeMenuPane from "../pane/HomeMenuPane.vue";


export const HomeSidebar = /*#__PURE__*/ defineComponent({
  name: "HomeSidebar",
  components: {HomeMenuPane},
  setup() {
    const isLoggedIn = computed(() => {
      return userData.isAuthorized();
    });
    const isError = ref(false);
    const route = useRoute();
    watch([route], () => {
      isError.value = route.name === "Error" ? true : false;
    });
    const isMenuPaneExpanded = ref(true);

    function toggleMenuExpand(isExpanded: boolean) {
      isMenuPaneExpanded.value = isExpanded;
    }

    return {
      isMenuPaneExpanded,
      toggleMenuExpand,
      isLoggedIn,
      isError,
    };
  },
});
export default HomeSidebar;
</script>

<template>
  <nav
    v-if="isLoggedIn && !isError"
    class="left-pane-container"
    :class="{
      collapsed: !isMenuPaneExpanded,
    }"
  >
    <HomeMenuPane
      :isExpanded="isMenuPaneExpanded"
      @toggleMenuExpand="toggleMenuExpand"
    />
  </nav>
</template>

<style lang="scss" scoped></style>
