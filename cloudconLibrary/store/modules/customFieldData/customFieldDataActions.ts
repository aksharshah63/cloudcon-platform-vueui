import { ActionContext } from "vuex";
import { State } from "../../../../src/store";
import { ICustomFieldDataState } from "./customFieldDataModule";
import { UsersApi } from "../../../../cloudconLibrary/api/usersApi";
import { IUsersApi } from "cloudconLibrary/api/apiInterfaces";
import {
  IRequestCustomFieldCreate,
  IRequestCustomFieldUpdate,
} from "cloudconLibrary/api/apiInterfaces";

type ICustomFieldDataContext = ActionContext<State, ICustomFieldDataState>;

const usersApi: IUsersApi = new UsersApi();

export default {
  getCustomFieldsByEntity: (
    { commit }: ICustomFieldDataContext,
    payload: { entity: string }
  ): Promise<void> => {
    return usersApi.getCustomFieldByEntity(payload.entity).then((response) => {
      if (response.data) {
        commit("updateCustomFieldsForTable", {
          data: response.data,
          totalRecords: response.metadata?.totalRecords ?? 0,
        });
        commit("updateCustomFields", response.data);
      }
    });
  },

  createCustomField: (
    { commit }: ICustomFieldDataContext,
    payload: {
      requestCustomFieldCreate: IRequestCustomFieldCreate;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .createCustomField(payload.tenantId, payload.requestCustomFieldCreate)
      .then((response) => {
        if (response != null) commit("updateCustomFields", [response.data]);
      });
  },

  deleteCustomField: (
    { commit }: ICustomFieldDataContext,
    payload: {
      id: number;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi.deleteCustomField(payload.tenantId, payload.id).then(() => {
      commit("deleteCustomFields", [payload.id]);
    });
  },

  updateCustomField: (
    { commit }: ICustomFieldDataContext,
    payload: {
      requestCustomFieldUpdate: IRequestCustomFieldUpdate;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .updateCustomField(payload.tenantId, payload.requestCustomFieldUpdate)
      .then((response) => {
        if (response != null) commit("updateCustomFields", [response.data]);
      });
  },

  updateMultipleCustomFields: (
    { commit }: ICustomFieldDataContext,
    payload: {
      requestCustomFieldUpdate: IRequestCustomFieldUpdate[];
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .updateMultipleCustomFields(
        payload.tenantId,
        payload.requestCustomFieldUpdate
      )
      .then((response) => {
        if (response != null) commit("updateCustomFields", response.data);
      });
  },
};
