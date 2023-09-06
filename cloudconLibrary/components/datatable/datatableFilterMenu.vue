<script lang="ts">
import {
  IColumnMetadata,
  IGroupDetail,
  IMetadata,
} from "../../store/modules/tableData/tableDataModule";
import { computed, defineComponent, onMounted, PropType, ref } from "vue";
import { IDatatableFilter } from "../datatable/datatable.vue";
import {
  DataFilter,
  booleanOperatorLabelsMap,
  numberOperatorLabelsMap,
  stringOperatorLabelsMap,
} from "../../dataFilter/dataFilter";
import useMetadata from "../../utilities/useMetadata";
import Dropdown, { DropdownChangeEvent } from "primevue/dropdown";
import utils from "../../utilities/useUtils";
import {
  DataFilterBooleanOperator,
  DataFilterCondition,
  DataFilterNumberOperator,
  DataFilterOperator,
  DataFilterStringOperator,
  DataFilterType,
  IDataFilterRule,
} from "../../dataFilter/dataFilterInterfaces";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";

interface IDatatableFilterMenuOperatorOption {
  isOption: boolean; // Whether it should be an option in the menu
  valueInputType?: DatatableFilterMenuValueInputType; // type of input fields to show
  label?: string; // Label to show in dropdown
  value?: DataFilterOperator; // Value to save in dropdown
}

enum DatatableFilterMenuValueInputType {
  SINGLE = "single",
  DOUBLE = "double",
}

export const DatatableFilterMenu = /*#__PURE__*/ defineComponent({
  name: "DatatableFilterMenu",
  components: {
    Dropdown,
    InputText,
    InputNumber,
  },
  emits: ["closeMenu", "updateFilters"],
  props: {
    metadata: {
      type: Object as PropType<IMetadata>,
      required: true,
    },
    filters: {
      type: Object as PropType<Record<string, IDatatableFilter>>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const dataFilter = new DataFilter();
    const metadataController = useMetadata();
    const selectedGroup = ref<IGroupDetail | null>(null);
    const copyFilters = ref<Record<string, IDatatableFilter>>(
      utils.deepCopy(props.filters)
    );
    const DataFilterConditionOptions = ref<
      { label: string; value: DataFilterCondition }[]
    >([
      { label: "Match Any", value: DataFilterCondition.AND },
      { label: "Match All", value: DataFilterCondition.OR },
    ]);
    const stringOperatorDetails: Record<
      DataFilterStringOperator,
      IDatatableFilterMenuOperatorOption
    > = {
      [DataFilterStringOperator.EQUAL]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterStringOperator.NOT_EQUAL]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterStringOperator.IN]: {
        isOption: false,
      },
      [DataFilterStringOperator.NOT_IN]: {
        isOption: false,
      },
      [DataFilterStringOperator.BEGINS_WITH]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterStringOperator.NOT_BEGINS_WITH]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterStringOperator.CONTAINS]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterStringOperator.NOT_CONTAINS]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterStringOperator.ENDS_WITH]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterStringOperator.NOT_ENDS_WITH]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterStringOperator.IS_EMPTY]: {
        isOption: true,
      },
      [DataFilterStringOperator.IS_NOT_EMPTY]: {
        isOption: true,
      },
      [DataFilterStringOperator.IS_NULL]: {
        isOption: true,
      },
      [DataFilterStringOperator.IS_NOT_NULL]: {
        isOption: true,
      },
    };
    const numberOperatorDetails: Record<
      DataFilterNumberOperator,
      IDatatableFilterMenuOperatorOption
    > = {
      [DataFilterNumberOperator.BETWEEN]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.DOUBLE,
      },
      [DataFilterNumberOperator.EQUAL]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterNumberOperator.GREATER]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterNumberOperator.GREATER_OR_EQUAL]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterNumberOperator.IN]: {
        isOption: false,
      },
      [DataFilterNumberOperator.IS_NOT_NULL]: {
        isOption: true,
      },
      [DataFilterNumberOperator.IS_NULL]: {
        isOption: true,
      },
      [DataFilterNumberOperator.LESS]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterNumberOperator.LESS_OR_EQUAL]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterNumberOperator.NOT_BETWEEN]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.DOUBLE,
      },
      [DataFilterNumberOperator.NOT_EQUAL]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterNumberOperator.NOT_IN]: {
        isOption: false,
      },
    };
    const booleanOperatorDetails: Record<
      DataFilterBooleanOperator,
      IDatatableFilterMenuOperatorOption
    > = {
      [DataFilterBooleanOperator.EQUAL]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
      [DataFilterBooleanOperator.IS_NOT_NULL]: {
        isOption: true,
      },
      [DataFilterBooleanOperator.IS_NULL]: {
        isOption: true,
      },
      [DataFilterBooleanOperator.NOT_EQUAL]: {
        isOption: true,
        valueInputType: DatatableFilterMenuValueInputType.SINGLE,
      },
    };
    const stringOperatorOptions = ref<IDatatableFilterMenuOperatorOption[]>(
      getDataFilterOperatorOptions(
        stringOperatorDetails,
        stringOperatorLabelsMap
      )
    );
    const numberOperatorOptions = ref<IDatatableFilterMenuOperatorOption[]>(
      getDataFilterOperatorOptions(
        numberOperatorDetails,
        numberOperatorLabelsMap
      )
    );
    const booleanOperatorOptions = ref<IDatatableFilterMenuOperatorOption[]>(
      getDataFilterOperatorOptions(
        booleanOperatorDetails,
        booleanOperatorLabelsMap
      )
    );
    const booleanValueOptions = ref<{ label: string; value: boolean }[]>([
      { label: "True", value: true },
      { label: "False", value: false },
    ]);

    const groupOptions = computed<IGroupDetail[]>(() =>
      Object.values(metadataController.getGrouping(props.metadata))
    );

    const showGroups = computed<boolean>(() =>
      groupOptions.value.length > 1 ? true : false
    );

    const filtersForGroup = computed<IDatatableFilter>({
      get() {
        if (selectedGroup.value == null) return {};
        return copyFilters.value[selectedGroup.value.Type] ?? {};
      },
      set(newFiltersForGroup) {
        if (selectedGroup.value != null)
          copyFilters.value[selectedGroup.value.Type] = newFiltersForGroup;
      },
    });

    const columns = computed<Record<string, IColumnMetadata[]>>(() => {
      const result: Record<string, IColumnMetadata[]> = {};

      groupOptions.value.forEach((group) => {
        result[group.Type] =
          metadataController.getViewableColumns(props.metadata, group.Type) ??
          [];
      });

      return result;
    });

    const columnsForGroup = computed<IColumnMetadata[]>(() => {
      return selectedGroup.value
        ? columns.value[selectedGroup.value.Type] ?? []
        : [];
    });

    const addFilterOptions = computed<IColumnMetadata[]>(() => {
      const currentFilterInternalNames = Object.keys(filtersForGroup.value);

      return columnsForGroup.value.filter((c) => {
        return (
          c.InternalName != null &&
          !currentFilterInternalNames.includes(c.InternalName)
        );
      });
    });

    function groupClick(group: IGroupDetail): void {
      selectedGroup.value = group;
    }

    function closeMenu(): void {
      emit("closeMenu");
    }

    function addFilter(event: DropdownChangeEvent): void {
      const columnToAdd = event.value as IColumnMetadata;
      const columnInternalName = columnToAdd.InternalName;
      const currentFilterInternalNames = Object.keys(filtersForGroup.value);

      if (
        columnInternalName != null &&
        !currentFilterInternalNames.includes(columnInternalName) &&
        selectedGroup.value != null
      ) {
        if (!(selectedGroup.value.Type in copyFilters.value))
          copyFilters.value[selectedGroup.value.Type] = {};
        if (
          !(columnInternalName in copyFilters.value[selectedGroup.value.Type])
        )
          copyFilters.value[selectedGroup.value.Type][columnInternalName] = {
            condition: DataFilterCondition.AND,
            rules: [],
          };
      }
    }

    function getColumnLabel(columnInternalName: string): string {
      return (
        columnsForGroup.value.find((c) => c.InternalName == columnInternalName)
          ?.Label ?? ""
      );
    }

    function getColumnRawType(columnInternalName: string): string {
      return (
        columnsForGroup.value
          .find((c) => c.InternalName == columnInternalName)
          ?.RawType?.toLowerCase() ?? ""
      );
    }

    function applyFilters(): void {
      const copyFiltersToSend = utils.deepCopy(copyFilters.value);

      // Only keep valid rules
      Object.values(copyFiltersToSend).forEach((filtersForGroup) => {
        Object.entries(filtersForGroup).forEach(
          ([columnInternalName, filtersForColumn]) => {
            filtersForColumn.rules = filtersForColumn.rules.filter((rule) =>
              dataFilter.isValidRule(rule as Partial<IDataFilterRule>)
            );

            // If no valid rules, delete the filter object for that column
            if (filtersForColumn.rules.length < 1)
              delete filtersForGroup[columnInternalName];
          }
        );
      });

      emit("updateFilters", copyFiltersToSend);
      closeMenu();
    }

    function resetFilters(): void {
      const copyFiltersToSend = utils.deepCopy(copyFilters.value);

      Object.keys(copyFiltersToSend).forEach((groupType) => {
        copyFiltersToSend[groupType] = {};
      });

      emit("updateFilters", copyFiltersToSend);
      closeMenu();
    }

    function deleteFilter(columnInternalName: string): void {
      if (
        selectedGroup.value &&
        selectedGroup.value.Type in copyFilters.value &&
        columnInternalName in copyFilters.value[selectedGroup.value.Type]
      )
        delete copyFilters.value[selectedGroup.value.Type][columnInternalName];
    }

    function deleteFilterRule(
      columnInternalName: string,
      ruleIndex: number
    ): void {
      if (
        selectedGroup.value &&
        selectedGroup.value.Type in copyFilters.value &&
        columnInternalName in copyFilters.value[selectedGroup.value.Type]
      ) {
        const rulesArray =
          copyFilters.value[selectedGroup.value.Type][columnInternalName].rules;
        rulesArray.splice(ruleIndex, 1);
      }
    }

    function addFilterRule(columnInternalName: string): void {
      if (
        selectedGroup.value &&
        selectedGroup.value.Type in copyFilters.value &&
        columnInternalName in copyFilters.value[selectedGroup.value.Type]
      ) {
        const rulesArray: Partial<IDataFilterRule>[] =
          copyFilters.value[selectedGroup.value.Type][columnInternalName].rules;
        const columnRawType = getColumnRawType(columnInternalName);
        const DataFilterType = dataFilter.getFilterType(columnRawType);

        if (DataFilterType != null)
          rulesArray.push({
            field: columnInternalName,
            type: DataFilterType,
            operator: getDefaultOperator(DataFilterType),
          });
      }
    }

    function getDefaultOperator(type: DataFilterType): DataFilterOperator {
      switch (type) {
        case DataFilterType.STRING:
          return DataFilterStringOperator.EQUAL;
        case DataFilterType.NUMBER:
          return DataFilterNumberOperator.EQUAL;
        case DataFilterType.BOOLEAN:
          return DataFilterBooleanOperator.EQUAL;
      }
    }

    function getDataFilterOperatorOptions<T extends DataFilterOperator>(
      DataFilterOperatorDetails: Record<T, IDatatableFilterMenuOperatorOption>,
      DataFilterOperatorLabelsMap: Record<T, string>
    ): IDatatableFilterMenuOperatorOption[] {
      return (
        Object.entries(DataFilterOperatorDetails) as [
          T,
          IDatatableFilterMenuOperatorOption
        ][]
      )
        .filter(([_, details]) => details.isOption)
        .map(([operator, details]) => {
          return {
            ...details,
            value: operator,
            label: DataFilterOperatorLabelsMap[operator],
          };
        });
    }

    function getValueInputType(
      operator: DataFilterOperator,
      type: DataFilterType
    ): DatatableFilterMenuValueInputType | null {
      switch (type) {
        case DataFilterType.STRING:
          return (
            stringOperatorDetails[operator as DataFilterStringOperator]
              ?.valueInputType ?? null
          );
        case DataFilterType.NUMBER:
          return (
            numberOperatorDetails[operator as DataFilterNumberOperator]
              ?.valueInputType ?? null
          );
        case DataFilterType.BOOLEAN:
          return (
            booleanOperatorDetails[operator as DataFilterBooleanOperator]
              ?.valueInputType ?? null
          );
        default:
          return null;
      }
    }

    function updateValueArray(
      newValue: string | number,
      rule: IDataFilterRule,
      index: number
    ): void {
      if (Array.isArray(rule.value)) {
        rule.value[index] = newValue;
      } else {
        const newValueArray: string[] | number[] = [];
        newValueArray[index] = newValue;
        rule.value = newValueArray;
      }
    }

    function updateOperator(
      newOperator: DataFilterOperator,
      rule: IDataFilterRule
    ): void {
      let oldOperatorDetails: IDatatableFilterMenuOperatorOption | null = null;
      let newOperatorDetails: IDatatableFilterMenuOperatorOption | null = null;

      switch (rule.type) {
        case DataFilterType.STRING:
          oldOperatorDetails =
            stringOperatorDetails[rule.operator as DataFilterStringOperator];
          newOperatorDetails =
            stringOperatorDetails[newOperator as DataFilterStringOperator];
          break;
        case DataFilterType.NUMBER:
          oldOperatorDetails =
            numberOperatorDetails[rule.operator as DataFilterNumberOperator];
          newOperatorDetails =
            numberOperatorDetails[newOperator as DataFilterNumberOperator];
          break;
        case DataFilterType.BOOLEAN:
          oldOperatorDetails =
            booleanOperatorDetails[rule.operator as DataFilterBooleanOperator];
          newOperatorDetails =
            booleanOperatorDetails[newOperator as DataFilterBooleanOperator];
          break;
      }

      rule.operator = newOperator;

      // Only delete value if valueInputType is different between new and old operators
      if (
        oldOperatorDetails == null ||
        newOperatorDetails == null ||
        oldOperatorDetails.valueInputType != newOperatorDetails.valueInputType
      )
        delete rule.value;
    }

    onMounted(() => {
      if (groupOptions.value.length > 0)
        selectedGroup.value = groupOptions.value[0];
    });

    return {
      DataFilterType,
      DatatableFilterMenuValueInputType,
      selectedGroup,
      DataFilterConditionOptions,
      stringOperatorOptions,
      numberOperatorOptions,
      booleanOperatorOptions,
      booleanValueOptions,
      groupOptions,
      showGroups,
      filtersForGroup,
      columnsForGroup,
      addFilterOptions,
      groupClick,
      closeMenu,
      addFilter,
      getColumnLabel,
      getColumnRawType,
      applyFilters,
      resetFilters,
      deleteFilter,
      deleteFilterRule,
      addFilterRule,
      getDataFilterType: dataFilter.getFilterType,
      getValueInputType,
      updateValueArray,
      updateOperator,
    };
  },
});
export default DatatableFilterMenu;
</script>

<template>
  <div class="datatable-filter-menu">
    <div
      class="datatable-filter-menu-header is-flex is-justify-content-space-between is-align-items-center"
    >
      <span class="datatable-filter-menu-header-label">Filters</span>
      <button
        class="datatable-filter-menu-header-close-button is-flex is-justify-content-center is-align-items-center pointer"
        @click="closeMenu()"
      >
        <font-awesome-icon
          class="datatable-filter-menu-header-close-button-icon"
          :icon="['fa', 'times']"
        />
      </button>
    </div>

    <div v-if="showGroups" class="datatable-filter-menu-tabs-container is-flex">
      <div
        v-for="group in groupOptions"
        :key="group.Type"
        class="datatable-filter-menu-tab is-flex pointer"
        :class="{
          'datatable-filter-menu-tab-selected':
            selectedGroup != null && selectedGroup.Type == group.Type,
        }"
        @click="groupClick(group)"
      >
        <span class="datatable-filter-menu-tab-label">{{ group.Name }}</span>
      </div>
    </div>

    <template v-if="selectedGroup">
      <div class="datatable-filter-menu-filters-container">
        <div
          v-for="({ rules }, columnInternalName) in filtersForGroup"
          :key="columnInternalName"
          class="datatable-filter-menu-column-filters-container is-flex is-flex-direction-column"
        >
          <div
            class="datatable-filter-menu-column-filters-header is-flex is-align-items-center"
          >
            <span
              class="datatable-filter-menu-column-filters-header-label is-flex-grow-1"
              >{{ getColumnLabel(columnInternalName) }}</span
            >
            <div
              class="datatable-filter-menu-column-filters-header-delete-filter-button-container is-flex is-justify-content-center is-align-items-center pointer"
              @click="deleteFilter(columnInternalName)"
            >
              <font-awesome-icon
                class="datatable-filter-menu-column-filters-header-delete-filter-button-icon"
                :icon="['fa', 'trash-alt']"
              />
            </div>
          </div>

          <div
            class="datatable-filter-menu-column-filters-filter-condition-container"
          >
            <Dropdown
              v-model="filtersForGroup[columnInternalName].condition"
              class="datatable-filter-menu-dropdown-field datatable-filter-menu-column-filters-filter-condition"
              :options="DataFilterConditionOptions"
              optionLabel="label"
              optionValue="value"
            />
          </div>

          <div
            class="datatable-filter-menu-column-filters-rules-container is-flex is-flex-direction-column"
          >
            <div
              v-for="(rule, i) in rules"
              :key="i"
              class="datatable-filter-menu-column-filters-rule is-flex is-align-items-center"
            >
              <template
                v-if="
                  getDataFilterType(getColumnRawType(rule.field)) ==
                  DataFilterType.STRING
                "
              >
                <Dropdown
                  class="datatable-filter-menu-dropdown-field datatable-filter-menu-column-filters-rule-operator"
                  :modelValue="rules[i].operator"
                  :options="stringOperatorOptions"
                  optionLabel="label"
                  optionValue="value"
                  @update:modelValue="updateOperator($event, rules[i])"
                />

                <div
                  class="datatable-filter-menu-column-filters-rule-value-container"
                >
                  <InputText
                    v-if="
                      getValueInputType(
                        rules[i].operator,
                        DataFilterType.STRING
                      ) == DatatableFilterMenuValueInputType.SINGLE
                    "
                    v-model="rules[i].value"
                    class="datatable-filter-menu-input-text-field datatable-filter-menu-column-filters-rule-value"
                  />
                </div>
              </template>

              <template
                v-else-if="
                  getDataFilterType(getColumnRawType(rule.field)) ==
                  DataFilterType.NUMBER
                "
              >
                <Dropdown
                  class="datatable-filter-menu-dropdown-field datatable-filter-menu-column-filters-rule-operator"
                  :modelValue="rules[i].operator"
                  :options="numberOperatorOptions"
                  optionLabel="label"
                  optionValue="value"
                  @update:modelValue="updateOperator($event, rules[i])"
                />

                <div
                  class="datatable-filter-menu-column-filters-rule-value-container is-flex"
                >
                  <InputNumber
                    v-if="
                      getValueInputType(
                        rules[i].operator,
                        DataFilterType.NUMBER
                      ) == DatatableFilterMenuValueInputType.SINGLE
                    "
                    v-model="rules[i].value"
                    class="datatable-filter-menu-input-number-field datatable-filter-menu-column-filters-rule-value"
                  />

                  <template
                    v-else-if="
                      getValueInputType(
                        rules[i].operator,
                        DataFilterType.NUMBER
                      ) == DatatableFilterMenuValueInputType.DOUBLE
                    "
                  >
                    <InputNumber
                      :modelValue="rules[i].value"
                      class="datatable-filter-menu-input-number-field datatable-filter-menu-column-filters-rule-value"
                      @update:modelValue="updateValueArray($event, rules[i], 0)"
                    />
                    <InputNumber
                      :modelValue="rules[i].value"
                      class="datatable-filter-menu-input-number-field datatable-filter-menu-column-filters-rule-value"
                      @update:modelValue="updateValueArray($event, rules[i], 1)"
                    />
                  </template>
                </div>
              </template>

              <template
                v-else-if="
                  getDataFilterType(getColumnRawType(rule.field)) ==
                  DataFilterType.BOOLEAN
                "
              >
                <Dropdown
                  class="datatable-filter-menu-dropdown-field datatable-filter-menu-column-filters-rule-operator"
                  :modelValue="rules[i].operator"
                  :options="booleanOperatorOptions"
                  optionLabel="label"
                  optionValue="value"
                  @update:modelValue="updateOperator($event, rules[i])"
                />

                <div
                  class="datatable-filter-menu-column-filters-rule-value-container"
                >
                  <Dropdown
                    v-if="
                      getValueInputType(
                        rules[i].operator,
                        DataFilterType.BOOLEAN
                      ) == DatatableFilterMenuValueInputType.SINGLE
                    "
                    v-model="rules[i].value"
                    class="datatable-filter-menu-input-number-field datatable-filter-menu-column-filters-rule-value"
                    :options="booleanValueOptions"
                    optionLabel="label"
                    optionValue="value"
                  />
                </div>
              </template>

              <template v-else>
                <span>{{
                  "MISSING TYPE: " + getColumnRawType(rule.field).toLowerCase()
                }}</span>
              </template>

              <button
                class="datatable-filter-menu-column-filters-rule-delete-filter-rule-button is-flex is-justify-content-center is-align-items-center ml-auto pointer"
                @click="deleteFilterRule(columnInternalName, i)"
              >
                <font-awesome-icon
                  class="datatable-filter-menu-column-filters-rule-delete-filter-rule-button-icon"
                  :icon="['fa', 'trash-alt']"
                />
              </button>
            </div>
          </div>

          <button
            class="datatable-filter-menu-column-filters-add-filter-rule-button is-flex is-justify-content-center is-align-items-center is-align-self-flex-start pointer"
            @click="addFilterRule(columnInternalName)"
          >
            <font-awesome-icon
              class="datatable-filter-menu-column-filters-add-filter-rule-button-icon"
              :icon="['fa', 'plus']"
            />
            <span
              class="datatable-filter-menu-column-filters-add-filter-rule-button-label"
              >Add Rule</span
            >
          </button>
        </div>
      </div>

      <div
        class="datatable-filter-menu-add-filter-container is-flex is-align-items-center"
      >
        <span class="datatable-filter-menu-add-filter-label"
          >Add Filter for Field</span
        >
        <Dropdown
          :options="addFilterOptions"
          class="datatable-filter-menu-dropdown-field"
          optionLabel="Label"
          placeholder="Select Field"
          @change="addFilter($event)"
        />
      </div>
    </template>

    <div
      class="datatable-filter-menu-footer is-flex is-justify-content-center is-align-items-center"
    >
      <button
        class="datatable-filter-menu-footer-clear-button pointer"
        @click="resetFilters()"
      >
        Clear
      </button>
      <button
        class="datatable-filter-menu-footer-apply-button pointer"
        @click="applyFilters()"
      >
        Apply
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.datatable-filter-menu {
  width: var(--datatable-filter-menu-width);

  > .datatable-filter-menu-header {
    border-bottom: var(--datatable-filter-menu-header-border-bottom);
    padding: var(--datatable-filter-menu-header-padding);
    margin: var(--datatable-filter-menu-header-margin);

    > .datatable-filter-menu-header-label {
      font-size: var(--datatable-filter-menu-header-label-font-size);
      line-height: var(--datatable-filter-menu-header-label-font-size);
      font-weight: var(--datatable-filter-menu-header-label-font-weight);
    }

    > .datatable-filter-menu-header-close-button {
      padding: var(--datatable-filter-menu-header-close-button-padding);
      border-radius: var(
        --datatable-filter-menu-header-close-button-border-radius
      );
      border: none;
      background: none;

      &:hover {
        background: var(
          --datatable-filter-menu-header-close-button-hover-background-colour
        );
      }

      > .datatable-filter-menu-header-close-button-icon {
        font-size: var(
          --datatable-filter-menu-header-close-button-icon-font-size
        );
      }
    }
  }

  > .datatable-filter-menu-tabs-container {
    padding: var(--datatable-filter-menu-tabs-container-padding);

    > .datatable-filter-menu-tab {
      padding: var(--datatable-filter-menu-tabs-padding);
      border-top-left-radius: var(--datatable-filter-menu-tabs-border-radius);
      border-top-right-radius: var(--datatable-filter-menu-tabs-border-radius);

      &.datatable-filter-menu-tab-selected {
        background-color: var(
          --datatable-filter-menu-tabs-selected-tab-background-colour
        );

        > .datatable-filter-menu-tab-label {
          color: var(
            --datatable-filter-menu-tabs-label-selected-tab-font-colour
          );
        }
      }

      > .datatable-filter-menu-tab-label {
        font-size: var(--datatable-filter-menu-tabs-label-font-size);
        font-weight: var(--datatable-filter-menu-tabs-label-font-weight);
        line-height: var(--datatable-filter-menu-tabs-label-font-size);
        color: var(--datatable-filter-menu-tabs-label-font-colour);
      }
    }
  }

  > .datatable-filter-menu-filters-container {
    padding: var(--datatable-filter-menu-filters-container-padding);
    max-height: var(--datatable-filter-menu-filters-container-max-height);
    border: var(--datatable-filter-menu-fitlers-container-border);
    border-radius: var(--datatable-filter-menu-fitlers-container-border-radius);
    overflow-y: auto;

    > .datatable-filter-menu-column-filters-container {
      gap: var(--datatable-filter-menu-column-filters-container-gap);
      padding: var(--datatable-filter-menu-column-filters-container-padding);

      &:not(:last-child) {
        border-bottom: var(
          --datatable-filter-menu-column-filters-container-border-bottom
        );
      }

      > .datatable-filter-menu-column-filters-header {
        gap: var(--datatable-filter-menu-column-filters-header-gap);

        > .datatable-filter-menu-column-filters-header-label {
          font-size: var(
            --datatable-filter-menu-column-filters-header-label-font-size
          );
          font-weight: var(
            --datatable-filter-menu-column-filters-header-label-font-weight
          );
        }

        > .datatable-filter-menu-column-filters-header-delete-filter-button-container {
          padding: var(
            --datatable-filter-menu-column-filters-header-delete-filter-button-container-padding
          );
          border-radius: var(
            --datatable-filter-menu-column-filters-header-delete-filter-button-container-border-radius
          );

          &:hover {
            background: var(
              --datatable-filter-menu-column-filters-header-delete-filter-button-container-hover-background-colour
            );
          }

          > .datatable-filter-menu-column-filters-header-delete-filter-button-icon {
            color: var(
              --datatable-filter-menu-column-filters-header-delete-filter-button-icon-colour
            );
            font-size: var(
              --datatable-filter-menu-column-filters-header-delete-filter-button-icon-font-size
            );
          }
        }
      }

      > .datatable-filter-menu-column-filters-filter-condition-container {
        width: var(
          --datatable-filter-menu-column-filters-filter-condition-container-width
        );

        > .datatable-filter-menu-column-filters-filter-condition {
          width: 100%;
        }
      }

      > .datatable-filter-menu-column-filters-rules-container {
        padding: var(
          --datatable-filter-menu-column-filters-rules-container-padding
        );
        gap: var(--datatable-filter-menu-column-filters-rules-container-gap);

        > .datatable-filter-menu-column-filters-rule {
          gap: var(--datatable-filter-menu-column-filters-rule-gap);

          > .datatable-filter-menu-column-filters-rule-operator {
            width: var(
              --datatable-filter-menu-column-filters-rule-operator-width
            );
          }

          > .datatable-filter-menu-column-filters-rule-value-container {
            width: var(
              --datatable-filter-menu-column-filters-rule-value-container-width
            );
            gap: var(
              --datatable-filter-menu-column-filters-rule-value-container-gap
            );
          }

          > .datatable-filter-menu-column-filters-rule-delete-filter-rule-button {
            padding: var(
              --datatable-filter-menu-column-filters-rule-delete-filter-rule-button-padding
            );
            border-radius: var(
              --datatable-filter-menu-column-filters-rule-delete-filter-rule-button-border-radius
            );
            border: none;
            background: none;

            &:hover {
              background: var(
                --datatable-filter-menu-column-filters-rule-delete-filter-rule-button-hover-background-colour
              );
            }

            > .datatable-filter-menu-column-filters-rule-delete-filter-rule-button-icon {
              color: var(
                --datatable-filter-menu-column-filters-rule-delete-filter-rule-button-icon-colour
              );
              font-size: var(
                --datatable-filter-menu-column-filters-rule-delete-filter-rule-button-icon-font-size
              );
            }
          }
        }
      }

      .datatable-filter-menu-column-filters-add-filter-rule-button {
        border: none;
        background: var(
          --datatable-filter-menu-column-filters-add-filter-rule-button-background-colour
        );
        color: var(
          --datatable-filter-menu-column-filters-add-filter-rule-button-font-colour
        );
        gap: var(
          --datatable-filter-menu-column-filters-add-filter-rule-button-gap
        );
        padding: var(
          --datatable-filter-menu-column-filters-add-filter-rule-button-padding
        );
        border-radius: var(
          --datatable-filter-menu-column-filters-add-filter-rule-button-border-radius
        );

        > .datatable-filter-menu-column-filters-add-filter-rule-button-label {
          font-size: var(
            --datatable-filter-menu-column-filters-add-filter-rule-button-label-font-size
          );
          font-weight: var(
            --datatable-filter-menu-column-filters-add-filter-rule-button-label-font-weight
          );
          line-height: var(
            --datatable-filter-menu-column-filters-add-filter-rule-button-label-font-size
          );
        }
      }
    }
  }

  > .datatable-filter-menu-add-filter-container {
    padding: var(--datatable-filter-menu-add-filter-container-padding);
    gap: var(--datatable-filter-menu-add-filter-container-gap);

    > .datatable-filter-menu-add-filter-label {
      font-weight: var(--datatable-filter-menu-add-filter-label-font-weight);
    }
  }

  > .datatable-filter-menu-footer {
    padding: var(--datatable-filter-menu-footer-padding);
    gap: var(--datatable-filter-menu-footer-gap);

    > .datatable-filter-menu-footer-apply-button {
      font-family: Poppins, serif;
      height: var(--datatable-filter-menu-footer-button-height);
      width: var(--datatable-filter-menu-footer-button-width);
      border-radius: var(--datatable-filter-menu-footer-button-border-radius);
      font-size: var(--datatable-filter-menu-footer-button-font-size);
      font-weight: var(--datatable-filter-menu-footer-button-font-weight);
      background: var(
        --datatable-filter-menu-footer-apply-button-background-colour
      );
      border: var(--datatable-filter-menu-footer-apply-button-border);
      color: var(--datatable-filter-menu-footer-apply-button-font-colour);
    }

    > .datatable-filter-menu-footer-clear-button {
      font-family: Poppins, serif;
      height: var(--datatable-filter-menu-footer-button-height);
      width: var(--datatable-filter-menu-footer-button-width);
      border-radius: var(--datatable-filter-menu-footer-button-border-radius);
      font-size: var(--datatable-filter-menu-footer-button-font-size);
      font-weight: var(--datatable-filter-menu-footer-button-font-weight);
      background: var(
        --datatable-filter-menu-footer-clear-button-background-colour
      );
      border: var(--datatable-filter-menu-footer-clear-button-border);
      color: var(--datatable-filter-menu-footer-clear-button-font-colour);
    }
  }

  // Style for all dropdowns in this menu
  .datatable-filter-menu-dropdown-field {
    border-radius: var(--datatable-filter-menu-field-border-radius);
    border: var(--datatable-filter-menu-field-border);

    &.p-focus {
      box-shadow: none;
    }

    ::v-deep(.p-inputtext) {
      font-family: Poppins, serif;
      font-style: normal;
      font-weight: normal;
      font-size: var(--datatable-filter-menu-field-text-font-size);
      color: var(--datatable-filter-menu-field-text-font-colour);
    }
  }

  // Text input fields
  .datatable-filter-menu-input-text-field {
    border-radius: var(--datatable-filter-menu-field-border-radius);
    border: var(--datatable-filter-menu-field-border);
    width: 100%;

    &:focus {
      box-shadow: none;
    }

    ::v-deep(.p-inputtext) {
      font-family: Poppins, serif;
      font-style: normal;
      font-weight: normal;
      font-size: var(--datatable-filter-menu-field-text-font-size);
      color: var(--datatable-filter-menu-field-text-font-colour);
    }
  }

  // Number input fields
  .datatable-filter-menu-input-number-field {
    border: none;
    flex: 1;

    ::v-deep(.p-inputtext) {
      font-family: Poppins, serif;
      font-style: normal;
      font-weight: normal;
      font-size: var(--datatable-filter-menu-field-text-font-size);
      color: var(--datatable-filter-menu-field-text-font-colour);
      border-radius: var(--datatable-filter-menu-field-border-radius);
      border: var(--datatable-filter-menu-field-border);
      width: 100%;

      &:focus {
        box-shadow: none;
      }
    }
  }
}
</style>
