import {
    IModuleManagementData
} from "./moduleManagementModule";

if (navigator.webdriver) {
    window.localStorage.clear();
}

export default {
    setSelectedTenant(state: IModuleManagementData, tenantId: number): void {
        state.selectedTenant = tenantId;
    },
};

  