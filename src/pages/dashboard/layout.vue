<script lang="ts">
import { defineComponent, ref, onMounted, watchEffect } from "vue";
import DashletManager from "../../controls/dashletDashboard/manager.vue";
import useControllerDashboard, {
  updating,
} from "../../use/controller/dashboard/dashboard";
import { stateSymbol, useState } from "../../store";

export const DashletLayout = /*#__PURE__*/ defineComponent({
  name: "DashletLayout",
  inject: [stateSymbol.description!],
  components: {
    DashletManager,
  },
  setup() {
    const upvise = useState().upvise;
    const controller = useControllerDashboard(upvise);
    const loaded = ref(true);

    //fillLocalData();

    onMounted(async () => {
      if (controller.pageName !== "baywatch")
        controller.fetch().then(() => {
          loaded.value = true;
          updating.value = false;
        });
    });

    watchEffect(() => {
      if (controller.pageName === "baywatch" && upvise.isFetchComplete) {
        loaded.value = true;
        updating.value = false;
      }
    });

    return { loaded };
  },
});

export default DashletLayout;
</script>

<template>
  <div class="overview">
    <dashlet-manager v-if="loaded" />
  </div>
</template>

<style scoped lang="scss">


.overview {
  font-family: Poppins, serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  color: $grey3;
  background-color: $grey4;
  min-width: 900px;
  padding-top: 24px;
}

.action {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 48px;
  width: 48px;
  border-radius: 16px;
  margin: 0 8px;
}
</style>
