import { store } from "../../../../src/store";
import { ICustomField } from "./customFieldDataModule";
import {
  IRequestCustomFieldCreate,
  IRequestCustomFieldUpdate,
} from "cloudconLibrary/api/apiInterfaces";

export default {
  getCustomFields: (): ICustomField[] =>
    store.getters["customFieldData/getCustomFields"](),

  getCustomFieldsForTable: (): ICustomField[] => {
    return store.getters["customFieldData/getCustomFieldsForTable"]();
  },

  getTotalCustomFieldsForTable: (): number =>
    store.getters["customFieldData/getTotalCustomFieldsForTable"](),

  getCustomFieldsByEntity: (entity?: string): Promise<void> =>
    store.dispatch("customFieldData/getCustomFieldsByEntity", {
      entity,
    }),

  createCustomField: (
    tenantId: number,
    requestCustomFieldCreate: IRequestCustomFieldCreate
  ): Promise<void> => {
    return store.dispatch("customFieldData/createCustomField", {
      requestCustomFieldCreate,
      tenantId,
    });
  },

  deletCustomField: (tenantId: number, id: number): Promise<void> => {
    return store.dispatch("customFieldData/deleteCustomField", {
      id,
      tenantId,
    });
  },

  getCustomFieldById: (id: number): ICustomField => {
    return store.getters["customFieldData/getCustomFieldsById"](id);
  },

  updateCustomField: (
    tenantId: number,
    requestCustomFieldUpdate: IRequestCustomFieldUpdate
  ): Promise<void> => {
    return store.dispatch("customFieldData/updateCustomField", {
      requestCustomFieldUpdate,
      tenantId,
    });
  },

  updateMultipleCustomFields: (
    tenantId: number,
    requestCustomFieldUpdate: IRequestCustomFieldUpdate[]
  ): Promise<void> => {
    return store.dispatch("customFieldData/updateMultipleCustomFields", {
      requestCustomFieldUpdate,
      tenantId,
    });
  },
};
