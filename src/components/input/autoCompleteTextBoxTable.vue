<script lang="ts">
import AutoComplete from "primevue/autocomplete";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { defineComponent, onMounted, ref, watch } from "vue";
import { IOptionRecord } from "../../use/controller/risks/risks.d";

export const AutoCompleteTextBoxTable = /*#__PURE__*/ defineComponent({
  name: "AutoCompleteTextBoxTable",
  components: {
    AutoComplete,
    DataTable,
    Column,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    fieldName: {
      type: String,
      required: true,
    },
    selected: {
      type: String,
      required: false,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const autoFillOptions = ref(props.options);
    const selectedOptions = ref(alreadySelected() as IOptionRecord[]);
    const filteredOptions = ref();

    const searchOptions = (event: any) => {
      setTimeout(() => {
        if (!event.query.trim().length) {
          filteredOptions.value = [...autoFillOptions.value];
        } else {
          filteredOptions.value = autoFillOptions.value.filter(
            (option: { id: string; name: string }) => {
              return option.name
                .toLowerCase()
                .includes(event.query.toLowerCase());
            }
          );
        }
      }, 250);
    };

    onMounted(() => {
      sort();
    });

    function sort() {
      autoFillOptions.value.sort((a: IOptionRecord, b: IOptionRecord) =>
        a.lookupvalue > b.lookupvalue ? 1 : -1
      );
    }

    function alreadySelected() {
      if (props.selected) {
        const selectedOptions: IOptionRecord[] = [];
        const propArray = props.selected.split("|");
        propArray.forEach((id: string) =>
          selectedOptions.push(
            autoFillOptions.value.find(
              (option: IOptionRecord) => option.id === id
            )
          )
        );
        return selectedOptions;
      }
    }

    function arrayToString() {
      if (selectedOptions.value) {
        if (selectedOptions.value.length > 0)
          return selectedOptions.value
            .map((selected) => {
              return selected.id;
            })
            .join("|");
      }
      return "";
    }

    function deleteItem(event: any) {
      console.log("Deleting....");
      console.log(event);
      //selectedOptions.value.splice(index, 1);
      //emit("updateOptionsValue", props.fieldName, arrayToString());
    }

    watch(selectedOptions, () => {
      emit("updateOptionsValue", props.fieldName, arrayToString());
    });

    return {
      autoFillOptions,
      selectedOptions,
      filteredOptions,
      searchOptions,
      deleteItem,
    };
  },
});
export default AutoCompleteTextBoxTable;
</script>

<template>
  <span>
    <AutoComplete
      forceSelection
      v-model="selectedOptions"
      :multiple="true"
      :dropdown="true"
      :suggestions="filteredOptions"
      field="name"
      @complete="searchOptions($event)"
    ></AutoComplete>

    <div v-if="selectedOptions">
      <DataTable
        class="table-header-hidden"
        selectionMode="single"
        dataKey="id"
        :value="selectedOptions"
        @rowSelect="deleteItem($event)"
      >
        <Column>
          <template #body>
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </template>
        </Column>
        <Column field="name"></Column>
      </DataTable>
    </div>
  </span>
</template>

<style scoped></style>
