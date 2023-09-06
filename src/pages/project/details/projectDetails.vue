<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import useControllerProjectDetails from "../../../use/controller/project/details";
import Calendar from "primevue/calendar";
import Checkbox from 'primevue/checkbox';
import Dropdown from "primevue/dropdown";
import HeaderActions from "../../../components/header/actions.vue";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
import ProgressSpinner from "primevue/progressspinner";

import utils from "../../../use/function/useUtils";
import { useToast } from "primevue/usetoast";
import types from "../../../use/utils/useTypes";

import {
  computed,
  defineComponent,
  onMounted,
  ref,
  watchEffect,
} from "vue";
import { stateSymbol, useState } from "../../../store/index";
import { IRecord, IUpviseDataMessage } from "../../../store/modules/upvise.d";
import { UpviseDataMessage } from "../../../store/modules/upvise";

export const ProjectDetails = /*#__PURE__*/ defineComponent({
  name: "ProjectDetails",
  inject: [stateSymbol.description!],
  components: {
    Calendar,
    Checkbox,
    Dropdown,
    HeaderActions,
    InputNumber,
    InputText,
    MultiSelect,
    ProgressSpinner,
  },
  setup() {
    const upvise = useState().upvise
    const toast = useToast();
    const isSaving = ref(false);
    const controller = useControllerProjectDetails(upvise);
    const upviseDataMessage = ref<IUpviseDataMessage>(new UpviseDataMessage());
    const copyProject = ref({});
    const groupedCustomFields = ref([] as unknown[]);
    const currentTab = ref(0);
    const upviseTableData = ref(
      {} as Record<
        string,
        { tableName: string; data: Record<string, unknown>[] }
      >
    );

    onMounted(async () => {
      await controller.getMetadata().then((m) => (upviseDataMessage.value = m));
      console.log("upviseDataMessage:", upviseDataMessage.value);
      groupedCustomFields.value = await controller.getGroupedCustomFields();
      console.log("groupedCustomFields:", groupedCustomFields.value);
      await utils
        .getUpviseTableData(types.upviseTableTypes)
        .then((result) => (upviseTableData.value = result))
        .catch(() => console.log("Unable to get upvise table data"));
      console.log("upviseTableData", upviseTableData.value);
      controller.fetch();
    });

    const headerActionButtons = computed(() => {
      return upvise.isFetchComplete
        ? [
            {
              action: "save",
              tooltip: "Save fields",
              icon: "save",
              isSaving: isSaving.value
            },
          ]
        : [];
    })

    function getCustomFieldName(field: string) {
      const fieldSchema = upviseDataMessage.value?.persistence["TableUnybizProjectsProjects"]?.Schema
        ?.find(s => s.InternalName === field);
      
      return fieldSchema
        ? utils.getCustomFieldName(fieldSchema.InternalName as string, fieldSchema.Label)
        : "";
    }

    function getCustomFieldType(field: IRecord) {
      return (field.type as string).toLowerCase();
    }

    function tabClicked(event: any, index: number) {
      const tabs = document.getElementsByClassName("tab");

      for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("selected");
      }

      event.currentTarget.classList.add("selected");
      currentTab.value = index;
    }

    async function headerActionClicked(action: string) {
      switch (action) {
        case "save":
          isSaving.value = true;
          const project = JSON.parse(JSON.stringify(copyProject.value));
          if (project.custom) project.custom = utils.stringifyCustomField(project.custom);
          await controller
            .doSaveModelEntities(project)
            .then(() => {
              isSaving.value = false;
            })
            .catch(() => {
              isSaving.value = false;
            });
          break;
      }
    }

    watchEffect(() => {
      if (upvise.isFetchComplete && Object.keys(controller.getProject()).length > 0) {
        const project = JSON.parse(JSON.stringify(controller.getProject()));
        const schema = upviseDataMessage.value?.persistence["TableUnybizProjectsProjects"]?.Schema
        if (project.custom && schema)
          project.custom = utils.parseCustomField(project.custom, schema);
        copyProject.value = project;
      }
    });

    return {
      types,
      utils,
      toast,
      upviseDataMessage,
      copyProject,
      groupedCustomFields,
      currentTab,
      upviseTableData,
      headerActionButtons,
      getCustomFieldName,
      getCustomFieldType,
      tabClicked,
      headerActionClicked,
    };
  },
});

export default ProjectDetails;
</script>

<template>
  <div class="details">
    <div class="header-row">
      <div class="header-title">
        <span>{{ copyProject.code }}</span>
        <span>{{ copyProject.name }}</span>
      </div>

      <header-actions
        class="header-actions"
        :upvise-data-message="upviseDataMessage"
        :action-buttons="headerActionButtons"
        :use-column-picker="false"
        :use-file-export="false"
        :use-file-import="false"
        :useFavouriteManager="false"
        @actionClicked="headerActionClicked"
      ></header-actions>
    </div>

    <div class="tabs-group">
      <div
        v-for="(group, index) in groupedCustomFields"
        :key="group.name + index"
        class="tab"
        :class="{
          selected: index === 0,
        }"
        @click="tabClicked($event, index)"
      >
        <div class="tab-wrapper">
          <span class="tab-text">{{ group.name }}</span>
        </div>
      </div>
    </div>

    <div
      v-if="groupedCustomFields[currentTab]?.fields"
      class="edit-view-container">
      <div class="edit-view">
        <template
          v-for="(field, index) in groupedCustomFields[currentTab].fields"
          :key="field.name + index"
        >
          <div
            v-if="
              'custom' in copyProject &&
              copyProject.custom &&
              typeof copyProject.custom === 'object' &&
              !types.unusedTypes.includes(getCustomFieldType(field))"
            class="p-grid field"
          >
            <div class="p-col-6 input-label">{{ field.label }}</div>
            <div class="p-col-6">
              <checkbox
                v-if="types.checkboxTypes.includes(getCustomFieldType(field))"
                v-model="copyProject['custom'][field.name]"
                :binary="true"
                :trueValue="'1'"
                :falseValue="'0'"
              />

              <dropdown
                v-else-if="types.currencyTypes.includes(getCustomFieldType(field))"
                class="input-dropdown-field"
                v-model="copyProject['custom'][field.name]"
                :options="types.currencyValueOptions"
                optionLabel="name"
                optionValue="value"
              />

              <calendar
                v-else-if="types.dateTypes.includes(getCustomFieldType(field))"
                class="input-date"
                dateFormat="yy-mm-dd"
                :model-value="
                  copyProject['custom'][field.name]
                    ? utils.getDate(copyProject['custom'][field.name])
                    : ''
                "
                :manualInput="false"
                :showTime="
                  getCustomFieldType(field) === 'datetime' ? true : false
                "
                hourFormat="12"
                @update:model-value="
                  copyProject['custom'][field.name] = utils.getEpoch($event)
                "
              />

              <input-number
                v-else-if="types.numberTypes.includes(getCustomFieldType(field))"
                class="input-number-field"
                v-model="copyProject['custom'][field.name]"
                :minFractionDigits="
                  getCustomFieldType(field) === 'decimal' ? 1 : null
                "
                :maxFractionDigits="
                  getCustomFieldType(field) === 'decimal' ? 10 : null
                "
              />

              <template
                v-else-if="types.selectMultiTypes.includes(getCustomFieldType(field))"
              >
                <div
                  v-if="utils.isSelOptionsFunction(field.seloptions)"
                  class="input-label"
                >
                  No options available
                </div>
                <multi-select
                  v-else
                  class="input-multiselect-field"
                  v-model="copyProject['custom'][field.name]"
                  :options="utils.getSelOptions(field.seloptions)"
                  optionLabel="name"
                  optionValue="value"
                />
              </template>

              <template
                v-else-if="types.selectTypes.includes(getCustomFieldType(field))"
              >
                <input-text
                  v-if="utils.isSelOptionsFunction(field.seloptions)"
                  class="input-text-field"
                  type="text"
                  v-model="copyProject['custom'][field.name]"
                />
                <dropdown
                  v-else
                  class="input-dropdown-field"
                  v-model="copyProject['custom'][field.name]"
                  :options="utils.getSelOptions(field.seloptions)"
                  optionLabel="name"
                  optionValue="value"
                />
              </template>

              <calendar
                v-else-if="types.timeTypes.includes(getCustomFieldType(field))"
                class="input-date"
                :model-value="
                  copyProject['custom'][field.name]
                    ? utils.getDate(copyProject['custom'][field.name])
                    : ''
                "
                :manualInput="false"
                :showTime="true"
                :timeOnly="true"
                hourFormat="12"
                @update:model-value="
                  copyProject['custom'][field.name] = utils.getEpoch($event)
                "
              />

              <checkbox
                v-else-if="types.toggleTypes.includes(getCustomFieldType(field))"
                v-model="copyProject['custom'][field.name]"
                :binary="true"
                :trueValue="'1'"
                :falseValue="'0'"
              />

              <dropdown
                v-else-if="(Object.keys(types.upviseTableTypes)).includes(getCustomFieldType(field))"
                class="input-dropdown-field"
                v-model="copyProject['custom'][field.name]"
                :options="upviseTableData[getCustomFieldType(field)].data"
                optionLabel="name"
                optionValue="name"
              />

              <input-text
                v-else
                class="input-text-field"
                type="text"
                v-model="copyProject['custom'][field.name]"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

.details {
  font-family: Poppins, serif;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  color: $grey3;
  background-color: $grey4;
  min-width: 900px;

  /*
  Header
  */

  .header-row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex: 1 1 auto;
    flex-wrap: wrap;
    padding: 24px;

    .header-title {
      display: flex;
      flex-direction: column;
      font-weight: 600;
      font-size: 24px;
      color: $grey3;
      cursor: default;
    }

    .header-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      flex: 1 1 auto;
    }
  }

  /*
  Tabs
  */

  .tabs-group {
    display: flex;
    flex-wrap: wrap;
    flex: 1 1 auto;
    height: 44px;
    margin: 0 24px;

    .tab {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: $grey4;
      border-radius: 8px 8px 0 0;
      padding: 12px 12px 12px 12px;
      font-weight: 700;
      height: 100%;
      box-sizing: border-box;
      min-width: 90px;
      max-width: 140px;
      cursor: pointer;

      .tab-wrapper {
        overflow: hidden;

        .tab-text {
          white-space: nowrap;
          text-align: center;
        }
      }

      &.selected {
        background-color: $white;
      }
    }
  }

  /*
  Edit view
  */

  .edit-view-container {
    padding: 0 24px 24px 24px;

    .edit-view {
      background-color: $white;
      width: 100%;
      min-height: 100px;
      padding: 24px;

      .field {
        max-width: 500px;

        .input-label {
          color: $grey6;
          display: flex;
          align-items: center;
          cursor: default;
        }
      }
    }
  }
}
</style>
