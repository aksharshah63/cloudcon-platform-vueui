<script lang="ts">
import { defineComponent, ref } from "vue";
import SquareIconButton from "../header/SquareIconButton.vue";
import SearchBar from "../input/searchBar.vue";
import OverlayPanel from "primevue/overlaypanel";

export const HomeResultBar = /*#__PURE__*/ defineComponent({
  name: "HomeResultBar",
  components: {
    SquareIconButton,
    SearchBar,
    OverlayPanel,
  },
  data() {
    return {
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

  setup() {
    const MenuOverlayPanelRef = ref();
    function toggleMenuOverlayPanel(event: Event) {
      MenuOverlayPanelRef.value.toggle(event);
    }
    return {
      toggleMenuOverlayPanel,
      MenuOverlayPanelRef,
    };
  },
});
export default HomeResultBar;
</script>
<template>
  <div class="home-result-bar">
    <div class="p-d-flex p-align-center">
      <h3>Result</h3>
      <ul class="p-d-flex p-align-center">
        <li v-for="item in icons" :key="item" class="mr-4">
          <SquareIconButton :iconName="item" class="large-icon-link" />
        </li>
        <li>
          <SquareIconButton
            iconName="ellipsis-v"
            @click="toggleMenuOverlayPanel($event)"
            class="menu-icon-link large-icon-link"
          >
          </SquareIconButton>
          <OverlayPanel
            ref="MenuOverlayPanelRef"
            class="home-result-menu-overflow"
          >
            <ul class="more-menu-list">
              <li v-for="item in MoreMenu" :key="item.icon">
                <SquareIconButton
                  :iconName="item.icon"
                  class="menu-more-link large-icon-link"
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
      <SearchBar />
    </div>
  </div>
</template>

<style lang="scss">
.home-result-bar {
  margin-bottom: 15px;
  h3 {
    font-weight: 600;
    font-size: 32px;
    line-height: 120%;
    margin-right: 30px;
    color: $grey3;
  }
  .search-bar-container {
    margin-left: 30px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 32px;
    padding: 8px 0px;
    height: auto;
    .search-bar-input {
      font-size: 12px;
      line-height: 16px;
    }
    .search-icon-container {
      .search-icon {
        font-size: 18px;
      }
    }
  }
}
.p-overlaypanel {
  &.home-result-menu-overflow {
    margin-top: 20px;
    .p-overlaypanel-content {
      .more-menu-list {
        li {
          a {
            padding: 10px 25px 10px 10px;
          }
        }
      }
    }
  }
}
</style>
