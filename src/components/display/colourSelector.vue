<script lang="ts">
import { defineComponent, ref } from "vue";
import { IUpviseDataMessage } from "../../store/modules/upvise.d";
import useControllerWorkshopColour from "../../use/function/workshopColour";

export const ColourSelector = /*#__PURE__*/ defineComponent({
  name: "ColourSelector",
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
  },
  setup(props) {
    const upviseDataMessage = ref(props.upviseDataMessage);
    const colourController = useControllerWorkshopColour();
    const currentColours = ref();

    function initialColour() {
      currentColours.value = colourController.initialiseColours();
    }

    // eslint-disable-next-line vue/no-dupe-keys
    return { upviseDataMessage, initialColour };
  },
});
export default ColourSelector;
</script>

<template>
  <div></div>
</template>

<style scoped lang="scss"></style>
