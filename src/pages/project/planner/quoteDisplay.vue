<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import Checkbox from "primevue/checkbox";
import DisplayStyle from "../../../components/display/style.vue";
import { stateSymbol } from "../../../store";

export const QuoteDisplay = /*#__PURE__*/ defineComponent({
  name: "QuoteDisplay",
  inject: [stateSymbol.description!],
  components: {
    Checkbox,
    DisplayStyle,
  },
  props: {
    quoteData: {
      type: Object,
      required: true,
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup(_, { emit }) {
    const selected = ref(false);
    watch(selected, function () {
      if (selected.value) emit("toggleOn");
      else emit("toggleOff");
      // console.log(selected.value);
    });
    return {
      selected,
    };
  },
});
export default QuoteDisplay;
</script>

<template>
  <div
    :class="{ 'p-grid': true, 'quote-display-area': true, selected: selected }"
  >
    <div class="p-col-8 data-area">
      <div class="p-grid">
        <div class="p-col-12 title-area">{{ quoteData.name }}</div>
        <div class="p-col-12 description-area">{{ quoteData.description }}</div>
      </div>
    </div>

    <div class="p-col-3 total-area">
      <span>Total:</span>
      <display-style
        style="width: auto; padding: 0 0 0 5px"
        :data="quoteData.totalex"
        :type-specialisation="'currency'"
      ></display-style>
    </div>

    <div class="p-col-1 checkbox-area">
      <Checkbox id="isChecked" v-model="selected" :binary="true"></Checkbox>
    </div>
  </div>
</template>

<style scoped lang="scss">


.p-grid.quote-display-area {
  border-radius: 4px;
  background-color: $white;
  color: $grey7;
  font-family: Poppins, serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  word-wrap: break-word;
  margin: 4px 0 4px 0;
  border-radius: 3px;
  border: 1px solid $grey6;

  &.selected {
    color: $white;
    background-color: $blue;
    border: 1px solid $blue;
  }

  .data-area {
    padding-right: 10px;

    .title-area {
      font-size: 22px;
    }

    .description-area {
      margin-top: 5px;
    }
  }

  .total-area {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    font-size: 18px;
  }

  .checkbox-area {
    align-items: center;
    justify-items: center;
    display: flex;
  }
}
</style>
