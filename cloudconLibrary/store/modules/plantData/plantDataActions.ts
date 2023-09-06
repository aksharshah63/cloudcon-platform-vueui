import { State } from "../../../../src/store";
import { IPlantDataState } from "./plantDataModule";
import { ActionContext } from "vuex";
import { UsersApi } from "../../../api/usersApi";
import {
  IRequestPlantCreate,
  IRequestPlantUpdate,
  IUsersApi,
} from "../../../api/apiInterfaces";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
// import { WebAuth } from "auth0-js";
// import useCookies from "../../../utilities/useCookies";
// import { cookieKeys } from "../../../utilities/useConstants";

type IPlantDataContext = ActionContext<State, IPlantDataState>;

const usersApi: IUsersApi = new UsersApi();

export default {
  fetchPlant: (
    { commit }: IPlantDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getPlant(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) {
          commit("updatePlantForTable", {
            data: response.data,
            totalRecords: response.metadata?.totalRecords ?? 0,
          });
          commit("updatePlant", response.data);
        }
      });
  },

  fetchPlantById: (
    { commit }: IPlantDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.getPlantById(id).then((data) => {
      commit("updatePlant", [data]);
    });
  },

  createPlant: (
    { commit }: IPlantDataContext,
    requestPlantCreate: IRequestPlantCreate
  ): Promise<void> => {
    return usersApi.createPlant(requestPlantCreate).then((response) => {
      if (response?.data != null) commit("updatePlant", [response.data]);
    });
  },

  deletePlant: ({ commit }: IPlantDataContext, id: number): Promise<void> => {
    return usersApi.deletePlant(id).then(() => {
      commit("deletePlant", [id]);
    });
  },

  updatePlant: (
    { commit }: IPlantDataContext,
    requestPlantUpdate: IRequestPlantUpdate
  ): Promise<void> => {
    return usersApi.updatePlant(requestPlantUpdate).then((response) => {
      console.log("test");
      if (response?.data != null) commit("updatePlant", [response.data]);
    });
  },

  fetchPlantGroups: (
    { commit }: IPlantDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getPlantGroups(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) {
          commit("updatePlantGroupsForTable", {
            data: response.data,
            totalRecords: response.metadata?.totalRecords ?? 0,
          });
          commit("updatePlantGroups", response.data);
        }
      });
  },

  fetchPlantGroupById: (
    { commit }: IPlantDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.getPlantGroupById(id).then((data) => {
      commit("updatePlantGroups", [data]);
    });
  },

  createPlantGroup: (
    { commit }: IPlantDataContext,
    payload: { name: string }
  ): Promise<void> => {
    return usersApi.createPlantGroup(payload.name).then((response) => {
      if (response?.data != null) commit("updatePlantGroups", [response.data]);
    });
  },

  updatePlantGroup: (
    { commit }: IPlantDataContext,
    payload: {
      id: number;
      name: string | null;
      addPlantArray: number[];
      removePlantArray: number[];
    }
  ): Promise<void> => {
    return usersApi
      .updatePlantGroup(
        payload.id,
        payload.name,
        payload.addPlantArray,
        payload.removePlantArray
      )
      .then((response) => {
        console.log("Update Plant Group", response);
        if (response?.data != null) {
          commit("updatePlantGroups", [response.data]);
        }
      });
  },
  deletePlantGroup: (
    { commit }: IPlantDataContext,
    id: number
  ): Promise<void> => {
    return usersApi.deletePlantGroup(id).then(() => {
      commit("deletePlantGroups", [id]);
    });
  },
};
