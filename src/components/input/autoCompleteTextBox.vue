<script lang="ts">
import { IRecord } from "../../store/modules/upvise.d";
import AutoComplete from "primevue/autocomplete";
import InputText from "primevue/inputtext";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { ILookupRecord } from "../../use/controller/lookups/lookups.d";
import useMultiIdController from "../../../cloudconLibrary/utilities/multiId";

export const AutoCompleteTextBox = /*#__PURE__*/ defineComponent({
  name: "AutoCompleteTextBox",
  components: {
    AutoComplete,
    InputText,
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
    displayField: {
      type: String,
      required: true,
    },
    selected: {
      type: String,
      required: false,
    },
    multiSelect: {
      type: Boolean,
      required: false,
      default: true,
    },
    disableSort: {
      type: Boolean,
      required: false,
      default: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const intialised = ref(false);
    const multiSelectController = useMultiIdController();
    const autoFillOptions = ref(props.options);
    const selectedOptions = ref(alreadySelected());
    const filteredOptions = ref();

    const remainingAutoFillOptions = computed(() => {
      const activeAutoFillOptions = autoFillOptions.value.filter(
        (o: ILookupRecord) => o.isactive !== 0
      );
      if (!props.selected) return activeAutoFillOptions;
      const selectedIds = props.selected.split("|");
      return activeAutoFillOptions.filter(
        (o: ILookupRecord) => !selectedIds.includes(o.id)
      );
    });

    const searchOptions = (event: any) => {
      setTimeout(() => {
        if (!event.query.trim().length) {
          filteredOptions.value = [...remainingAutoFillOptions.value];
        } else {
          filteredOptions.value = remainingAutoFillOptions.value.filter(
            (option: any) => {
              return option[props.displayField]
                .toLowerCase()
                .includes(event.query.toLowerCase());
            }
          );
        }
      }, 250);
    };

    onMounted(() => {
      intialised.value = true;
      if (!props.disableSort) sort();
    });

    function sort() {
      autoFillOptions.value.sort((a: any, b: any) =>
        a[props.displayField] > b[props.displayField] ? 1 : -1
      );
    }

    function alreadySelected() {
      if (props.selected) {
        if (props.multiSelect) {
          return multiSelectController.getSelectedObjects(
            props.selected,
            "id",
            autoFillOptions.value
          );
        } else {
          //console.log("Comes Here", autoFillOptions.value);
          return autoFillOptions.value.find(
            (option: ILookupRecord) =>
              option.id === props.selected ||
              option.lookuptype === props.selected
          );
        }
      }
    }

    function getAutoCompleteValue() {
      if (selectedOptions.value) {
        if (Array.isArray(selectedOptions.value)) {
          return multiSelectController.getMultiIdString(selectedOptions.value);
        } else if (selectedOptions.value.id) {
          return selectedOptions.value.id;
        } else if (selectedOptions.value.lookuptype) {
          return selectedOptions.value.lookuptype;
        }
      }
      return "";
    }

    function parseSelectedOptionsToString(): string {
      console.log(selectedOptions.value);
      if (Array.isArray(selectedOptions.value))
        return (
          selectedOptions.value
            ?.map((option: IRecord) => option?.[props.displayField] ?? "")
            .join(", ") ?? ""
        );
      else if (typeof selectedOptions.value === "object")
        return (selectedOptions.value?.[props.displayField] as string) ?? "";
      else return selectedOptions.value ?? "";
    }

    watch(selectedOptions, () => {
      const newValue = getAutoCompleteValue();
      emit("updateOptionsValue", props.fieldName, newValue ?? "");
    });

    watch(
      () => props.options,
      () => {
        if (intialised.value) {
          autoFillOptions.value = props.options;
        }
      }
    );

    return {
      autoFillOptions,
      selectedOptions,
      filteredOptions,
      remainingAutoFillOptions,
      searchOptions,
      parseSelectedOptionsToString,
    };
  },
});
export default AutoCompleteTextBox;
</script>

<template>
  <div>
    <AutoComplete
      v-if="!disabled"
      forceSelection
      v-model="selectedOptions"
      inputClass="input-text-field"
      :multiple="multiSelect"
      :suggestions="filteredOptions"
      :field="displayField"
      :completeOnFocus="true"
      :dropdown="true"
      @complete="searchOptions($event)"
    ></AutoComplete>
    <input-text
      v-else
      class="input-text-field"
      :disabled="true"
      :model-value="parseSelectedOptionsToString()"
    />
  </div>
</template>

<style scoped lang="scss">
::v-deep(.p-autocomplete.p-inputwrapper) {
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  border: none;
  border-radius: 5px;
  border-width: 0;

  &.p-autocomplete-multiple {
    .p-button {
      display: flex;
      align-items: flex-start;
      padding-top: 7px;
      outline: none;
      border: none;
    }
  }

  .p-inputtext {
    box-shadow: none;
    padding-right: 0;

    &:not(.p-disabled).p-focus {
      box-shadow: none;
    }
  }

  .p-button {
    background-color: transparent;
    padding: 0;
    width: auto;

    .p-button-icon {
      font-size: 10px;
      color: $blue;
      margin: 0 4px;

      .p-button-label {
        display: none;
      }
    }
  }
}
</style>
