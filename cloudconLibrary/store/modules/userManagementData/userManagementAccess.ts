import { store } from "../../../../src/store";

export default {
    getSelectedTenant: (): number|undefined => {
        return store.getters["userManagement/getSelectTenant"]();
    },

    setSelectedTenant: (tenantId:number): void => {
        return store.commit("userManagement/setSelectedTenant", tenantId);
    }
}