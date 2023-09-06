<script lang="ts">
import { defineComponent, ref, computed, PropType } from "vue";
import { IFieldMenu, IFieldSearchMap } from "../../../cloudconLibrary/store/modules/formTemplateData/formTemplateDataModule";
import PanelMenu from "primevue/panelmenu";
import InputText from "primevue/inputtext";

/* eslint-disable */
export const FieldMenu = /*#__PURE__*/ defineComponent({
  name: "FieldMenu",
  props: {
    fieldGroups: {
      type: Array as PropType<IFieldMenu[]>,
      required: true,
    },
  },
  components: {
    PanelMenu,
    InputText,
  },
  setup(props) {
    const fieldGroups = ref(props.fieldGroups);
    const field = ref("");
    const expandedKeys = ref<Record<string, any>>({});

    function expandNode(node: any) {
      console.log(`node: ${node}`)
      if (node.items && node.items.length) {
        expandedKeys.value[node.key] = true;

        for (let item of node.items) {
          expandNode(item);
        }
      }
    }

    function expandAll() {
      for (let node of props.fieldGroups) {
        expandNode(node);
      }

      expandedKeys.value = { ...expandedKeys.value };
      console.log(`keys: ${JSON.stringify(expandedKeys.value)}`);
    }

    function collapseAll() {
      expandedKeys.value = {};
      console.log(`keys: ${JSON.stringify(expandedKeys.value)}`);
    }

    const fieldSearchMap = computed<IFieldSearchMap>(() => {
      let stringArray:IFieldSearchMap = {};
      props.fieldGroups.forEach(fieldGroup => {
        let items =  fieldGroup.items;
        let fieldString = [];
        for(let i = 0; i < items.length; i++){
          var item = items[i];
          fieldString.push(item.label.toLowerCase());
        }
        stringArray[parseInt(fieldGroup.key)] = (fieldString.join("|"));
      })
      return stringArray;
    })

    function onInput(event: any) {
      expandedKeys.value = {};
      console.log(`Search  input >> ${event.target.value}`);
      if (event.target.value != "") {
        for (let key of Object.keys(fieldSearchMap.value)) {
          if (fieldSearchMap.value[parseInt(key)].includes(event.target.value.toLowerCase())) {
            expandedKeys.value[parseInt(key)] = true;
          }
        }
        console.log(`fields object >> ${JSON.stringify(Object.values(props.fieldGroups)[0])}`);
      }
    }

    return {
      fieldGroups,
      onInput,
      field,
      expandedKeys,
      expandAll,
      collapseAll,
      fieldMap: fieldSearchMap,
    };
  },
});
export default FieldMenu;
</script>
<template>
  <div class="field-menu">
    <div class="field-search">
      <span class="p-input-icon-left">
        <i class="pi pi-search" />
        <InputText
          type="text"
          v-model="field"
          @input="onInput($event)"
          placeholder="Search"
        />
      </span>
    </div>
    <!-- <PanelMenu :model="props.fields"/> -->
    <div class="button-container">
      <Button type="button" @click="expandAll" class="button"
        >Expand All</Button
      >
      <Button type="button" @click="collapseAll" class="button"
        >Collapse All</Button
      >
    </div>
    <PanelMenu :model="fieldGroups" v-model:expandedKeys="expandedKeys" />
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
