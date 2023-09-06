import { ICustomField, ICustomFieldData } from "./customFieldDataModule";

export default {
  getCustomFields: (state: ICustomFieldData) => (): ICustomField[] => {
    return Object.values(state.customFields);
  },

  getCustomFieldsForTable: (state: ICustomFieldData) => (): ICustomField[] => {
    return state.customFieldsForTable.data;
  },

  getTotalCustomFieldsForTable: (state: ICustomFieldData) => (): number => {
    return state.customFieldsForTable.totalRecords;
  },

  getCustomFieldsById:
    (state: ICustomFieldData) =>
    (id: number): ICustomField => {
      return state.customFields[id];
    },
};
