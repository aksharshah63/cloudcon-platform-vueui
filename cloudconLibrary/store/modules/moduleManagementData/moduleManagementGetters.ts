import { IModuleManagementData} from "./moduleManagementModule";

export default {
  getSelectTenant: (state: IModuleManagementData) => (): number | null => {
    return state.selectedTenant;
  },
};
