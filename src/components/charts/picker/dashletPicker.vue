<script lang="ts">
import { defineComponent, watch, ref, computed } from "vue";
import Sidebar from "primevue/sidebar";
import { DashletCard } from "./dashletCard.vue";
import { IDashletCard } from "../../../use/controller/dashboard/dashboard.d";

// import TabMenu from "primevue/tabmenu";

export const DashletPicker = /*#__PURE__*/ defineComponent({
  name: "DashletPicker",
  components: {
    Sidebar,
    DashletCard,
  },
  props: {
    showDashletPicker: {
      type: Boolean,
      required: true,
    },
    dashletCards: {
      type: Object as () => IDashletCard[],
      required: true,
    },
  },
  setup(props, context) {
    const showDashletpicker = ref(props.showDashletPicker);
    var displayedDashletCards = ref(props.dashletCards);
    const tabItems = computed(() => {
      return [
        ...new Set(
          ["All"].concat(
            props.dashletCards
              .map((x) => x.category)
              .filter((x) => x !== undefined) as Array<string>
          )
        ),
      ];
    });

    function showDashlets(dashlets: IDashletCard[]) {
      displayedDashletCards.value = dashlets;
    }

    function filterCategory(cat: string) {
      if (cat === "All") {
        showDashlets(props.dashletCards);
      } else {
        showDashlets(props.dashletCards.filter((x) => x?.category === cat));
      }
    }

    function addDashlet(options: Record<string, unknown>) {
      context.emit("add-dashlet", options);
    }

    function tabClicked(event: PointerEvent, name: string) {
      const option = document.getElementsByClassName("tab");
      for (let i = 0; i < option.length; i++) {
        option[i].classList.remove("selected");
      }

      (event.currentTarget as Element)?.classList.add("selected");
      filterCategory(name);
    }

    watch(
      () => showDashletpicker.value,
      () => {
        context.emit("toggleDashletPicker");
      }
    );

    return {
      displayedDashletCards,
      showDashletpicker,
      addDashlet,
      tabItems,
      tabClicked,
    };
  },
});
export default DashletPicker;
</script>

<template>
  <div>
    <Sidebar
      class="dashlet-picker"
      v-model:visible="showDashletpicker"
      position="right"
      :showCloseIcon="false"
    >
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name">Dashlet Picker</span>
            </div>
          </div>
        </div>

        <div class="p-col-5 sidebar-options">
          <div class="option" @click="showDashletpicker = false">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>
      </div>

      <div class="tabs-group">
        <div v-for="(name, index) in tabItems" :key="name">
          <div
            v-if="index === 0"
            class="tab selected"
            @click="tabClicked($event, name)"
          >
            <div class="tab-wrapper">
              <span class="tab-text">{{ name }}</span>
            </div>
          </div>
          <div v-else class="tab" @click="tabClicked($event, name)">
            <div class="tab-wrapper">
              <span class="tab-text">{{ name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dashlet-cards">
        <dashlet-card
          v-for="dashlet in displayedDashletCards"
          :key="dashlet.id"
          :cardProperties="dashlet"
          @add-dashlet="addDashlet($event)"
        />
      </div>
    </Sidebar>
  </div>
</template>

<style lang="scss" scoped>


.tabs-group {
  display: flex;
  flex-wrap: wrap;
  flex: 1 1 auto;
  height: 44px;

  .tab {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $white;
    border-radius: 8px 8px 0 0;
    //padding: 12px; While we arent using tab-count
    padding: 12px 12px 12px 12px;
    line-height: 12px;
    font-weight: 700;
    height: 100%;
    box-sizing: border-box;
    min-width: 90px;
    max-width: 140px;
    cursor: pointer;
    border: 1px solid #c8c8c8;

    .tab-wrapper {
      overflow: hidden;

      .tab-text {
        color: $grey3;
        white-space: nowrap;
        text-align: center;
      }
    }

    &.selected {
      background-color: $grey4;
    }
  }
}
</style>
