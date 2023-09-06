import { IRecord } from "../../../utilities/useGenericInterfaces";
import moduleManagementGetters from "./moduleManagementGetters";
import moduleManagementActions from "./moduleManagementActions";
import moduleManagementMutations from "./moduleManagementMutations";

export interface IModuleManagementData {
    selectedTenant: number | null
}

export type IModuleManagementDataKeys =
  | "selectedTenant"

const state: IModuleManagementData = {
    selectedTenant: null
};

export type IModuleManagementDataState = Record<string, Record<string, IRecord>>;

export default {
namespaced: true,
state,
getters: moduleManagementGetters,
actions: moduleManagementActions,
mutations: moduleManagementMutations,
// plugins,
};