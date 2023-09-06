<script lang="ts">
import { defineComponent, ref } from "vue";
import DashletPicker from "../../components/charts/picker/dashletPicker.vue";
import ProgressSpinner from "primevue/progressspinner";
import { updating } from "../../use/controller/dashboard/dashboard";
import { IDashletCard } from "../../use/controller/dashboard/dashboard.d";

export const DashboardActions = /*#__PURE__*/ defineComponent({
  name: "DashboardActions",
  components: {
    DashletPicker,
    ProgressSpinner,
  },
  props: {
    dashletCards: {
      type: Object as () => IDashletCard[],
      required: true,
    },
  },
  setup(_, context) {
    // const templateOptions = [
    //   { description: "2 col", value: [6, 6] },
    //   { description: "3 col", value: [4, 4, 4] },
    //   { description: "skinny col", value: [3, 9] },
    //   { description: "1 col", value: [12] },
    // ];
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const showDashletPick = ref(false);

    function toggleDashletPicker() {
      showDashletPick.value = !showDashletPick.value;
    }

    // function changeFilter(filters: IFilterModel) {
    //   context.emit("change-filter", filters);
    // }

    function addDashlet(type: string) {
      context.emit("add-dashlet", type);
    }

    function saveLayout() {
      context.emit("save");
    }

    return {
      toggleDashletPicker,
      showDashletPick,
      addDashlet,
      saveLayout,
      updating,
    };
  },
});

export default DashboardActions;
</script>

<template>
  <div>
    <div class="p-my-3 p-d-flex">
      <div class="actions-group">
        <!-- <div class="action" @click="openLayoutSelect($event)">
          <font-awesome-icon
            class="plus-circle-icon"
            :icon="['fa', 'plus-circle']"
          />
          <OverlayPanel ref="layoutSelect">
            <SelectButton
              class="layout-select"
              v-model="template"
              :options="templateOptions"
              optionLabel="description"
              optionValue="value"
              :disabled="updating"
            />
          </OverlayPanel>
        </div> -->
        <div v-if="updating" class="action">
          <ProgressSpinner :style="{ height: '80%', width: '80%' }" />
        </div>
        <div v-else class="action" @click="saveLayout()">
          <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
        </div>
        <div class="action" @click="toggleDashletPicker()">
          <font-awesome-icon
            class="plus-circle-icon"
            :icon="['fa', 'plus-circle']"
          />
          <dashlet-picker
            v-if="showDashletPick"
            :dashlet-cards="dashletCards"
            :show-dashlet-picker="showDashletPick"
            @add-dashlet="addDashlet($event)"
            @toggleDashletPicker="toggleDashletPicker()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/global";

.actions-group {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 1 1 auto;
  height: 48px;

  .action {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48px;
    width: 48px;
    background-color: $white;
    box-shadow: 0px 0px 0px 1px $grey5 inset;
    border-radius: 16px;
    margin: 0 8px;
    cursor: pointer;

    .save-icon {
      font-size: 16px;
    }

    .plus-circle-icon {
      font-size: 16px;
    }

    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
