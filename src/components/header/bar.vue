<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from "vue";
import OverlayPanel from "primevue/overlaypanel";
import ModulesPanel from "./modulesPanel.vue";
import { IModuleOption } from "../../store/modules/upvise.d";
import userData from "../../../cloudconLibrary/store/modules/userData/userDataAccess";
import { IUserDetails } from "../../../cloudconLibrary/store/modules/userData/userDataModule";
import { useRouter } from "vue-router";
import { tenantSelectionRoute } from "../../router/router";
import SearchBar from "../input/searchBar.vue";
import Dropdown from "primevue/dropdown";
import SquareIconButton from "./SquareIconButton.vue";

export const HeaderBar = /*#__PURE__*/ defineComponent({
  name: "HeaderBar",
  components: {
    OverlayPanel,
    ModulesPanel,
    SearchBar,
    Dropdown,
    SquareIconButton,
  },
  data() {
    return {
      selectedCity: null,
      cities: [
        { name: "New York", code: "NY" },
        { name: "Rome", code: "RM" },
        { name: "London", code: "LDN" },
        { name: "Istanbul", code: "IST" },
        { name: "Paris", code: "PRS" },
      ],
      icons: ["plus-circle", "pen", "cloud-download-alt"],
      MoreMenu: [
        { icon: "plus-circle", name: "Menu 1" },
        { icon: "plus-circle", name: "Menu 2" },
        { icon: "plus-circle", name: "Menu 3" },
        { icon: "plus-circle", name: "Menu 4" },
        { icon: "plus-circle", name: "Menu 5" },
      ],
    };
  },
  props: {
    modules: {
      type: Array as PropType<IModuleOption[]>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const modulesOverlayPanelRef = ref();
    const userOptionsOverlayPanelRef = ref();
    const MenuOverlayPanelRef = ref();

    const isLoggedIn = computed(() => {
      return userData.isAuthorized();
    });

    const userDetails = computed<IUserDetails>(() => {
      return userData.getUserDetails();
    });

    const userInitials = computed<string>(() => {
      return (
        userDetails.value.user?.name
          ?.split(" ")
          ?.filter((e) => e.length > 0)
          ?.slice(0, 3)
          ?.map((e) => e.charAt(0).toLocaleUpperCase())
          ?.join("") ?? ""
      );
    });

    function logInScreen() {
      router.push({ path: "login" });
    }

    function logOutScreen() {
      userData.customLogout();
      router.push({ path: "login" });
    }

    function toggleModulesOverlayPanel(event: Event) {
      modulesOverlayPanelRef.value.toggle(event);
    }

    function toggleUserOptionsOverlayPanel(event: Event) {
      userOptionsOverlayPanelRef.value.toggle(event);
    }

    function hideModulesOverlayPanel() {
      modulesOverlayPanelRef.value.hide();
    }

    function hideUserOptionsOverlayPanel() {
      userOptionsOverlayPanelRef.value.hide();
    }

    function updateSelectedModule(option: IModuleOption) {
      emit("updateSelectedModule", option);
    }

    function onUserOptionClick(option: string) {
      hideUserOptionsOverlayPanel();

      switch (option) {
        case "selectTenant":
          router.push({
            path: tenantSelectionRoute.path,
          });
          break;
        case "logout":
          logOutScreen();
          break;
      }
    }

    function toggleMenuOverlayPanel(event: Event) {
      MenuOverlayPanelRef.value.toggle(event);
    }

    watch(isLoggedIn, () => {
      console.log(isLoggedIn);
    });

    return {
      isLoggedIn,
      userInitials,
      logInScreen,
      logOutScreen,
      props,
      modulesOverlayPanelRef,
      userOptionsOverlayPanelRef,
      toggleModulesOverlayPanel,
      toggleUserOptionsOverlayPanel,
      hideModulesOverlayPanel,
      updateSelectedModule,
      onUserOptionClick,
      toggleMenuOverlayPanel,
      MenuOverlayPanelRef,
    };
  },
});
export default HeaderBar;
</script>

<template>
  <nav class="navbar is-fixed-top header-bar" role="navigation">
    <div class="navbar-brand">
      <div
        class="navbar-item menu-button-container is-clickable"
        @click="toggleModulesOverlayPanel($event)"
        v-if="isLoggedIn"
      >
        <font-awesome-icon class="menu-icon" :icon="['fa', 'bars']" />

        <OverlayPanel ref="modulesOverlayPanelRef" class="module-overlay">
          <ModulesPanel
            :modules="props.modules"
            @updateSelectedModule="updateSelectedModule"
            @closeModulesOverlayPanel="hideModulesOverlayPanel"
          />
        </OverlayPanel>
      </div>
      <a
        class="navbar-logo"
        @click="toggleModulesOverlayPanel($event)"
        v-if="isLoggedIn"
      >
        <img
          class=""
          alt="CloudconLogo"
          src="../../assets/icons/CloudconLogo.svg"
        />
      </a>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <ul class="p-d-flex p-align-center">
          <li v-for="item in icons" :key="item">
            <SquareIconButton :iconName="item" />
          </li>
          <li>
            <SquareIconButton
              iconName="ellipsis-v"
              @click="toggleMenuOverlayPanel($event)"
              v-if="isLoggedIn"
            >
            </SquareIconButton>
            <OverlayPanel ref="MenuOverlayPanelRef" class="menu-overflow">
              <ul class="more-menu-list">
                <li v-for="item in MoreMenu" :key="item.icon">
                  <SquareIconButton
                    :iconName="item.icon"
                    class="menu-more-link"
                  >
                    <template v-slot:iconWithName>
                      <div>{{ item.name }}</div>
                    </template>
                  </SquareIconButton>
                </li>
              </ul>
            </OverlayPanel>
          </li>
        </ul>
      </div>
      <div class="navbar-middle">
        <SearchBar class="navbar-search" />
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <Dropdown
            v-model="selectedCity"
            :options="cities"
            optionLabel="name"
            placeholder="Everyone (Test)"
            class="user-dropdown"
          />
        </div>
        <div class="navbar-item">
          <a><font-awesome-icon class="nav-icon" :icon="['fa', 'cog']" /></a>
        </div>
        <div class="navbar-item">
          <div class="buttons">
            <a
              v-if="isLoggedIn"
              class="user-icon"
              @click="toggleUserOptionsOverlayPanel($event)"
            >
              <font-awesome-icon class="nav-icon" :icon="['fa', 'user-alt']" />
              {{ userInitials }}
              <OverlayPanel
                ref="userOptionsOverlayPanelRef"
                class="user-overlay"
              >
                <div class="menu">
                  <ul class="menu-list">
                    <li @click="onUserOptionClick('selectTenant')">
                      <a>Switch Tenants</a>
                    </li>
                    <li @click="onUserOptionClick('logout')"><a>Logout</a></li>
                  </ul>
                </div>
              </OverlayPanel>
            </a>
            <a v-else class="button is-light" @click="logInScreen"> Log in </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style lang="scss">
.header-bar {
  background: var(--header-bar-background-colour);
  padding: 1rem;
  height: 4rem;

  .menu-button-container {
    .menu-icon {
      color: var(--header-bar-menu-icon-colour);
    }
  }

  .navbar-brand {
    min-height: auto;
    .navbar-item {
      padding: 5px;
      margin-right: 16px;
    }
    .navbar-logo {
      display: flex;
      margin-right: 16px;
      position: relative;

      &::after {
        content: "";
        width: 1px;
        height: 32px;
        background: var(--white);
        opacity: 0.2;
        position: absolute;
        right: -16px;
        top: -3px;
      }
    }
  }

  .navbar-menu {
    padding-left: 16px;
    .navbar-start {
      ul {
        li {
          margin-right: 16px;
          &:last-child {
            margin-right: 0;
          }
        }
      }
    }

    .navbar-middle {
      .navbar-search {
        background: rgba(0, 0, 0, 0.2);
        width: 488px;
        height: 32px;
        border-radius: 32px;
        .search-bar-input {
          font-size: 12px;
          line-height: 16px;
          color: #ffffff;
        }
        .search-bar-input::placeholder {
          color: #ffffff;
          opacity: 0.5;
        }
        .search-icon {
          color: var(--white);
          font-size: 18px;
        }
      }
    }

    .navbar-end {
      .user-dropdown {
        width: 100px;
        background: transparent;
        border: none;
        &.p-focus {
          box-shadow: none;
        }
        .p-inputtext {
          color: #ffffff;
          padding: 0;
          font-size: 12px;
          line-height: 16px;
        }
        .p-dropdown-trigger {
          color: #ffffff;
          width: 1rem;
        }
        .pi {
          font-size: 12px;
          line-height: 16px;
        }
      }

      .navbar-item {
        color: var(--white);
        margin-right: 20px;
        padding: 0;
        .nav-icon {
          color: var(--white);
        }
      }

      .user-icon {
        color: var(--white);
      }
    }
  }
}
.p-overlaypanel {
  &.module-overlay {
    padding: 25px 20px;
    margin-top: 30px;
    width: 272px;
    /* position: fixed !important;
  top: 64px !important; */
  }
}
</style>
