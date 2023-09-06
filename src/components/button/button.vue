<template>
  <div
    class="outer-element-style"
    :style="passedInStyle"
    v-on:click="raiseButtonClicked($event, id)"
  >
    <div class="inner-element-style">
      <div class="upper-text-area">
        <div class="upper-text-style">{{ titleText }}</div>
        <div class="upper-text-description-style">{{ titleDescription }}</div>
      </div>
      <div class="lower-text-area" v-if="lowerText || lowerTextDescription">
        <div class="lower-text-style">{{ lowerText }}</div>
        <div class="lower-text-style-description">
          {{ lowerTextDescription }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
export const ButtonControl = /*#__PURE__*/ defineComponent({
  name: "button.vue",
  props: {
    id: {
      required: true,
      type: Number,
    },
    colour: {
      required: false,
      type: String,
      default: "#000000",
    },
    fontColour: {
      required: false,
      type: String,
      default: "#FFFFFF",
    },
    titleText: {
      required: true,
    },
    titleDescription: {
      required: false,
      type: String,
    },
    lowerText: {
      required: false,
      type: String,
    },
    lowerTextDescription: {
      required: false,
      type: String,
    },
  },
  emits: {
    //Emits this event with two arguments
    //First Argument is the event that caused this to be emitted
    //The second argument is the id of this button
    buttonClick: null,
  },

  methods: {
    raiseButtonClicked(event: MouseEvent, id: number) {
      this.$emit("buttonClick", event, id);
    },
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(props: Record<string, any>) {
    const passedInStyle = computed(() => {
      return (
        "background-color: " +
        props.colour +
        "; color: " +
        props.fontColour +
        "; box-shadow: 10px 10px 20px " +
        props.colour +
        "4D;"
      );
    });
    return {
      passedInStyle,
    };
  },
});

export default ButtonControl;
</script>

<style scoped>
.outer-element-style {
  border-radius: 15px;
  width: auto;
  display: inline-block;
  margin: 15px 0 15px 15px;
  cursor: pointer;
}
.inner-element-style {
  border-left-width: 0;
  border-bottom-width: 0;
  border-right-width: 0;
  border-top-width: 0;
  border-style: solid;
  font-family: "Poppins", sans-serif;
  font-size: 13px;
}
.upper-text-area {
  margin: 12px;
}
.lower-text-area {
  margin: 0 12px 12px;
}
.upper-text-style {
  font-size: 24px;
  font-weight: 600;
}
.upper-text-description-style {
  font-size: 12px;
}
.lower-text-style {
  font-size: 12px;
  font-weight: bold;
}
.lower-text-style-description {
  font-size: 10px;
}
</style>
