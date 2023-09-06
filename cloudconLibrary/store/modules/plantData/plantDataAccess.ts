import { IPlant, IPlantGroup } from "./plantDataModule";
import { store } from "../../../../src/store";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
import {
  IRequestPlantCreate,
  IRequestPlantUpdate,
} from "cloudconLibrary/api/apiInterfaces";

export default {
  getPlant: (): IPlant[] => {
    return store.getters["plantData/getPlant"]();
  },

  getPlantForTable: (): IPlant[] => {
    return store.getters["plantData/getPlantForTable"]();
  },

  getTotalPlantForTable: (): number => {
    return store.getters["plantData/getTotalPlantForTable"]();
  },

  getPlantById: (id: number): IPlant | undefined => {
    return store.getters["plantData/getPlantById"](id);
  },

  fetchPlant: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("plantData/fetchPlant", {
      filters,
      sort,
      pagination,
    });
  },

  fetchPlantById: (id: number): Promise<void> => {
    return store.dispatch("plantData/fetchPlantById", id);
  },

  createPlant: (requestPlantCreate: IRequestPlantCreate): Promise<void> => {
    return store.dispatch("plantData/createPlant", requestPlantCreate);
  },

  deletePlant: (id: number): Promise<void> => {
    return store.dispatch("plantData/deletePlant", id);
  },

  updatePlant: (requestPlantUpdate: IRequestPlantUpdate): Promise<void> => {
    return store.dispatch("plantData/updatePlant", requestPlantUpdate);
  },

  // Plant Groups

  getPlantGroups: (): IPlantGroup[] => {
    return store.getters["plantData/getPlantGroups"]();
  },

  getPlantGroupsForTable: (): IPlantGroup[] => {
    return store.getters["plantData/getPlantGroupsForTable"]();
  },

  getTotalPlantGroupsForTable: (): number => {
    return store.getters["plantData/getTotalPlantGroupsForTable"]();
  },

  getPlantGroupById: (id: number): IPlantGroup | undefined => {
    return store.getters["plantData/getPlantGroupById"](id);
  },

  fetchPlantGroups: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("plantData/fetchPlantGroups", {
      filters,
      sort,
      pagination,
    });
  },

  fetchPlantGroupById: (id: number): Promise<void> => {
    return store.dispatch("plantData/fetchPlantGroupById", id);
  },

  createPlantGroup: (name: string): Promise<void> => {
    return store.dispatch("plantData/createPlantGroup", { name });
  },

  deletePlantGroup: (id: number): Promise<void> => {
    return store.dispatch("plantData/deletePlantGroup", id);
  },

  updatePlantGroup: (
    id: number,
    name: string,
    addPlantArray: number[],
    removePlantArray: number[]
  ): Promise<void> => {
    return store.dispatch("plantData/updatePlantGroup", {
      id,
      name,
      addPlantArray,
      removePlantArray,
    });
  },
};
