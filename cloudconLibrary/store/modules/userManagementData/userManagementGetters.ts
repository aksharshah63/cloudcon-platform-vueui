import { IUserManagementData} from "./userManagementModule";

export default {
  getSelectTenant: (state: IUserManagementData) => (): number | null => {
    return state.selectedTenant;
  },
};
