<script lang="ts">
import { defineComponent } from "vue";
import SquareIconButton from "../header/SquareIconButton.vue";

export const HomeMenuPane = /*#__PURE__*/ defineComponent({
  name: "HomeMenuPane",
  components: { SquareIconButton },
  emits: ["toggleMenuExpand"],
  data() {
    return {
      active_menu: "1",
      moduleOptions: [
        {
          id: "home_id",
          path: "/",
          name: "Home",
          visible: true,
          menuItems: [
            {
              id: "1",
              path: "/",
              name: "Home",
              icon: "bell",
              visible: true,
            },
          ],
        },
      ],
    };
  },
  props: {
    isExpanded: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    function toggleSideBar() {
      emit("toggleMenuExpand", !props.isExpanded);
    }

    return {
      props,
      toggleSideBar,
    };
  },
});
export default HomeMenuPane;
</script>

<template>
  <div class="menu-toggler">
    <font-awesome-icon
      class="is-clickable"
      @click="toggleSideBar()"
      :icon="[
        'fa',
        props.isExpanded ? 'angle-double-left' : 'angle-double-right',
      ]"
    />
  </div>
  <div class="menu-pane">
    <div
      class="menu-header is-flex is-align-items-center"
      :class="{
        'is-justify-content-space-between': props.isExpanded,
        'is-justify-content-center': !props.isExpanded,
      }"
    >
      <span
        class="menu-title"
        :class="{
          hidden: !props.isExpanded,
        }"
        v-for="group in moduleOptions"
        :key="group.id"
        >{{ group.name }}</span
      >
    </div>
    <aside class="menu">
      <template v-for="group in moduleOptions" :key="group.id">
        <ul class="menu-list">
          <template v-for="item in group.menuItems" :key="item.id">
            <li v-if="item.visible" @click="active_menu = item.id">
              <router-link
                :to="item.path"
                class="is-flex menu-router-link"
                :class="{
                  'is-active': item.path == $route.path,
                }"
              >
                <SquareIconButton
                  :iconName="item.icon"
                  v-if="'icon' in item"
                  class="is-flex is-align-items-center"
                >
                  <template v-slot:iconWithName>
                    <div
                      v-if="props.isExpanded"
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
</template>

<style lang="scss" scoped></style>
