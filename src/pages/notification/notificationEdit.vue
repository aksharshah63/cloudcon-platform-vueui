<script lang="ts">
import {
  IRecord,
  IUpviseDataMessage,
} from "../../../src/store/modules/upvise.d";
import useControllerNotification from "../../use/controller/notification/notification";
import {
  IRecordNotification,
  IRecordRule,
  IRecordRuleField,
} from "../../use/controller/notification/notification.d";
import Sidebar from "primevue/sidebar";
import InputText from "primevue/inputtext";
import InputSwitch from "primevue/inputswitch";
import Dropdown from "primevue/dropdown";
import ProgressSpinner from "primevue/progressspinner";
import Calendar from "primevue/calendar";
import InputNumber from "primevue/inputnumber";
import MultiSelect from "primevue/multiselect";
import { useToast } from "primevue/usetoast";
import { computed, defineComponent, reactive, ref, watch } from "vue";
import AutoCompleteTextBox from "../../../src/components/input/autoCompleteTextBox.vue";
import { stateSymbol, useState } from "../../store/index";
import utils from "../../use/function/useUtils";
import moment from "moment";
import { orderBy } from "lodash";

export const NotificationEdit = /*#__PURE__*/ defineComponent({
  name: "NotificationEdit",
  inject: [stateSymbol.description!],
  components: {
    Sidebar,
    InputText,
    InputSwitch,
    Dropdown,
    Calendar,
    InputNumber,
    MultiSelect,
    AutoCompleteTextBox,
    ProgressSpinner,
  },
  props: {
    upviseDataMessage: {
      type: Object as () => IUpviseDataMessage,
      required: true,
    },
    notificationId: {
      type: String,
      required: true,
    },
    upviseTableData: {
      type: Object as () => Record<string, unknown>,
      required: true,
    },
    linkedTableFields: {
      type: Object as () => Record<string, unknown>,
      required: true,
    },
    defaultTimeZone: {
      type: String,
      required: true,
    },
    moduleCustomFields: {
      type: Object as () => IRecord[],
      required: true,
    },
  },
  setup(props: Record<string, any>, { emit }) {
    const upviseDataMessage = ref<IUpviseDataMessage>(props.upviseDataMessage);
    const awaitingResponse = ref(false);
    const showNotification = ref(true);
    const showSave = ref(false);
    const controller = useControllerNotification(useState().upvise);
    const moduleFields = ref(props.moduleCustomFields);
    const copyNotification = parseNotification(
      props.notificationId
        ? controller.getEditNotification(props.notificationId)
        : controller.getNewNotification()
    );
    const copyRules = parseRules(
      props.notificationId
        ? (controller.getEditRulesForNotification(
            props.notificationId
          ) as unknown as IRecordRule[])
        : reactive<IRecordRule[]>([])
    );
    const originalNotification = utils.deepCopy(copyNotification);
    const originalRules = utils.deepCopy(copyRules);
    const contactsOptions = ref(props.upviseTableData["contact"].data);
    const allTimeZones = ref(getAllTimeZones());

    const formTemplateOptions = ref(
      props.upviseTableData["formTemplates"].data
    );
    const moduleNameOptions = ref(getModuleNameOptions());

    const unusedTypes = [
      "button",
      "drawing",
      "form",
      "formula",
      "header",
      "label",
    ];
    const dateTypes = ["date", "datetime"];
    const timeTypes = ["time"];
    const textTypes = [
      "barcode",
      "email",
      "phone",
      "text",
      "textarea",
      "string",
      "TEXT",
    ];
    const numberTypes = [
      "decimal",
      "duration",
      "numeric",
      "score",
      "number",
      "INTEGER",
    ];
    const valueProvidedTypes = ["file", "image", "link", "photo", "signature"];

    const typeOptions = [{ name: "module" }, { name: "form" }];

    const dateTypeOptions = [
      { name: "Static", value: "static" },
      { name: "Relative", value: "relative" },
      { name: "Empty", value: "empty" },
      { name: "Not empty", value: "notEmpty" },
      { name: "Expired", value: "expired" },
      { name: "Not expired", value: "notExpired" },
    ];

    const timeTypeOptions = [
      { name: "Static", value: "static" },
      { name: "Empty", value: "empty" },
      { name: "Not empty", value: "notEmpty" },
    ];

    const textOperationOptions = [
      { name: "Contains", value: "contains" },
      { name: "Does not contain", value: "notContains" },
      { name: "Begins with", value: "begins" },
      { name: "Does not begin with", value: "notBegins" },
      { name: "Ends with", value: "ends" },
      { name: "Does not end with", value: "notEnds" },
      { name: "Empty", value: "empty" },
      { name: "Not Empty", value: "notEmpty" },
    ];

    const numberOperationOptions = [
      { name: "Equals", value: "=" },
      { name: "Greater than", value: ">" },
      { name: "Greater than or equal to", value: ">=" },
      { name: "Less than", value: "<" },
      { name: "Less than or equal to", value: "<=" },
      { name: "Does not equal", value: "!=" },
      { name: "Between X (inclusive) and Y (exclusive)", value: "between" },
      { name: "Empty", value: "empty" },
      { name: "Not Empty", value: "notEmpty" },
    ];

    const staticDateOperationOptions = [
      { name: "Equals", value: "=" },
      { name: "After", value: ">" },
      { name: "On and after", value: ">=" },
      { name: "Before", value: "<" },
      { name: "On and before", value: "<=" },
      { name: "Does not equal", value: "!=" },
      { name: "Between X (inclusive) and Y (exclusive)", value: "between" },
    ];

    const relativeDateOperationOptions = [
      { name: "+", value: "+" },
      { name: "-", value: "-" },
    ];

    const valueProvidedOperationOptions = [
      { name: "Empty", value: "empty" },
      { name: "Not empty", value: "notEmpty" },
    ];

    const checkboxOperationOptions = [
      { name: "Selected", value: "selected" },
      { name: "Not selected", value: "notSelected" },
    ];

    const toggleOperationOptions = [
      { name: "Yes", value: "yes" },
      { name: "No", value: "no" },
    ];

    const currencyValueOptions = [
      { name: "U.S. Dollar", value: "USD" },
      { name: "Euro", value: "EUR" },
      { name: "British Pound", value: "GBP" },
      { name: "Japanese Yen", value: "JPY" },
      { name: "Canadian Dollar", value: "CAD" },
      { name: "Australian Dollar", value: "AUD" },
      { name: "Swiss Franc", value: "CHF" },
      { name: "Hong Kong Dollar", value: "HKD" },
      { name: "New Zealand Dollar", value: "NZD" },
      { name: "Singapore Dollar", value: "SGD" },
      { name: "Sri Lanka Rupee", value: "LKR" },
      { name: "Swedish Krona", value: "SEK" },
    ];

    const fieldToNotifyTypes: Record<string, Record<string, string>> = {
      project: { module: "projects", table: "TableUnybizProjectsProjects" },
    };

    const isNotificationActive = computed({
      get: () => {
        return copyNotification.isactive === 1;
      },
      set: (val) => {
        if (val) copyNotification.isactive = 1;
        else copyNotification.isactive = 0;
      },
    });

    const fieldToNotifyOptions = computed(() => {
      const formRules = copyRules.find(
        (r) => utils.IsActive(r as IRecord) && r.type === "form"
      );
      const options: Record<string, unknown>[] = [];

      if (!formRules || !formRules.typename) return options;

      // add contact of linkedtable as an option
      if (
        getLinkedTableName(formRules.typename) === "TableUnybizContactsContacts"
      )
        options.push({
          name: "Contact linked to form",
          id: JSON.stringify({
            field: "LinkedTable",
            location: "TableUnybizContactsContacts",
          }),
        });

      const formFields = (
        props.upviseTableData["formFields"]?.data as IRecord[]
      ).filter((f) => f.formid === formRules.typename);

      if (formFields)
        formFields.forEach((f) => {
          // if a custom field type is contact or user, add it as an option
          if (f.type === "contact" || f.type === "user")
            options.push({
              name: f.label ?? "",
              id: JSON.stringify({
                field: f.id,
                location: "TableUnybizContactsContacts",
              }),
            });
          // else if a custom field type is in fieldToNotifyTypes, look for contact or user custom fields for that type
          else if ((f.type as string) in fieldToNotifyTypes) {
            const moduleFields = (
              props.upviseTableData["moduleFields"]?.data as IRecord[]
            ).filter(
              (m) => m.formid === fieldToNotifyTypes[f.type as string].module
            );

            if (moduleFields)
              moduleFields.forEach((m) => {
                if (m.type === "contact" || m.type === "user")
                  options.push({
                    name: `${f.label ?? ""} - ${m.label ?? ""}`,
                    id: JSON.stringify({
                      field: f.id,
                      location: fieldToNotifyTypes[f.type as string].table,
                      contacts: m.id,
                    }),
                  });
              });
          }
        });

      return options;
    });

    function resizeTextArea(event: any) {
      const textarea = event.currentTarget;

      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
      }
    }

    function getFieldOptions(rule: IRecordRule) {
      if (rule.type === "form" && rule.typename)
        return getFormFieldOptions(rule);
      else if (rule.type === "module" && rule.typename)
        return getModuleFieldOptions(rule);
      else if (rule.type === "linkedTable" && rule.typename)
        return getLinkedTableFieldOptions(rule);
      else return [];
    }

    function getFormFieldOptions(rule: IRecordRule) {
      const options = [] as Record<string, unknown>[];
      const formStatusOption = {
        id: "status",
        label: "Status",
        type: "selectmulti",
        seloptions: [
          { name: "Draft", value: 0 },
          { name: "Submitted", value: 1 },
        ],
      };

      props.upviseTableData["formStates"].data
        .filter((s: Record<string, unknown>) => s.templateid === rule.typename)
        .forEach((s: Record<string, unknown>) => {
          const sameStateOption = formStatusOption.seloptions.find(
            (o) => o.value === s.status
          );
          if (sameStateOption) sameStateOption.name = s.name as string;
          else
            formStatusOption.seloptions.push({
              name: s.name as string,
              value: Number(s.status),
            });
        });
      formStatusOption.seloptions.sort((a, b) => (a.value > b.value ? 1 : -1));

      options.push(formStatusOption);

      props.upviseTableData["formFields"].data.forEach(
        (field: Record<string, unknown>) => {
          if (
            field.formid === rule.typename &&
            !unusedTypes.includes(field.type as string)
          ) {
            options.push({
              id: field.id,
              label: field.label,
              type: field.type,
              seloptions: field.seloptions,
            });
          }
        }
      );

      return options;
    }

    function getModuleFieldOptions(rule: IRecordRule) {
      return moduleFields.value.filter(
        (field: IRecord) =>
          field["formid"] == rule.typename &&
          !unusedTypes.includes(field.type as string)
      );
    }

    function getLinkedTableFieldOptions(rule: IRecordRule) {
      if (props.linkedTableFields[rule.typename])
        return Object.values(props.linkedTableFields[rule.typename]) as Record<
          string,
          unknown
        >[];
      else return [] as Record<string, unknown>[];
    }

    function getModuleNameOptions() {
      const moduleNames = new Set(
        moduleFields.value.map((field: IRecord) => field.formid)
      );
      const moduleNameOptions = [] as Record<string, unknown>[];
      // Need to keep the name and id structure to work with code that already exists
      moduleNames.forEach((name) => {
        if (typeof name == "string") {
          moduleNameOptions.push({
            name: name,
            id: name,
          });
        }
      });
      return moduleNameOptions;
    }

    function getLabel(
      value: string,
      options: { name: string; value: string }[]
    ) {
      for (const o of options) {
        if (o.value === value) return o.name;
      }

      return "";
    }

    function getValueName(value: string, tableName: string) {
      const tableData = props.upviseTableData[tableName].data as Record<
        string,
        unknown
      >[];
      return tableData.filter((o) => o.id === value)[0].name;
    }

    function parseNotification(notification: IRecordNotification) {
      if (notification.notifyfields)
        notification.notifyfields = JSON.parse(
          notification.notifyfields as string
        )
          .map((f: Record<string, unknown>) => JSON.stringify(f))
          .join("|");
      return reactive(notification);
    }

    function stringifyNotification(notification: IRecordNotification) {
      if (notification.notifyfields)
        notification.notifyfields = JSON.stringify(
          (notification.notifyfields as string)
            .split("|")
            .map((f) => JSON.parse(f))
        );
      return reactive(notification);
    }

    function parseRules(rules: IRecordRule[]) {
      rules.forEach((r) => {
        r.rules = JSON.parse(r.rules as string);
      });
      return reactive(rules);
    }

    function stringifyRules(rules: IRecordRule[]) {
      rules.forEach((r) => {
        const rulesFields = r.rules as IRecordRuleField[];
        r.rules = JSON.stringify(
          rulesFields.filter((r) => utils.IsActive(r as unknown as IRecord))
        );
      });
      return reactive(rules);
    }

    function addNewRules(linkedTableName: string) {
      const newRule =
        getActiveRules().length === 0
          ? controller.getNewRule(copyNotification.id, "")
          : controller.getNewRule(copyNotification.id, linkedTableName);
      copyRules.push(newRule);
    }

    function deleteRules(_: unknown, index: number) {
      copyRules[index]._type = "DELETE";
      // if linked entity exists, remove it
      getActiveRules().forEach((r) => {
        if (r.type === "linkedTable") r._type = "DELETE";
      });
    }

    function addNewField(rule: IRecordRule) {
      const newField = controller.getNewRuleField();
      const rules = rule.rules as IRecordRuleField[];
      rules.push(newField);
    }

    function deleteField(_: unknown, rule: IRecordRule, index: number) {
      const rules = rule.rules as IRecordRuleField[];
      rules[index]._type = "DELETE";
    }

    function onRuleFieldChange(
      event: any,
      rule: IRecordRule,
      item: Record<string, unknown>
    ) {
      const field = getFieldOptions(rule).filter(
        (o: Record<string, unknown>) => o.id === event.value
      )[0];

      item.fieldname = field.label;
      item.fieldid = field.id;
      item.fieldtype = field.type;
      item.ruledetails = {};
    }

    function onRuleDetailsChange(
      _: any,
      item: Record<string, unknown>,
      ruleDetails: Record<string, unknown>
    ) {
      item.ruledetails = ruleDetails;
    }

    // Check if selOptions property in form field is a function or not
    function isSelOptionsFunction(formFieldId: string, rule: IRecordRule) {
      const options = getFieldOptions(rule).find(
        (o: Record<string, unknown>) => o.id === formFieldId
      )?.seloptions as string;
      if (options && typeof options === "string" && options.charAt(0) === "=")
        return true;
      else return false;
    }

    function getSelOptions(formFieldId: string, rule: IRecordRule) {
      const options = getFieldOptions(rule).find(
        (o: Record<string, unknown>) => o.id === formFieldId
      )?.seloptions as string;
      return options
        ? typeof options === "string"
          ? options.split("|").map((o) => ({ name: o, value: o }))
          : options
        : [];
    }

    function updateOptionsValue(fieldName: string, value: string) {
      if (fieldName === "notifycontacts")
        copyNotification["notifycontacts"] = value;
      else if (fieldName === "notifyfields")
        copyNotification["notifyfields"] = value;
      else if (fieldName === "timezone") copyNotification.timezone = value;
    }

    // update copyRules when type or form/module type changes (Removes linkedtable rules if it exists)
    function updateRules(
      rule: IRecordRule,
      newRules: IRecordRuleField[],
      newTypeName: string | null = null
    ) {
      if (rule.type === "module" || rule.type === "form") {
        rule.rules = newRules;
        if (newTypeName !== null) rule.typename = newTypeName;
      }

      // if linked entity exists, remove it
      getActiveRules().forEach((r) => {
        if (r.type === "linkedTable") r._type = "DELETE";
      });
      clearFieldToNotify();
    }

    function getActiveRules() {
      return copyRules.filter((r) => utils.IsActive(r as unknown as IRecord));
    }

    function clearFieldToNotify() {
      //console.log("Before clear: ", copyNotification.notifyfields);
      copyNotification.notifyfields = "";
      //console.log("After clear: ", copyNotification.notifyfields);
    }

    // Format name (e.g. Contacts.contacts -> TableUnybizContactsContacts)
    function formatTableName(string: string) {
      const name = string
        .toLowerCase()
        .replace(/\./g, " ")
        .split(" ")
        .map((s) => s[0].toUpperCase() + s.substr(1).toLowerCase())
        .join("");

      if (Object.keys(props.linkedTableFields).includes(`Table${name}`))
        return `Table${name}`;
      else return `TableUnybiz${name}`;
    }

    function getLinkedTableName(formTemplateId: string) {
      const formTemplates = props.upviseTableData["formTemplates"]
        .data as IRecord[];
      const tableName =
        (formTemplates.find((t) => t.id === formTemplateId)
          ?.linkedtable as string) || "";

      // check if form has a linked table
      if (!tableName) return tableName;
      else return formatTableName(tableName);
    }

    function closeNotification() {
      showNotification.value = false;
      emit("closeNotification");
    }

    function getAllTimeZones() {
      const defaultTZ: { name: string; id: string }[] = [];
      const ausTimeZones: { name: string; id: string }[] = [];
      const worldTimeZones: { name: string; id: string }[] = [];
      const timeZoneNames = moment.tz.names();
      timeZoneNames.forEach((name) => {
        let label = name.replace("_", " ");
        if (name.toLowerCase() == props.defaultTimeZone.toLowerCase())
          defaultTZ.push({ name: label + " (Default)", id: name });
        else
          name.toLowerCase().startsWith("australia")
            ? ausTimeZones.push({ name: label, id: name })
            : worldTimeZones.push({ name: label, id: name });
      });
      return defaultTZ.concat(
        orderBy(ausTimeZones, ["name"], ["asc"]).concat(
          orderBy(worldTimeZones, ["name"], ["asc"])
        )
      );
    }

    async function saveNotification() {
      if (controller.doValidateNotification(copyNotification, copyRules)) {
        awaitingResponse.value = true;
        await controller
          .doSaveModelEntities({
            TableEmployeedashboardNotificationrules: [
              stringifyNotification(
                JSON.parse(JSON.stringify(copyNotification))
              ),
            ],
            TableEmployeedashboardRules: stringifyRules(
              JSON.parse(JSON.stringify(copyRules))
            ),
          })
          .then(() => {
            awaitingResponse.value = false;
            closeNotification();
          })
          .catch(() => {
            awaitingResponse.value = false;
            useToast().add({
              severity: "error",
              summary: "Operation unsuccesful",
              detail: "Could not save the notification",
              life: 1570,
            });
          });
      }
    }

    async function deleteNotification() {
      awaitingResponse.value = true;
      await controller
        .doDeleteNotification(copyNotification, upviseDataMessage.value)
        .then(() => {
          awaitingResponse.value = false;
          closeNotification();
        })
        .catch(() => {
          awaitingResponse.value = false;
          useToast().add({
            severity: "error",
            summary: "Operation unsuccesful",
            detail: "Could not delete the notification",
            life: 1570,
          });
        });
    }

    watch(
      [copyNotification, copyRules],
      utils.debounce(() => {
        let rulesChanged = false;

        if (copyRules.length !== originalRules.length) {
          rulesChanged = true;
        } else {
          copyRules.some((rule) => {
            const originalRule = originalRules.find((r) => r.id === rule.id);
            if (!originalRule || !utils.equalObjects(rule, originalRule)) {
              rulesChanged = true;
              return true;
            }
            return false;
          });
        }

        showSave.value =
          rulesChanged ||
          !utils.equalObjects(copyNotification, originalNotification);
      }),
      { deep: true }
    );

    return {
      awaitingResponse,
      showNotification,
      showSave,
      copyNotification,
      copyRules,
      isNotificationActive,
      fieldToNotifyOptions,
      // eslint-disable-next-line vue/no-dupe-keys
      contactsOptions,
      allTimeZones,
      formTemplateOptions,
      moduleNameOptions,
      dateTypes,
      timeTypes,
      textTypes,
      numberTypes,
      valueProvidedTypes,
      typeOptions,
      dateTypeOptions,
      timeTypeOptions,
      textOperationOptions,
      numberOperationOptions,
      staticDateOperationOptions,
      relativeDateOperationOptions,
      valueProvidedOperationOptions,
      checkboxOperationOptions,
      toggleOperationOptions,
      currencyValueOptions,
      resizeTextArea,
      getFieldOptions,
      getLabel,
      getValueName,
      addNewRules,
      deleteRules,
      addNewField,
      deleteField,
      onRuleFieldChange,
      onRuleDetailsChange,
      isSelOptionsFunction,
      getSelOptions,
      updateOptionsValue,
      updateRules,
      getActiveRules,
      getLinkedTableName,
      closeNotification,
      saveNotification,
      deleteNotification,
      IsActive: utils.IsActive,
      getDate: utils.getDate,
      getEpoch: utils.getEpoch,
    };
  },
});
export default NotificationEdit;
</script>

<template>
  <div>
    <sidebar
      class="notification-screen"
      :visible="showNotification"
      position="right"
    >
      <div class="p-grid sidebar-grid">
        <div class="p-col-7">
          <div class="p-grid">
            <div class="p-col-12">
              <span class="header-name">Notification</span>
            </div>
          </div>
        </div>

        <div class="p-col-5 sidebar-options">
          <div class="loading-spinner" v-if="awaitingResponse">
            <ProgressSpinner class="spinner"></ProgressSpinner>
          </div>
          <div v-if="showSave" class="option" @click="saveNotification()">
            <font-awesome-icon class="save-icon" :icon="['fa', 'save']" />
          </div>
          <div class="option" @click="deleteNotification()">
            <font-awesome-icon class="trash-icon" :icon="['fa', 'trash']" />
          </div>
          <div class="option" @click="closeNotification()">
            <font-awesome-icon class="times-icon" :icon="['fa', 'times']" />
          </div>
        </div>

        <div class="p-col-12 divider"></div>

        <div class="p-col-3 input-label">Name</div>
        <div class="p-col-9">
          <input-text
            class="input-text-field"
            type="text"
            v-model="copyNotification.name"
            maxlength="225"
          />
        </div>

        <div class="p-col-3 input-label">Contacts to notify</div>
        <div class="p-col-9">
          <auto-complete-text-box
            :options="contactsOptions"
            :selected="copyNotification.notifycontacts"
            display-field="name"
            field-name="notifycontacts"
            @updateOptionsValue="updateOptionsValue"
          />
        </div>

        <div class="p-col-3 input-label">Message</div>
        <div class="p-col-9">
          <textarea
            class="input-textarea"
            rows="3"
            @input="resizeTextArea($event)"
            v-model="copyNotification.message"
          />
        </div>

        <div class="p-col-3 input-label">Time Zone</div>
        <div class="p-col-9">
          <auto-complete-text-box
            :options="allTimeZones"
            :selected="
              copyNotification.timezone
                ? copyNotification.timezone
                : defaultTimeZone
            "
            :multi-select="false"
            :disable-sort="true"
            display-field="name"
            field-name="timezone"
            @updateOptionsValue="updateOptionsValue"
          />
        </div>

        <div class="p-col-3 input-label">Active Notification</div>
        <div class="p-col-9 input-switch">
          <input-switch v-model="isNotificationActive" />
        </div>

        <template v-if="fieldToNotifyOptions.length > 0">
          <div class="p-col-3 input-label">Fields to notify</div>
          <div class="p-col-9">
            <auto-complete-text-box
              :options="fieldToNotifyOptions"
              :selected="copyNotification.notifyfields"
              display-field="name"
              field-name="notifyfields"
              @updateOptionsValue="updateOptionsValue"
            />
          </div>
        </template>

        <template v-for="(Rule, ruleIndex) in copyRules" :key="ruleIndex">
          <template v-if="IsActive(Rule)">
            <div class="p-col-12" style="height: 60px"></div>
            <div class="p-col-12 divider"></div>

            <template v-if="Rule.type === 'linkedTable'">
              <div class="p-col-2 input-label">Type</div>
              <div class="p-col-3 input-label">{{ Rule.typename }}</div>
              <div class="p-col-6"></div>
              <div
                class="p-col-1 rule-delete"
                @click.stop="deleteRules($event, ruleIndex)"
              >
                <font-awesome-icon class="trash-icon" :icon="['fa', 'trash']" />
              </div>
            </template>

            <template v-else>
              <div class="p-col-2 input-label">Type</div>
              <div class="p-col-3">
                <dropdown
                  class="input-dropdown-field"
                  v-model="Rule.type"
                  :options="typeOptions"
                  optionLabel="name"
                  optionValue="name"
                  placeholder="Select type"
                  @change="
                    () => {
                      updateRules(Rule, [], '');
                    }
                  "
                />
              </div>
              <div class="p-col-6"></div>
              <div
                class="p-col-1 rule-delete"
                @click="deleteRules($event, ruleIndex)"
              >
                <font-awesome-icon class="trash-icon" :icon="['fa', 'trash']" />
              </div>

              <template v-if="Rule.type">
                <div class="p-col-2 input-label">
                  {{ Rule.type === "form" ? "Form" : "Module" }}
                </div>
                <div class="p-col-3">
                  <dropdown
                    class="input-dropdown-field"
                    v-model="Rule.typename"
                    :options="
                      Rule.type === 'form'
                        ? formTemplateOptions
                        : moduleNameOptions
                    "
                    optionLabel="name"
                    optionValue="id"
                    :placeholder="
                      Rule.type === 'form' ? 'Select form' : 'Select module'
                    "
                    :filter="true"
                    @change="
                      () => {
                        updateRules(Rule, []);
                      }
                    "
                  />
                </div>
                <div class="p-col-7"></div>
              </template>
            </template>

            <div class="p-col-12 divider"></div>

            <div v-if="Rule.type && Rule.typename" class="p-col-12 rule-label">
              Rules
              <div @click.stop="addNewField(Rule)">
                <font-awesome-icon
                  class="plus-circle-icon"
                  :icon="['fa', 'plus-circle']"
                />
              </div>
            </div>

            <template
              v-for="(Item, itemIndex) in Rule.rules"
              :key="ruleIndex + ' rule_' + itemIndex"
            >
              <template v-if="IsActive(Item)">
                <div class="p-col-3 rule-dropdown">
                  <dropdown
                    class="input-dropdown-field"
                    v-model="Item.fieldid"
                    :options="getFieldOptions(Rule)"
                    optionLabel="label"
                    optionValue="id"
                    placeholder="Select field"
                    :filter="true"
                    @change="onRuleFieldChange($event, Rule, Item)"
                  />
                </div>
                <div class="p-col-9">
                  <div class="p-grid rule-details">
                    <template
                      v-if="
                        dateTypes.includes(Item.fieldtype) ||
                        timeTypes.includes(Item.fieldtype)
                      "
                    >
                      <div class="p-col-3">
                        <dropdown
                          class="input-dropdown-field field-name-dropdown"
                          v-model="Item.ruledetails.type"
                          :options="
                            dateTypes.includes(Item.fieldtype)
                              ? dateTypeOptions
                              : timeTypeOptions
                          "
                          optionLabel="name"
                          optionValue="value"
                          placeholder="Type"
                          @change="
                            onRuleDetailsChange($event, Item, {
                              type: Item.ruledetails.type,
                              ...($event.value !== 'relative' && {
                                operation:
                                  $event.value === 'empty' ||
                                  $event.value === 'notEmpty' ||
                                  $event.value === 'expired' ||
                                  $event.value === 'notExpired'
                                    ? Item.ruledetails.type
                                    : null,
                              }),
                              ...(($event.value === 'empty' ||
                                $event.value === 'notEmpty' ||
                                $event.value === 'expired' ||
                                $event.value === 'notExpired') && {
                                operationLabel: getLabel(
                                  Item.ruledetails.type,
                                  dateTypes.includes(Item.fieldtype)
                                    ? dateTypeOptions
                                    : timeTypeOptions
                                ),
                              }),
                            })
                          "
                        />
                      </div>

                      <template v-if="Item.ruledetails.type === 'static'">
                        <div class="p-col-2">
                          <dropdown
                            class="input-dropdown-field"
                            v-model="Item.ruledetails.operation"
                            :options="staticDateOperationOptions"
                            optionLabel="name"
                            optionValue="value"
                            @change="
                              onRuleDetailsChange($event, Item, {
                                type: Item.ruledetails.type,
                                operation: Item.ruledetails.operation,
                                operationLabel: getLabel(
                                  Item.ruledetails.operation,
                                  staticDateOperationOptions
                                ),
                                ...(Item.ruledetails.operation ===
                                  'between' && {
                                  value1: null,
                                  value2: null,
                                }),
                                ...(Item.ruledetails.operation !==
                                  'between' && {
                                  value: null,
                                }),
                              })
                            "
                          />
                        </div>

                        <template
                          v-if="Item.ruledetails.operation === 'between'"
                        >
                          <div class="p-col-3">
                            <calendar
                              class="input-date"
                              dateFormat="yy-mm-dd"
                              :model-value="
                                Item.ruledetails.value1
                                  ? getDate(Item.ruledetails.value1)
                                  : ''
                              "
                              :manualInput="false"
                              :showTime="
                                Item.fieldtype === 'date' ? false : true
                              "
                              hourFormat="12"
                              :timeOnly="
                                Item.fieldtype === 'time' ? true : false
                              "
                              @update:model-value="
                                Item.ruledetails.value1 = getEpoch($event)
                              "
                            />
                          </div>
                          <div class="p-col-3">
                            <calendar
                              class="input-date"
                              dateFormat="yy-mm-dd"
                              :model-value="
                                Item.ruledetails.value2
                                  ? getDate(Item.ruledetails.value2)
                                  : ''
                              "
                              :manualInput="false"
                              :showTime="
                                Item.fieldtype === 'date' ? false : true
                              "
                              hourFormat="12"
                              :timeOnly="
                                Item.fieldtype === 'time' ? true : false
                              "
                              @update:model-value="
                                Item.ruledetails.value2 = getEpoch($event)
                              "
                            />
                          </div>
                        </template>
                        <template v-else-if="Item.ruledetails.operation">
                          <div class="p-col-6">
                            <calendar
                              class="input-date"
                              dateFormat="yy-mm-dd"
                              :model-value="
                                Item.ruledetails.value
                                  ? getDate(Item.ruledetails.value)
                                  : ''
                              "
                              :manualInput="false"
                              :showTime="
                                Item.fieldtype === 'date' ? false : true
                              "
                              hourFormat="12"
                              :timeOnly="
                                Item.fieldtype === 'time' ? true : false
                              "
                              @update:model-value="
                                Item.ruledetails.value = getEpoch($event)
                              "
                            />
                          </div>
                        </template>
                        <div v-else class="p-col-6" />
                      </template>

                      <template
                        v-else-if="Item.ruledetails.type === 'relative'"
                      >
                        <div class="p-col-2" />
                        <div class="p-col-6">
                          <input-text
                            class="input-text-field"
                            type="text"
                            v-model="Item.ruledetails.value"
                            :placeholder="'(+/-)#(D/W/M/Y) (eg: -3M)'"
                          />
                        </div>
                      </template>
                      <div v-else class="p-col-8"></div>
                    </template>

                    <template v-else-if="numberTypes.includes(Item.fieldtype)">
                      <div class="p-col-3">
                        <dropdown
                          class="input-dropdown-field"
                          v-model="Item.ruledetails.operation"
                          :options="numberOperationOptions"
                          optionLabel="name"
                          optionValue="value"
                          @change="
                            onRuleDetailsChange(
                              $event,
                              Item,
                              Item.ruledetails.operation === 'between'
                                ? {
                                    operation: Item.ruledetails.operation,
                                    operationLabel: getLabel(
                                      Item.ruledetails.operation,
                                      numberOperationOptions
                                    ),
                                    value1: null,
                                    value2: null,
                                  }
                                : {
                                    operation: Item.ruledetails.operation,
                                    operationLabel: getLabel(
                                      Item.ruledetails.operation,
                                      numberOperationOptions
                                    ),
                                    value: null,
                                  }
                            )
                          "
                        />
                      </div>
                      <div class="p-col-2" />
                      <template v-if="Item.ruledetails.operation === 'between'">
                        <div class="p-col-3">
                          <input-number
                            class="input-number-field"
                            v-model="Item.ruledetails.value1"
                            :minFractionDigits="
                              Item.fieldtype === 'decimal' ? 1 : null
                            "
                            :maxFractionDigits="
                              Item.fieldtype === 'decimal' ? 10 : null
                            "
                          />
                        </div>
                        <div class="p-col-3">
                          <input-number
                            class="input-number-field"
                            v-model="Item.ruledetails.value2"
                            :minFractionDigits="
                              Item.fieldtype === 'decimal' ? 1 : null
                            "
                            :maxFractionDigits="
                              Item.fieldtype === 'decimal' ? 10 : null
                            "
                          />
                        </div>
                      </template>
                      <template
                        v-else-if="
                          Item.ruledetails.operation &&
                          Item.ruledetails.operation !== 'empty' &&
                          Item.ruledetails.operation !== 'notEmpty'
                        "
                      >
                        <div class="p-col-6">
                          <input-number
                            class="input-number-field"
                            v-model="Item.ruledetails.value"
                            :minFractionDigits="
                              Item.fieldtype === 'decimal' ? 1 : null
                            "
                            :maxFractionDigits="
                              Item.fieldtype === 'decimal' ? 10 : null
                            "
                          />
                        </div>
                      </template>
                      <template v-else>
                        <div class="p-col-6" />
                      </template>
                    </template>

                    <template v-else-if="textTypes.includes(Item.fieldtype)">
                      <div class="p-col-3">
                        <dropdown
                          class="input-dropdown-field"
                          v-model="Item.ruledetails.operation"
                          :options="textOperationOptions"
                          optionLabel="name"
                          optionValue="value"
                          @change="
                            onRuleDetailsChange($event, Item, {
                              operation: Item.ruledetails.operation,
                              operationLabel: getLabel(
                                Item.ruledetails.operation,
                                textOperationOptions
                              ),
                              ...(!(
                                Item.ruledetails.operation === 'empty' ||
                                Item.ruledetails.operation === 'notEmpty'
                              ) && {
                                value: null,
                              }),
                            })
                          "
                        />
                      </div>
                      <div class="p-col-2" />
                      <template
                        v-if="
                          Item.ruledetails.operation &&
                          Item.ruledetails.operation !== 'empty' &&
                          Item.ruledetails.operation !== 'notEmpty'
                        "
                      >
                        <div class="p-col-6">
                          <input-text
                            class="input-text-field"
                            type="text"
                            v-model="Item.ruledetails.value"
                          />
                        </div>
                      </template>
                      <template v-else>
                        <div class="p-col-6" />
                      </template>
                    </template>

                    <template v-else-if="Item.fieldtype === 'select'">
                      <div class="p-col-5" />
                      <div class="p-col-6">
                        <input-text
                          v-if="isSelOptionsFunction(Item.fieldid, Rule)"
                          class="input-text-field"
                          type="text"
                          v-model="Item.ruledetails.value"
                        />
                        <dropdown
                          v-else
                          class="input-dropdown-field"
                          v-model="Item.ruledetails.value"
                          :options="getSelOptions(Item.fieldid, Rule)"
                          optionLabel="name"
                          optionValue="value"
                        />
                      </div>
                    </template>

                    <template v-else-if="Item.fieldtype === 'selectmulti'">
                      <div class="p-col-5" />
                      <div class="p-col-6">
                        <!-- <input-text
                          v-if="isSelOptionsFunction(Item.fieldid, Rule)"
                          class="input-text-field"
                          type="text"
                          v-model="Item.ruledetails.value"
                        /> -->
                        <div
                          v-if="isSelOptionsFunction(Item.fieldid, Rule)"
                          class="p-col-3 input-label"
                        >
                          No options available
                        </div>
                        <multi-select
                          v-else
                          class="input-multiselect-field"
                          v-model="Item.ruledetails.value"
                          :options="getSelOptions(Item.fieldid, Rule)"
                          optionLabel="name"
                          optionValue="value"
                        />
                      </div>
                    </template>

                    <template v-else-if="Item.fieldtype === 'currency'">
                      <div class="p-col-5" />
                      <div class="p-col-6">
                        <dropdown
                          class="input-dropdown-field"
                          v-model="Item.ruledetails.value"
                          :options="currencyValueOptions"
                          optionLabel="name"
                          optionValue="value"
                        />
                      </div>
                    </template>

                    <template
                      v-else-if="valueProvidedTypes.includes(Item.fieldtype)"
                    >
                      <div class="p-col-3">
                        <dropdown
                          class="input-dropdown-field"
                          v-model="Item.ruledetails.operation"
                          :options="valueProvidedOperationOptions"
                          optionLabel="name"
                          optionValue="value"
                          @change="
                            onRuleDetailsChange($event, Item, {
                              operation: Item.ruledetails.operation,
                              operationLabel: getLabel(
                                Item.ruledetails.operation,
                                valueProvidedOperationOptions
                              ),
                            })
                          "
                        />
                      </div>
                      <div class="p-col-8" />
                    </template>

                    <template v-else-if="Item.fieldtype === 'checkbox'">
                      <div class="p-col-3">
                        <dropdown
                          class="input-dropdown-field"
                          v-model="Item.ruledetails.operation"
                          :options="checkboxOperationOptions"
                          optionLabel="name"
                          optionValue="value"
                          @change="
                            onRuleDetailsChange($event, Item, {
                              operation: Item.ruledetails.operation,
                              operationLabel: getLabel(
                                Item.ruledetails.operation,
                                checkboxOperationOptions
                              ),
                            })
                          "
                        />
                      </div>
                      <div class="p-col-8" />
                    </template>

                    <template v-else-if="Item.fieldtype === 'toggle'">
                      <div class="p-col-3">
                        <dropdown
                          class="input-dropdown-field"
                          v-model="Item.ruledetails.operation"
                          :options="toggleOperationOptions"
                          optionLabel="name"
                          optionValue="value"
                          @change="
                            onRuleDetailsChange($event, Item, {
                              operation: Item.ruledetails.operation,
                              operationLabel: getLabel(
                                Item.ruledetails.operation,
                                toggleOperationOptions
                              ),
                            })
                          "
                        />
                      </div>
                      <div class="p-col-8" />
                    </template>

                    <template
                      v-else-if="
                        Object.keys(upviseTableData).includes(Item.fieldtype)
                      "
                    >
                      <div class="p-col-5" />
                      <div class="p-col-6">
                        <dropdown
                          class="input-dropdown-field"
                          v-model="Item.ruledetails.value"
                          :options="upviseTableData[Item.fieldtype].data"
                          optionLabel="name"
                          optionValue="id"
                          :filter="true"
                          @change="
                            onRuleDetailsChange($event, Item, {
                              value: Item.ruledetails.value,
                              valueName: getValueName(
                                Item.ruledetails.value,
                                Item.fieldtype
                              ),
                            })
                          "
                          dataKey="id"
                        />
                      </div>
                    </template>

                    <template v-else>
                      <div class="p-col-11"></div>
                    </template>

                    <div
                      class="p-col-1 rule-delete"
                      @click="deleteField($event, Rule, itemIndex)"
                    >
                      <font-awesome-icon
                        class="trash-icon"
                        :icon="['fa', 'trash']"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </template>
        </template>

        <template v-if="getActiveRules().length === 0">
          <div class="p-col-12" style="height: 60px"></div>
          <div class="p-col-12 divider"></div>

          <div class="p-col-12 rule-label">
            Add rules for form/module
            <div @click="addNewRules('')">
              <font-awesome-icon
                class="plus-circle-icon"
                :icon="['fa', 'plus-circle']"
              />
            </div>
          </div>
        </template>

        <template
          v-if="
            getActiveRules().length === 1 &&
            getActiveRules()[0].type === 'form' &&
            getLinkedTableName(getActiveRules()[0].typename)
          "
        >
          <div class="p-col-12" style="height: 60px"></div>
          <div class="p-col-12 divider"></div>

          <div class="p-col-12 rule-label">
            Add rules for linked entity
            <div
              @click="
                addNewRules(getLinkedTableName(getActiveRules()[0].typename))
              "
            >
              <font-awesome-icon
                class="plus-circle-icon"
                :icon="['fa', 'plus-circle']"
              />
            </div>
          </div>
        </template>
      </div>
    </sidebar>
  </div>
</template>

<style scoped></style>
