import { ActionContext } from "vuex";
import { State } from "../../../../src/store";
import { IJobDataState } from "./jobDataModule";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
import { UsersApi } from "../../../../cloudconLibrary/api/usersApi";
import {
  IRequestJobBudgetLineCreate,
  IRequestJobBudgetLineUpdate,
  IRequestJobCreate,
  IRequestJobItemCreate,
  IRequestJobItemUpdate,
  IRequestJobSubItemCreate,
  IRequestJobSubItemUpdate,
  IRequestJobUpdate,
  IUsersApi,
} from "cloudconLibrary/api/apiInterfaces";

type IJobDataContext = ActionContext<State, IJobDataState>;

const usersApi: IUsersApi = new UsersApi();

export default {
  fetchJobs: (
    { commit }: IJobDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getJobs(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) {
          commit("updateJobsForTable", {
            data: response.data,
            totalRecords: response.metadata?.totalRecords ?? 0,
          });
          commit("updateJobs", response.data);
        }
      });
  },

  fetchJobById: ({ commit }: IJobDataContext, id: number): Promise<void> => {
    return usersApi.getJobById(id).then((data) => {
      commit("updateJobs", [data]);
    });
  },

  createJob: (
    { commit }: IJobDataContext,
    requestJobCreate: IRequestJobCreate
  ): Promise<void> => {
    return usersApi.createJob(requestJobCreate).then((response) => {
      if (response?.data != null) commit("updateJobs", [response.data]);
    });
  },

  deleteJob: ({ commit }: IJobDataContext, id: number): Promise<void> => {
    return usersApi.deleteJob(id).then(() => {
      commit("deleteJobs", [id]);
    });
  },

  updateJob: (
    { commit }: IJobDataContext,
    requestJobUpdate: IRequestJobUpdate
  ): Promise<void> => {
    return usersApi.updateJob(requestJobUpdate).then((response) => {
      if (response?.data != null) commit("updateJobs", [response.data]);
    });
  },

  fetchJobItems: (
    { commit }: IJobDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getJobItems(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) {
          commit("updateJobItems", response.data);
        }
      });
  },

  fetchJobItemById: (
    { commit }: IJobDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.getJobItemById(id).then((data) => {
      commit("updateJobItems", [data]);
    });
  },

  createJobItem: (
    { commit }: IJobDataContext,
    requestJobItemCreate: IRequestJobItemCreate
  ): Promise<void> => {
    return usersApi.createJobItem(requestJobItemCreate).then((response) => {
      if (response?.data != null) commit("updateJobItems", [response.data]);
    });
  },

  deleteJobItem: ({ commit }: IJobDataContext, id: number): Promise<void> => {
    return usersApi.deleteJobItem(id).then(() => {
      commit("deleteJobItems", [id]);
    });
  },

  updateJobItem: (
    { commit }: IJobDataContext,
    requestJobItemUpdate: IRequestJobItemUpdate
  ): Promise<void> => {
    return usersApi.updateJob(requestJobItemUpdate).then((response) => {
      if (response?.data != null) commit("updateJobItems", [response.data]);
    });
  },

  fetchJobSubItems: (
    { commit }: IJobDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getJobSubItems(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) {
          commit("updateJobSubItems", response.data);
        }
      });
  },

  fetchJobSubItemById: (
    { commit }: IJobDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.getJobSubItemById(id).then((data) => {
      commit("updateJobSubItems", [data]);
    });
  },

  createJobSubItem: (
    { commit }: IJobDataContext,
    requestJobSubItemCreate: IRequestJobSubItemCreate
  ): Promise<void> => {
    return usersApi
      .createJobSubItem(requestJobSubItemCreate)
      .then((response) => {
        if (response?.data != null)
          commit("updateJobSubItems", [response.data]);
      });
  },

  deleteJobSubItem: (
    { commit }: IJobDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.deleteJobSubItem(id).then(() => {
      commit("deleteJobSubItems", [id]);
    });
  },

  updateJobSubItem: (
    { commit }: IJobDataContext,
    requestJobSubItemUpdate: IRequestJobSubItemUpdate
  ): Promise<void> => {
    return usersApi
      .updateJobSubItem(requestJobSubItemUpdate)
      .then((response) => {
        if (response?.data != null)
          commit("updateJobSubItems", [response.data]);
      });
  },

  fetchJobBudgetLines: (
    { commit }: IJobDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getJobBudgetLines(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) {
          commit("updateJobBudgetLines", response.data);
        }
      });
  },

  fetchJobBudgetLineById: (
    { commit }: IJobDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.getJobBudgetLineById(id).then((data) => {
      commit("updateJobBudgetLines", [data]);
    });
  },

  createJobBudgetLine: (
    { commit }: IJobDataContext,
    requestJobBudgetLineCreate: IRequestJobBudgetLineCreate
  ): Promise<void> => {
    return usersApi
      .createJobBudgetLine(requestJobBudgetLineCreate)
      .then((response) => {
        if (response?.data != null)
          commit("updateJobBudgetLines", [response.data]);
      });
  },

  deleteJobBudgetLine: (
    { commit }: IJobDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.deleteJobBudgetLine(id).then(() => {
      commit("deleteJobBudgetLines", [id]);
    });
  },

  updateJobBudgetLine: (
    { commit }: IJobDataContext,
    requestJobBudgetLineUpdate: IRequestJobBudgetLineUpdate
  ): Promise<void> => {
    return usersApi
      .updateJobBudgetLine(requestJobBudgetLineUpdate)
      .then((response) => {
        if (response?.data != null)
          commit("updateJobBudgetLines", [response.data]);
      });
  },
};
