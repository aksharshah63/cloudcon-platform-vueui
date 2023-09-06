<script lang="ts">
import { watch, computed, ref, defineComponent, onMounted } from "vue";
import Button from "primevue/button";
import { stateSymbol, useState } from "../../store/index";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import useControllerJobs from "../../use/controller/jobs/jobs";

export const JobsBulkUpdate = defineComponent({
  name: "JobsBulkUpdate",
  inject: [stateSymbol.description!],
  components: {
    Button,
    Dropdown,
    Calendar,
  },
  //props: Record<string, any>, { emit }
  setup(_, { emit }) {
    const controller = useControllerJobs(useState().upvise);

    //This is what the field will be
    const currentField = ref("");
    const bulkOption = ref<Record<string, any>[]>([]);
    const optionsMap = ref<Record<string, any>>({});
    const realOptions = ref<string[]>([]);

    //This will be used to emit to the top part
    const selectedValue = ref();
    //const realValue = ref();
    //const optionNames = ["Due Date", "Owner", "Status", "Priority"].sort();
    const optionNames = ref<string[]>([]);
    [];
    console.log(controller);
    const currentType = computed(() => {
      const properField = bulkOption.value.find(
        (x) => x.label == currentField.value
      );
      if (properField == undefined) {
        return "string";
      } else {
        return properField.type;
      }
    });

    const checkInvalidValues = computed(() => {
      return !(currentField.value !== "" && selectedValue.value !== undefined);
    });

    onMounted(async () => {
      await controller.getBulkJobUpdateString().then((data) => {
        if (data !== undefined) {
          bulkOption.value = JSON.parse(data);
          optionNames.value = bulkOption.value
            .map((x) => x.label as string)
            .sort();
        }
      });
    });

    watch(
      () => currentField.value,
      async (currVal, prevVal) => {
        if (currVal !== prevVal) selectedValue.value = undefined;
        //realValue.value = undefined

        const currentSource = bulkOption.value.find(
          (field) => field.label == currentField.value
        );
        if (currentSource == undefined) return;

        const selector: string = currentSource?.selector;
        const returnValue: string = currentSource?.return;
        realOptions.value = await controller.getBulkJobOptions(selector);
        optionsMap.value = await controller.getBulkJobOptionsMap(
          selector,
          returnValue
        );
      }
    );

    function bulkUpdate() {
      const map: Record<string, any> = {};
      const returnType = bulkOption.value.find(
        (x) => x.label == currentField.value
      )?.returntype;
      map.value =
        Object.keys(optionsMap.value).length === 0
          ? selectedValue.value
          : optionsMap.value[selectedValue.value];

      if (returnType == "int") map.value = parseInt(map.value);
      else if (returnType == "float") map.value = parseFloat(map.value);
      else if (returnType == "date")
        map.value =
          typeof map.value == "object"
            ? map.value.getTime()
            : new Date(map.value).getTime();
      map.field = bulkOption.value.find(
        (x) => x.label == currentField.value
      )?.value;
      emit("updatedFieldValue", map);

      selectedValue.value = undefined;
      currentField.value = "";
      optionsMap.value = {};
    }
    function closeOverlay() {
      selectedValue.value = undefined;
      //realValue.value = undefined
      currentField.value = "";
      optionsMap.value = {};
      emit("closeOverlay");
    }
    //console.log("test");
    return {
      bulkUpdate,
      bulkOption,
      realOptions,
      selectedValue,
      currentField,
      optionNames,
      currentType,
      closeOverlay,
      checkInvalidValues,
    };
  },
});
export default JobsBulkUpdate;
</script>
<template>
  <div class="bulk-update-screen">
    <div class="header-section">
      <span class="header-name">
        {{ "Update Field" }}
      </span>
      <div class="option" @click="closeOverlay">
        <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
      </div>
    </div>
    <div class="divider"></div>
    <div class="options-field-section">
      <Dropdown
        class="select-field"
        v-model="currentField"
        placeholder="Select Field"
        :options="optionNames"
      ></Dropdown>
      <Dropdown
        class="select-value"
        v-if="currentType !== 'date'"
        placeholder="Select Value"
        v-model="selectedValue"
        :options="realOptions"
      ></Dropdown>
      <Calendar
        v-else
        class="select-value"
        v-model="selectedValue"
        placeholder="Select Date"
        dateFormat="yy-mm-dd"
        :manualInput="false"
        :monthNavigator="true"
        :yearNavigator="true"
        yearRange="1970:2100"
      />
    </div>
    <div class="jobs-bulk-button">
      <Button
        :disabled="checkInvalidValues"
        @click="bulkUpdate"
        label="Update"
        class="assignButton"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>

.bulk-update-screen {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  .header-section {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 5%;
    .header-name {
      font-weight: bold;
      font-size: 18px;
      color: $black;
      cursor: default;
    }
    .option {
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 12px;
      border: 1px solid $grey5;
      cursor: pointer;
    }
  }
  .options-field-section {
    display: flex;
    flex-direction: column;
    margin-bottom: 5%;

    .select-field {
      margin-bottom: 5%;
    }
    .select-value {
      margin-bottom: 5%;
    }
  }
}
</style>
