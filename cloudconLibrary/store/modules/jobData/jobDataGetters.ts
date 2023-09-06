import {
  IJob,
  IJobBudgetLine,
  IJobData,
  IJobItem,
  IJobSubItem,
} from "./jobDataModule";

export default {
  getJobs: (state: IJobData) => (): IJob[] => {
    return Object.values(state.jobs);
  },

  getJobsForTable: (state: IJobData) => (): IJob[] => {
    return state.jobsForTable.data;
  },

  getTotalJobsForTable: (state: IJobData) => (): number => {
    return state.jobsForTable.totalRecords;
  },

  getJobById:
    (state: IJobData) =>
    (id: number): IJob | undefined => {
      return state.jobs[id];
    },

  getJobItems: (state: IJobData) => (): IJobItem[] => {
    return Object.values(state.jobItems);
  },

  getJobItemById:
    (state: IJobData) =>
    (id: number): IJobItem | undefined => {
      return state.jobItems[id];
    },

  getJobSubItems: (state: IJobData) => (): IJobSubItem[] => {
    return Object.values(state.jobSubItems);
  },

  getJobSubItemById:
    (state: IJobData) =>
    (id: number): IJobSubItem | undefined => {
      return state.jobSubItems[id];
    },

  getJobBudgetLines: (state: IJobData) => (): IJobBudgetLine[] => {
    return Object.values(state.jobBudgetLines);
  },

  getJobBudgetLineById:
    (state: IJobData) =>
    (id: number): IJobBudgetLine | undefined => {
      return state.jobBudgetLines[id];
    },
};
