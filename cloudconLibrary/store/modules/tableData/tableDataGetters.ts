import {
  IMetadata,
  ITableRecord,
  ITableDataState,
  ITableResponse,
  Metadata,
} from "./tableDataModule";
import { useTableNames } from "../../../utilities/useConstants";
import {
  IDataFilter,
  IDataFilters,
} from "../../../dataFilter/dataFilterInterfaces";
import { DataFilter } from "../../../dataFilter/dataFilter";

const dataFilter: IDataFilter = new DataFilter();

export default {
  getTableData:
    (state: ITableDataState) =>
    (
      tableName: string,
      filters: IDataFilters | null = null
    ): Record<string, ITableRecord> => {
      const tableData = state?.[tableName] ?? {};

      if (!filters) return tableData;

      return dataFilter.filterDictionary(tableData, filters);
    },

  getRecord:
    (state: ITableDataState) =>
    (tableName: string, id: string): ITableRecord =>
      state?.[tableName]?.[id] ?? {},

  getMetadata:
    (_state: ITableDataState, getters: any) =>
    (moduleName: string): IMetadata => {
      const metadataRecords = Object.values(
        getters.getTableData(useTableNames.METADATA) as Record<
          string,
          ITableRecord
        >
      ).filter((m) => m.keyname === moduleName);
      if (!metadataRecords || metadataRecords.length === 0)
        return new Metadata();
      else {
        const persistence = {} as Record<string, ITableResponse>;

        metadataRecords.forEach((m) => {
          const p = JSON.parse(m.persistence as string) as ITableResponse;
          const name = p.Location.Name;

          persistence[name] = p;
        });

        // May need to module and selection here as well
        const data = new Metadata(
          {},
          persistence,
          JSON.parse(metadataRecords[0].configuration as string),
          JSON.parse(metadataRecords[0].definition as string)
        );
        return data;
      }
    },
};
