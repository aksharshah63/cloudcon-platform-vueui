<script lang="ts">
import { defineComponent, PropType } from "vue";

import Calendar from "primevue/calendar";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
import TriStateCheckbox from "primevue/tristatecheckbox";
import { IColumnMetadata } from "../../store/modules/upvise.d";
import { OptionsProgressStatus } from "../../../cloudconLibrary/utilities/useConstants";
import utils from "../../use/function/useUtils";

export const FilterMenuInputs = /*#__PURE__*/ defineComponent({
  name: "FilterMenuInputs",
  emits: ["filterValueChange"],
  components: {
    Calendar,
    Dropdown,
    InputNumber,
    InputText,
    MultiSelect,
    TriStateCheckbox,
  },
  props: {
    column: {
      type: Object as PropType<IColumnMetadata>,
      required: true,
    },
    filterValue: {
      required: true,
    },
  },
  setup(props, { emit }) {
    function updateFilterValue(newValue: unknown) {
      emit("filterValueChange", newValue);
    }

    return {
      utils,
      OptionsProgressStatus,
      props,
      updateFilterValue,
    };
  },
});

export default FilterMenuInputs;
</script>

<template>
  <MultiSelect
    v-if="
      ['progressStatusCellColour', 'progressStatusText'].includes(
        props.column.Style
      )
    "
    :model-value="props.filterValue"
    :options="OptionsProgressStatus"
    optionLabel="label"
    optionValue="value"
    placeholder="Status"
    class="multiselect-filter-input"
    @update:model-value="updateFilterValue($event)"
  >
    <template #option="slotProps">
      <div class="multiselect-option">
        <div
          v-if="props.column.Style === 'progressStatusCellColour'"
          class="box-colour"
          :class="slotProps.option.colour"
        />
        <span class="label">{{ slotProps.option.label }}</span>
      </div>
    </template>
  </MultiSelect>
  <InputText
    v-else-if="
      props.column.RawType.toLowerCase() === 'string' ||
      props.column.RawType.toLowerCase() === 'text' ||
      props.column.RawType.toLowerCase() === 'textarea' ||
      props.column.RawType.toLowerCase() === 'user'
    "
    type="text"
    :model-value="props.filterValue"
    class="input-text-field"
    placeholder="Text"
    @update:model-value="updateFilterValue($event)"
  />
  <Calendar
    v-else-if="
      props.column.RawType.toLowerCase() === 'date' ||
      props.column.RawType.toLowerCase() === 'datetime' ||
      props.column.Style.toLowerCase() === 'date'
    "
    dateFormat="dd/mm/yy"
    class="input-date"
    :model-value="props.filterValue"
    placeholder="dd/mm/yy"
    @update:model-value="updateFilterValue($event)"
  />
  <InputNumber
    v-else-if="
      props.column.RawType.toLowerCase() === 'number' ||
      props.column.RawType.toLowerCase() === 'integer' ||
      props.column.RawType.toLowerCase() === 'decimal'
    "
    :model-value="props.filterValue"
    class="input-number-field"
    placeholder="Value"
    :minFractionDigits="
      props.column.RawType.toLowerCase() === 'decimal' ? 1 : null
    "
    :maxFractionDigits="
      props.column.RawType.toLowerCase() === 'decimal' ? 10 : null
    "
    @update:model-value="updateFilterValue($event)"
  />
  <dropdown
    v-else-if="props.column.RawType.toLowerCase() === 'select'"
    :model-value="props.filterValue"
    class="input-dropdown-field"
    :options="getSelectOptions(props.column)"
    optionLabel="name"
    optionValue="name"
    placeholder="Select option"
    @update:model-value="updateFilterValue($event)"
  />
  <template
    v-else-if="
      props.column.RawType.toLowerCase() === 'checkbox' ||
      props.column.RawType.toLowerCase() === 'boolean' ||
      props.column.RawType.toLowerCase() === 'toogle'
    "
  >
    <tri-state-checkbox
      :model-value="utils.getBoolFromNum(props.filterValue)"
      @update:model-value="updateFilterValue(utils.getNumFromBool($event))"
    />
    <span
      v-if="props.filterValue !== null"
      class="checkbox-label"
      :class="{
        true: props.filterValue,
        false: !props.filterValue,
      }"
    >
      {{ props.filterValue ? "True" : "False" }}
    </span>
  </template>
</template>

<style lang="scss" scoped>
.multiselect-option {
  display: flex;
  align-items: center;

  .box-colour {
    border-radius: 5px;
    border: 1px solid $grey2;
    width: 18px;
    height: 18px;
    margin-right: 5px;

    &.red {
      background: $red;
    }

    &.green {
      background: $green;
    }

    &.yellow {
      background: $yellow;
    }
  }
}
</style>
