<script lang="ts">
import { IUpviseDataMessage } from "../../store/modules/upvise.d";
import { defineComponent, onMounted, ref } from "vue";
import { UpviseDataMessage } from "../../store/modules/upvise";
import SchedulerJobs from "./schedulerJobs.vue";

export const Scheduler = /*#__PURE__*/ defineComponent({
  name: "Scheduler",
  components: {
    SchedulerJobs
  },
  props: {
  },
  setup() {
    const metadata = ref<IUpviseDataMessage>(new UpviseDataMessage());

    onMounted(async () => {
    });

    return {
      metadata,
    };
  },
});
export default Scheduler;
</script>

<template>
  <SchedulerJobs
    :upviseDataMessage="metadata"
    :currentView="'jobs'"
  ></SchedulerJobs>
</template>

<style lang="scss" scoped>

</style>
