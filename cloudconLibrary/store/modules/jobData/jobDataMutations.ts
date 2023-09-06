import {
  IJob,
  IJobBudgetLine,
  IJobData,
  IJobItem,
  IJobSubItem,
  IJobTableDataKeys,
} from "./jobDataModule";
import utils from "../../../utilities/useUtils";

export default {
  resetJobs(state: IJobData): void {
    resetStore(state, "jobs");
  },

  updateJobs(state: IJobData, data: IJob[]): void {
    updateStore(state, "jobs", data);
  },

  updateJobsForTable(
    state: IJobData,
    payload: {
      data: IJob[];
      totalRecords: number;
    }
  ): void {
    state.jobsForTable.data = payload.data;
    state.jobsForTable.totalRecords = payload.totalRecords;
  },

  deleteJobs(state: IJobData, idsToDelete: number[]): void {
    deleteFromStore(state, "jobs", idsToDelete);
  },

  resetJobItems(state: IJobData): void {
    resetStore(state, "jobItems");
  },

  updateJobItems(state: IJobData, data: IJobItem[]): void {
    updateStore(state, "jobItems", data);
  },

  deleteJobItems(state: IJobData, idsToDelete: number[]): void {
    deleteFromStore(state, "jobItems", idsToDelete);
  },

  resetJobSubItems(state: IJobData): void {
    resetStore(state, "jobSubItems");
  },

  updateJobSubItems(state: IJobData, data: IJobSubItem[]): void {
    updateStore(state, "jobSubItems", data);
  },

  deleteJobSubItems(state: IJobData, idsToDelete: number[]): void {
    deleteFromStore(state, "jobSubItems", idsToDelete);
  },

  resetJobBudgetLines(state: IJobData): void {
    resetStore(state, "jobBudgetLines");
  },

  updateJobBudgetLines(state: IJobData, data: IJobBudgetLine[]): void {
    updateStore(state, "jobBudgetLines", data);
  },

  deleteJobBudgetLines(state: IJobData, idsToDelete: number[]): void {
    deleteFromStore(state, "jobBudgetLines", idsToDelete);
  },
};

function updateStore<T extends IJob | IJobItem | IJobSubItem | IJobBudgetLine>(
  state: IJobData,
  keyName: IJobTableDataKeys,
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

function resetStore(state: IJobData, keyName: IJobTableDataKeys): void {
  if (typeof state[keyName] != "object") return;
  state[keyName] = {};
}

function deleteFromStore(
  state: IJobData,
  keyName: IJobTableDataKeys,
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
