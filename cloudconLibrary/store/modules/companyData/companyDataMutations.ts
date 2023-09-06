import {
  ICompany,
  ICompanyData,
  ICompanyTableDataKeys,
} from "./companyDataModule";
import utils from "../../../utilities/useUtils";

export default {
  resetCompanies(state: ICompanyData): void {
    resetStore(state, "companies");
  },

  updateCompanies(state: ICompanyData, data: ICompany[]): void {
    updateStore(state, "companies", data);
  },

  updateCompaniesForTable(
    state: ICompanyData,
    payload: {
      data: ICompany[];
      totalRecords: number;
    }
  ): void {
    state.companiesForTable.data = payload.data;
    state.companiesForTable.totalRecords = payload.totalRecords;
  },

  deleteCompanies(state: ICompanyData, idsToDelete: number[]): void {
    deleteFromStore(state, "companies", idsToDelete);
  },
};

function updateStore<T extends ICompany>(
  state: ICompanyData,
  keyName: ICompanyTableDataKeys,
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

function resetStore(state: ICompanyData, keyName: ICompanyTableDataKeys): void {
  if (typeof state[keyName] != "object") return;
  state[keyName] = {};
}

function deleteFromStore(
  state: ICompanyData,
  keyName: ICompanyTableDataKeys,
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
