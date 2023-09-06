import {
  IField,
  IFormTemplateData,
  IFieldGroup,
  IFormTemplate,
  IFormTemplateField,
  IFormTemplateGroup,
} from "./formTemplateDataModule";

export default {
  getFields: (state: IFormTemplateData) => (): IField[] => {
    return Object.values(state.fields);
  },

  getFieldGroups: (state: IFormTemplateData) => (): IFieldGroup[] => {
    return Object.values(state.fieldGroups);
  },

  getFormTemplates: (state: IFormTemplateData) => (): IFormTemplate[] => {
    return Object.values(state.formTemplates);
  },

  getFieldsForTable: (state: IFormTemplateData) => (): IField[] => {
    return state.fieldsForTable.data;
  },

  getFieldGroupsForTable: (state: IFormTemplateData) => (): IFieldGroup[] => {
    return state.fieldGroupsForTable.data;
  },

  getFormTemplatesForTable:
    (state: IFormTemplateData) => (): IFormTemplate[] => {
      return state.formTemplatesForTable.data;
    },

  getTotalFieldsForTable: (state: IFormTemplateData) => (): number => {
    return state.fieldsForTable.totalRecords;
  },

  getTotalFieldGroupsForTable: (state: IFormTemplateData) => (): number => {
    return state.fieldGroupsForTable.totalRecords;
  },

  getTotalFormTemplatesForTable: (state: IFormTemplateData) => (): number => {
    return state.formTemplatesForTable.totalRecords;
  },

  getFormTemplateById:
    (state: IFormTemplateData) =>
    (id: number): IFormTemplate => {
      return state.formTemplates[id];
    },

  getFormTemplateFields:
    (state: IFormTemplateData) => (): IFormTemplateField[] => {
      return Object.values(state.formTemplateFields);
    },

  getFormTemplateFieldsById:
    (state: IFormTemplateData) =>
    (id: number): IFormTemplateField => {
      return state.formTemplateFields[id];
    },

  getFormTemplateFieldsByFormTemplateId:
    (state: IFormTemplateData) =>
    (formTempalteId: number): IFormTemplateField[] => {
      return Object.values(state.formTemplateFields).filter(
        (f) => f.formTemplateId === formTempalteId
      );
    },

  getFormTemplateGroups:
    (state: IFormTemplateData) => (): IFormTemplateGroup[] =>
      Object.values(state.formTemplateGroups),

  getFormTemplateGroupById:
    (state: IFormTemplateData) =>
    (id: number): IFormTemplateGroup => {
      return state.formTemplateGroups[id];
    },
};
