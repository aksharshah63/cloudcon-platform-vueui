<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
//import Sidebar from "primevue/sidebar";
//import TabMenu from "primevue/tabmenu";
import Button from "primevue/button";
import AutoCompleteTextBox from "../input/autoCompleteTextBox.vue";
import Calendar from "primevue/calendar";
//import { DashletCard } from "./dashletCard.vue";
import {
  IDashletFilter,
  IDashletFilterTemplate,
  IFilterModel,
} from "../../use/controller/dashboard/dashboard.d";
import useControllerDashboard from "../../use/controller/dashboard/dashboard";
import { stateSymbol, useState } from "../../store";
import { filterUpdating } from "../../use/controller/dashboard/dashboard";
import ProgressSpinner from "primevue/progressspinner";

export const DashletFilter = defineComponent({
  name: "DashletFilter",
  inject: [stateSymbol.description!],
  components: {
    Calendar,
    Button,
    AutoCompleteTextBox,
    ProgressSpinner,
  },
  setup(_, context) {
    // todo: add filters to metadata instead of hardcoding
    // selector format: 'upvise'|module|{\"property1\": [\"allowed1\", \"allowed2\"], \"custom_property2\": [\"allowed1\"]}|property
    const pageFilters = {
      jobs: [
        {
          label: "Users",
          description: "Users",
          selector: "upvise|jobs.jobs||owner",
          type: "string",
        },
        {
          label: "Suburb",
          description: "Suburb",
          selector: "upvise|jobs.jobs||city",
          type: "string",
        },
        {
          label: "Start Date",
          description: "startDate",
          selector: "",
          type: "date",
          default: new Date(),
        },
        {
          label: "End Date",
          description: "endDate",
          selector: "",
          type: "date",
          default: new Date(Date.now() + 12096e5),
        },
      ],
      project: [
        {
          label: "Drafter",
          description: "Users",
          selector:
            'upvise|unybiz.contacts.contacts|{"custom_F7": ["25AB078D26AC9FCD3E345150483E9C"]}|name',
          type: "string",
        },
        {
          label: "Start Date",
          description: "startDate",
          selector: "",
          type: "date",
          default: new Date(),
        },
        {
          label: "End Date",
          description: "endDate",
          selector: "",
          type: "date",
          default: new Date(Date.now() + 12096e5),
        },
      ],
      safety: [
        {
          label: "Start Date",
          description: "startDate",
          selector: "",
          type: "date",
          default: new Date(Date.now() - 3.154e10),
        },
        {
          label: "End Date",
          description: "endDate",
          selector: "",
          type: "date",
          default: new Date(),
        },
      ],
      NCR: [
        {
          label: "Start Date",
          description: "startDate",
          selector: "",
          type: "date",
          default: new Date(Date.now() - 3.154e10),
        },
        {
          label: "End Date",
          description: "endDate",
          selector: "",
          type: "date",
          default: new Date(),
        },
      ],
      feedback: [
        {
          label: "Start Date",
          description: "startDate",
          selector: "",
          type: "date",
          default: new Date(Date.now() - 3.154e10),
        },
        {
          label: "End Date",
          description: "endDate",
          selector: "",
          type: "date",
          default: new Date(),
        },
      ],
    } as Record<string, IDashletFilter[]>;
    const controller = useControllerDashboard(useState().upvise);
    const filters = pageFilters[controller.pageName] ?? [];
    const properFilters = ref();
    const valuesInputted = ref<IFilterModel>({});
    const savedFilterComp = computed(() => controller.getSavedFilter() ?? {});
    // flip to refresh autoCompleteTextBox
    const textBoxKey = ref(1);

    (async () => {
      properFilters.value = await controller.getFilters(filters);
      applySavedFilters(savedFilterComp.value);
      sendFilter();
      textBoxKey.value *= -1;

      watch(savedFilterComp, (newVal, oldVal) => {
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          applySavedFilters(newVal);
          sendFilter();
          textBoxKey.value *= -1;
        }
      });
    })();

    const filterValues = computed(() => {
      let filterVals = {} as IFilterModel;
      properFilters.value.forEach((x: IDashletFilterTemplate) => {
        if (x.type === "date") {
          let date = valuesInputted.value[x.description];
          filterVals[x.description] = date
            ? new Date(date as string).getTime().toString()
            : "";
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
        } else filterVals[x.description] = valuesInputted.value[x.description];
      });

      return filterVals;
    });

    function sendFilter() {
      context.emit("filterValues", filterValues.value);
    }

    function closeFilter() {
      context.emit("closeFilter");
    }

    function updateOptionsValue(desc: string, value: string) {
      if (value) valuesInputted.value[desc] = value.split("|");
      else valuesInputted.value[desc] = [];
    }

    const autoCompleteOptions = computed(() => {
      return properFilters.value.map((filter: IDashletFilterTemplate) =>
        computeAutoCompleteOptions(filter.value)
      );
    });

    function computeAutoCompleteOptions(
      options: { name: string; value: string }[]
    ) {
      return options.map((option: { name: string; value: string }) => ({
        ...option,
        id: option.value,
      }));
    }

    function clearFilters() {
      resetFilters();
      textBoxKey.value *= -1;
    }

    function saveTextFilters() {
      // emit filterValues without date fields
      context.emit(
        "saveFilters",
        Object.fromEntries(
          properFilters.value
            .filter((x: IDashletFilterTemplate) => x.type !== "date")
            .map((x: IDashletFilterTemplate) => [
              x.description,
              filterValues.value[x.description],
            ])
        )
      );
    }

    function saveFilters() {
      context.emit("saveFilters", filterValues.value);
    }

    function resetFilters() {
      properFilters.value.forEach((filter: IDashletFilterTemplate) => {
        // filter.type !== "date"
        //   ? (valuesInputted.value[filter.description as string] =
        //       [] as string[])
        //   : (valuesInputted.value[filter.description as string] = "");
        valuesInputted.value[filter.description as string] =
          filter.default ?? (filter.type !== "date" ? ([] as string[]) : "");
      });
    }

    function applySavedFilters(savedFilter: IFilterModel) {
      properFilters.value.forEach((filter: IDashletFilterTemplate) => {
        // filter.type !== "date"
        //   ? (valuesInputted.value[filter.description as string] =
        //       [] as string[])
        //   : (valuesInputted.value[filter.description as string] = "");
        valuesInputted.value[filter.description as string] =
          savedFilter[filter.description as string] ??
          filter.default ??
          (filter.type !== "date" ? ([] as string[]) : "");
      });
    }

    return {
      valuesInputted,
      properFilters,
      sendFilter,
      closeFilter,
      updateOptionsValue,
      autoCompleteOptions,
      clearFilters,
      textBoxKey,
      saveTextFilters,
      saveFilters,
      filterUpdating,
    };
  },
});
export default DashletFilter;
</script>
<template>
  <div class="p-grid p-x-2">
    <div class="p-col-7">
      <div class="p-grid">
        <div class="p-col-12">
          <span class="header-name">
            {{ "Filters" }}
          </span>
        </div>
      </div>
    </div>

    <div class="p-col-5 options">
      <div v-if="filterUpdating" class="option">
        <ProgressSpinner class="filter-spinner" />
      </div>
      <div v-else class="option" @click="saveTextFilters()">
        <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
      </div>
      <div class="option" @click="closeFilter()">
        <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
      </div>
    </div>

    <div class="p-col-12 divider"></div>

    <div
      v-for="(filter, index) in properFilters"
      :key="filter.description"
      class="p-col-12"
    >
      <div class="input-label">{{ filter.label }}</div>
      <auto-complete-text-box
        v-if="filter.type != 'date'"
        :key="textBoxKey"
        :options="autoCompleteOptions[index]"
        :multi-select="true"
        :field-name="filter.description"
        :selected="valuesInputted[filter.description].join('|')"
        display-field="value"
        @updateOptionsValue="updateOptionsValue"
      ></auto-complete-text-box>
      <Calendar
        v-else
        class="input-date"
        v-model="valuesInputted[filter.description]"
        dateFormat="yy-mm-dd"
        :manualInput="false"
        :monthNavigator="true"
        :yearNavigator="true"
        yearRange="1970:2100"
      />
    </div>

    <div class="p-d-flex p-col-12 p-mt-2">
      <Button
        label="Clear"
        @click="clearFilters"
        class="filterButton p-col-5 p-ml-4 p-mr-2"
      />
      <Button
        label="Filter"
        @click="sendFilter"
        class="filterButton p-col-5 p-mr-4 p-ml-2"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>

.filterButton {
  max-height: 32px;
  // width: 98%;
  // margin: 16px auto 0;
  border-radius: 5px;

  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
  border: none;
  border-radius: 5px;
  border-width: 0;
}
.option {
  // box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
  //   0 1px 5px 0 rgba(0, 0, 0, 0.12);
  border: none;
  cursor: pointer;
}

.filter-spinner {
  max-height: 32px;
  max-width: 32px;
}
</style>
