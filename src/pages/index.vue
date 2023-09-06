<script lang="ts">
/* eslint-disable */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { computed, defineComponent, onMounted, ref } from "vue";
import { useState } from "../store/index";
import "../assets/styles/global.scss";
/*import { _populateLocalForage } from "../store/mock/_populateLocalForage";*/
import app from "../../serve/app";
import HeaderBar from "../components/header/bar.vue";
import MenuPane from "../components/pane/menuPane.vue";
import { IModuleOption } from "../store/modules/upvise.d";
import userData from "../../cloudconLibrary/store/modules/userData/userDataAccess";
import { useRoute } from "vue-router";
import useControllerIndex from "@/use/controller/indexController";
import Toast from "primevue/toast";
import moduleManagementAccess from "../../cloudconLibrary/store/modules/moduleManagementData/moduleManagementAccess";
import useCookies from "../../cloudconLibrary/utilities/useCookies";
import { cookieKeys } from "../../cloudconLibrary/utilities/useConstants";

export const Index = /*#__PURE__*/ defineComponent({
  name: "index",
  components: {
    HeaderBar,
    MenuPane,
    Toast,
  },
  setup() {
    const isLoggedIn = computed(() => {
      return userData.isAuthorized();
    });
    const isError = ref(false);
    const route = useRoute();
    const controller = useControllerIndex();
    const upviseElement = document.getElementById("one");
    const headerElement = document
      .getElementsByTagName("head")[0]
      .getElementsByTagName("title")[0];
    const kuiElement = document.getElementById("kui");
    const selectedModule = ref<IModuleOption>();
    const modules = computed<IModuleOption[]>(() => {
      return controller.getModuleOptions();
    });

    const usesHeader = computed(() => {
      const result = route.name != "Login";
      if (!result) {
        (
          document.getElementsByClassName(
            "has-navbar-fixed-top"
          )[0] as HTMLElement
        ).style.paddingTop = "0";
      } else {
        (
          document.getElementsByClassName(
            "has-navbar-fixed-top"
          )[0] as HTMLElement
        ).style.paddingTop = "0rem";
      }
      return result;
    });

    const observer = new MutationObserver(disconnectDatahub);

    function disconnectDatahub() {
      if (!document.body.contains(kuiElement)) {
        disconnect();
      }
    }

    window.addEventListener("beforeunload", disconnect);

    function disconnect() {
      console.log("DISCONNECTING THE OBSERVER.");
      // upvise?.disconnectDataHub();
      unmountApp();
      stopObservers();
      console.log("Test we need to redploy quite sad");
    }

    function stopObservers() {
      observer.disconnect();
      window.removeEventListener("beforeunload", disconnect);
    }

    function unmountApp() {
      console.log("UNMOUNTING APP");
      app.unmount();
    }

    function updateSelectedModule(option: IModuleOption) {
      selectedModule.value = option;
    }

    onMounted(() => {
      if (upviseElement && headerElement) {
        console.log("Observers started...");
        observer.observe(upviseElement, { childList: true });
        observer.observe(headerElement, { childList: true });
      }

      selectedModule.value = modules.value.find((m) => m.path === route.path);

      const currentTenant = Number(useCookies.get(cookieKeys.TENANT_ID));
      if (currentTenant)
        moduleManagementAccess.setSelectedTenant(currentTenant);
    });

    return {
      isLoggedIn,
      currentPage: useState().upvise.upvisePage,
      modules,
      updateSelectedModule,
      isError,
      usesHeader,
    };
  },
});
export default Index;
</script>

<template>
  <div class="screen-container">
    <HeaderBar
      v-if="usesHeader"
      :modules="modules"
      @updateSelectedModule="updateSelectedModule"
    />

    <div
      class="main-view-container"
      :style="[
        $route.path == '/login'
          ? { paddingTop: '0rem' }
          : { paddingTop: '4rem' },
      ]"
    >
      <div class="body-container">
        <router-view />
      </div>
    </div>
  </div>
  <Toast />
</template>

<style lang="scss">
.screen-container {
  font-family: "Poppins";
  font-style: normal;
  font-weight: normal;
  display: flex;
  flex-direction: column;
  height: 100vh;

  .main-view-container {
    display: flex;
    height: 100%;

    .left-pane-container {
      flex: none;
      width: var(--menu-pane-expanded-width);
      overflow-x: hidden;
      overflow-y: auto;
      transition: all 0.1s ease-out;
      height: 100%;
      padding: 10px 0;
      position: fixed;

      &.collapsed {
        width: var(--menu-pane-collapsed-width);
        & + .dashboard-wrapper {
          margin-left: 48px;
          transition: all 0.1s ease-out;
        }
      }
      & + .dashboard-wrapper {
        margin-left: 208px;
        transition: all 0.1s ease-out;
      }
    }

    .body-container {
      flex: 1;
      height: 100%;
      background-color: var(--grey-1700);
      overflow-x: hidden;
      overflow-y: hidden;
      display: flex;
      .dashboard-wrapper {
        padding: 25px;
        flex: 1;
        height: 100%;
        overflow-y: auto;
      }
    }
  }
}
</style>
