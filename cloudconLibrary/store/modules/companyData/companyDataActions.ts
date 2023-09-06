import { ActionContext } from "vuex";
import { State } from "../../../../src/store";
import { ICompanyDataState } from "./companyDataModule";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
import { UsersApi } from "../../../../cloudconLibrary/api/usersApi";
import {
  IRequestCompanyCreate,
  IRequestCompanyUpdate,
  IUsersApi,
} from "cloudconLibrary/api/apiInterfaces";

type ICompanyDataContext = ActionContext<State, ICompanyDataState>;

const usersApi: IUsersApi = new UsersApi();

export default {
  fetchCompanies: (
    { commit }: ICompanyDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getCompanies(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) {
          commit("updateCompaniesForTable", {
            data: response.data,
            totalRecords: response.metadata?.totalRecords ?? 0,
          });
          commit("updateCompanies", response.data);
        }
      });
  },

  fetchCompanyById: (
    { commit }: ICompanyDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.getCompanyById(id).then((data) => {
      commit("updateCompanies", [data]);
    });
  },

  createCompany: (
    { commit }: ICompanyDataContext,
    requestCompanyCreate: IRequestCompanyCreate
  ): Promise<void> => {
    return usersApi.createCompany(requestCompanyCreate).then((response) => {
      if (response?.data != null) commit("updateCompanies", [response.data]);
    });
  },

  deleteCompany: (
    { commit }: ICompanyDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.deleteCompany(id).then(() => {
      commit("deleteCompanies", [id]);
    });
  },

  updateCompany: (
    { commit }: ICompanyDataContext,
    requestCompanyUpdate: IRequestCompanyUpdate
  ): Promise<void> => {
    return usersApi.updateCompany(requestCompanyUpdate).then((response) => {
      if (response?.data != null) commit("updateCompanies", [response.data]);
    });
  },
};
