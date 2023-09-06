import { State } from "../../../../src/store";
import { IFormTemplateDataState } from "./formTemplateDataModule";
import { ActionContext } from "vuex";
import { UsersApi } from "../../../api/usersApi";
import {
  IUsersApi,
  IRequestFormTemplateCreate,
  IRequestFormTemplateUpdate,
  IRequestFormTemplateFieldCreate,
  IRequestFormTemplateFieldUpdate,
  IRequestFormTemplateGroupUpdate,
  IRequestFormTemplateGroupCreate,
} from "../../../api/apiInterfaces";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";

type IFormTemplateDataContext = ActionContext<State, IFormTemplateDataState>;

const usersApi: IUsersApi = new UsersApi();

export default {
  fetchFields: (
    { commit }: IFormTemplateDataContext,
    payload: {
      filters: IFilters;
      sort: ISort;
      pagination: IPagination;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .getFields(
        payload.tenantId,
        payload.filters,
        payload.sort,
        payload.pagination
      )
      .then((response) => {
        if (response.data) {
          commit("updateFieldsForTable", {
            data: response.data,
            totalRecords: response.metadata?.totalRecords ?? 0,
          });
          commit("updateFields", response.data);
        }
      });
  },

  fetchFieldGroups: (
    { commit }: IFormTemplateDataContext,
    payload: {
      filters: IFilters;
      sort: ISort;
      pagination: IPagination;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .getFieldGroups(
        payload.tenantId,
        payload.filters,
        payload.sort,
        payload.pagination
      )
      .then((response) => {
        if (response.data) {
          commit("updateFieldGroupsForTable", {
            data: response.data,
            totalRecords: response.metadata?.totalRecords ?? 0,
          });
          commit("updateFieldGroups", response.data);
        }
      });
  },

  fetchFormTemplates: (
    { commit }: IFormTemplateDataContext,
    payload: {
      filters: IFilters;
      sort: ISort;
      pagination: IPagination;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .getFormTemplates(
        payload.tenantId,
        payload.filters,
        payload.sort,
        payload.pagination
      )
      .then((response) => {
        if (response.data) {
          commit("updateFormTemplatesForTable", {
            data: response.data,
            totalRecords: response.metadata?.totalRecords ?? 0,
          });
          commit("updateFormTemplates", response.data);
        }
      });
  },

  createFormTemplate: (
    { commit }: IFormTemplateDataContext,
    payload: {
      requestFormTemplateCreate: IRequestFormTemplateCreate;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .createFormTemplate(payload.tenantId, payload.requestFormTemplateCreate)
      .then((response) => {
        if (response != null) commit("updateFormTemplates", [response.data]);
      });
  },

  deleteFormTemplate: (
    { commit }: IFormTemplateDataContext,
    payload: {
      id: number;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .deleteFormTemplate(payload.tenantId, payload.id)
      .then(() => {
        commit("deleteFormTemplates", [payload.id]);
      });
  },

  updateFormTemplate: (
    { commit }: IFormTemplateDataContext,
    payload: {
      requestFormTemplateUpdate: IRequestFormTemplateUpdate;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .updateFormTemplate(payload.tenantId, payload.requestFormTemplateUpdate)
      .then((response) => {
        if (response != null) commit("updateFormTemplates", [response.data]);
      });
  },

  fetchFormTemplateFields: (
    { commit }: IFormTemplateDataContext,
    payload: { tenantId: number }
  ): Promise<void> => {
    return usersApi.getFormTemplateFields(payload.tenantId).then((response) => {
      commit("updateFormTemplateFields", response.data);
    });
  },

  createFormTemplateField: (
    { commit }: IFormTemplateDataContext,
    payload: {
      requestFormTemplateFieldCreate: IRequestFormTemplateFieldCreate;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .createFormTemplateField(
        payload.tenantId,
        payload.requestFormTemplateFieldCreate
      )
      .then((response) => {
        if (response != null)
          commit("updateFormTemplateFields", [response.data]);
      });
  },

  deleteFormTemplateField: (
    { commit }: IFormTemplateDataContext,
    payload: {
      id: number;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .deleteFormTemplateField(payload.tenantId, payload.id)
      .then(() => {
        commit("deleteFormTemplateFields", [payload.id]);
      });
  },

  updateFormTemplateField: (
    { commit }: IFormTemplateDataContext,
    payload: {
      requestFormTemplateFieldUpdate: IRequestFormTemplateFieldUpdate;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .updateFormTemplateField(
        payload.tenantId,
        payload.requestFormTemplateFieldUpdate
      )
      .then((response) => {
        if (response != null)
          commit("updateFormTemplateFields", [response.data]);
      });
  },

  updateMultipleFormTemplateFields: (
    { commit }: IFormTemplateDataContext,
    payload: {
      requestFormTemplateFieldUpdate: IRequestFormTemplateFieldUpdate[];
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .updateMultipleFormTemplateFields(
        payload.tenantId,
        payload.requestFormTemplateFieldUpdate
      )
      .then((response) => {
        if (response != null) commit("updateFormTemplateFields", response.data);
      });
  },

  fetchFormTemplateGroups: (
    { commit }: IFormTemplateDataContext,
    payload: { filters: IFilters; sort: ISort; tenantId: number }
  ): Promise<void> => {
    return usersApi
      .getFormTemplateGroups(payload.tenantId, payload.filters, payload.sort)
      .then((response) => {
        commit("updateFormTemplateGroups", response.data);
      });
  },

  createFormTemplateGroup: (
    { commit }: IFormTemplateDataContext,
    payload: {
      requestFormTemplateGroupCreate: IRequestFormTemplateGroupCreate;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .createFormTemplateGroup(
        payload.tenantId,
        payload.requestFormTemplateGroupCreate
      )
      .then((response) => {
        if (response != null)
          commit("updateFormTemplateGroups", [response.data]);
      });
  },

  deleteFormTemplateGroup: (
    { commit }: IFormTemplateDataContext,
    payload: {
      id: number;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .deleteFormTemplateGroup(payload.tenantId, payload.id)
      .then(() => {
        commit("deleteFormTemplateGroups", [payload.id]);
      });
  },

  updateFormTemplateGroup: (
    { commit }: IFormTemplateDataContext,
    payload: {
      requestFormTemplateGroupUpdate: IRequestFormTemplateGroupUpdate;
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .updateFormTemplateGroup(
        payload.tenantId,
        payload.requestFormTemplateGroupUpdate
      )
      .then((response) => {
        if (response != null)
          commit("updateFormTemplateGroups", [response.data]);
      });
  },
};
