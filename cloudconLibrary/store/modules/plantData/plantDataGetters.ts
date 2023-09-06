import { IPlant, IPlantData, IPlantGroup } from "./plantDataModule";

export default {
  getPlant: (state: IPlantData) => (): IPlant[] => {
    return Object.values(state.plant);
  },

  getPlantForTable: (state: IPlantData) => (): IPlant[] => {
    return state.plantForTable.data;
  },

  getTotalPlantForTable: (state: IPlantData) => (): number => {
    return state.plantForTable.totalRecords;
  },

  getPlantById:
    (state: IPlantData) =>
    (id: number): IPlant | undefined => {
      return state.plant[id];
    },

  getPlantGroups: (state: IPlantData) => (): IPlantGroup[] => {
    return Object.values(state.plantGroups);
  },

  getPlantGroupsForTable: (state: IPlantData) => (): IPlantGroup[] => {
    return state.plantGroupsForTable.data;
  },

  getTotalPlantGroupsForTable: (state: IPlantData) => (): number => {
    return state.plantGroupsForTable.totalRecords;
  },

  getPlantGroupById:
    (state: IPlantData) =>
    (id: number): IPlantGroup | undefined => {
      return state.plantGroups[id];
    },
};
