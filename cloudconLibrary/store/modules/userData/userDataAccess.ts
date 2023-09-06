import {
  ActionId,
  SubmoduleId,
  UserAdminLevel,
} from "../../../utilities/useConstants";
import { store } from "../../../../src/store";
import {
  IAction,
  IClaim,
  IClaimSet,
  IModule,
  IRole,
  ISubmodule,
  ITenant,
  IUser,
  IUserDetails,
  IUserGroup,
} from "./userDataModule";
import {
  IAuthLoginData,
  IAuthUserData,
} from "cloudconLibrary/api/apiInterfaces";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";

export default {
  isAuthorized: (): boolean => {
    return store.getters["userData/isAuthorized"]();
  },

  hasValidClaim: (
    submoduleIds: SubmoduleId | SubmoduleId[],
    actionIds?: ActionId | ActionId[]
  ): boolean => {
    return store.getters["userData/hasValidClaim"](submoduleIds, actionIds);
  },

  getUserDetails: (): IUserDetails => {
    return store.getters["userData/getUserDetails"]();
  },

  getUserAdminLevel: (): UserAdminLevel | undefined => {
    return store.getters["userData/getUserAdminLevel"]();
  },

  getUserClaims: (): IClaim[] => {
    return store.getters["userData/getUserClaims"]();
  },

  getUserLastClaimsSyncDate: (): number => {
    return store.getters["userData/getUserLastClaimsSyncDate"]();
  },

  // getUserPages: (): string[] => {
  //   return store.getters["userData/getUserPages"]();
  // },

  getTenants: (): ITenant[] => {
    return store.getters["userData/getTenants"]();
  },

  getRoles: (): IRole[] => {
    return store.getters["userData/getRoles"]();
  },

  getActions: (): IAction[] => {
    return store.getters["userData/getActions"]();
  },

  getModules: (): IModule[] => {
    return store.getters["userData/getModules"]();
  },

  getSubmodules: (): ISubmodule[] => {
    return store.getters["userData/getSubmodules"]();
  },

  getClaims: (): IClaim[] => {
    return store.getters["userData/getClaims"]();
  },

  getClaimSets: (): IClaimSet[] => {
    return store.getters["userData/getClaimSets"]();
  },

  getUsers: (): IUser[] => {
    return store.getters["userData/getUsers"]();
  },

  getUserGroups: (): IUserGroup[] => {
    return store.getters["userData/getUserGroups"]();
  },

  setUserIsAuthenticated: (replacement: any): void => {
    return store.commit("userData/setUserIsAuthenticated", replacement);
  },

  setUserDetails: (replacement: IUserDetails): void => {
    return store.commit("userData/setUserDetails", replacement);
  },

  getUserData: (): Promise<IAuthUserData> => {
    return store.dispatch("userData/fetchAuthInfo");
  },

  customLogin: (
    username: string,
    password: string
  ): Promise<IAuthLoginData> => {
    return store.dispatch("userData/customLogin", { username, password });
  },

  forgetPassword: (username: string): Promise<string> => {
    return store.dispatch("userData/forgetPassword", { username });
  },

  customLogout: (): Promise<void> => {
    return store.dispatch("userData/customLogout");
  },

  refreshTokens: (): Promise<IAuthLoginData> => {
    return store.dispatch("userData/refreshTokens");
  },

  setUserAsLoggedIn: (userDetails: IUserDetails): Promise<void> => {
    return store.dispatch("userData/setUserAsLoggedIn", userDetails);
  },

  setUserAsLoggedOut: (): Promise<void> => {
    return store.dispatch("userData/setUserAsLoggedOut");
  },

  fetchTenants: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("userData/fetchTenants", {
      filters,
      sort,
      pagination,
    });
  },

  fetchTenantIdsForUser: (id: number): Promise<void> => {
    return store.dispatch("userData/fetchTenantIdsForUser", { id });
  },

  createTenant: (name: string, clientCode: string): Promise<void> => {
    return store.dispatch("userData/createTenant", { name, clientCode });
  },

  updateTenant: (
    id: number,
    name: string | null,
    clientCode: string | null
  ): Promise<void> => {
    return store.dispatch("userData/updateTenant", { id, name, clientCode });
  },

  deleteTenant: (id: number): Promise<void> => {
    return store.dispatch("userData/deleteTenant", id);
  },

  fetchRoles: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("userData/fetchRoles", { filters, sort, pagination });
  },

  createRole: (
    name: string,
    tenantId: number,
    claimIds?: number[],
    claimSetIds?: number[]
  ): Promise<void> => {
    return store.dispatch("userData/createRole", {
      name,
      tenantId,
      claimIds,
      claimSetIds,
    });
  },

  deleteRole: (id: number): Promise<void> => {
    return store.dispatch("userData/deleteRole", id);
  },

  updateRole: (
    id: number,
    name: string | null,
    claimIds: number[] | null,
    claimSetIds: number[] | null
  ): Promise<void> => {
    return store.dispatch("userData/updateRole", {
      id,
      name,
      claimIds,
      claimSetIds,
    });
  },

  resetRole: (): void => {
    return store.commit("userData/resetRoles");
  },

  fetchActions: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("userData/fetchActions", {
      filters,
      sort,
      pagination,
    });
  },

  createAction: (name: string): Promise<void> => {
    return store.dispatch("userData/createAction", { name });
  },

  updateAction: (id: number, name: string | null): Promise<void> => {
    return store.dispatch("userData/updateAction", { id, name });
  },

  deleteAction: (id: number): Promise<void> => {
    return store.dispatch("userData/deleteAction", id);
  },

  fetchModules: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("userData/fetchModules", {
      filters,
      sort,
      pagination,
    });
  },

  createModule: (name: string): Promise<void> => {
    return store.dispatch("userData/createModule", { name });
  },

  updateModule: (id: number, name: string | null): Promise<void> => {
    return store.dispatch("userData/updateModule", { id, name });
  },

  deleteModule: (id: number): Promise<void> => {
    return store.dispatch("userData/deleteModule", id);
  },

  fetchSubmodules: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("userData/fetchSubmodules", {
      filters,
      sort,
      pagination,
    });
  },

  createSubmodule: (name: string, moduleId: number): Promise<void> => {
    return store.dispatch("userData/createSubmodule", { name, moduleId });
  },

  updateSubmodule: (
    id: number,
    name: string | null,
    moduleId: number | null
  ): Promise<void> => {
    return store.dispatch("userData/updateSubmodule", { id, name, moduleId });
  },

  deleteSubmodule: (id: number): Promise<void> => {
    return store.dispatch("userData/deleteSubmodule", id);
  },

  fetchClaims: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("userData/fetchClaims", {
      filters,
      sort,
      pagination,
    });
  },

  createClaim: (
    name: string,
    submoduleId: number,
    actionId: number
  ): Promise<void> => {
    return store.dispatch("userData/createClaim", {
      name,
      submoduleId,
      actionId,
    });
  },

  updateClaim: (
    id: number,
    name: string | null,
    submoduleId: number | null,
    actionId: number | null
  ): Promise<void> => {
    return store.dispatch("userData/updateClaim", {
      id,
      name,
      submoduleId,
      actionId,
    });
  },

  deleteClaim: (id: number): Promise<void> => {
    return store.dispatch("userData/deleteClaim", id);
  },

  fetchClaimSets: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("userData/fetchClaimSets", {
      filters,
      sort,
      pagination,
    });
  },

  createClaimSet: (name: string): Promise<void> => {
    return store.dispatch("userData/createClaimSet", { name });
  },

  updateClaimSet: (
    id: number,
    name: string,
    claimIds: number[]
  ): Promise<void> => {
    return store.dispatch("userData/updateClaimSet", { id, name, claimIds });
  },

  deleteClaimSet: (id: number): Promise<void> => {
    return store.dispatch("userData/deleteClaimSet", id);
  },

  fetchUsers: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("userData/fetchUsers", { filters, sort, pagination });
  },

  fetchClaimsForUser: (id: number, tenantId: number): Promise<void> => {
    return store.dispatch("userData/fetchClaimsForUser", { id, tenantId });
  },

  createUser: (
    name: string,
    password: string,
    emailAddress: string,
    adminLevel: UserAdminLevel | null,
    userGroupIds: number[],
    roleIds: number[],
    tenantId: number
  ): Promise<void> => {
    return store.dispatch("userData/createUser", {
      name,
      password,
      emailAddress,
      adminLevel,
      userGroupIds,
      roleIds,
      tenantId,
    });
  },

  updateUser: (
    id: number,
    name: string | null,
    adminLevel: UserAdminLevel | null,
    tenantIds: number[] | null,
    userGroupIdsMap: Record<number, number[]> | null,
    roleIdsMap: Record<number, number[]> | null
  ): Promise<void> => {
    return store.dispatch("userData/updateUser", {
      id,
      name,
      adminLevel,
      tenantIds,
      userGroupIdsMap,
      roleIdsMap,
    });
  },

  deleteUser: (id: number): Promise<void> => {
    return store.dispatch("userData/deleteUser", id);
  },

  resetUser: (): void => {
    return store.commit("userData/resetUsers");
  },

  fetchUserGroups: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("userData/fetchUserGroups", {
      filters,
      sort,
      pagination,
    });
  },

  createUserGroup: (
    name: string,
    tenantId: number,
    claimSetIds: number[] | null,
    roleIds: number[] | null
  ): Promise<void> => {
    return store.dispatch("userData/createUserGroup", {
      name,
      tenantId,
      claimSetIds,
      roleIds,
    });
  },

  updateUserGroup: (
    id: number,
    name: string | null,
    claimSetIds: number[] | null,
    roleIds: number[] | null
  ): Promise<void> => {
    return store.dispatch("userData/updateUserGroup", {
      id,
      name,
      claimSetIds,
      roleIds,
    });
  },

  deleteUserGroup: (id: number): Promise<void> => {
    return store.dispatch("userData/deleteUserGroup", id);
  },

  resetUserGroup: (): void => {
    return store.commit("userData/resetUserGroups");
  },

  fetchAccessToken: (id: number): Promise<void> => {
    return store.dispatch("userData/fetchAccessToken", id);
  },
};
