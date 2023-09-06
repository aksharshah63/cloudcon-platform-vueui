<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
  watchEffect,
} from "vue";
import { useState } from "../../store";
import useControllerBaywatch from "../../use/controller/baywatch/baywatch";
import DashletLayout from "../../pages/dashboard/layout.vue";
import backingField from "../../use/utils/useBackingField";
import { IUpviseDataMessage } from "../../store/modules/upvise.d";
import { UpviseDataMessage } from "../../store/modules/upvise";

export const Baywatch = /*#__PURE__*/ defineComponent({
  name: "Baywatch",
  components: {
    DashletLayout,
  },
  setup() {
    const upvise = useState().upvise;
    const controller = useControllerBaywatch(upvise);
    const forageData = ref();
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const useBackingField = backingField();
    const backingFieldDictionary = ref({});
    const backingFieldData = ref({});

    onMounted(async () => {
      await controller.getMetadata().then((m) => (metadata.value = m));
      await controller.getForageData().then((f) => (forageData.value = f));

      backingFieldDictionary.value = useBackingField.getDictionary(
        metadata.value
      );

      await useBackingField
        .getData(backingFieldDictionary.value)
        .then((d) => (backingFieldData.value = d));

      controller.updateBayWidgetSizes();
      window.addEventListener("resize", controller.updateBayWidgetSizes);

      controller.fetch();
    });

    onUnmounted(() => {
      window.removeEventListener("resize", controller.updateBayWidgetSizes);
    });

    const bayData = computed(() => {
      return upvise.entityData(controller.bayTable);
    });

    const dashletData = computed(() => {
      return upvise.entityData("TableEmployeedashboardDashlets");
    });

    const dropzoneData = computed(() => {
      return upvise.entityData("TableEmployeedashboardDropzones");
    });

    watchEffect(() => {
      if (upvise.isFetchComplete) {
        useBackingField.setData(
          backingFieldDictionary.value,
          backingFieldData.value
        );
        controller.notPersistedCalcs();
      }
    });

    watch(
      [bayData, dashletData, dropzoneData],
      () => {
        console.log("Resizing baywatch widgets");
        controller.updateBayWidgetSizes();
      },
      { deep: true, flush: "post" }
    );

    return {
      bayData,
    };
  },
});

export default Baywatch;
</script>

<template>
  <DashletLayout />
</template>

<style scoped lang="scss"></style>
