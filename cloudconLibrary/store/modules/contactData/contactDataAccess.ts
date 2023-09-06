import { IContact, IContactGroup } from "./contactDataModule";
import { store } from "../../../../src/store";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
import {
  IRequestContactCreate,
  IRequestContactUpdate,
} from "cloudconLibrary/api/apiInterfaces";

export default {
  getContacts: (): IContact[] => {
    return store.getters["contactData/getContacts"]();
  },

  getContactsForTable: (): IContact[] => {
    return store.getters["contactData/getContactsForTable"]();
  },

  getTotalContactsForTable: (): number =>
    store.getters["contactData/getTotalContactsForTable"](),

  getContactById: (id: number): IContact | undefined => {
    return store.getters["contactData/getContactById"](id);
  },

  fetchContacts: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("contactData/fetchContacts", {
      filters,
      sort,
      pagination,
    });
  },

  fetchContactById: (id: number): Promise<void> => {
    return store.dispatch("contactData/fetchContactById", id);
  },

  createContact: (
    requestContactCreate: IRequestContactCreate
  ): Promise<void> => {
    return store.dispatch("contactData/createContact", requestContactCreate);
  },

  deleteContact: (id: number): Promise<void> => {
    return store.dispatch("contactData/deleteContact", id);
  },

  updateContact: (
    requestContactUpdate: IRequestContactUpdate
  ): Promise<void> => {
    return store.dispatch("contactData/updateContact", requestContactUpdate);
  },

  // Contact Groups

  getContactGroups: (): IContactGroup[] => {
    return store.getters["contactData/getContactGroups"]();
  },

  getContactGroupsForTable: (): IContactGroup[] => {
    return store.getters["contactData/getContactGroupsForTable"]();
  },

  getTotalContactGroupsForTable: (): number =>
    store.getters["contactData/getTotalContactGroupsForTable"](),

  getContactGroupById: (id: number): IContactGroup | undefined => {
    return store.getters["contactData/getContactGroupById"](id);
  },

  fetchContactGroups: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("contactData/fetchContactGroups", {
      filters,
      sort,
      pagination,
    });
  },

  fetchContactGroupById: (id: number): Promise<void> => {
    return store.dispatch("contactData/fetchContactGroupById", id);
  },

  createContactGroup: (name: string): Promise<void> => {
    return store.dispatch("contactData/createContactGroup", { name });
  },

  deleteContactGroup: (id: number): Promise<void> => {
    return store.dispatch("contactData/deleteContactGroup", id);
  },

  updateContactGroup: (
    id: number,
    name: string,
    addContactArray: number[],
    removeContactArray: number[]
  ): Promise<void> => {
    return store.dispatch("contactData/updateContactGroup", {
      id,
      name,
      addContactArray,
      removeContactArray,
    });
  },
};
