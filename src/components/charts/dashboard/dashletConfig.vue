<script lang="ts">
import { defineComponent, ref } from "vue";
import useControllerDashboard from "../../../use/controller/dashboard/dashboard";
import Dropdown from "primevue/dropdown";
import { stateSymbol, useState } from "../../../store";

export const DashletConfig = defineComponent({
  name: "DashletConfig",
  inject: [stateSymbol.description!],
  components: {
    Dropdown,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const testSourceOptions = [
      { name: "Sales", code: "sales" },
      { name: "Planner", code: "planner" },
    ];

    const controller = useControllerDashboard(useState().upvise);
    const { type, dataconfig } = controller.getDashlet(props.id);

    const config = ref(JSON.parse(dataconfig));
    // const {source} = toRefs({source: 'sales'});
    // const source = ref(null);

    // watch(config.value, (newConfig) => {
    //   console.log(newConfig);
    // });

    return {
      type,
      testSourceOptions,
      config,
    };
  },
});
export default DashletConfig;
</script>

<template>
  <div class="p-d-flex p-flex-column p-ai-center">
    <div>
      Data Source
      <Dropdown
        v-model="config.source"
        :options="testSourceOptions"
        placeholder="Select a data source"
        optionLabel="name"
        optionValue="code"
      />
      {{ config.source }}
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
