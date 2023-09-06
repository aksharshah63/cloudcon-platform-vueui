<script lang="ts">
import useControllerDynamicEdit from "../../use/controller/dynamic/dynamicEdit";
import { computed, defineComponent, PropType, ref } from "vue";
import utils from "../../use/function/useUtils";
import { ITableRecord } from "../../../cloudconLibrary/store/modules/tableData/tableDataModule";
import { useTableNames } from "../../../cloudconLibrary/utilities/useConstants";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Checkbox from "primevue/checkbox";
import Calendar from "primevue/calendar";
import AutoCompleteTextBox from "../../../src/components/input/autoCompleteTextBox.vue";

export const EditSidebarDynamicBody = /*#__PURE__*/ defineComponent({
  name: "EditSidebarDynamicBody",
  components: {
    InputText,
    InputNumber,
    Checkbox,
    Calendar,
    AutoCompleteTextBox,
  },
  props: {
    currentItem: {
      type: Object as PropType<ITableRecord>,
      required: true,
    },
    metadata: {
      type: Object as PropType<any>,
      required: true,
    },
    entityLookup: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const controller = useControllerDynamicEdit(
      props.entityLookup as useTableNames
    );
    const item = ref<ITableRecord>(props.currentItem);
    const textInputTypes = ["", "TEXT", "text", "string", "location"];
    const numberInputTypes = ["integer", "INTEGER", "numeric"];
    const dateInputTypes = ["date", "datetime"];
    const timeInputTypes = ["time"];
    const boolInputTypes = ["boolean", "checkbox", "BOOLEAN"];
    const lookupInputTypes = [
      "project",
      "contact",
      "quote",
      "task",
      "equipment",
      "risk",
      "risktype",
      "hazard",
      "department",
      "activity",
      "controlmeasure",
      "group",
    ];

    const filteredColumns = computed(() => {
      let filteredValue = props.metadata.filter(
        (c: any) => c.Label != null && c.Visible
      );
      filteredValue.forEach((c: any) => {
        c.CurrentObjectKey = getObjectKey(c);
      });
      return filteredValue;
    });

    const getSectionList = computed(() => {
      var orderedSectionsFromTable = controller.getSectionDetails(
        props.entityLookup
      );
      var calculatedSections = Object.keys(sections());
      var listedSections = orderedSectionsFromTable.map((a) => a.sectionid);
      var missingSections = calculatedSections.filter(
        (a) => listedSections.indexOf(parseInt(a)) < 0
      );
      missingSections.forEach((sec) => listedSections.push(sec));
      return listedSections;
    });

    function sections() {
      return utils.groupBy(filteredColumns.value, "Section");
    }

    function getSectionHeader(sectionId: string) {
      var sectionDetails = controller.getSectionDetails(props.entityLookup);
      var sectionHeader = sectionDetails.find((a) => a.sectionid == sectionId);
      return sectionHeader?.title ?? "Section " + sectionId;
    }

    function getObjectKey(column: any) {
      if (column.IsCustom) {
        return utils.getCustomFieldName(column.InternalName, column.Title);
      } else {
        return column.InternalName;
      }
    }

    function relevantColumns(section: number) {
      return Object.values(
        sections()[section.toString() as keyof typeof sections]
      );
    }

    function getSelectOptions(options: any) {
      var listOptions: any = [];
      Object.keys(options).forEach(function (key) {
        listOptions.push({ id: key, name: key });
      });
      return listOptions;
    }

    function getLookupOptions(lookupType: string) {
      return controller.returnLookup(lookupType);
    }

    function updateLookup(fieldName: string, _value: string) {
      console.log("updateLookup", fieldName, _value);
      item.value[fieldName] = _value;
    }

    function updateMulti(fieldName: string, value: string) {
      item.value[fieldName] = value;
    }

    return {
      utils,
      item,
      textInputTypes,
      numberInputTypes,
      dateInputTypes,
      timeInputTypes,
      boolInputTypes,
      lookupInputTypes,
      getSectionList,
      getSectionHeader,
      relevantColumns,
      getSelectOptions,
      getLookupOptions,
      updateLookup,
      updateMulti,
    };
  },
});
export default EditSidebarDynamicBody;
</script>

<template>
  <div class="edit-sidebar-body">
    <template v-for="section in getSectionList" :key="section">
      <div class="p-col-12 divider"></div>
      <div class="header-name" style="font-size: 1.45em">
        {{ getSectionHeader(section) }}
      </div>
      <div class="p-col-12 divider"></div>
      <div class="columns is-multiline">
        <template
          v-for="column in relevantColumns(section)"
          :key="column.InternalName"
        >
          <div v-bind:class="column.Span ? 'column is-full' : 'column is-half'">
            <div>{{ column.Label }} {{ column.IsRequired ? "*" : "" }}</div>
            <div>
              <template v-if="textInputTypes.includes(column.Style)">
                <InputText
                  class="input-text-field"
                  type="text"
                  v-model="item[column.CurrentObjectKey]"
                >
                </InputText>
              </template>
              <template v-else-if="numberInputTypes.includes(column.Style)">
                <InputNumber
                  class="input-number-field"
                  type="text"
                  v-model="item[column.CurrentObjectKey]"
                >
                </InputNumber>
              </template>
              <template v-else-if="dateInputTypes.includes(column.Style)">
                <Calendar
                  class="input-date"
                  dateFormat="yy-mm-dd"
                  :model-value="
                    currentItem[column.CurrentObjectKey] != null
                      ? utils.getDate(currentItem[column.InternalName])
                      : ''
                  "
                  :manualInput="true"
                  :showIcon="true"
                  @update:model-value="
                    item[column.CurrentObjectKey] = utils.getEpoch($event)
                  "
                />
              </template>
              <template v-else-if="timeInputTypes.includes(column.Style)">
                <Calendar
                  class="input-date"
                  dateFormat="yy-mm-dd"
                  :model-value="
                    currentItem[column.CurrentObjectKey] != null
                      ? utils.getDate(
                          currentItem[column.CurrentObjectKey].toString()
                        )
                      : ''
                  "
                  :manualInput="true"
                  :showTime="true"
                  :showIcon="true"
                  hourFormat="12"
                  :timeOnly="true"
                  @update:model-value="
                    item[column.CurrentObjectKey] = utils.getEpoch($event)
                  "
                />
              </template>
              <template v-else-if="boolInputTypes.includes(column.Style)">
                <Checkbox
                  id="binary"
                  class="input-checkbox"
                  v-model="item[column.CurrentObjectKey]"
                  :binary="true"
                />
              </template>
              <template v-else-if="column.Style == 'selectmulti'">
                <AutoCompleteTextBox
                  :options="getSelectOptions(column.SelectOptions)"
                  :selected="currentItem[column.CurrentObjectKey]"
                  :multi-select="true"
                  display-field="name"
                  :field-name="column.CurrentObjectKey"
                  @updateOptionsValue="updateMulti"
                ></AutoCompleteTextBox>
              </template>
              <template v-else-if="lookupInputTypes.includes(column.Style)">
                <AutoCompleteTextBox
                  :options="getLookupOptions(column.Style)"
                  :selected="currentItem[column.CurrentObjectKey]"
                  :multi-select="false"
                  display-field="name"
                  :field-name="column.CurrentObjectKey"
                  @updateOptionsValue="updateLookup"
                ></AutoCompleteTextBox>
              </template>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
