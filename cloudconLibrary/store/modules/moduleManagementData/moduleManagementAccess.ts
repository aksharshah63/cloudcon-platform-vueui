import { store } from "../../../../src/store";

export default {
  getSelectedTenant: (): number => {
    return store.getters["moduleManagement/getSelectTenant"]();
  },

  setSelectedTenant: (tenantId: number): void => {
    return store.commit("moduleManagement/setSelectedTenant", tenantId);
  },

  resetModuleData: (): void => {
    store.commit("fileData/resetFiles");
    store.commit("contactData/resetContacts");
    store.commit("contactData/resetContactGroups");
  },

  moduleExists: (): boolean=>{
    return store.hasModule("moduleManagement");
  }
};
