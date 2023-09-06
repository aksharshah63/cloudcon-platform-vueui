<script lang="ts">
import { defineComponent, ref, computed } from "vue";
// import { IFieldSearchMap } from "../../../cloudconLibrary/store/modules/formTemplateData/formTemplateDataModule";
import InputText from "primevue/inputtext";
import Listbox from "primevue/listbox";

/* eslint-disable */
export const customFieldMenu = /*#__PURE__*/ defineComponent({
  name: "customFieldMenu",
  props: {
    fieldGroups: {
      type: Array,
      required: true,
    },
  },
  components: {
    InputText,
    Listbox,
  },
  setup(props) {
    const field = ref("");
    const expandedKeys = ref<Record<string, any>>({});
    function changeOption(e: any) {
      props.fieldGroups.forEach((field: any) => {
        if (field.label === e.value.label) {
          field.command();
        }
      });
    }

    const data = computed(() => {
      return props.fieldGroups.filter((post: any) => {
        return (
          post.label.toUpperCase().match(field.value.toUpperCase()) ||
          post.label.toLowerCase().match(field.value.toLowerCase())
        );
      });
    });

    return { expandedKeys, changeOption, field, data };
  },
});
export default customFieldMenu;
</script>
<template>
  <div class="field-menu">
    <div class="field-search">
      <span class="p-input-icon-left">
        <i class="pi pi-search" />
        <InputText type="text" v-model="field" placeholder="Search" />
      </span>
    </div>
    <Listbox
      :options="data"
      v-model:expandedKeys="expandedKeys"
      optionLabel="label"
      @change="changeOption($event)"
    />
  </div>
</template>
<style lang="scss" scoped>
@import "../../assets/styles/global";

.field-menu {
  width: 200px;
  border-radius: 8px;
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.05) 10px 10px 20px;
}

.p-inputtext {
  width: 180px;
}

.p-panelmenu {
  width: 100%;
  padding: 10px;
}

.field-search {
  padding: 10px;
  display: flex;
  justify-content: space-between;
}

.button-container {
  padding: 10px;
  display: flex;
  justify-content: space-between;
}
.button {
  width: 45%;
  font-size: 12px;
  color: #333333;
}
</style>
