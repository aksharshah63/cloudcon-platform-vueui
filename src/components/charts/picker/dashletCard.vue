<script lang="ts">
import { defineComponent, ref } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import AutoCompleteTextBox from "../../input/autoCompleteTextBox.vue";

// import TabMenu from "primevue/tabmenu";
import { IDashletCard } from "../../../use/controller/dashboard/dashboard.d";

export const DashletCard = /*#__PURE__*/ defineComponent({
  name: "DashletCard",
  components: {
    AutoCompleteTextBox,
    Card,
    Button,
  },
  props: {
    cardProperties: {
      type: Object as () => IDashletCard,
      required: true,
    },
  },
  setup(props, context) {
    const cardDetails = ref(props.cardProperties);

    function addDashlet() {
      context.emit("add-dashlet", {
        type: cardDetails.value.type,
        dataconfig: cardDetails.value.dataconfig,
        config: cardDetails.value.config,
      });
    }

    function updateOptionsValue(fieldName: string, value: string) {
      if (cardDetails.value.dataconfig)
        cardDetails.value.dataconfig[fieldName] = value;
    }

    return {
      cardDetails,

      addDashlet,
      updateOptionsValue,
    };
  },
});
export default DashletCard;
</script>

<template>
  <Card>
    <template #title>
      {{ cardDetails.name }}
    </template>
    <template #content>
      <div class="p-d-flex p-flex-wrap">
        <!-- <div v-if="'imgEncoding' in cardDetails">
          <img :src="'data:image/png;base64, ' + cardDetails.imgEncoding" />
        </div> -->
        <span>{{ cardDetails.description }}</span>
      </div>
      <div v-if="cardDetails.selectionOptions" class="p-grid">
        <template
          v-for="(selection, i) in cardDetails.selectionOptions"
          :key="i"
        >
          <span class="p-col-6 label">{{ selection.name }}</span>
          <div class="p-col-6">
            <auto-complete-text-box
              :options="selection.options"
              :selected="cardDetails.dataconfig[selection.field]"
              :multi-select="false"
              :display-field="selection.labelField"
              :field-name="selection.field"
              @updateOptionsValue="updateOptionsValue"
            />
          </div>
        </template>
      </div>
    </template>
    <template #footer>
      <Button label="Add" @click="addDashlet()" />
    </template>
  </Card>
</template>

<style lang="scss" scoped></style>
