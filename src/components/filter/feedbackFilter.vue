<script lang="ts">
import { defineComponent, watch, ref } from "vue";
// import Card from "primevue/card";
import Chip from "primevue/chip";
import {
  IColumnMetadata,
  IGridSlicingFilter,
} from "../../store/modules/upvise.d";
import { OptionsProgressStatus } from "../../../cloudconLibrary/utilities/useConstants";

export const FeedbackFilter = defineComponent({
  name: "FeedbackFilter",
  components: {
    // Card,
    Chip,
  },
  props: {
    filterData: {
      type: Object as () => Record<string, IGridSlicingFilter>,
      required: true,
    },
    columns: {
      type: Object as () => IColumnMetadata[],
      required: true,
    },
  },
  setup(props, context) {
    const validFiltersToShow = ref([] as string[]);
    type internalLabelName = {
      internalName: string;
      label: string;
    };
    const internalNameHolder = [] as internalLabelName[];
    watch(
      () => props.filterData,
      (filters) => {
        validFiltersToShow.value = [];
        Object.entries(filters).forEach((filterItem) => {
          const constraints = filterItem[1].constraints;
          const column = props.columns.find(
            (column) => column.InternalName === filterItem[0]
          );

          //if filter has valid value, add this filter into validFiltersToShow
          if (constraints[0].value !== null) {
            let validFilter = `${filterItem[0]} ${constraints[0].matchMode} ${
              column
                ? formatValue(constraints[0].value, column)
                : constraints[0].value
            }`;

            if (constraints.length > 1) {
              for (let i = 1; i < constraints.length; i += 1) {
                validFilter += ` ${filterItem[1].operator} ${constraints[i].matchMode} ${constraints[i].value}`;
              }
            }
            const appendedFilter: Record<string, unknown> = {};
            appendedFilter[filterItem[0]] = validFilter;

            if (validFilter.includes("T13:00:00.000Z")) {
              validFilter = formatDate(validFilter);
            }

            validFilter = replaceAbbrev(validFilter);

            //Replace Internal Name with Label for better Formatting and Readability
            var filterStr = validFilter.split(" ");
            const internalName = filterStr[0];
            if (
              props.columns.find((column) =>
                validFilter.includes(column.InternalName!)
              )
            ) {
              filterStr[0] = props.columns
                .find((column) => validFilter.includes(column.InternalName!))!
                .Label!.toString();
              internalNameHolder.push({
                internalName: internalName,
                label: filterStr[0],
              });
            }
            validFilter = filterStr.join("\u00a0");

            validFiltersToShow.value.push(validFilter);
          }
        });
      },
      { deep: true }
    );

    function formatDate(str: string) {
      str = str.replace("T13:00:00.000Z", "");
      var stringArry = str.split(" ");
      var dateString = stringArry[stringArry.length - 1];
      var date = new Date(dateString);
      var formattedDate = "";
      if (!isNaN(date.getTime())) {
        // Months use 0 index.
        formattedDate =
          date.getDate() +
          1 +
          "/" +
          date.getMonth() +
          1 +
          "/" +
          date.getFullYear();
      }

      return str.replace(dateString, formattedDate);
    }

    function replaceAbbrev(str: string) {
      const abbrevMapObj: Record<string, string> = {
        gte: "is Greater Than or Equal to",
        lte: "is Less Than or Equal to",
        gt: "is Greater Than",
        lt: "is Less Than",
        lessThane: "is Less Than",
        greaterThane: "is Greater Than",
        notEquals: "Does Not Equal",
        dateIs: "is",
        dateBefore: "is Before",
        dateAfter: "is After",
        IsNot: "is Not",
        startsWith: "Starts With",
        notContains: "Does not Contain",
        endsWith: "Ends With",
      };

      const re = new RegExp(Object.keys(abbrevMapObj).join("|"), "g");
      return str.replace(re, (matched) => abbrevMapObj[matched]);
    }

    function camelize(str: string) {
      return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, "");
    }

    function formatValue(value: unknown, column: IColumnMetadata) {
      if (
        Array.isArray(value) &&
        column.Style &&
        ["progressStatusCellColour", "progressStatusText"].includes(
          column.Style
        )
      )
        return value.map((v) => {
          return (
            OptionsProgressStatus.find((status) => status.value === v)?.label ??
            "Undefined status"
          );
        });
      else return value;
    }

    function deleteFilter(event: Event) {
      const target = event.target as Element;
      var deleteFilterName = target.parentElement?.innerText.split(
        "\u00a0"
      )[0] as string;
      deleteFilterName = internalNameHolder.find(
        (name) => name.label === deleteFilterName
      )!.internalName;
      const camelCaseDeleteFilterName = camelize(deleteFilterName);
      context.emit("deleteFilter", camelCaseDeleteFilterName);
    }

    function clearAllFilters() {
      context.emit("clearAllFilters");
    }

    return {
      validFiltersToShow,
      deleteFilter,
      clearAllFilters,
    };
  },
});
export default FeedbackFilter;
</script>

<template>
  <div id="filtercard" class="p-d-flex p-ai-center p-mb-4">
    <span class="p-mr-2">Filters</span>
    <div id="chipcontainer" class="p-d-flex p-flex-wrap p-ai-center">
      <Chip
        v-for="filterItem in validFiltersToShow"
        :key="filterItem"
        @remove="deleteFilter"
        removable
        class="p-mr-2 p-mb-1 p-mt-1"
      >
        {{ filterItem }}
      </Chip>
    </div>
    <div id="placeholder"></div>
    <span id="clear" @click="clearAllFilters">CLEAR</span>
  </div>
</template>

<style scoped lang="scss">
.p-card {
  position: relative;
  border: 1px solid #e8e8e8;
  box-shadow: none !important;
  border-radius: 8px !important;
  &.p-card-content {
    padding: 0;
  }
}
.p-chip {
  background-color: #f5f5f5;
  height: 32px;
}
span {
  font-weight: bolder;
}
#clear {
  cursor: pointer;
  position: absolute;
  right: 36px;
}
#placeholder {
  width: 40px;
}
#filtercard {
  min-height: 70px;
  height: auto;
  position: relative;
  border: 1px solid #e8e8e8;
  box-shadow: none !important;
  border-radius: 8px !important;
}
#chipcontainer {
  height: auto;
  padding: 10px 0;
}
#chipcontainer::first-line {
  margin: 0;
}
</style>
