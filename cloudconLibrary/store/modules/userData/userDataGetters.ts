import {
  ActionId,
  SubmoduleId,
  UserAdminLevel,
} from "../../../utilities/useConstants";
import {
  IUserData,
  ITenant,
  IRole,
  IAction,
  IModule,
  ISubmodule,
  IClaim,
  IClaimSet,
  IUser,
  IUserGroup,
  IUserDetails,
} from "./userDataModule";

export default {
  isAuthorized: (state: IUserData) => (): boolean => {
    return state.userIsAuthorized;
  },

  // Checks if a user is a super admin OR has the admin claim OR has a claim which contains one of the submoduleIds and one of the actionIds (if actionIds is passed)
  hasValidClaim:
    (state: IUserData) =>
    (
      submoduleIds: SubmoduleId | SubmoduleId[],
      actionIds?: ActionId | ActionId[]
    ): boolean => {
      return (
        state.userDetails.user?.adminLevel == UserAdminLevel.SUPER_ADMIN ||
        (state.userDetails.currentClaims?.some(
          (c) =>
            containsId(c.subModuleId, SubmoduleId.ADMIN) ||
            (containsId(c.subModuleId, submoduleIds) &&
              (actionIds == null || containsId(c.actionId, actionIds)))
        ) ??
          false)
      );
    },


  getUserDetails: (state: IUserData) => (): IUserDetails => {
    return state.userDetails;
  },

  getUserAdminLevel: (state: IUserData) => (): UserAdminLevel | undefined => {
    return state.userDetails.user?.adminLevel;
  },

  getUserClaims: (state: IUserData) => (): IClaim[] => {
    return state.userDetails.currentClaims ?? [];
  },

  getUserLastClaimsSyncDate: (state: IUserData) => (): number => {
    return state.userDetails.lastClaimsSyncDate ?? 0;
  },

  // getUserPages: (_state: IUserData, getters: any) => (): string[] => {
  //   return Object.keys(JSON.parse(getters.getUserClaims()));
  // },

  getTenants: (state: IUserData) => (): ITenant[] => {
    return Object.values(state.tenants);
  },

  getRoles: (state: IUserData) => (): IRole[] => {
    return Object.values(state.roles);
  },

  getActions: (state: IUserData) => (): IAction[] => {
    return Object.values(state.actions);
  },

  getModules: (state: IUserData) => (): IModule[] => {
    return Object.values(state.modules);
  },

  getSubmodules: (state: IUserData) => (): ISubmodule[] => {
    return Object.values(state.submodules);
  },

  getClaims: (state: IUserData) => (): IClaim[] => {
    return Object.values(state.claims);
  },

  getClaimSets: (state: IUserData) => (): IClaimSet[] => {
    return Object.values(state.claimSets);
  },

  getUsers: (state: IUserData) => (): IUser[] => {
    return Object.values(state.users);
  },

  getUserGroups: (state: IUserData) => (): IUserGroup[] => {
    return Object.values(state.userGroups);
  },
};

// checks if id matches any of the matchingIds
function containsId(id: number, matchingIds: number | number[]): boolean {
  if (Array.isArray(matchingIds)) return matchingIds.some((e) => e == id);
  else return id == matchingIds;
}
