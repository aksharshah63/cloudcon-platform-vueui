<script lang="ts">
import { defineComponent, ref } from "vue";
import Button from "primevue/button";
import MultiSelect from "primevue/multiselect";

export const UtilizationFilter = defineComponent({
  name: "UtilizationFilter",
  components: {
    Button,
    MultiSelect,
  },
  props: {
    groupNameOptions: {
      type: [Object],
      required: true,
    },
    projectNameOptions: {
      type: [Object],
      required: true,
    },
  },
  setup(_, context) {
    const selectedGroups = ref();
    const selectedProjects = ref();
    function closeFilter() {
      context.emit("closeFilter");
    }

    function sendFilter() {
      const selectedFilters = {
        selectedGroups: selectedGroups.value,
        selectedProjects: selectedProjects.value,
      };
      context.emit("filterValues", selectedFilters);
    }

    function clearFilters() {
      selectedGroups.value = [];
      selectedProjects.value = [];
      context.emit("clearFilter");
    }

    return {
      selectedGroups,
      selectedProjects,
      closeFilter,
      sendFilter,
      clearFilters,
    };
  },
});
export default UtilizationFilter;
</script>
<template>
  <div class="p-grid p-x-2">
    <div class="p-col-7">
      <div class="p-grid">
        <div class="p-col-12">
          <span class="header-name">
            {{ "Filters" }}
          </span>
        </div>
      </div>
    </div>

    <div class="p-col-5 options">
      <div class="option" @click="closeFilter()">
        <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
      </div>
    </div>

    <div class="p-col-12 divider"></div>

    <div class="p-col-12 input-label">Group Name</div>
    <div class="p-col-12 groupFilter">
      <MultiSelect
        v-model="selectedGroups"
        :options="groupNameOptions"
        optionLabel="groupname"
        placeholder="Select Groups"
        display="chip"
        class="filter"
      />
    </div>

    <div class="p-col-12 input-label">Project Name</div>
    <div class="p-col-12 groupFilter">
      <MultiSelect
        v-model="selectedProjects"
        :options="projectNameOptions"
        optionLabel="projectname"
        placeholder="Select Projects"
        display="chip"
        class="filter"
      />
    </div>

    <div class="p-d-flex p-col-12 p-mt-2">
      <Button
        label="Clear"
        @click="clearFilters"
        class="filterButton p-col-5 p-ml-4 p-mr-2"
      />
      <Button
        label="Filter"
        @click="sendFilter"
        class="filterButton p-col-5 p-mr-4 p-ml-2"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../../assets/styles/global.scss";
.filterButton {
  max-height: 32px;
  // width: 98%;
  // margin: 16px auto 0;
  border-radius: 5px;

  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  border: none;
  border-radius: 5px;
  border-width: 0;
}
.option {
  // box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
  //   0 1px 5px 0 rgba(0, 0, 0, 0.12);
  border: none;
  cursor: pointer;
}
</style>
