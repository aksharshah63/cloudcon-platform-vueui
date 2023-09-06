import {
  IContact,
  IContactData,
  IContactGroup,
  IContactTableDataKeys,
} from "./contactDataModule";
import utils from "../../../utilities/useUtils";

if (navigator.webdriver) {
  window.localStorage.clear();
}

export default {
  resetContacts(state: IContactData): void {
    resetStore(state, "contacts");
  },

  updateContacts(state: IContactData, data: IContact[]): void {
    updateStore(state, "contacts", data);
  },

  updateContactsForTable(
    state: IContactData,
    payload: {
      data: IContact[];
      totalRecords: number;
    }
  ): void {
    state.contactsForTable.data = payload.data;
    state.contactsForTable.totalRecords = payload.totalRecords;
  },

  deleteContacts(state: IContactData, idsToDelete: number[]): void {
    deleteFromStore(state, "contacts", idsToDelete);
  },

  resetContactGroups(state: IContactData): void {
    resetStore(state, "contactGroups");
  },

  updateContactGroups(state: IContactData, data: IContactGroup[]): void {
    updateStore(state, "contactGroups", data);
  },

  updateContactGroupsForTable(
    state: IContactData,
    payload: {
      data: IContactGroup[];
      totalRecords: number;
    }
  ): void {
    state.contactGroupsForTable.data = payload.data;
    state.contactGroupsForTable.totalRecords = payload.totalRecords;
  },

  deleteContactGroups(state: IContactData, idsToDelete: number[]): void {
    deleteFromStore(state, "contactGroups", idsToDelete);
  },
};

function updateStore<T extends IContact | IContactGroup>(
  state: IContactData,
  keyName: IContactTableDataKeys,
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

function resetStore(state: IContactData, keyName: IContactTableDataKeys): void {
  if (typeof state[keyName] != "object") return;
  state[keyName] = {};
}

function deleteFromStore(
  state: IContactData,
  keyName: IContactTableDataKeys,
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
