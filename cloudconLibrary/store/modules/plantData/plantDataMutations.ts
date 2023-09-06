import {
  IPlant,
  IPlantData,
  IPlantGroup,
  IPlantTableDataKeys,
} from "./plantDataModule";
import utils from "../../../utilities/useUtils";

export default {
  resetPlant(state: IPlantData): void {
    resetStore(state, "plant");
  },

  updatePlant(state: IPlantData, data: IPlant[]): void {
    updateStore(state, "plant", data);
  },

  updatePlantForTable(
    state: IPlantData,
    payload: {
      data: IPlant[];
      totalRecords: number;
    }
  ): void {
    state.plantForTable.data = payload.data;
    state.plantForTable.totalRecords = payload.totalRecords;
  },

  deletePlant(state: IPlantData, idsToDelete: number[]): void {
    deleteFromStore(state, "plant", idsToDelete);
  },

  resetPlantGroups(state: IPlantData): void {
    resetStore(state, "plantGroups");
  },

  updatePlantGroups(state: IPlantData, data: IPlantGroup[]): void {
    updateStore(state, "plantGroups", data);
  },

  updatePlantGroupsForTable(
    state: IPlantData,
    payload: {
      data: IPlantGroup[];
      totalRecords: number;
    }
  ): void {
    state.plantGroupsForTable.data = payload.data;
    state.plantGroupsForTable.totalRecords = payload.totalRecords;
  },

  deletePlantGroups(state: IPlantData, idsToDelete: number[]): void {
    deleteFromStore(state, "plantGroups", idsToDelete);
  },
};

function updateStore<T extends IPlant | IPlantGroup>(
  state: IPlantData,
  keyName: IPlantTableDataKeys,
  data: T[]
): void {
  const stateData = state[keyName];
  if (typeof state[keyName] != "object") return;
  data.forEach((record) => {
    const recordId = record.id;

    // if record has no id, ignore it
    if (!recordId) return;

    // if record already in store, just update it
    if (recordId in stateData) {
      const existingRecord = stateData[recordId];
      Object.assign(existingRecord, utils.deepCopy(record));
    } else {
      // else add record to the store
      const newRecord = utils.deepCopy(record);
      stateData[recordId] = newRecord;
    }
  });
}

function resetStore(state: IPlantData, keyName: IPlantTableDataKeys): void {
  if (typeof state[keyName] != "object") return;
  state[keyName] = {};
}

function deleteFromStore(
  state: IPlantData,
  keyName: IPlantTableDataKeys,
  idsToDelete: number[]
): void {
  const stateData = state[keyName];
  if (typeof stateData != "object") return;

  idsToDelete.forEach((id) => {
    // if record in store, delete it
    if (id in stateData) {
      delete stateData[id];
    }
  });
}
