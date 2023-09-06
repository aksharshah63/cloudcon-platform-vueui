import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
import { store } from "../../../../src/store";
import {
  IRequestJobBudgetLineCreate,
  IRequestJobBudgetLineUpdate,
  IRequestJobCreate,
  IRequestJobItemCreate,
  IRequestJobItemUpdate,
  IRequestJobSubItemCreate,
  IRequestJobSubItemUpdate,
  IRequestJobUpdate,
} from "cloudconLibrary/api/apiInterfaces";
import { IJob, IJobBudgetLine, IJobItem, IJobSubItem } from "./jobDataModule";

export default {
  getJobs: (): IJob[] => store.getters["jobData/getJobs"](),

  getJobsForTable: (): IJob[] => store.getters["jobData/getJobsForTable"](),

  getTotalJobsForTable: (): number =>
    store.getters["jobData/getTotalJobsForTable"](),

  getJobById: (id: number): IJob | undefined =>
    store.getters["jobData/getJobById"](id),

  fetchJobs: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> =>
    store.dispatch("jobData/fetchJobs", { filters, sort, pagination }),

  fetchJobById: (id: number): Promise<void> =>
    store.dispatch("jobData/fetchJobById", id),

  createJob: (requestJobCreate: IRequestJobCreate): Promise<void> =>
    store.dispatch("jobData/createJob", requestJobCreate),

  deleteJob: (id: number): Promise<void> =>
    store.dispatch("jobData/deleteJob", id),

  updateJob: (requestJobUpdate: IRequestJobUpdate): Promise<void> =>
    store.dispatch("jobData/updateJob", requestJobUpdate),

  getJobItems: (): IJob[] => store.getters["jobData/getJobItems"](),

  getJobItemById: (id: number): IJobItem | undefined =>
    store.getters["jobData/getJobItemById"](id),

  fetchJobItems: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> =>
    store.dispatch("jobData/fetchJobItems", { filters, sort, pagination }),

  fetchJobItemById: (id: number): Promise<void> =>
    store.dispatch("jobData/fetchJobItemById", id),

  createJobItem: (requestJobItemCreate: IRequestJobItemCreate): Promise<void> =>
    store.dispatch("jobData/createJobItem", requestJobItemCreate),

  deleteJobItem: (id: number): Promise<void> =>
    store.dispatch("jobData/deleteJobItem", id),

  updateJobItem: (requestJobItemUpdate: IRequestJobItemUpdate): Promise<void> =>
    store.dispatch("jobData/updateJobItem", requestJobItemUpdate),

  getJobSubItems: (): IJob[] => store.getters["jobData/getJobSubItems"](),

  getJobSubItemById: (id: number): IJobSubItem | undefined =>
    store.getters["jobData/getJobSubItemById"](id),

  fetchJobSubItems: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> =>
    store.dispatch("jobData/fetchJobSubItems", { filters, sort, pagination }),

  fetchJobSubItemById: (id: number): Promise<void> =>
    store.dispatch("jobData/fetchJobSubItemById", id),

  createJobSubItem: (
    requestJobSubItemCreate: IRequestJobSubItemCreate
  ): Promise<void> =>
    store.dispatch("jobData/createJobSubItem", requestJobSubItemCreate),

  deleteJobSubItem: (id: number): Promise<void> =>
    store.dispatch("jobData/deleteJobSubItem", id),

  updateJobSubItem: (
    requestJobSubItemUpdate: IRequestJobSubItemUpdate
  ): Promise<void> =>
    store.dispatch("jobData/updateJobSubItem", requestJobSubItemUpdate),

  getJobBudgetLines: (): IJobBudgetLine[] =>
    store.getters["jobData/getJobBudgetLines"](),

  getJobBudgetLineById: (id: number): IJobBudgetLine | undefined =>
    store.getters["jobData/getJobBudgetLineById"](id),

  fetchJobBudgetLines: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> =>
    store.dispatch("jobData/fetchJobBudgetLines", {
      filters,
      sort,
      pagination,
    }),

  fetchJobBudgetLineById: (id: number): Promise<void> =>
    store.dispatch("jobData/fetchJobBudgetLineById", id),

  createJobBudgetLine: (
    requestJobBudgetLineCreate: IRequestJobBudgetLineCreate
  ): Promise<void> =>
    store.dispatch("jobData/createJobBudgetLine", requestJobBudgetLineCreate),

  deleteJobBudgetLine: (id: number): Promise<void> =>
    store.dispatch("jobData/deleteJobBudgetLine", id),

  updateJobBudgetLine: (
    requestJobBudgetLineUpdate: IRequestJobBudgetLineUpdate
  ): Promise<void> =>
    store.dispatch("jobData/updateJobBudgetLine", requestJobBudgetLineUpdate),
};
