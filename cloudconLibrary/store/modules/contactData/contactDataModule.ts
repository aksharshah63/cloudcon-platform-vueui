import { IRecord } from "../../../utilities/useGenericInterfaces";
import contactDataGetters from "./contactDataGetters";
import contactDataActions from "./contactDataActions";
import contactDataMutations from "./contactDataMutations";
import storeHelper, {
  IStoreDataForTable,
} from "../../../../cloudconLibrary/store/storeHelper/storeHelper";

export interface IContact {
  id: number;
  jobTitle?: string | null;
  email?: string | null;
  email2?: string | null;
  mobile?: string | null;
  phone?: string | null;
  phone2?: string | null;
  name: string;
  city?: string | null;
  code?: string | null;
  country?: string | null;
  creationDate: number;
  custom?: Record<string, IRecord> | null;
  fax?: string | null;
  notes?: string | null;
  rate?: number | null;
  salutation?: string | null;
  skypeName?: string | null;
  state?: string | null;
  street?: string | null;
  webpage?: string | null;
  weekendRate?: number | null;
  zipCode?: string | null;
  contactGroups: {
    id: string;
    name: string;
  }[];
  company?: {
    id: string;
    name: string;
  } | null;
  owners: {
    id: string;
  }[];
  photoId?: string;
  relatedCompanies: {
    id: string;
    name: string;
  }[];
}

export interface IContactGroup {
  id: number;
  name: string;
  contacts: {
    id: string;
    name: string;
  }[];
}

export interface IContactData {
  contacts: Record<number, IContact>;
  contactsForTable: IStoreDataForTable<IContact>;
  contactGroups: Record<number, IContactGroup>;
  contactGroupsForTable: IStoreDataForTable<IContactGroup>;
}

export type IContactTableDataKeys = "contacts" | "contactGroups";

const state: IContactData = {
  contacts: {},
  contactsForTable: storeHelper.emptyStoreDataForTable<IContact>(),
  contactGroups: {},
  contactGroupsForTable: storeHelper.emptyStoreDataForTable<IContactGroup>(),
};

export type IContactDataState = Record<string, Record<string, IRecord>>;

export default {
  namespaced: true,
  state,
  getters: contactDataGetters,
  actions: contactDataActions,
  mutations: contactDataMutations,
  // plugins,
};
