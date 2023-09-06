<script lang="ts">
import { IMetadata } from "../../store/modules/tableData/tableDataModule";
import { computed, defineComponent, PropType } from "vue";
import { IDatatableFilter } from "./datatable.vue";
import useMetadata from "../../utilities/useMetadata";
import { DataFilter } from "../../dataFilter/dataFilter";
import Chip from "primevue/chip";

interface IDatatableFilterFeedback {
  groupName: string;
  rules: Record<string, string>; // key is the column internal name and value is the label to show
}

export const DatatableFilterFeedback = /*#__PURE__*/ defineComponent({
  name: "DatatableFilterFeedback",
  components: {
    Chip,
  },
  emits: ["deleteColumnFilter", "deleteAllFilters"],
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

    const formattedFilters = computed<Record<string, IDatatableFilterFeedback>>(
      () => {
        const filtersToDisplay: Record<string, IDatatableFilterFeedback> = {};
        const grouping = Object.values(
          metadataController.getGrouping(props.metadata)
        );

        Object.entries(props.filters ?? {}).forEach(
          ([groupType, datatableFilter]) => {
            const groupName = grouping.find((g) => g.Type == groupType)?.Name;

            if (groupName == null) return;

            if (!(groupType in filtersToDisplay))
              filtersToDisplay[groupType] = {
                groupName: groupName,
                rules: {},
              };

            Object.entries(datatableFilter).forEach(
              ([columnInternalName, columnFilter]) => {
                if (columnFilter.rules.length < 1) return;

                const ruleStrings: string[] = columnFilter.rules.map((rule) => {
                  const columnLabel: string =
                    metadataController.getColumn(
                      props.metadata,
                      groupType,
                      columnInternalName
                    )?.Label ?? "";
                  const operatorLabel: string =
                    dataFilter.getFilterOperatorLabel(rule.operator, rule.type);
                  const formattedValue = rule.value; // TODO format value e.g. epoch to date string

                  return `${columnLabel} ${operatorLabel}${
                    formattedValue == null ? "" : ' "' + formattedValue + '"'
                  }`;
                });

                filtersToDisplay[groupType].rules[columnInternalName] =
                  ruleStrings.join(
                    ` ${dataFilter.getFilterConditionLabel(
                      columnFilter.condition
                    )} `
                  );
              }
            );
          }
        );

        return filtersToDisplay;
      }
    );

    const showGroupName = computed<boolean>(() =>
      metadataController.getGroupingLevels(props.metadata) > 1 ? true : false
    );

    function deleteColumnFilter(
      groupType: string,
      columnInternalName: string
    ): void {
      emit("deleteColumnFilter", groupType, columnInternalName);
    }

    function deleteAllFilters(): void {
      emit("deleteAllFilters");
    }

    return {
      formattedFilters,
      showGroupName,
      deleteColumnFilter,
      deleteAllFilters,
    };
  },
});
export default DatatableFilterFeedback;
</script>

<template>
  <div
    class="datatable-filter-feedback is-flex is-justify-content-center is-align-items-center"
  >
    <span class="datatable-filter-feedback-label">FILTERS</span>

    <div
      class="datatable-filter-feedback-filters-container is-flex is-flex-direction-column is-flex-grow-1"
    >
      <template
        v-for="(filtersForGroup, groupType) in formattedFilters"
        :key="groupType"
      >
        <div
          v-if="Object.keys(filtersForGroup.rules).length > 0"
          class="datatable-filter-feedback-filters-list"
        >
          <span
            v-if="showGroupName"
            class="datatable-filter-feedback-group-label"
          >
            {{ filtersForGroup.groupName + ":" }}
          </span>

          <Chip
            v-for="(rulesString, columnInternalName) in filtersForGroup.rules"
            :key="columnInternalName"
            @remove="deleteColumnFilter(groupType, columnInternalName)"
            removable
            class="datatable-filter-feedback-chip"
          >
            {{ rulesString }}
          </Chip>
        </div>
      </template>
    </div>

    <button
      class="datatable-filter-feedback-clear-button pointer"
      @click="deleteAllFilters()"
    >
      CLEAR
    </button>
  </div>
</template>

<style scoped lang="scss">
.datatable-filter-feedback {
  border-radius: var(--datatable-filter-feedback-border-radius);
  padding: var(--datatable-filter-feedback-padding);
  border: var(--datatable-filter-feedback-border);
  background: var(--datatable-filter-feedback-background-colour);
  gap: var(--datatable-filter-feedback-gap);
  width: 100%;

  > .datatable-filter-feedback-label {
    font-weight: var(--datatable-filter-feedback-label-font-weight);
    font-size: var(--datatable-filter-feedback-label-font-size);
  }

  > .datatable-filter-feedback-filters-container {
    gap: var(--datatable-filter-feedback-filters-container-gap);

    > .datatable-filter-feedback-filters-list {
      > .datatable-filter-feedback-group-label {
        font-size: var(--datatable-filter-feedback-group-label-font-size);
        margin: var(--datatable-filter-feedback-group-label-margin);
      }
    }
  }

  > .datatable-filter-feedback-clear-button {
    font-family: var(--datatable-filter-feedback-clear-button-font-family);
    border-radius: var(--datatable-filter-feedback-clear-button-border-radius);
    font-size: var(--datatable-filter-feedback-clear-button-font-size);
    border: var(--datatable-filter-feedback-clear-button-border);
    background: var(--datatable-filter-feedback-clear-button-background-colour);
    color: var(--datatable-filter-feedback-clear-button-font-colour);
    padding: var(--datatable-filter-feedback-clear-button-padding);
  }
}
</style>
