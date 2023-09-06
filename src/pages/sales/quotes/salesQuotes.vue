<script lang="ts">
import { UpviseDataMessage } from "../../../store/modules/upvise";
//import DashletTable from "../../../components/charts/staticdashboard/dashletTable.vue";
import DashboardOverview from "../../../controls/dashboard/overview.vue";
import {
  defineComponent,
  onMounted,
  ref,
  watch,
  computed,
  watchEffect,
} from "vue";

import useControllerSalesQuotes from "../../../use/controller/sales/quotes";
import { stateSymbol, useState } from "../../../store/index";
import { IUpviseDataMessage } from "../../../store/modules/upvise.d";
import backingField from "../../../use/utils/useBackingField";

export const SalesQuotes = /*#__PURE__*/ defineComponent({
  name: "SalesQuotes",
  inject: [stateSymbol.description!],
  components: {
    DashboardOverview,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  setup(props: Record<string, any>) {
    const upvise = useState().upvise;
    const controller = useControllerSalesQuotes(upvise, props.type);
    const slicingInformation = ref();
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const currentRecords = ref<Record<string, any>[]>([]);
    const useBackingField = backingField();
    const backingFieldDictionary = ref({});
    const backingFieldData = ref({});

    watch(
      () => metadata.value.definition,
      () => {
        slicingInformation.value = controller.getSlicingInformation(
          metadata.value
        );
      }
    );

    onMounted(async () => {
      await controller.getMetadata().then((m) => (metadata.value = m));
      console.log("METADATA:", metadata.value);
      controller.fetch();
      backingFieldDictionary.value = useBackingField.getDictionary(
        metadata.value
      );

      await useBackingField
        .getData(backingFieldDictionary.value)
        .then((d) => (backingFieldData.value = d));
    });

    const pageName = computed(() => {
      return metadata.value.definition?.Grouping[0]?.Name ?? null;
    });

    function getFilteredRows(event: unknown) {
      const quotes = event as Record<string, any>[];
      if (upvise.isFetchComplete) currentRecords.value = quotes;
    }

    function groupedItemClick(
      action: string,
      _groupName: string,
      itemId: string,
      _: string
    ) {
      if (action === "Edit") {
        window.Engine.eval("Sales.viewQuote('" + itemId + "')", 0);
      }
    }

    watchEffect(() => {
      controller.initialiseStore();
      useBackingField.setData(
        backingFieldDictionary.value,
        backingFieldData.value
      );
    });

    return {
      currentRecords,
      metadata,
      pageName,
      groupedItemClick,
      slicingInformation,
      getFilteredRows,
    };
  },
});

export default SalesQuotes;
</script>

<template>
  <dashboard-overview
    :title="pageName + 's'"
    :module-name="type"
    :upvise-data-message="metadata"
    :hide-center-header="true"
    :show-view-toggle="false"
    :show-header-toggle="false"
    :slicing-information="slicingInformation"
    :show-file-export="true"
    @groupedItemClick="groupedItemClick"
    @filteredValue="getFilteredRows"
  >
  </dashboard-overview>
</template>

<style lang="scss" scoped></style>
