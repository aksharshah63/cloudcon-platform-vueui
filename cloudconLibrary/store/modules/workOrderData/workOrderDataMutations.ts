import {
  IWorkOrder,
  IWorkOrderData,
  IWorkOrderTableDataKeys,
} from "./workOrderDataModule";
import utils from "../../../utilities/useUtils";

export default {
  resetWorkOrders(state: IWorkOrderData): void {
    resetStore(state, "workOrders");
  },

  updateWorkOrders(state: IWorkOrderData, data: IWorkOrder[]): void {
    updateStore(state, "workOrders", data);
  },

  updateWorkOrdersForTable(
    state: IWorkOrderData,
    payload: {
      data: IWorkOrder[];
      totalRecords: number;
    }
  ): void {
    state.workOrdersForTable.data = payload.data;
    state.workOrdersForTable.totalRecords = payload.totalRecords;
  },

  deleteWorkOrders(state: IWorkOrderData, idsToDelete: number[]): void {
    deleteFromStore(state, "workOrders", idsToDelete);
  },
};

function updateStore<T extends IWorkOrder>(
  state: IWorkOrderData,
  keyName: IWorkOrderTableDataKeys,
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

function resetStore(
  state: IWorkOrderData,
  keyName: IWorkOrderTableDataKeys
): void {
  if (typeof state[keyName] != "object") return;
  state[keyName] = {};
}

function deleteFromStore(
  state: IWorkOrderData,
  keyName: IWorkOrderTableDataKeys,
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
