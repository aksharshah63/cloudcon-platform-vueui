import {
  IField,
  IFieldGroup,
  IFormTemplate,
  IFormTemplateField,
  IFormTemplateGroup,
} from "./formTemplateDataModule";
import { store } from "../../../../src/store";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
import {
  IRequestFormTemplateCreate,
  IRequestFormTemplateUpdate,
  IRequestFormTemplateFieldCreate,
  IRequestFormTemplateFieldUpdate,
  IRequestFormTemplateGroupCreate,
  IRequestFormTemplateGroupUpdate,
} from "cloudconLibrary/api/apiInterfaces";

export default {
  getFields: (): IField[] => {
    return store.getters["formTemplateData/getFields"]();
  },
  getFieldsForTable: (): IField[] => {
    return store.getters["formTemplateData/getFieldsForTable"]();
  },
  getTotalFieldsForTable: (): number => {
    return store.getters["formTemplateData/getTotalFieldsForTable"]();
  },
  fetchFields: (
    tenantId: number,
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("formTemplateData/fetchFields", {
      filters,
      sort,
      pagination,
      tenantId,
    });
  },

  getFieldGroups: (): IFieldGroup[] => {
    return store.getters["formTemplateData/getFieldGroups"]();
  },
  getFieldGroupsForTable: (): IFieldGroup[] => {
    return store.getters["formTemplateData/getFieldGroupsForTable"]();
  },
  getTotalFieldGroupsForTable: (): number => {
    return store.getters["formTemplateData/getTotalFieldGroupsForTable"]();
  },
  fetchFieldGroups: (
    tenantId: number,
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("formTemplateData/fetchFieldGroups", {
      filters,
      sort,
      pagination,
      tenantId,
    });
  },

  getFormTemplates: (): IFormTemplate[] => {
    return store.getters["formTemplateData/getFormTemplates"]();
  },
  getFormTemplatesForTable: (): IFormTemplate[] => {
    return store.getters["formTemplateData/getFormTemplatesForTable"]();
  },
  getTotalFormTemplatesForTable: (): number => {
    return store.getters["formTemplateData/getTotalFormTemplatesForTable"]();
  },
  getFormTemplateById: (id: number): IFormTemplate => {
    return store.getters["formTemplateData/getFormTemplateById"](id);
  },
  fetchFormTemplates: (
    tenantId: number,
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("formTemplateData/fetchFormTemplates", {
      filters,
      sort,
      pagination,
      tenantId,
    });
  },
  createFormTemplate: (
    tenantId: number,
    requestFormTemplateCreate: IRequestFormTemplateCreate
  ): Promise<void> => {
    return store.dispatch("formTemplateData/createFormTemplate", {
      requestFormTemplateCreate,
      tenantId,
    });
  },
  deleteFormTemplate: (tenantId: number, id: number): Promise<void> => {
    return store.dispatch("formTemplateData/deleteFormTemplate", {
      id,
      tenantId,
    });
  },
  updateFormTemplate: (
    tenantId: number,
    requestFormTemplateUpdate: IRequestFormTemplateUpdate
  ): Promise<void> => {
    return store.dispatch("formTemplateData/updateFormTemplate", {
      requestFormTemplateUpdate,
      tenantId,
    });
  },
  resetFormTemplate: (): void => {
    store.commit("formTemplateData/resetFormTemplates");
  },

  getFormTemplateFields: (): IFormTemplateField[] => {
    return store.getters["formTemplateData/getFormTemplateFields"]();
  },
  getFormTemplateFieldById: (id: number): IFormTemplateField => {
    return store.getters["formTemplateData/getFormTemplateFieldsById"](id);
  },
  getFormTemplateFieldsByFormTemplateId: (
    formTemplateId: number
  ): IFormTemplateField[] => {
    return store.getters[
      "formTemplateData/getFormTemplateFieldsByFormTemplateId"
    ](formTemplateId);
  },
  fetchFormTemplateFields: (tenantId: number): Promise<void> => {
    return store.dispatch("formTemplateData/fetchFormTemplateFields", {
      tenantId,
    });
  },
  createFormTemplateField: (
    tenantId: number,
    requestFormTemplateFieldCreate: IRequestFormTemplateFieldCreate
  ): Promise<void> => {
    return store.dispatch("formTemplateData/createFormTemplateField", {
      requestFormTemplateFieldCreate,
      tenantId,
    });
  },
  deleteFormTemplateField: (tenantId: number, id: number): Promise<void> => {
    return store.dispatch("formTemplateData/deleteFormTemplateField", {
      id,
      tenantId,
    });
  },
  updateFormTemplateField: (
    tenantId: number,
    requestFormTemplateFieldUpdate: IRequestFormTemplateFieldUpdate
  ): Promise<void> => {
    return store.dispatch("formTemplateData/updateFormTemplateField", {
      requestFormTemplateFieldUpdate,
      tenantId,
    });
  },

  updateMultipleFormTemplateFields: (
    tenantId: number,
    requestFormTemplateFieldUpdate: IRequestFormTemplateFieldUpdate[]
  ): Promise<void> => {
    return store.dispatch("formTemplateData/updateMultipleFormTemplateFields", {
      requestFormTemplateFieldUpdate,
      tenantId,
    });
  },

  getFormTemplateGroups: (): IFormTemplateGroup[] => {
    return store.getters["formTemplateData/getFormTemplateGroups"]();
  },
  getFormTemplateGroupById: (id: number): IFormTemplateGroup => {
    return store.getters["formTemplateData/getFormTemplateGroupById"](id);
  },
  fetchFormTemplateGroups: (
    tenantId: number,
    filters?: IFilters,
    sort?: ISort
  ): Promise<void> => {
    return store.dispatch("formTemplateData/fetchFormTemplateGroups", {
      filters,
      sort,
      tenantId,
    });
  },
  createFormTemplateGroup: (
    tenantId: number,
    requestFormTemplateGroupCreate: IRequestFormTemplateGroupCreate
  ): Promise<void> => {
    return store.dispatch("formTemplateData/createFormTemplateGroup", {
      requestFormTemplateGroupCreate,
      tenantId,
    });
  },
  deleteFormTemplateGroup: (tenantId: number, id: number): Promise<void> => {
    return store.dispatch("formTemplateData/deleteFormTemplateGroup", {
      id,
      tenantId,
    });
  },
  updateFormTemplateGroup: (
    tenantId: number,
    requestFormTemplateGroupUpdate: IRequestFormTemplateGroupUpdate
  ): Promise<void> => {
    return store.dispatch("formTemplateData/updateFormTemplateGroup", {
      requestFormTemplateGroupUpdate,
      tenantId,
    });
  },
  resetFormTemplateGroup: (): void => {
    store.commit("formTemplateData/resetFormTemplateGroups");
  },
};
