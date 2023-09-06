import { State } from "../../../../src/store";
import { IContactDataState } from "./contactDataModule";
import { ActionContext } from "vuex";
import { UsersApi } from "../../../api/usersApi";
import {
  IRequestContactCreate,
  IRequestContactUpdate,
  IUsersApi,
} from "../../../api/apiInterfaces";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
// import { WebAuth } from "auth0-js";
// import useCookies from "../../../utilities/useCookies";
// import { cookieKeys } from "../../../utilities/useConstants";

type IContactDataContext = ActionContext<State, IContactDataState>;

const usersApi: IUsersApi = new UsersApi();

export default {
  fetchContacts: (
    { commit }: IContactDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getContacts(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) {
          commit("updateContactsForTable", {
            data: response.data,
            totalRecords: response.metadata?.totalRecords ?? 0,
          });
          commit("updateContacts", response.data);
        }
      });
  },

  fetchContactById: (
    { commit }: IContactDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.getContactById(id).then((data) => {
      commit("updateContacts", [data]);
    });
  },

  createContact: (
    { commit }: IContactDataContext,
    requestContactCreate: IRequestContactCreate
  ): Promise<void> => {
    return usersApi.createContact(requestContactCreate).then((response) => {
      if (response?.data != null) commit("updateContacts", [response.data]);
    });
  },

  deleteContact: (
    { commit }: IContactDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.deleteContact(id).then(() => {
      commit("deleteContacts", [id]);
    });
  },

  updateContact: (
    { commit }: IContactDataContext,
    requestContactUpdate: IRequestContactUpdate
  ): Promise<void> => {
    return usersApi.updateContact(requestContactUpdate).then((response) => {
      if (response?.data != null) commit("updateContacts", [response.data]);
    });
  },

  fetchContactGroups: (
    { commit }: IContactDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getContactGroups(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) {
          commit("updateContactGroupsForTable", {
            data: response.data,
            totalRecords: response.metadata?.totalRecords ?? 0,
          });
          commit("updateContactGroups", response.data);
        }
      });
  },

  fetchContactGroupById: (
    { commit }: IContactDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.getContactGroupById(id).then((data) => {
      commit("updateContactGroups", [data]);
    });
  },

  createContactGroup: (
    { commit }: IContactDataContext,
    payload: { name: string }
  ): Promise<void> => {
    return usersApi.createContactGroup(payload.name).then((response) => {
      if (response?.data != null)
        commit("updateContactGroups", [response.data]);
    });
  },

  updateContactGroup: (
    { commit }: IContactDataContext,
    payload: {
      id: number;
      name: string | null;
      addContactArray: number[];
      removeContactArray: number[];
    }
  ): Promise<void> => {
    return usersApi
      .updateContactGroup(
        payload.id,
        payload.name,
        payload.addContactArray,
        payload.removeContactArray
      )
      .then((response) => {
        if (response?.data != null) {
          commit("updateContactGroups", [response.data]);
        }
      });
  },
  deleteContactGroup: (
    { commit }: IContactDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.deleteContactGroup(id).then(() => {
      commit("deleteContactGroups", [id]);
    });
  },
};
