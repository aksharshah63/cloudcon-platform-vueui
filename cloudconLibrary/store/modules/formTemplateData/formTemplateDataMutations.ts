import {
  IField,
  IFormTemplateData,
  IFieldGroup,
  IFormTemplateTableDataKeys,
  IFormTemplate,
  IFormTemplateField,
  IFormTemplateGroup,
} from "./formTemplateDataModule";
import utils from "../../../utilities/useUtils";

export default {
  updateFields(state: IFormTemplateData, data: IField[]): void {
    updateStore(state, "fields", data);
  },

  updateFieldGroups(state: IFormTemplateData, data: IFieldGroup[]): void {
    updateStore(state, "fieldGroups", data);
  },

  updateFormTemplates(state: IFormTemplateData, data: IFormTemplate[]): void {
    updateStore(state, "formTemplates", data);
  },

  updateFieldsForTable(
    state: IFormTemplateData,
    payload: {
      data: IField[];
      totalRecords: number;
    }
  ): void {
    state.fieldsForTable.data = payload.data;
    state.fieldsForTable.totalRecords = payload.totalRecords;
  },

  updateFieldGroupsForTable(
    state: IFormTemplateData,
    payload: {
      data: IFieldGroup[];
      totalRecords: number;
    }
  ): void {
    state.fieldGroupsForTable.data = payload.data;
    state.fieldGroupsForTable.totalRecords = payload.totalRecords;
  },

  updateFormTemplatesForTable(
    state: IFormTemplateData,
    payload: {
      data: IFormTemplate[];
      totalRecords: number;
    }
  ): void {
    state.formTemplatesForTable.data = payload.data;
    state.formTemplatesForTable.totalRecords = payload.totalRecords;
  },

  resetFormTemplates(state: IFormTemplateData): void {
    resetStore(state, "formTemplates");
  },

  deleteFormTemplates(state: IFormTemplateData, idsToDelete: number[]): void {
    deleteFromStore(state, "formTemplates", idsToDelete);
  },

  updateFormTemplateFields(
    state: IFormTemplateData,
    data: IFormTemplateField[]
  ): void {
    updateStore(state, "formTemplateFields", data);
  },

  resetFormTemplateFields(state: IFormTemplateData): void {
    resetStore(state, "formTemplateFields");
  },

  deleteFormTemplateFields(
    state: IFormTemplateData,
    idsToDelete: number[]
  ): void {
    deleteFromStore(state, "formTemplateFields", idsToDelete);
  },

  updateFormTemplateGroups(
    state: IFormTemplateData,
    data: IFormTemplateGroup[]
  ): void {
    updateStore(state, "formTemplateGroups", data);
  },

  resetFormTemplateGroups(state: IFormTemplateData): void {
    resetStore(state, "formTemplateGroups");
  },

  deleteFormTemplateGroups(
    state: IFormTemplateData,
    idsToDelete: number[]
  ): void {
    deleteFromStore(state, "formTemplateGroups", idsToDelete);
  },
};

function updateStore<
  T extends
    | IField
    | IFieldGroup
    | IFormTemplate
    | IFormTemplateField
    | IFormTemplateGroup
>(
  state: IFormTemplateData,
  keyName: IFormTemplateTableDataKeys,
  data: T[]
): void {
  const stateData = state[keyName];
  if (typeof state[keyName] != "object") return;
  data.forEach((record) => {
    const recordId = record.id;

    // if record has no id, ignore it
    if (!recordId) return;

    // if record already in store, just update it
    if (recordId in stateData) {
      const existingRecord = stateData[recordId];
      Object.assign(existingRecord, utils.deepCopy(record));
    } else {
      // else add record to the store
      const newRecord = utils.deepCopy(record);
      stateData[recordId] = newRecord;
    }
  });
}

function resetStore(
  state: IFormTemplateData,
  keyName: IFormTemplateTableDataKeys
): void {
  if (typeof state[keyName] != "object") return;
  state[keyName] = {};
}

function deleteFromStore(
  state: IFormTemplateData,
  keyName: IFormTemplateTableDataKeys,
  idsToDelete: number[]
): void {
  const stateData = state[keyName];
  if (typeof stateData != "object") return;

  idsToDelete.forEach((id) => {
    // if record in store, delete it
    if (id in stateData) {
      delete stateData[id];
    }
  });
}
