import { IRecord } from "../../../utilities/useGenericInterfaces";
import plantDataGetters from "./plantDataGetters";
import plantDataActions from "./plantDataActions";
import plantDataMutations from "./plantDataMutations";
import storeHelper, {
  IStoreDataForTable,
} from "../../../../cloudconLibrary/store/storeHelper/storeHelper";

export interface IPlant {
  id: number;
  name: string;
  creationDate: number;
  address?: string | null;
  custom?: Record<string, IRecord> | null;
  geo?: string | null;
  maintenanceUsage?: number | null;
  manufacturer?: string | null;
  model?: string | null;
  purchaseDate?: number | null;
  purchasePrice?: number | null;
  serialNumber?: string | null;
  usage?: number | null;
  warrantyDate?: number | null;
  plantGroups: {
    id: string;
    name: string;
  }[];
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
  parent?: {
    id: string;
    name: string;
  } | null;
  job?: {
    id: string;
    name: string;
  } | null;
  tag?: {
    id: string;
    name: string;
  } | null;
}

export interface IPlantGroup {
  id: number;
  name: string;
  plant: {
    id: string;
    name: string;
  }[];
}

export interface IPlantData {
  plant: Record<number, IPlant>;
  plantForTable: IStoreDataForTable<IPlant>;
  plantGroups: Record<number, IPlantGroup>;
  plantGroupsForTable: IStoreDataForTable<IPlantGroup>;
}

export type IPlantTableDataKeys = "plant" | "plantGroups";

const state: IPlantData = {
  plant: {},
  plantForTable: storeHelper.emptyStoreDataForTable<IPlant>(),
  plantGroups: {},
  plantGroupsForTable: storeHelper.emptyStoreDataForTable<IPlantGroup>(),
};

export type IPlantDataState = Record<string, Record<string, IRecord>>;

export default {
  namespaced: true,
  state,
  getters: plantDataGetters,
  actions: plantDataActions,
  mutations: plantDataMutations,
  // plugins,
};
