import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
import { store } from "../../../../src/store";
import {
  IRequestWorkOrderCreate,
  IRequestWorkOrderUpdate,
} from "cloudconLibrary/api/apiInterfaces";
import { IWorkOrder } from "./workOrderDataModule";

export default {
  getWorkOrders: (): IWorkOrder[] =>
    store.getters["workOrderData/getWorkOrders"](),

  getWorkOrdersForTable: (): IWorkOrder[] =>
    store.getters["workOrderData/getWorkOrdersForTable"](),

  getTotalWorkOrdersForTable: (): number =>
    store.getters["workOrderData/getTotalWorkOrdersForTable"](),

  getWorkOrderById: (id: number): IWorkOrder | undefined =>
    store.getters["workOrderData/getWorkOrderById"](id),

  fetchWorkOrders: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> =>
    store.dispatch("workOrderData/fetchWorkOrders", {
      filters,
      sort,
      pagination,
    }),

  fetchWorkOrderById: (id: number): Promise<void> =>
    store.dispatch("workOrderData/fetchWorkOrderById", id),

  createWorkOrder: (
    requestWorkOrderCreate: IRequestWorkOrderCreate
  ): Promise<void> =>
    store.dispatch("workOrderData/createWorkOrder", requestWorkOrderCreate),

  deleteWorkOrder: (id: number): Promise<void> =>
    store.dispatch("workOrderData/deleteWorkOrder", id),

  updateWorkOrder: (
    requestWorkOrderUpdate: IRequestWorkOrderUpdate
  ): Promise<void> =>
    store.dispatch("workOrderData/updateWorkOrder", requestWorkOrderUpdate),
};
