import storeHelper, {
  IStoreDataForTable,
} from "../../../../cloudconLibrary/store/storeHelper/storeHelper";
import { IRecord } from "../../../utilities/useGenericInterfaces";
import workOrderDataActions from "./workOrderDataActions";
import workOrderDataGetters from "./workOrderDataGetters";
import workOrderDataMutations from "./workOrderDataMutations";

export interface IWorkOrder {
  id: number;
  name: string;
  notes?: string | null;
  city?: string | null;
  country?: string | null;
  creationDate: number;
  custom?: string | null;
  dueDate?: number | null;
  duration?: number | null;
  endDate?: number | null;
  state?: string | null;
  street?: string | null;
  zipCode?: string | null;
  company?: {
    id: string;
    name: string;
  } | null;
  contact?: {
    id: string;
    name: string;
  } | null;
  owners: {
    id: string;
  }[];
  mandatoryForms: {
    id: string;
    name: string;
  }[];
  workOrder?: {
    id: string;
    name: string;
  } | null;
}

export interface IWorkOrderData {
  workOrders: Record<number, IWorkOrder>;
  workOrdersForTable: IStoreDataForTable<IWorkOrder>;
}

export type IWorkOrderTableDataKeys = "workOrders";

const state: IWorkOrderData = {
  workOrders: {},
  workOrdersForTable: storeHelper.emptyStoreDataForTable<IWorkOrder>(),
};

export type IWorkOrderDataState = Record<string, Record<string, IRecord>>;

export default {
  namespaced: true,
  state,
  getters: workOrderDataGetters,
  actions: workOrderDataActions,
  mutations: workOrderDataMutations,
};
