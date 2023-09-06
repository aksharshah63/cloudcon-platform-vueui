import { readonly, provide, inject } from "vue";
import { IRootState } from "./index.d";
import { upvise } from "./modules/upvise";
import { createStore } from "vuex";
import userDataModule, {
  IUserDataState,
} from "../../cloudconLibrary/store/modules/userData/userDataModule";
import tableDataModule, {
  ITableDataState,
} from "../../cloudconLibrary/store/modules/tableData/tableDataModule";

import contactDataModule, {
  IContactDataState,
} from "../../cloudconLibrary/store/modules/contactData/contactDataModule";

import fileDataModule, {
  IFileDataState,
} from "../../cloudconLibrary/store/modules/fileData/fileDataModule";

import formTemplateDataModule, {
  IFormTemplateDataState,
} from "../../cloudconLibrary/store/modules/formTemplateData/formTemplateDataModule";
import moduleManagementModule, {
  IModuleManagementDataState,
} from "../../cloudconLibrary/store/modules/moduleManagementData/moduleManagementModule";
import companyDataModule, {
  ICompanyDataState,
} from "../../cloudconLibrary/store/modules/companyData/companyDataModule";
import jobDataModule, {
  IJobDataState,
} from "../../cloudconLibrary/store/modules/jobData/jobDataModule";
import plantDataModule, {
  IPlantDataState,
} from "../../cloudconLibrary/store/modules/plantData/plantDataModule";
import workOrderDataModule, {
  IWorkOrderDataState,
} from "../../cloudconLibrary/store/modules/workOrderData/workOrderDataModule";
import customFieldDataModule, {
  ICustomFieldDataState,
} from "../../cloudconLibrary/store/modules/customFieldData/customFieldDataModule";

export type Primitive = string | boolean | number | Date;
export type NullablePrimitive = Primitive | null | undefined;

const initState: IRootState = {
  version: "1.0",
  upvise,
};

export const stateSymbol = Symbol("state");
export const createState = () => {
  const state = readonly(initState);
  return state;
};

export const useState = () =>
  inject(stateSymbol, createState()) as unknown as IRootState;
export const provideState = () => provide(stateSymbol, createState());
export interface State {
  companyData: ICompanyDataState;
  contactData: IContactDataState;
  fileData: IFileDataState;
  formTemplateData: IFormTemplateDataState;
  jobData: IJobDataState;
  moduleManagement: IModuleManagementDataState;
  plantData: IPlantDataState;
  tableData: ITableDataState;
  userData: IUserDataState;
  workOrderData: IWorkOrderDataState;
  customFieldData: ICustomFieldDataState;
}

export const store = createStore({
  modules: {
    companyData: companyDataModule,
    contactData: contactDataModule,
    fileData: fileDataModule,
    formTemplateData: formTemplateDataModule,
    jobData: jobDataModule,
    moduleManagement: moduleManagementModule,
    plantData: plantDataModule,
    tableData: tableDataModule,
    userData: userDataModule,
    workOrderData: workOrderDataModule,
    customFieldData: customFieldDataModule,
  },
});
