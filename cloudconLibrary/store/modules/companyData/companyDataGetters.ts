import { ICompany, ICompanyData } from "./companyDataModule";

export default {
  getCompanies: (state: ICompanyData) => (): ICompany[] => {
    return Object.values(state.companies);
  },

  getCompaniesForTable: (state: ICompanyData) => (): ICompany[] => {
    return state.companiesForTable.data;
  },

  getTotalCompaniesForTable: (state: ICompanyData) => (): number => {
    return state.companiesForTable.totalRecords;
  },

  getCompanyById:
    (state: ICompanyData) =>
    (id: number): ICompany | undefined => {
      return state.companies[id];
    },
};
