<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { UpviseDataMessage } from "../../../store/modules/upvise";
import useControllerProjectsTimeline from "../../../use/controller/project/timeline";

import { useToast } from "primevue/usetoast";
import ViewTimeline from "../../../components/view/timeline.vue";

import { defineComponent, onMounted, ref, watchEffect } from "vue";
import { stateSymbol, useState } from "../../../store/index";
import { IUpviseDataMessage } from "../../../store/modules/upvise.d";

export const ProjectsTimeline = /*#__PURE__*/ defineComponent({
  name: "ProjectsTimeline",
  inject: [stateSymbol.description!],
  components: {
    ViewTimeline,
  },
  setup() {
    const upvise = useState().upvise;
    const toast = useToast();
    const controller = useControllerProjectsTimeline(upvise);
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());

    onMounted(async () => {
      await controller.getMetadata().then((m) => (metadata.value = m));
      console.log("METADATA:", metadata.value);
      controller.fetch();
    });

    watchEffect(() => {
      controller.notPersistedCalcs();
    });

    return {
      toast,
      metadata,
    };
  },
});

export default ProjectsTimeline;
</script>

<template>
  <view-timeline
    :upviseDataMessage="metadata"
    :is-projects-timeline="true"
  ></view-timeline>
</template>

<style scoped>

</style>
