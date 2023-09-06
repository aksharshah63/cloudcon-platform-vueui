<script lang="ts">
import { defineComponent, ref } from "vue";
import Layout from "./layout.vue";
import { stateSymbol, useState } from "../../store";
import ToggleOptions from "../../components/input/toggleOptions.vue";
import { updating } from "../../use/controller/dashboard/dashboard";

export const MultiDashletLayout = /*#__PURE__*/ defineComponent({
  name: "DashletLayout",
  inject: [stateSymbol.description!],
  components: {
    Layout,
    ToggleOptions,
  },
  setup() {
    const key = ref(1);
    const pageOptionsSelectorNum = 1;
    const div = window.document.querySelector("div#kui");

    const upvise = useState().upvise;
    const pageOptions =
      upvise.upviseSelector[pageOptionsSelectorNum].split("|");

    const currentPage = ref("");
    changePage(pageOptions[0]);

    function optionClicked(event: string) {
      if (event !== currentPage.value) changePage(event);
    }

    function changePage(pageName: string) {
      updating.value = true;
      currentPage.value = pageName;
      let oldSelector = JSON.parse(div!.getAttribute("__selector") as string);
      oldSelector[0] = pageName;
      div?.setAttribute("__selector", JSON.stringify(oldSelector));
      key.value *= -1;
    }

    return { key, optionClicked, pageOptions, currentPage };
  },
});

export default MultiDashletLayout;
</script>

<template>
  <toggle-options
    class="options"
    :toggleOptions="pageOptions"
    :currentOption="currentPage"
    @option-selected="optionClicked"
  />
  <layout :key="key" />
</template>

<style scoped lang="scss">

.options {
  position: absolute;
  margin-top: 54px;
  height: 40px;

  font-family: Poppins, serif;
  font-style: normal;
  font-weight: 700;
  font-size: 12px;
  color: $grey3;
  background-color: $grey4;

  ::v-deep(.grid-toggle-option) {
    min-width: 100px;
  }
}
</style>
