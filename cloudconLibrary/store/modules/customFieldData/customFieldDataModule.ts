import storeHelper, {
  IStoreDataForTable,
} from "../../../../cloudconLibrary/store/storeHelper/storeHelper";
import { IRecord } from "../../../utilities/useGenericInterfaces";
import customFieldDataActions from "./customFieldDataActions";
import customFieldDataGetters from "./customFieldDataGetters";
import customFieldDataMutations from "./customFieldDataMutations";

export interface ICustomField {
  id: number;
  entity: string;
  name: string;
  label: string;
  position: number;
  options: string;
  type: string;
  hidden: boolean;
  mandatory: boolean;
  onchange: string;
  status: number;
  value: string;
}

export interface ICustomFieldData {
  customFields: Record<number, ICustomField>;
  customFieldsForTable: IStoreDataForTable<ICustomField>;
}

export type ICustomFieldTableDataKeys = "customFields";

const state: ICustomFieldData = {
  customFields: {},
  customFieldsForTable: storeHelper.emptyStoreDataForTable<ICustomField>(),
};

export type ICustomFieldDataState = Record<string, Record<string, IRecord>>;

export default {
  namespaced: true,
  state,
  getters: customFieldDataGetters,
  actions: customFieldDataActions,
  mutations: customFieldDataMutations,
};
