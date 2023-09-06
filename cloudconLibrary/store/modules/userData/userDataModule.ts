import { IRecord } from "../../../utilities/useGenericInterfaces";
import userDataActions from "./userDataActions";
import userDataMutations, { USER_DETAIL, LOGGED_IN } from "./userDataMutations";
import userDataGetters from "./userDataGetters";
import { UserAdminLevel } from "cloudconLibrary/utilities/useConstants";
//import plugins from "./auth0Plugins";

export type IEntity = Record<string, IRecord>;

export interface IUserDetails {
  user_id?: string | number;
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_at?: number;
  user?: IUser;
  tenantIds?: number[];
  currentTenantId?: number;
  currentClaims?: IClaim[];
  lastClaimsSyncDate?: number;
  atlasApiAccessToken?: string;
}

export interface IUserData {
  userDetails: IUserDetails;
  userIsAuthorized: boolean;
  tenants: Record<number, ITenant>;
  roles: Record<number, IRole>;
  actions: Record<number, IAction>;
  modules: Record<number, IModule>;
  submodules: Record<number, ISubmodule>;
  claims: Record<number, IClaim>;
  claimSets: Record<number, IClaimSet>;
  users: Record<number, IUser>;
  userGroups: Record<number, IUserGroup>;
}

export type IUserTableDataKeys = keyof Omit<
  IUserData,
  "userDetails" | "userIsAuthorized"
>;

export interface ITenant {
  id: number;
  name: string;
  clientCode: string;
}

export interface IRole {
  id: number;
  name: string;
  tenantId: number;
  tenantName: string;
  claimNames: string[];
  claimIds: number[];
  claimSetNames: string[];
  claimSetIds: number[];
}

export interface IAction {
  id: number;
  name: string;
}

export interface IModule {
  id: number;
  name: string;
  subModuleNames: string[];
}

export interface ISubmodule {
  id: number;
  name: string;
  parentId: number;
}

export interface IClaim {
  id: number;
  name: string;
  subModuleId: number;
  actionId: number;
}

export interface IClaimSet {
  id: number;
  name: string;
  claimNames: string[];
  claimIds: number[];
}

export interface IUser {
  id: number;
  name: string;
  emailAddress: string;
  adminLevel: UserAdminLevel;
  tenantIds: number[];
  tenantNames: string[];
  tenants: IUserTenantData[];
  userGroupIdsMap: Record<number, number[]>;
  roleIdsMap: Record<number, number[]>;
}
export interface IUserTenantData {
  id: number;
  name: string;
}

export interface IUserGroup {
  id: number;
  name: string;
  tenantId: number;
  tenantName: string;
  claimSetIds: number[];
  claimSetNames: string[];
  roleIds: number[];
  roleNames: string[];
}

const state: IUserData = {
  userDetails: JSON.parse(window.localStorage.getItem(USER_DETAIL) || "{}"),
  userIsAuthorized:
    window.localStorage.getItem(LOGGED_IN) == "true" ? true : false,
  tenants: {},
  roles: {},
  actions: {},
  modules: {},
  submodules: {},
  claims: {},
  claimSets: {},
  users: {},
  userGroups: {},
};

export type IUserDataState = Record<string, Record<string, IRecord>>;

export default {
  namespaced: true,
  state,
  getters: userDataGetters,
  actions: userDataActions,
  mutations: userDataMutations,
  // plugins,
};
