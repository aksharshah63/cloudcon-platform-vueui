import storeHelper, {
  IStoreDataForTable,
} from "../../../../cloudconLibrary/store/storeHelper/storeHelper";
import { IRecord } from "../../../utilities/useGenericInterfaces";
import companyDataActions from "./companyDataActions";
import companyDataGetters from "./companyDataGetters";
import companyDataMutations from "./companyDataMutations";

export interface ICompany {
  id: number;
  city?: string | null;
  country?: string | null;
  creationDate: number;
  custom?: Record<string, IRecord> | null;
  email?: string | null;
  fax?: string | null;
  name: string;
  note?: string | null;
  phone?: string | null;
  state?: string | null;
  street?: string | null;
  abn?: string | null;
  webPage?: string | null;
  zipCode?: string | null;
  childCompanies?: {
    id: string;
    name: string;
  }[];
  owners?: {
    id: string;
  }[];
}

export interface ICompanyData {
  companies: Record<number, ICompany>;
  companiesForTable: IStoreDataForTable<ICompany>;
}

export type ICompanyTableDataKeys = "companies";

const state: ICompanyData = {
  companies: {},
  companiesForTable: storeHelper.emptyStoreDataForTable<ICompany>(),
};

export type ICompanyDataState = Record<string, Record<string, IRecord>>;

export default {
  namespaced: true,
  state,
  getters: companyDataGetters,
  actions: companyDataActions,
  mutations: companyDataMutations,
};
