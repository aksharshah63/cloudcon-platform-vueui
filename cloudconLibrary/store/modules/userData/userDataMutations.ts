export const USER_DETAIL = "user-details";
export const LOGGED_IN = "user-authenticated";
import {
  IUserData,
  ITenant,
  IUserTableDataKeys,
  IRole,
  IAction,
  IModule,
  ISubmodule,
  IClaim,
  IClaimSet,
  IUserGroup,
  IUser,
  IUserDetails,
} from "./userDataModule";
import utils from "../../../utilities/useUtils";

if (navigator.webdriver) {
  window.localStorage.clear();
}

export default {
  setUserIsAuthenticated(state: IUserData, replacement: boolean): void {
    state.userIsAuthorized = replacement;
  },

  setUserDetails(state: IUserData, replacement: IUserDetails): void {
    state.userDetails = replacement;
  },

  setClaimsForUser(state: IUserData, claims: IClaim[]): void {
    state.userDetails.currentClaims = claims;
  },

  setLastClaimsSyncDateForUser(state: IUserData): void {
    state.userDetails.lastClaimsSyncDate = Date.now();
  },

  setTenantIdsForUser(state: IUserData, tenantIds: number[]): void {
    state.userDetails.tenantIds = tenantIds;
  },

  setCurrentTenantIdForUser(state: IUserData, currentTenantId: number): void {
    state.userDetails.currentTenantId = currentTenantId;
  },

  setAccessTokenForUser(state: IUserData, accessToken: string): void {
    state.userDetails.atlasApiAccessToken = accessToken;
  },

  updateTenants(state: IUserData, data: ITenant[]): void {
    updateStore(state, "tenants", data);
  },

  deleteTenants(state: IUserData, idsToDelete: number[]): void {
    deleteFromStore(state, "tenants", idsToDelete);
  },

  resetRoles(state: IUserData): void {
    resetStore(state, "roles");
  },

  updateRoles(state: IUserData, data: IRole[]): void {
    updateStore(state, "roles", data);
  },

  deleteRoles(state: IUserData, idsToDelete: number[]): void {
    deleteFromStore(state, "roles", idsToDelete);
  },

  updateActions(state: IUserData, data: IAction[]): void {
    updateStore(state, "actions", data);
  },

  deleteActions(state: IUserData, idsToDelete: number[]): void {
    deleteFromStore(state, "actions", idsToDelete);
  },

  updateModules(state: IUserData, data: IModule[]): void {
    updateStore(state, "modules", data);
  },

  deleteModules(state: IUserData, idsToDelete: number[]): void {
    deleteFromStore(state, "modules", idsToDelete);
  },

  updateSubmodules(state: IUserData, data: ISubmodule[]): void {
    updateStore(state, "submodules", data);
  },

  deleteSubmodules(state: IUserData, idsToDelete: number[]): void {
    deleteFromStore(state, "submodules", idsToDelete);
  },

  updateClaims(state: IUserData, data: IClaim[]): void {
    updateStore(state, "claims", data);
  },

  deleteClaims(state: IUserData, idsToDelete: number[]): void {
    deleteFromStore(state, "claims", idsToDelete);
  },

  updateClaimSets(state: IUserData, data: IClaimSet[]): void {
    updateStore(state, "claimSets", data);
  },

  deleteClaimSets(state: IUserData, idsToDelete: number[]): void {
    deleteFromStore(state, "claimSets", idsToDelete);
  },

  resetUsers(state: IUserData): void {
    resetStore(state, "users");
  },

  updateUsers(state: IUserData, data: IUser[]): void {
    updateStore(state, "users", data);
  },

  deleteUsers(state: IUserData, idsToDelete: number[]): void {
    deleteFromStore(state, "users", idsToDelete);
  },

  resetUserGroups(state: IUserData): void {
    resetStore(state, "userGroups");
  },
  updateUserGroups(state: IUserData, data: IUserGroup[]): void {
    updateStore(state, "userGroups", data);
  },

  deleteUserGroups(state: IUserData, idsToDelete: number[]): void {
    deleteFromStore(state, "userGroups", idsToDelete);
  },
};

function updateStore<
  T extends
    | ITenant
    | IRole
    | IAction
    | IModule
    | ISubmodule
    | IClaim
    | IClaimSet
    | IUser
    | IUserGroup
>(state: IUserData, keyName: IUserTableDataKeys, data: T[]): void {
  const stateData = state[keyName];
  if (typeof stateData != "object") return;

  data.forEach((record) => {
    const recordId = record.id;

    // if record has no id, ignore it
    if (!recordId) return;

    // if record already in store, just update it
    if (recordId in stateData) {
      const existingRecord = stateData[recordId];
      Object.assign(existingRecord, utils.deepCopy(record));
    } else {
      // else add record to the store
      const newRecord = utils.deepCopy(record);
      stateData[recordId] = newRecord;
    }
  });
}

function resetStore(state: IUserData, keyName: IUserTableDataKeys): void {
  if (typeof state[keyName] != "object") return;
  state[keyName] = {};
}

function deleteFromStore(
  state: IUserData,
  keyName: IUserTableDataKeys,
  idsToDelete: number[]
): void {
  const stateData = state[keyName];
  if (typeof stateData != "object") return;

  idsToDelete.forEach((id) => {
    // if record in store, delete it
    if (id in stateData) {
      delete stateData[id];
    }
  });
}
