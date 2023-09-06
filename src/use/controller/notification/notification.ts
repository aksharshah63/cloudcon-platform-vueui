import {
  IRecord,
  ITableResponse,
  IUpvise,
  IUpviseDataMessage,
} from "../../../store/modules/upvise.d";
import utils from "../../../use/function/useUtils";
import {
  IRecordNotification,
  IRecordRule,
  IRecordRuleField,
} from "../../../use/controller/notification/notification.d";
import { reactive } from "vue";
import useLocalForage from "../../../use/utils/useLocalForage";

export default function useControllerNotification(upvise: IUpvise) {
  const state = upvise.state();
  const fetch = () => upvise.fetch("notification");
  const getMetadata = () => upvise.metadata("notification");

  const upviseTableNames = {
    company: "unybiz.contacts.companies",
    contact: "unybiz.contacts.contacts",
    formFields: "unybiz.forms.fields",
    formStates: "unybiz.forms.states",
    formTemplates: "unybiz.forms.templates",
    metadata: upvise.upviseClient + "employeedashboard.metadata",
    moduleFields: "uny.notes.fields",
    opp: "unybiz.sales.opportunities",
    owner: "unybiz.contacts.contacts",
    product: "unybiz.sales.products",
    project: "unybiz.projects.projects",
    risk: "qhse.risks",
    tool: "tools.tools",
    user: "unybiz.contacts.contacts",
  } as Record<string, string>;

  const setNameForRules = (
    upviseTableData: Record<string, { tableName: string; data: unknown }>
  ) => {
    const rulesData = Object.values(
      upvise.entityData("TableEmployeedashboardRules")
    );
    rulesData.forEach((r) => {
      if (r.type === "linkedTable") r.name = r.typename;
      else if (r.type === "form") {
        const formTemplates = (upviseTableData["formTemplates"]?.data ||
          []) as Record<string, unknown>[];
        r.name =
          (formTemplates.filter((t) => t.id === r.typename)[0]
            ?.name as string) || "";
      } else if (r.type === "module") {
        const metadata = (upviseTableData["metadata"]?.data || []) as Record<
          string,
          unknown
        >[];
        r.name =
          (metadata.filter((t) => t.id === r.typename)[0]?.keyname as string) ||
          "";
      }
    });
  };

  async function getUpviseTableData() {
    const upviseTableData: Record<
      string,
      { tableName: string; data: Record<string, unknown>[] }
    > = {};
    const localForageInstance = useLocalForage.getInstance("upvise", "tables");

    for (const key in upviseTableNames) {
      await useLocalForage
        .getData(upviseTableNames[key], localForageInstance)
        .then((result: unknown) => {
          if (result)
            upviseTableData[key] = {
              tableName: upviseTableNames[key],
              data: result as IRecord[],
            };
          else
            upviseTableData[key] = {
              tableName: upviseTableNames[key],
              data: [],
            };
        })
        .catch();
    }
    return upviseTableData;
  }

  function getLinkedTableFields(metadata: Record<string, unknown>[]) {
    const fields: Record<string, Record<string, Record<string, string>>> = {};

    metadata.forEach((m) => {
      const persistence = JSON.parse(m.persistence as string) as ITableResponse;

      if (persistence.Type === 0) {
        const tableName = persistence.Location.Name;
        const schema = persistence.Schema;

        if (schema)
          Object.values(schema).forEach((f) => {
            if (f.SupportsFiltering === true) {
              if (!fields[tableName]) fields[tableName] = {};
              if (!fields[tableName][f.InternalName as string]) {
                fields[tableName][f.InternalName as string] = {
                  id: f.InternalName as string,
                  label: f.Label as string,
                  type: f.RawType as string,
                };
              }
            }
          });
      }
    });

    return fields;
  }

  const doSaveModelEntities = (payload: {
    TableEmployeedashboardNotificationrules?: IRecordNotification[];
    TableEmployeedashboardRules?: IRecordRule[];
  }): Promise<void> => {
    return upvise.update(payload as Record<string, IRecord[]>);
  };

  const getNewNotification = () =>
    reactive({
      id: utils.generateId(),
      isactive: 1,
      message: "",
      name: "",
      notifycontacts: "",
      notifyfields: "",
      owner: window?.User?.email || "stegr@cloudcon.com.au",
    } as IRecordNotification);

  const getEditNotification = (notificationId: string): IRecordNotification => {
    const editNotification = upvise.recordData(
      "TableEmployeedashboardNotificationrules",
      notificationId
    ) as unknown as IRecordNotification;

    return reactive(JSON.parse(JSON.stringify(editNotification)));
  };

  const doValidateNotification = (
    notification: IRecordNotification,
    rules: IRecordRule[]
  ) => {
    if (!notification.name.trim()) {
      alert("Please input a name");
      return false;
    }

    if (!notification.notifycontacts.trim() && !notification.notifyfields) {
      alert("Please select at least one contact to notify");
      return false;
    }

    const requiredKeys = ["value", "value1", "value2", "operation"];
    const relativeDateRegex = new RegExp(/^(\+|-)?[0-9]+(D|W|M|Y){1}$/);
    let isMissingFieldValue = false;
    let invalidRelativeDateValue = false;

    rules
      .filter((entity) => utils.IsActive(entity as unknown as IRecord))
      .forEach((e) => {
        const rules = e.rules as IRecordRuleField[];
        rules
          .filter((rule) => utils.IsActive(rule as unknown as IRecord))
          .forEach((r) => {
            if (!r.fieldid) isMissingFieldValue = true; // Added rule but did not select field type
            const ruleDetails = r.ruledetails as Record<string, unknown>;
            if (Object.keys(ruleDetails).length === 0)
              isMissingFieldValue = true; // Did not select rules to apply to field
            Object.keys(ruleDetails).forEach((key) => {
              if (typeof ruleDetails[key] === "string") {
                ruleDetails[key] = (ruleDetails[key] as string).trim(); // Remove unnecessary whitespace
              }
              if (requiredKeys.includes(key) && !ruleDetails[key])
                isMissingFieldValue = true; // Rule field is empty
            });

            if (
              // Check relative rules have valid values
              (r.fieldtype === "date" || r.fieldtype === "datetime") &&
              Object.keys(ruleDetails).length !== 0 &&
              ruleDetails.type === "relative" &&
              ruleDetails.value &&
              !relativeDateRegex.test(ruleDetails.value as string)
            )
              invalidRelativeDateValue = true;
          });
      });

    if (isMissingFieldValue) {
      alert("Please ensure all rules have been filled");
      return false;
    }

    if (invalidRelativeDateValue) {
      alert("Please ensure all relative date rules have been filled properly");
      return false;
    }

    return true;
  };

  const doDeleteNotification = (
    notificationModel: IRecordNotification,
    upviseDataMessage: IUpviseDataMessage
  ): Promise<void> => {
    const copyNotification = JSON.parse(
      JSON.stringify(notificationModel)
    ) as IRecord;
    copyNotification._type = "DELETE";

    return upvise.update(
      {
        TableEmployeedashboardNotificationrules: [copyNotification],
      },
      upviseDataMessage
    );
  };

  const getNewRule = (notificationId: string, linkedTableName: string) =>
    reactive({
      id: utils.generateId(),
      notificationid: notificationId,
      rules: [] as IRecordRuleField[],
      type: linkedTableName ? "linkedTable" : "",
      typename: linkedTableName ? linkedTableName : "",
    } as IRecordRule);

  const getEditRulesForNotification = (
    notificationId: string
  ): IRecordRule[] => {
    const editRules = upvise.entityFilter(
      "TableEmployeedashboardRules",
      "notificationid",
      notificationId
    ) as unknown as IRecordRule[];

    return reactive(JSON.parse(JSON.stringify(editRules)));
  };

  const getNewRuleField = () =>
    reactive({
      fieldid: "",
      fieldname: "",
      fieldtype: "",
      ruledetails: {},
    } as IRecordRuleField);

  return {
    state,
    fetch,
    getMetadata,
    setNameForRules,
    getUpviseTableData,
    getLinkedTableFields,
    doSaveModelEntities,

    getNewNotification,
    getEditNotification,
    doValidateNotification,
    doDeleteNotification,

    getNewRule,
    getEditRulesForNotification,

    getNewRuleField,
  };
}
