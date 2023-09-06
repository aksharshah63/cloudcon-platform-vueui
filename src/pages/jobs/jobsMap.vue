<script lang="ts">
/* eslint-disable no-undef */
import { defineComponent, ref } from "vue";
import {
  stateSymbol, //useState
} from "../../store/index";

import utils from "../../use/function/useUtils";
import Jobs from "../../pages/jobs/jobs.vue";
import GoogleMap from "../../components/map/googleMap.vue";

export const JobsMap = /*#__PURE__*/ defineComponent({
  name: "JobsMap",
  props: {
    googleApiKey: {
      type: String,
      required: true,
    },
  },
  components: {
    GoogleMap,
    Jobs,
  },
  inject: [stateSymbol.description!],
  setup() {
    const currentDate = ref<number>(utils.getStartOfDay(new Date()));
    const center = ref({ lat: -33, lng: 150 });
    const markers = ref<Record<string, any>[]>([]);
    const enableDate = ref(false);
    function getFilteredDate(data: number) {
      currentDate.value = data;
    }
    function filteredRows(event: unknown) {
      markers.value = event as Record<string, any>[];
    }

    function isDateRangeEnabled(event: unknown) {
      enableDate.value = event as boolean;
    }

    return {
      center,
      markers,
      currentDate,
      getFilteredDate,
      filteredRows,
      enableDate,
      isDateRangeEnabled,
    };
  },
});

export default JobsMap;
</script>
<template>
  <google-map
    @enableDate="isDateRangeEnabled"
    :map-data="markers"
    :googleApiKey="googleApiKey"
  ></google-map>
  <jobs
    @newRowValues="filteredRows"
    @filteredDay="getFilteredDate"
    :current-date="currentDate"
    :enableDate="enableDate"
  ></jobs>
</template>

<style lang="scss" scoped>

</style>
