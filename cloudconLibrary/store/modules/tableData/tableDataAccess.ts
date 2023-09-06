import { IEntity, IFilter, ITableRecord, IMetadata } from "./tableDataModule";
import { store } from "../../../../src/store";
import { IDataFilters } from "../../../dataFilter/dataFilterInterfaces";

export default {
  getTableData: (
    tableName: string,
    filters: IDataFilters | null = null
  ): IEntity => {
    return store.getters["tableData/getTableData"](tableName, filters);
  },

  getRecord: (tableName: string, id: string): ITableRecord => {
    return store.getters["tableData/getRecord"](tableName, id);
  },

  getMetadata: (moduleName: string): IMetadata => {
    return store.getters["tableData/getMetadata"](moduleName);
  },

  updateStore: (data: Record<string, ITableRecord[]>): void => {
    return store.commit("tableData/updateStore", data);
  },

  clearStore: (): void => {
    return store.commit("tableData/clearStore");
  },

  fetchTableData: (
    tableName: string,
    columns?: string[],
    filters?: IFilter[]
  ): Promise<void> => {
    return store.dispatch("tableData/fetchTableData", {
      tableName: tableName,
      columns: columns,
      filters: filters,
    });
  },

  fetchRecord: (
    tableName: string,
    id: string,
    columns?: string[],
    filters?: IFilter[]
  ): Promise<void> => {
    return store.dispatch("tableData/fetchRecord", {
      tableName: tableName,
      id: id,
      columns: columns,
      filters: filters,
    });
  },

  upsertRecords: (tableName: string, data: ITableRecord[]): Promise<void> => {
    return store.dispatch("tableData/upsertRecords", {
      tableName: tableName,
      data: data,
    });
  },

  deleteRecord: (tableName: string, id: string): Promise<void> => {
    return store.dispatch("tableData/deleteRecord", {
      tableName: tableName,
      id: id,
    });
  },

  deleteRecords: (tableName: string, ids: string[]): Promise<void> => {
    return store.dispatch("tableData/deleteRecords", {
      tableName: tableName,
      ids: ids,
    });
  },
};
