<script lang="ts">
import { IMenuItem, IModuleOption } from "../../store/modules/upvise.d";
import { computed, defineComponent, PropType } from "vue";
import { useRouter } from "vue-router";

export const MenuPane = /*#__PURE__*/ defineComponent({
  name: "MenuPane",
  components: {},
  data() {
    return {
      active_menu: "1",
    };
  },
  props: {
    selectedMenuItem: {
      type: Object as PropType<IMenuItem>,
    },
    selectedModule: {
      type: Object as PropType<IModuleOption>,
    },
    isExpanded: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const router = useRouter();

    const moduleMenuGroups = computed(() => {
      return props.selectedModule?.menuGroups ?? [];
    });

    function updateSelectedMenuItem(menuItem: IMenuItem) {
      emit("updateSelectedMenuItem", menuItem);
    }

    function navigateToPage(menuItem: IMenuItem) {
      router.push({
        path: (props.selectedModule?.path ?? "") + menuItem.path,
      });

      updateSelectedMenuItem(menuItem);
    }

    function toggleSideBar() {
      emit("toggleMenuExpand", !props.isExpanded);
    }

    return {
      props,
      moduleMenuGroups,
      navigateToPage,
      toggleSideBar,
    };
  },
});
export default MenuPane;
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
        >{{ props.selectedModule?.name }}</span
      >
    </div>
    <aside class="menu">
      <template v-for="group in moduleMenuGroups" :key="group.id">
        <!-- <div v-if="i !== 0" class="menu-group-seperator"/> -->
        <ul class="menu-list">
          <!-- <template v-for="(item,index) in group.menuItems" :key="index">
            <li v-if="item.visible" @click="active_menu = item.id">
              <router-link :to="item.path"> -->
          <template v-for="item in group.menuItems" :key="item.id">
            <li v-if="item.visible" @click="active_menu = item.id">
              <router-link
                :to="item.path"
                class="is-flex"
                :class="{
                  'is-active':
                    item.path.split('/')[1] == $route.path.split('/')[1],
                }"
              >
                <div
                  class="
                    menu-item-icon-container
                    is-flex is-align-items-center is-justify-content-center
                  "
                >
                  <font-awesome-icon
                    v-if="'icon' in item"
                    class="menu-item-icon"
                    :icon="['fa', item.icon]"
                  />
                </div>

                <span
                  v-if="props.isExpanded"
                  class="
                    menu-item-label
                    is-flex is-align-items-center is-clipped
                  "
                >
                  {{ item.name }}
                </span>
              </router-link>
            </li>
          </template>
        </ul>
      </template>
    </aside>
    <div class="menu-divider"></div>
  </div>
</template>

<style lang="scss" scoped>
.menu-toggler {
  width: 30px;
  height: 30px;
  margin-left: auto;
  margin-right: 10px;
  margin-bottom: 10px;
  border-radius: 50%;
  background-color: var(--grey-1700);
  color: $grey6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.menu-pane {
  .menu-header {
    .menu-title {
      font-weight: 600;
      font-size: 12px;
      line-height: 120%;
      color: $grey6;
      padding: 10px;
      &.hidden {
        width: 0;
        overflow-x: hidden;
        padding: 0;
      }
    }
  }

  .menu {
    .menu-list {
      li {
        a {
          padding: 12px;
          border-radius: 0;
          color: var(--menu-pane-menu-item-colour);

          &.is-active {
            background-color: var(
              --menu-pane-menu-item-selected-background-colour
            );
            color: var(--menu-pane-menu-item-selected-colour);
            .menu-item-icon-container {
              color: var(--primary-colour);
              background-color: var(--white);
            }
          }

          .menu-item-icon-container {
            flex: 0 0 calc(var(--menu-pane-collapsed-width) - 1.5em);
            background-color: var(--primary-colour);
            color: var(--white);
            width: 24px;
            height: 24px;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
            .menu-item-icon {
              font-size: 12px;
            }
          }

          .menu-item-label {
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }

  .menu-divider {
    border-bottom: 1px solid $grey5;
    margin: 5px 10px;
  }
}
</style>
