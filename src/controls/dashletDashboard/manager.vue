<script lang="ts">
import { defineComponent, ref, computed, watchEffect } from "vue";
import useControllerDashboard from "../../use/controller/dashboard/dashboard";
import DropZone from "../../components/charts/dashboard/zone.vue";
import DashboardActions from "../../components/header/dashboardActions.vue";
import { IFilterModel } from "../../use/controller/dashboard/dashboard.d";
import { stateSymbol, useState } from "../../store";
import { updating } from "../../use/controller/dashboard/dashboard";
import Card from "primevue/card";
import Dropdown from "primevue/dropdown";

import DashletFilter from "../../components/filter/dashletFilter.vue";
//import ToggleOptions from "../../components/input/toggleOptions.vue";

// try vuedraggable for better dragging?
export const DashletManager = /*#__PURE__*/ defineComponent({
  name: "DashletManager",
  inject: [stateSymbol.description!],
  components: {
    DropZone,
    DashboardActions,
    DashletFilter,
    Card,
    Dropdown,
    //GridToggle: ToggleOptions,
  },

  setup() {
    const upvise = useState().upvise;
    const controller = useControllerDashboard(upvise);
    const currentDashlets = ref([]);
    const gridKey = ref(1);
    //const properFilters = ref();
    const currentView = ref(null);
    const showFilters = ref(false);

    controller.getCurrentDashlets(currentDashlets.value);
    let dropZones = computed(() => controller.getDropZoneIds());
    const draggedDashlet = ref("");
    const stopDrag = ref(true);
    // (async () => {
    //   try {
    //   properFilters.value = await controller.getFilters(filters);
    //   console.log(properFilters.value);
    // } catch (e) {
    //   console.log(e)
    // }
    // })();

    const scrollSpeed = 1;
    const scrollMargin = 150;
    //Calculating current layout
    const currentLayout = computed(() => {
      let result = controller
        .getDropZones()
        .sort((a, b) => a.zoneorder - b.zoneorder)
        .map((x) => x.width);
      if (result.length == 0) {
        changeLayout([12]);
        return [12];
      } else return result;
    });
    function handleDrop(colid: string, index: number) {
      moveDashlet(draggedDashlet.value, colid, index);
    }
    const templateOptions = ref(controller.getTemplateOptions());
    const templateOptionsNames = computed(() =>
      templateOptions.value.map((x) => {
        return { label: x.description };
      })
    );
    const templateOptionsMap = computed(
      () =>
        templateOptions.value.reduce(
          (obj, item) => ({ ...obj, [item.description]: item.value }),
          {}
        ) as Record<string, Array<number>>
    );

    function handleDrag(dashletid: string) {
      draggedDashlet.value = dashletid;
    }

    // for scroll on dashlet drag
    function handleDraggingScroll(event: DragEvent) {
      stopDrag.value = true;
      let windowHeight =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
      if (event.screenY <= scrollMargin) {
        stopDrag.value = false;
        scroll(-1);
      } else if (event.screenY >= windowHeight - scrollMargin) {
        stopDrag.value = false;
        scroll(1);
      }
    }

    // for scroll on dashlet drag
    function handleDragendScroll() {
      stopDrag.value = true;
    }

    function scroll(direction: 1 | -1) {
      if (!stopDrag.value) {
        window.scrollBy(0, direction * scrollSpeed);
        setTimeout(scroll, 50, direction);
      }
    }

    // function addDashlet(colid: string, index: number, type: string) {
    //   console.log("add dashlet", colid, index, type);
    // }

    function addDashletToStart(options: Record<string, unknown>) {
      controller.addDashletToStart(options);
    }

    function moveDashlet(dashletid: string, colid: string, index: number) {
      console.log("move dashlet", dashletid, colid, index);
      controller.moveDashlet(dashletid, colid, index);
    }

    async function changeLayout(layout: number[]) {
      await controller.changeLayout(layout);
      // make charts resize by calling window resize event
      window.dispatchEvent(new CustomEvent("resize"));
    }

    function layoutClicked(event: any) {
      const option = event.value.label;
      if (!updating.value && option in templateOptionsMap.value) {
        changeLayout(templateOptionsMap.value[option]);
      }
    }

    function changeFilter(filters: IFilterModel) {
      controller.changeFilters(filters);
      // refresh charts
      gridKey.value *= -1;
    }

    function save() {
      controller.save();
    }

    function toggleFilters() {
      // overlayElement.value!.show(event);
      showFilters.value = !showFilters.value;
    }

    function saveFilters(filters: IFilterModel) {
      controller.saveFilters(filters);
    }

    watchEffect(() => {
      if (upvise.isFetchComplete) {
        currentDashlets.value = [];
        controller.getCurrentDashlets(currentDashlets.value);
      }
    });

    return {
      //properFilters,
      changeFilter,
      handleDrop,
      currentLayout,
      handleDrag,
      handleDraggingScroll,
      handleDragendScroll,
      dropZones,
      addDashletToStart,
      changeLayout,
      templateOptionsNames,
      currentDashlets,
      gridKey,
      save,
      currentView,
      layoutClicked,
      toggleFilters,
      showFilters,
      saveFilters,
    };
  },
});
export default DashletManager;
</script>

<template>
  <div class="dashlet">
    <div class="header-row">
      <dashboard-actions
        :current-layout="currentLayout"
        :dashlet-cards="currentDashlets"
        @add-dashlet="addDashletToStart($event)"
        @change-layout="changeLayout($event)"
        @save="save()"
      />
    </div>
    <div class="button-holder">
      <div class="grid-options">
        <Dropdown
          class="columns-dropdown"
          v-model="currentView"
          :options="templateOptionsNames"
          option-label="label"
          placeholder="COLUMNS"
          @change="layoutClicked($event)"
        ></Dropdown>

        <!-- TODO -->
        <div class="filter-button" @click="toggleFilters()">
          <font-awesome-icon class="filter-icon" :icon="['fa', 'filter']" />
          <span> FILTER </span>
        </div>

        <!-- temp div to trigger filters -->
        <Card v-show="showFilters" class="overlay-card">
          <template #content>
            <dashlet-filter
              @filterValues="changeFilter($event)"
              @closeFilter="toggleFilters()"
              @saveFilters="saveFilters($event)"
            ></dashlet-filter>
          </template>
        </Card>
      </div>
    </div>
    <div>
      <div class="p-grid" :key="gridKey">
        <drop-zone
          v-for="columnid in dropZones"
          :key="columnid"
          :id="columnid"
          @onDrop="handleDrop(columnid, $event)"
          @onDrag="handleDrag($event)"
          @onDraggingScroll="handleDraggingScroll($event)"
          @onDragendScroll="handleDragendScroll()"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>


.dashlet {
  // margin: 15px 0px 15px 0px;
  padding: 10px 20px;

  .button-holder {
    .grid-options {
      .columns-dropdown {
        line-height: 24px;
        width: 140px;
        border-radius: 8px;
        height: 24px;
        border: 1px $grey5 solid;

        ::v-deep(.p-dropdown-trigger) {
          color: $grey3;
        }

        ::v-deep(.p-inputtext) {
          font-family: Poppins;
          font-style: normal;
          font-weight: bold;
          font-size: 10px;
          padding: 0 12px;
          color: $grey3;
        }
      }
    }
  }
}

.dashletColumn {
  border-radius: 25px;
  background: #f2f2f2;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0px 15px 0px 15px;
}
</style>
