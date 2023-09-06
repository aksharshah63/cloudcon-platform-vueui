import { ITableRecord, ITableDataState } from "./tableDataModule";
import utils from "../../../utilities/useUtils";

export default {
  updateStore(
    state: ITableDataState,
    data: Record<string, ITableRecord[]>
  ): void {
    Object.entries(data).forEach(([tableName, tableData]) => {
      if (!(tableName in state)) state[tableName] = {};

      tableData.forEach((record) => {
        const recordId = record.id as string;

        // if record has no id, ignore it
        if (!recordId) return;

        // if record already in store, just update it
        if (recordId in state[tableName]) {
          const existingRecord = state[tableName][recordId];
          Object.assign(existingRecord, utils.deepCopy(record));
          existingRecord._isCalculated = false;
        } else {
          // else add record to the store
          const newRecord = utils.deepCopy(record);
          newRecord._isCalculated = false;
          state[tableName][recordId] = newRecord;
        }
      });
    });
  },

  clearStore(state: ITableDataState): void {
    Object.keys(state).forEach((t) => {
      delete state[t];
    });
  },
};
