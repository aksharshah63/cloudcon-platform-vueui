import { DatabaseWebApi } from "../../../api/databaseWebApi";
import { IDatabaseApi } from "../../../api/apiInterfaces";
import { ActionContext } from "vuex";
import {
  IFilter,
  ITableRecord,
  IResponseData,
  ITableDataState,
} from "./tableDataModule";
import { State } from "../../../../src/store";
import { IDataFilters } from "../../../dataFilter/dataFilterInterfaces";

type ITableDataContext = ActionContext<State, ITableDataState>;

const database: IDatabaseApi = new DatabaseWebApi();

export default {
  fetchTableData: (
    { commit }: ITableDataContext,
    payload: {
      tableName: string;
      columns?: string[];
      filters?: Record<string, IDataFilters>;
    }
  ) => {
    console.debug("calling fetch table data...");
    return database
      .fetchTableData(payload.tableName, payload.columns, payload.filters)
      .then((responseData) => {
        console.debug(
          "Response data in action for ",
          payload.tableName,
          responseData
        );

        const data = formatDataFromResponse(responseData, payload.tableName);

        commit("updateStore", data);
      });
  },

  fetchRecord: (
    { commit }: ITableDataContext,
    payload: {
      tableName: string;
      id: string;
      columns?: string[];
      filters?: IFilter[];
    }
  ) => {
    console.debug("calling fetch record...");
    return database
      .fetchRecord(
        payload.tableName,
        payload.id,
        payload.columns,
        payload.filters
      )
      .then((responseData) => {
        console.debug("Response data in action", responseData);

        const data = formatDataFromResponse(responseData, payload.tableName);

        commit("updateStore", data);
      });
  },

  upsertRecords: (
    { commit }: ITableDataContext,
    payload: { tableName: string; data: ITableRecord[] }
  ) => {
    console.debug("calling upsert records...");
    return database
      .upsertRecords(payload.tableName, payload.data)
      .then((responseData) => {
        console.debug("Response data in action", responseData);

        const data = formatDataFromResponse(responseData, payload.tableName);

        commit("updateStore", data);
      });
  },

  deleteRecord: (
    { commit }: ITableDataContext,
    payload: { tableName: string; id: string }
  ) => {
    console.debug("calling delete record...");
    return database.deleteRecord(payload.tableName, payload.id).then(() => {
      const data: Record<string, ITableRecord[]> = {
        [payload.tableName]: [
          {
            id: payload.id,
            _type: "DELETE",
          },
        ],
      };

      commit("updateStore", data);
    });
  },

  deleteRecords: (
    { commit }: ITableDataContext,
    payload: { tableName: string; ids: string[] }
  ) => {
    console.debug("calling delete records...");
    return database.deleteRecords(payload.tableName, payload.ids).then(() => {
      const data: Record<string, ITableRecord[]> = {
        [payload.tableName]: [],
      };

      payload.ids.forEach((id) => {
        data[payload.tableName].push({
          id: id,
          _type: "DELETE",
        });
      });

      commit("updateStore", data);
    });
  },
};

function formatDataFromResponse(
  responseData: IResponseData,
  tableName: string
): Record<string, ITableRecord[]> {
  const data: Record<string, ITableRecord[]> = {};

  data[tableName] = responseData.data.tableData;

  Object.entries(responseData.linkedData).forEach(
    ([linkedName, linkedData]) => {
      data[linkedName] = linkedData.tableData;
    }
  );

  return data;
}
