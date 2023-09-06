import {
    IUserManagementData
} from "./userManagementModule";

if (navigator.webdriver) {
    window.localStorage.clear();
}

export default {
    setSelectedTenant(state: IUserManagementData, tenantId: number): void {
        state.selectedTenant = tenantId;
    },
};

  