import {
  ICustomField,
  ICustomFieldData,
  ICustomFieldTableDataKeys,
} from "./customFieldDataModule";
import utils from "../../../utilities/useUtils";

export default {
  resetCustomFields(state: ICustomFieldData): void {
    resetStore(state, "customFields");
  },

  updateCustomFields(state: ICustomFieldData, data: ICustomField[]): void {
    updateStore(state, "customFields", data);
  },

  updateCustomFieldsForTable(
    state: ICustomFieldData,
    payload: {
      data: ICustomField[];
      totalRecords: number;
    }
  ): void {
    state.customFieldsForTable.data = payload.data;
    state.customFieldsForTable.totalRecords = payload.totalRecords;
  },

  deleteCustomFields(state: ICustomFieldData, idsToDelete: number[]): void {
    deleteFromStore(state, "customFields", idsToDelete);
  },
};

function updateStore<T extends ICustomField>(
  state: ICustomFieldData,
  keyName: ICustomFieldTableDataKeys,
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
  state: ICustomFieldData,
  keyName: ICustomFieldTableDataKeys
): void {
  if (typeof state[keyName] != "object") return;
  state[keyName] = {};
}

function deleteFromStore(
  state: ICustomFieldData,
  keyName: ICustomFieldTableDataKeys,
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
