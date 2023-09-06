import { ActionContext } from "vuex";
import { State } from "../../../../src/store";
import { IWorkOrderDataState } from "./workOrderDataModule";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
import { UsersApi } from "../../../../cloudconLibrary/api/usersApi";
import {
  IRequestWorkOrderCreate,
  IRequestWorkOrderUpdate,
  IUsersApi,
} from "cloudconLibrary/api/apiInterfaces";

type IWorkOrderDataContext = ActionContext<State, IWorkOrderDataState>;

const usersApi: IUsersApi = new UsersApi();

export default {
  fetchWorkOrders: (
    { commit }: IWorkOrderDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getWorkOrders(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) {
          commit("updateWorkOrdersForTable", {
            data: response.data,
            totalRecords: response.metadata?.totalRecords ?? 0,
          });
          commit("updateWorkOrders", response.data);
        }
      });
  },

  fetchWorkOrderById: (
    { commit }: IWorkOrderDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.getWorkOrderById(id).then((data) => {
      commit("updateWorkOrders", [data]);
    });
  },

  createWorkOrder: (
    { commit }: IWorkOrderDataContext,
    requestWorkOrderCreate: IRequestWorkOrderCreate
  ): Promise<void> => {
    return usersApi.createWorkOrder(requestWorkOrderCreate).then((response) => {
      if (response?.data != null) commit("updateWorkOrders", [response.data]);
    });
  },

  deleteWorkOrder: (
    { commit }: IWorkOrderDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.deleteWorkOrder(id).then(() => {
      commit("deleteWorkOrders", [id]);
    });
  },

  updateWorkOrder: (
    { commit }: IWorkOrderDataContext,
    requestWorkOrderUpdate: IRequestWorkOrderUpdate
  ): Promise<void> => {
    return usersApi.updateWorkOrder(requestWorkOrderUpdate).then((response) => {
      if (response?.data != null) commit("updateWorkOrders", [response.data]);
    });
  },
};
