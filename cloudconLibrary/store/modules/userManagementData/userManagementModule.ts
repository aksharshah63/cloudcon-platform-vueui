import { IRecord } from "../../../utilities/useGenericInterfaces";
import userManagementGetters from "./userManagementGetters";
import userManagementActions from "./userManagementActions";
import userManagementMutations from "./userManagementMutations";

export interface IUserManagementData {
    selectedTenant: number | null
}

export type IUserManagementDataKeys =
  | "selectedTenant"

const state: IUserManagementData = {
    selectedTenant: null
};

export type IUserManagementDataState = Record<string, Record<string, IRecord>>;

export default {
  namespaced: true,
  state,
  getters: userManagementGetters,
  actions: userManagementActions,
  mutations: userManagementMutations,
  // plugins,
};