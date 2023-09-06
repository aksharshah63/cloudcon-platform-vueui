import {
  IFilter,
  ITableRecord,
  IResponseData,
} from "../store/modules/tableData/tableDataModule";
import axios, { AxiosResponse } from "axios";
import { IDatabaseApi } from "./apiInterfaces";
import {
  DataFilterCondition,
  DataFilterOperator,
  DataFilterType,
  DataFilterValue,
  IDataFilters,
} from "../dataFilter/dataFilterInterfaces";

const webApiUrl = "https://api.database.app.cloudcon.com.au:5001";
// const webApiUrl = "https://localhost:5001";
const client = "test"; // NEED TO GET CLIENT NAME FROM SOMEWHERE

export type IDatabaseFilters = IDatabaseFilterGroup | IDatabaseFilterRule;

interface IDatabaseFilterGroup {
  Condition: DataFilterCondition;
  Rules: IDatabaseFilters[];
}

interface IDatabaseFilterRule {
  Field: string;
  Type: DataFilterType;
  Operator: DataFilterOperator;
  Value?: IDatabaseFilterRuleValue;
}

interface IDatabaseFilterRuleValue {
  String?: string;
  StringArray?: string[];
  Number?: number;
  NumberArray?: number[];
  Boolean?: boolean;
}

export interface IDatatableSortObject {
  field: string;
  order: SortOrderOption;
}

export enum SortOrderOption {
  ASCENDING = "asc",
  DESCENDING = "desc",
}

export interface IDatabaseSort {
  Field: string;
  Order: SortOrderOption;
}

export class DatabaseWebApi implements IDatabaseApi {
  fetchTableData(
    tableName: string,
    columns?: string[],
    filters?: Record<string, IDataFilters>,
    sort?: Record<string, IDatatableSortObject[]>,
    paginationPage?: number,
    paginationItemsPerPage?: number
  ): Promise<IResponseData> {
    return new Promise((resolve, reject) => {
      fetchTableDataCall(
        tableName,
        columns,
        filters,
        sort,
        paginationPage,
        paginationItemsPerPage
      )
        .then((response) => {
          const responseData = response.data as IResponseData;
          return resolve(responseData);
        })
        .catch((error) => {
          console.error(error);
          reject();
        });
    });
  }

  fetchRecord(
    tableName: string,
    id: string,
    columns?: string[],
    filters?: IFilter[]
  ): Promise<IResponseData> {
    return new Promise((resolve, reject) => {
      fetchRecordCall(tableName, id, columns, filters)
        .then((response) => {
          const responseData = response.data as IResponseData;
          return resolve(responseData);
        })
        .catch((error) => {
          console.error(error);
          reject();
        });
    });
  }

  upsertRecords(
    tableName: string,
    records: ITableRecord[]
  ): Promise<IResponseData> {
    return new Promise((resolve, reject) => {
      upsertRecordsCall(tableName, records)
        .then((response) => {
          const responseData = response.data as IResponseData;
          return resolve(responseData);
        })
        .catch((error) => {
          console.error(error);
          reject();
        });
    });
  }

  deleteRecord(tableName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      deleteRecordCall(tableName, id)
        .then(() => resolve())
        .catch((error) => {
          console.error(error);
          reject();
        });
    });
  }

  deleteRecords(tableName: string, ids: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      deleteRecordsCall(tableName, ids)
        .then(() => resolve())
        .catch((error) => {
          console.error(error);
          reject();
        });
    });
  }
}

function fetchTableDataCall(
  tableName: string,
  columns?: string[],
  filters?: Record<string, IDataFilters>,
  sort?: Record<string, IDatatableSortObject[]>,
  paginationPage?: number,
  paginationItemsPerPage?: number
): Promise<AxiosResponse<any>> {
  const params = new URLSearchParams();

  // Add columns as query parameters
  columns?.forEach((c) => {
    params.append("columns[]", c);
  });

  // Add filters as query parameters
  if (filters != null) {
    const formattedFilters: Record<string, IDatabaseFilters> = {};

    Object.keys(filters).forEach((tableName) => {
      // console.log(`filters >> ${JSON.stringify(filters[tableName])}`);
      formattedFilters[tableName] = _formatFilters(filters[tableName]);
    });

    params.append("filters", JSON.stringify(formattedFilters));
  }

  if (sort != null) {
    const formattedSort: Record<string, IDatabaseSort[]> = {};
    Object.keys(sort).forEach((tableName) => {
      // console.log(`sort >> ${JSON.stringify(sort[tableName])}`);
      formattedSort[tableName] = _formatSort(sort[tableName]);
    });
    params.append("sort", JSON.stringify(formattedSort));
  }

  if (paginationPage != null)
    params.append("paginationPage", paginationPage.toString());

  if (paginationItemsPerPage != null)
    params.append("paginationItemsPerPage", paginationItemsPerPage.toString());

  return axios.get(`${webApiUrl}/${client}/${tableName}`, {
    headers: {
      "api-key": process.env.VUE_APP_DATABASE_WEB_API_KEY ?? "",
    },
    params: params,
  });
}

function fetchRecordCall(
  tableName: string,
  id: string,
  columns?: string[],
  filters?: IFilter[]
): Promise<AxiosResponse<any>> {
  const params = new URLSearchParams();

  // Add columns as query parameters
  columns?.forEach((c) => {
    params.append("columns[]", c);
  });

  // Add filters as query parameters
  if (filters) params.append("filters", JSON.stringify(filters));

  return axios.get(`${webApiUrl}/${client}/${tableName}/${id}`, {
    headers: {
      "api-key": process.env.VUE_APP_DATABASE_WEB_API_KEY ?? "",
    },
    params: params,
  });
}

function upsertRecordsCall(
  tableName: string,
  records: ITableRecord[]
): Promise<AxiosResponse<any>> {
  const params = new URLSearchParams();

  return axios.put(
    `${webApiUrl}/${client}/${tableName}`,
    {
      TableData: records,
    },
    {
      headers: {
        "api-key": process.env.VUE_APP_DATABASE_WEB_API_KEY ?? "",
      },
      params: params,
    }
  );
}

function deleteRecordCall(
  tableName: string,
  id: string
): Promise<AxiosResponse<any>> {
  return axios.delete(`${webApiUrl}/${client}/${tableName}/${id}`, {
    headers: {
      "api-key": process.env.VUE_APP_DATABASE_WEB_API_KEY ?? "",
    },
  });
}

function deleteRecordsCall(
  tableName: string,
  ids: string[]
): Promise<AxiosResponse<any>> {
  return axios.delete(`${webApiUrl}/${client}/${tableName}`, {
    headers: {
      "api-key": process.env.VUE_APP_DATABASE_WEB_API_KEY ?? "",
    },
    data: {
      TableDataIds: ids,
    },
  });
}

// format filters to the format the web api expects
function _formatFilters(filters: IDataFilters): IDatabaseFilters {
  if ("condition" in filters) {
    return {
      Condition: filters.condition,
      Rules: filters.rules.map((r) => _formatFilters(r)),
    } as IDatabaseFilters;
  } else
    return {
      Field: filters.field,
      Type: filters.type,
      Operator: filters.operator,
      Value: _formatFilterRuleValue(filters.type, filters.value),
    } as IDatabaseFilterRule;
}

function _formatFilterRuleValue(
  type: DataFilterType,
  value: DataFilterValue | undefined
): IDatabaseFilterRuleValue {
  const filterRuleValue: IDatabaseFilterRuleValue = {};
  if (typeof value == "string") filterRuleValue.String = value;
  else if (typeof value == "number") filterRuleValue.Number = value;
  else if (typeof value == "boolean") filterRuleValue.Boolean = value;
  else if (Array.isArray(value) && type == DataFilterType.NUMBER)
    filterRuleValue.NumberArray = value as number[];
  else if (Array.isArray(value) && type == DataFilterType.STRING)
    filterRuleValue.StringArray = value as string[];

  return filterRuleValue;
}

// format sort to the format the web api expects
function _formatSort(sort: IDatatableSortObject[]): IDatabaseSort[] {
  return sort.map((s) => {
    return {
      Field: s.field,
      Order: s.order,
    };
  });
}
