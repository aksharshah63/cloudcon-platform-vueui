import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
import { store } from "../../../../src/store";
import {
  IRequestCompanyCreate,
  IRequestCompanyUpdate,
} from "cloudconLibrary/api/apiInterfaces";
import { ICompany } from "./companyDataModule";

export default {
  getCompanies: (): ICompany[] => store.getters["companyData/getCompanies"](),

  getCompaniesForTable: (): ICompany[] =>
    store.getters["companyData/getCompaniesForTable"](),

  getTotalCompaniesForTable: (): number =>
    store.getters["companyData/getTotalCompaniesForTable"](),

  getCompanyById: (id: number): ICompany | undefined =>
    store.getters["companyData/getCompanyById"](id),

  fetchCompanies: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> =>
    store.dispatch("companyData/fetchCompanies", { filters, sort, pagination }),

  fetchCompanyById: (id: number): Promise<void> =>
    store.dispatch("companyData/fetchCompanyById", id),

  createCompany: (requestCompanyCreate: IRequestCompanyCreate): Promise<void> =>
    store.dispatch("companyData/createCompany", requestCompanyCreate),

  deleteCompany: (id: number): Promise<void> =>
    store.dispatch("companyData/deleteCompany", id),

  updateCompany: (requestCompanyUpdate: IRequestCompanyUpdate): Promise<void> =>
    store.dispatch("companyData/updateCompany", requestCompanyUpdate),
};
