<script lang="ts">
import { defineComponent, computed, ref, watch } from "vue";
import userData from "../../../cloudconLibrary/store/modules/userData/userDataAccess";
import { RouteLocationNormalizedLoaded, useRoute } from "vue-router";
import SquareIconButton from "../header/SquareIconButton.vue";
import { menuOptions } from "./menuOptions";

export const MenuSidebar = /*#__PURE__*/ defineComponent({
  name: "MenuSidebar",
  components: { SquareIconButton },
  props: {
    panel: {
      type: String,
    },
  },
  setup(props) {
    const { menus } = menuOptions;
    const isLoggedIn = computed(() => {
      return userData.isAuthorized();
    });
    const isError = ref(false);
    const route = useRoute();
    watch([route], () => {
      isError.value = route.name === "Error" ? true : false;
    });
    const isMenuPaneExpanded = ref(true);

    function toggleSideBar() {
      isMenuPaneExpanded.value = !isMenuPaneExpanded.value;
    }

    function isActiveClass(
      item: Record<string, string>,
      route: RouteLocationNormalizedLoaded
    ) {
      const routesWithChild = ["form_template"];
      if (!routesWithChild.includes(props.panel as string)) {
        return (
          item.path == route.path ||
          item.path.split("/")[1] == route.path.split("/")[1]
        );
      }

      const alias = route.path.split("/")[2];

      if (item.name === "All") {
        return [undefined, "add", "view", "edit"].includes(alias);
      } else {
        return item.alias == alias;
      }
    }

    return {
      isMenuPaneExpanded,
      isLoggedIn,
      isError,
      props,
      toggleSideBar,
      isActiveClass,
      menus,
    };
  },
});
export default MenuSidebar;
</script>

<template>
  <nav
    v-if="isLoggedIn && !isError"
    class="left-pane-container"
    :class="{
      collapsed: !isMenuPaneExpanded,
    }"
  >
    <div class="menu-toggler">
      <font-awesome-icon
        class="is-clickable"
        @click="toggleSideBar()"
        :icon="[
          'fa',
          isMenuPaneExpanded ? 'angle-double-left' : 'angle-double-right',
        ]"
      />
    </div>
    <div class="menu-pane">
      <div
        class="menu-header is-flex is-align-items-center"
        :class="{
          'is-justify-content-space-between': isMenuPaneExpanded,
          'is-justify-content-center': !isMenuPaneExpanded,
        }"
      >
        <span
          class="menu-title"
          :class="{
            hidden: !isMenuPaneExpanded,
          }"
          v-for="group in menus[props.panel].moduleOptions"
          :key="group.id"
          >{{ group.name }}</span
        >
      </div>
      <aside class="menu">
        <template
          v-for="group in menus[props.panel].moduleOptions"
          :key="group.id"
        >
          <ul class="menu-list">
            <template v-for="item in group.menuItems" :key="item.id">
              <li
                v-if="item.visible"
                @click="menus[props.panel].active_menu = item.id"
              >
                <router-link
                  :to="item.path"
                  class="is-flex menu-router-link"
                  :class="{
                    'is-active': isActiveClass(item, $route),
                  }"
                >
                  <SquareIconButton
                    :iconName="item.icon"
                    v-if="'icon' in item"
                    class="is-flex is-align-items-center"
                  >
                    <template v-slot:iconWithName>
                      <div
                        v-if="isMenuPaneExpanded"
                        class="
                          menu-item-label
                          is-flex
                          is-align-items-center
                          is-justify-content-space-between
                          is-clipped
                        "
                      >
                        {{ item.name }}
                        <!-- <span class="menu-item-count">20</span> -->
                      </div>
                    </template>
                  </SquareIconButton>
                </router-link>
              </li>
            </template>
          </ul>
        </template>
      </aside>
      <div class="menu-divider"></div>
    </div>
  </nav>
</template>

<style lang="scss" scoped></style>
