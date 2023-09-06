import { IContact, IContactData, IContactGroup } from "./contactDataModule";

export default {
  getContacts: (state: IContactData) => (): IContact[] => {
    return Object.values(state.contacts);
  },

  getContactsForTable: (state: IContactData) => (): IContact[] => {
    return state.contactsForTable.data;
  },

  getTotalContactsForTable: (state: IContactData) => (): number => {
    return state.contactsForTable.totalRecords;
  },

  getContactById:
    (state: IContactData) =>
    (id: number): IContact | undefined => {
      return state.contacts[id];
    },

  getContactGroups: (state: IContactData) => (): IContactGroup[] => {
    return Object.values(state.contactGroups);
  },

  getContactGroupsForTable: (state: IContactData) => (): IContactGroup[] => {
    return state.contactGroupsForTable.data;
  },

  getTotalContactGroupsForTable: (state: IContactData) => (): number => {
    return state.contactGroupsForTable.totalRecords;
  },

  getContactGroupById:
    (state: IContactData) =>
    (id: number): IContactGroup | undefined => {
      return state.contactGroups[id];
    },
};
