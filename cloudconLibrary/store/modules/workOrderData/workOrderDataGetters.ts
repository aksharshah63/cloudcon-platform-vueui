import { IWorkOrder, IWorkOrderData } from "./workOrderDataModule";

export default {
  getWorkOrders: (state: IWorkOrderData) => (): IWorkOrder[] => {
    return Object.values(state.workOrders);
  },

  getWorkOrdersForTable: (state: IWorkOrderData) => (): IWorkOrder[] => {
    return state.workOrdersForTable.data;
  },

  getTotalWorkOrdersForTable: (state: IWorkOrderData) => (): number => {
    return state.workOrdersForTable.totalRecords;
  },

  getWorkOrderById:
    (state: IWorkOrderData) =>
    (id: number): IWorkOrder | undefined => {
      return state.workOrders[id];
    },
};
