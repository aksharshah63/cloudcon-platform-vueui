import { IFile, IFileData, IFileTableDataKeys } from "./fileDataModule";
import utils from "../../../utilities/useUtils";

if (navigator.webdriver) {
  window.localStorage.clear();
}

export default {
  updateFiles(state: IFileData, data: IFile[]): void {
    updateStore(state, "files", data);
  },
  updateFilesForTable(
    state: IFileData,
    payload: {
      data: IFile[];
      totalRecords: number;
    }
  ): void {
    state.filesForTable.data = payload.data;
    state.filesForTable.totalRecords = payload.totalRecords;
  },
  deleteFile(state: IFileData, idsToDelete: string[]): void {
    deleteFromStore(state, "files", idsToDelete);
  },
  resetFile(state: IFileData): void {
    resetStore(state, "files");
  },
};

function deleteFromStore(
  state: IFileData,
  keyName: IFileTableDataKeys,
  idsToDelete: string[]
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

function updateStore<T extends IFile>(
  state: IFileData,
  keyName: IFileTableDataKeys,
  data: T[]
): void {
  const stateData = state[keyName];
  if (typeof state[keyName] != "object") return;

  data.forEach((record) => {
    const recordId = record.id;

    // if record has no id, ignore it
    if (!recordId) return;

    // if record already in store, update it
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

function resetStore(state: IFileData, keyName: IFileTableDataKeys): void {
  if (typeof state[keyName] != "object") return;
  state[keyName] = {};
}
