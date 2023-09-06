<script lang="ts">
import { IRecord } from "../../utilities/useGenericInterfaces";
import AutoComplete from "primevue/autocomplete";
import InputText from "primevue/inputtext";
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  ref,
  watch,
} from "vue";
import multiIdController from "../../utilities/multiId";

export const AutoCompleteCustom = /*#__PURE__*/ defineComponent({
  name: "AutoCompleteCustom",
  components: {
    AutoComplete,
    InputText,
  },
  props: {
    options: {
      type: Array as PropType<IRecord[]>,
      required: true,
    },
    property: {
      type: String,
      required: false,
      default: "id",
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
      type: [String, Number],
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
    placeholder: {
      type: String,
      required: false,
    },
  },
  setup(props, { emit }) {
    const intialised = ref(false);
    const multiSelectController = multiIdController();
    const autoFillOptions = ref(props.options);
    const selectedOptions = ref(alreadySelected());
    const filteredOptions = ref();

    const remainingAutoFillOptions = computed(() => {
      if (!props.selected) return autoFillOptions.value;
      const selectedIds =
        typeof props.selected == "string"
          ? props.selected.split("|")
          : [props.selected];
      return autoFillOptions.value.filter(
        (r: IRecord) =>
          !selectedIds.some((id) => id == (r[props.property] as string))
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
            props.selected.toString(),
            props.property,
            autoFillOptions.value
          );
        } else {
          //console.log("Comes Here", autoFillOptions.value);
          return autoFillOptions.value.find(
            (option: IRecord) => option[props.property] === props.selected
          );
        }
      }
    }

    function getAutoCompleteValue() {
      if (selectedOptions.value) {
        if (Array.isArray(selectedOptions.value)) {
          return multiSelectController.getMultiIdString(selectedOptions.value);
        } else if (selectedOptions.value[props.property]) {
          return selectedOptions.value[props.property];
        }
      }
      return undefined;
    }

    function parseSelectedOptionsToString(): string {
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

    watch(
      () => props.selected,
      () => {
        selectedOptions.value = alreadySelected();
      }
    );

    watch(selectedOptions, () => {
      const newValue = getAutoCompleteValue();
      emit("updateOptionsValue", props.fieldName, newValue ?? undefined);
    });

    watch(
      () => props.options,
      () => {
        if (intialised.value) {
          autoFillOptions.value = props.options;
          selectedOptions.value = [];
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
export default AutoCompleteCustom;
</script>

<template>
  <div>
    <AutoComplete
      v-if="!disabled"
      forceSelection
      v-model="selectedOptions"
      :multiple="multiSelect"
      :suggestions="filteredOptions"
      :field="displayField"
      :completeOnFocus="true"
      :dropdown="true"
      :placeholder="placeholder"
      @complete="searchOptions($event)"
    ></AutoComplete>
    <input-text
      v-else
      :disabled="true"
      :model-value="parseSelectedOptionsToString()"
    />
  </div>
</template>

<style scoped lang="scss"></style>
