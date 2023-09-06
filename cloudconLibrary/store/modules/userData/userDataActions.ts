import { USER_DETAIL, LOGGED_IN } from "./userDataMutations";
import { State } from "../../../../src/store";
import { IUserDataState, IUserDetails } from "./userDataModule";
import { ActionContext } from "vuex";
import { UsersApi } from "../../../api/usersApi";
import {
  IAuthApi,
  IAuthLoginData,
  IAuthUserData,
  IUsersApi,
} from "../../../api/apiInterfaces";
import useCookies from "../../../utilities/useCookies";
import { cookieKeys, UserAdminLevel } from "../../../utilities/useConstants";
import { AuthApi } from "../../../api/authApi";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
type IUserDataContext = ActionContext<State, IUserDataState>;

const usersApi: IUsersApi = new UsersApi();
const authApi: IAuthApi = new AuthApi();

export default {
  fetchTenants: (
    { commit }: IUserDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getTenants(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) commit("updateTenants", response.data);
      });
  },

  fetchTenantIdsForUser: (
    { commit }: IUserDataContext,
    payload: { id: number }
  ): Promise<void> => {
    return usersApi.getTenantIdsForUser(payload.id).then((data) => {
      commit("setTenantIdsForUser", data);
    });
  },

  createTenant: (
    { commit }: IUserDataContext,
    payload: { name: string; clientCode: string }
  ): Promise<void> => {
    return usersApi
      .createTenant(payload.name, payload.clientCode)
      .then((response) => {
        if (response.data != null) commit("updateTenants", [response.data]);
      });
  },

  updateTenant: (
    { commit }: IUserDataContext,
    payload: { id: number; name: string | null; clientCode: string | null }
  ): Promise<void> => {
    return usersApi
      .updateTenant(payload.id, payload.name, payload.clientCode)
      .then((response) => {
        if (response.data != null) commit("updateTenants", [response.data]);
      });
  },

  deleteTenant: ({ commit }: IUserDataContext, id: number): Promise<void> => {
    return usersApi.deleteTenant(id).then(() => {
      commit("deleteTenants", [id]);
    });
  },

  fetchRoles: (
    { commit }: IUserDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getRoles(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) commit("updateRoles", response.data);
      });
  },

  createRole: (
    { commit }: IUserDataContext,
    payload: {
      name: string;
      tenantId: number;
      claimIds?: number[];
      claimSetIds?: number[];
    }
  ): Promise<void> => {
    return usersApi
      .createRole(
        payload.name,
        payload.tenantId,
        payload.claimIds,
        payload.claimSetIds
      )
      .then((response) => {
        if (response.data != null) commit("updateRoles", [response.data]);
      });
  },

  deleteRole: ({ commit }: IUserDataContext, id: number): Promise<void> => {
    return usersApi.deleteRole(id).then(() => {
      commit("deleteRoles", [id]);
    });
  },

  updateRole: (
    { commit }: IUserDataContext,
    payload: {
      id: number;
      name: string | null;
      claimIds: number[] | null;
      claimSetIds: number[] | null;
    }
  ): Promise<void> => {
    return usersApi
      .updateRole(
        payload.id,
        payload.name,
        payload.claimIds,
        payload.claimSetIds
      )
      .then((response) => {
        if (response.data != null) commit("updateRoles", [response.data]);
      });
  },

  fetchActions: (
    { commit }: IUserDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getActions(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) commit("updateActions", response.data);
      });
  },

  createAction: (
    { commit }: IUserDataContext,
    payload: { name: string }
  ): Promise<void> => {
    return usersApi.createAction(payload.name).then((response) => {
      if (response.data != null) commit("updateActions", [response.data]);
    });
  },

  updateAction: (
    { commit }: IUserDataContext,
    payload: { id: number; name: string | null }
  ): Promise<void> => {
    return usersApi.updateAction(payload.id, payload.name).then((response) => {
      if (response.data != null) commit("updateActions", [response.data]);
    });
  },

  deleteAction: ({ commit }: IUserDataContext, id: number): Promise<void> => {
    return usersApi.deleteAction(id).then(() => {
      commit("deleteActions", [id]);
    });
  },

  fetchModules: (
    { commit }: IUserDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getModules(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) commit("updateModules", response.data);
      });
  },

  createModule: (
    { commit }: IUserDataContext,
    payload: { name: string }
  ): Promise<void> => {
    return usersApi.createModule(payload.name).then((response) => {
      if (response.data != null) commit("updateModules", [response.data]);
    });
  },

  updateModule: (
    { commit }: IUserDataContext,
    payload: { id: number; name: string | null }
  ): Promise<void> => {
    return usersApi.updateModule(payload.id, payload.name).then((response) => {
      if (response.data != null) commit("updateModules", [response.data]);
    });
  },

  deleteModule: ({ commit }: IUserDataContext, id: number): Promise<void> => {
    return usersApi.deleteModule(id).then(() => {
      commit("deleteModules", [id]);
    });
  },

  fetchSubmodules: (
    { commit }: IUserDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getSubmodules(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) commit("updateSubmodules", response.data);
      });
  },

  createSubmodule: (
    { commit }: IUserDataContext,
    payload: { name: string; moduleId: number }
  ): Promise<void> => {
    return usersApi
      .createSubmodule(payload.name, payload.moduleId)
      .then((response) => {
        if (response.data != null) commit("updateSubmodules", [response.data]);
      });
  },

  updateSubmodule: (
    { commit }: IUserDataContext,
    payload: { id: number; name: string | null; moduleId: number | null }
  ): Promise<void> => {
    return usersApi
      .updateSubmodule(payload.id, payload.name, payload.moduleId)
      .then((response) => {
        if (response.data != null) commit("updateSubmodules", [response.data]);
      });
  },

  deleteSubmodule: (
    { commit }: IUserDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.deleteSubmodule(id).then(() => {
      commit("deleteSubmodules", [id]);
    });
  },

  fetchClaims: (
    { commit }: IUserDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getClaims(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) commit("updateClaims", response.data);
      });
  },

  createClaim: (
    { commit }: IUserDataContext,
    payload: { name: string; submoduleId: number; actionId: number }
  ): Promise<void> => {
    return usersApi
      .createClaim(payload.name, payload.submoduleId, payload.actionId)
      .then((response) => {
        if (response.data != null) commit("updateClaims", [response.data]);
      });
  },

  updateClaim: (
    { commit }: IUserDataContext,
    payload: {
      id: number;
      name: string | null;
      submoduleId: number | null;
      actionId: number | null;
    }
  ): Promise<void> => {
    return usersApi
      .updateClaim(
        payload.id,
        payload.name,
        payload.submoduleId,
        payload.actionId
      )
      .then((response) => {
        if (response.data != null) commit("updateClaims", [response.data]);
      });
  },

  deleteClaim: ({ commit }: IUserDataContext, id: number): Promise<void> => {
    return usersApi.deleteClaim(id).then(() => {
      commit("deleteClaims", [id]);
    });
  },

  fetchClaimSets: (
    { commit }: IUserDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getClaimSets(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) commit("updateClaimSets", response.data);
      });
  },

  createClaimSet: (
    { commit }: IUserDataContext,
    payload: { name: string }
  ): Promise<void> => {
    return usersApi.createClaimSet(payload.name).then((response) => {
      if (response.data != null) commit("updateClaimSets", [response.data]);
    });
  },

  updateClaimSet: (
    { commit }: IUserDataContext,
    payload: { id: number; name: string | null; claimIds: number[] | null }
  ): Promise<void> => {
    return usersApi
      .updateClaimSet(payload.id, payload.name, payload.claimIds)
      .then((response) => {
        if (response.data != null) commit("updateClaimSets", [response.data]);
      });
  },

  deleteClaimSet: ({ commit }: IUserDataContext, id: number): Promise<void> => {
    return usersApi.deleteClaimSet(id).then(() => {
      commit("deleteClaimSets", [id]);
    });
  },

  fetchUsers: (
    { commit }: IUserDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getUsers(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) commit("updateUsers", response.data);
      });
  },

  fetchClaimsForUser: (
    { commit }: IUserDataContext,
    payload: { id: number; tenantId: number }
  ): Promise<void> => {
    return usersApi
      .getClaimsForUser(payload.id, payload.tenantId)
      .then((data) => {
        commit("setCurrentTenantIdForUser", payload.tenantId);
        commit("setClaimsForUser", data);
        commit("setLastClaimsSyncDateForUser");
      });
  },

  createUser: (
    { commit }: IUserDataContext,
    payload: {
      name: string;
      password: string;
      emailAddress: string;
      adminLevel: UserAdminLevel | null;
      userGroupIds: number[];
      roleIds: number[];
      tenantId: number;
    }
  ): Promise<void> => {
    return usersApi
      .createUser(
        payload.name,
        payload.password,
        payload.emailAddress,
        payload.adminLevel,
        payload.userGroupIds,
        payload.roleIds,
        payload.tenantId
      )
      .then((response) => {
        if (response.data != null) commit("updateUsers", [response.data]);
      });
  },

  updateUser: (
    { commit }: IUserDataContext,
    payload: {
      id: number;
      name: string | null;
      adminLevel: UserAdminLevel | null;
      tenantIds: number[] | null;
      userGroupIdsMap: Record<number, number[]> | null;
      roleIdsMap: Record<number, number[]> | null;
    }
  ): Promise<void> => {
    return usersApi
      .updateUser(
        payload.id,
        payload.name,
        payload.adminLevel,
        payload.tenantIds,
        payload.userGroupIdsMap,
        payload.roleIdsMap
      )
      .then((response) => {
        if (response.data != null) commit("updateUsers", [response.data]);
      });
  },

  deleteUser: ({ commit }: IUserDataContext, id: number): Promise<void> => {
    return usersApi.deleteUser(id).then(() => {
      commit("deleteUsers", [id]);
    });
  },

  fetchUserGroups: (
    { commit }: IUserDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getUserGroups(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) commit("updateUserGroups", response.data);
      });
  },

  createUserGroup: (
    { commit }: IUserDataContext,
    payload: {
      name: string;
      tenantId: number;
      claimSetIds: number[] | null;
      roleIds: number[] | null;
    }
  ): Promise<void> => {
    return usersApi
      .createUserGroup(
        payload.name,
        payload.tenantId,
        payload.claimSetIds,
        payload.roleIds
      )
      .then((response) => {
        if (response.data != null) commit("updateUserGroups", [response.data]);
      });
  },

  updateUserGroup: (
    { commit }: IUserDataContext,
    payload: {
      id: number;
      name: string | null;
      claimSetIds: number[] | null;
      roleIds: number[] | null;
    }
  ): Promise<void> => {
    return usersApi
      .updateUserGroup(
        payload.id,
        payload.name,
        payload.claimSetIds,
        payload.roleIds
      )
      .then((response) => {
        if (response.data != null) commit("updateUserGroups", [response.data]);
      });
  },

  deleteUserGroup: (
    { commit }: IUserDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.deleteUserGroup(id).then(() => {
      commit("deleteUserGroups", [id]);
    });
  },

  fetchAccessToken: (
    { commit }: IUserDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.getAccessToken(id).then((accessToken) => {
      commit("setAccessTokenForUser", accessToken);
    });
  },

  customLogin(
    _: IUserDataContext,
    { username, password }: { username: string; password: string }
  ): Promise<IAuthLoginData> {
    // return getters.getAuthentication().login()
    return new Promise((resolve, reject) => {
      authApi
        .loginAuth(username, password)
        .then((response) => {
          const responseData = response as IAuthLoginData;
          return resolve(responseData);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  },

  forgetPassword(
    _: IUserDataContext,
    { username }: { username: string }
  ): Promise<string> {
    // return getters.getAuthentication().login()
    return new Promise((resolve, reject) => {
      authApi
        .forgetPassword(username)
        .then((response) => {
          const responseData = response as string;
          return resolve(responseData);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  },

  customLogout(context: IUserDataContext): void {
    context.dispatch("setUserAsLoggedOut");
  },

  refreshTokens(_: IUserDataContext): Promise<IAuthLoginData> {
    return new Promise((resolve, reject) => {
      authApi
        .refreshSession()
        .then((response) => {
          const responseData = response as IAuthLoginData;
          return resolve(responseData);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  },

  fetchAuthInfo(_: IUserDataContext): Promise<IAuthUserData> {
    // return getters.getAuthentication().login()
    return new Promise((resolve, reject) => {
      authApi
        .fetchUserInfo()
        .then((response) => {
          const responseData = response as IAuthUserData;
          return resolve(responseData);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  },

  setUserAsLoggedIn(
    context: IUserDataContext,
    userDetails: IUserDetails
  ): void {
    context.commit("setUserIsAuthenticated", true);
    context.commit("setUserDetails", userDetails);
    window.localStorage.setItem(USER_DETAIL, JSON.stringify(userDetails));
    window.localStorage.setItem(LOGGED_IN, JSON.stringify(true));
  },

  setUserAsLoggedOut(context: IUserDataContext): void {
    context.commit("setUserIsAuthenticated", false);
    context.commit("setUserDetails", {} as IUserDetails);
    window.localStorage.setItem(USER_DETAIL, JSON.stringify({}));
    window.localStorage.setItem(LOGGED_IN, JSON.stringify(false));
    useCookies.remove(cookieKeys.AUTH0_ACCESS_TOKEN);
    useCookies.remove(cookieKeys.AUTH0_REFRESH_TOKEN);
    useCookies.remove(cookieKeys.TENANT_ID);
    useCookies.remove(cookieKeys.EMAIL_ADDRESS);
  },
};
