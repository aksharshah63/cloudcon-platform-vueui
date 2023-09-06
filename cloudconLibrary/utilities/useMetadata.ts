import {
  IColumnMetadata,
  IGroupDetail,
  IGrouping,
  IMetadata,
  ITableRecord,
} from "../store/modules/tableData/tableDataModule";

export default function useMetadata() {
  function getGrouping(metadata: IMetadata): IGrouping {
    return metadata.definition.Grouping;
  }

  function getGroup(metadata: IMetadata, level: number): IGroupDetail | null {
    return metadata.definition.Grouping[level] ?? null;
  }

  function getGroupingLevels(metadata: IMetadata): number {
    return Object.keys(getGrouping(metadata)).length;
  }

  // Add newColumns to metadata
  function addColumns(
    newColumns: IColumnMetadata[],
    metadata: IMetadata,
    entityName: string
  ): void {
    const entity = metadata?.persistence?.[entityName];

    if (entity) {
      const schema = entity?.Schema;

      if (schema)
        newColumns.forEach((column) => {
          schema.push(column);
        });
      else entity.Schema = newColumns;
    }
  }

  // Get Columns for a specific entity
  function getColumns(
    metadata: IMetadata,
    entityName: string
  ): IColumnMetadata[] | null {
    return metadata.persistence[entityName]?.Schema ?? null;
  }

  // Get columns that can be viewed
  function getViewableColumns(
    metadata: IMetadata,
    entityName: string
  ): IColumnMetadata[] | null {
    const allColumns = getColumns(metadata, entityName);
    if (allColumns == null) return null;

    return allColumns
      .filter((c) => c.IsVisible)
      .sort((a, b) => ((a?.Label ?? "") < (b?.Label ?? 0) ? 1 : -1));
  }

  // Get sorted Columns to be displayed
  function getDisplayColumns(
    metadata: IMetadata,
    entityName: string
  ): IColumnMetadata[] | null {
    const allColumns = getColumns(metadata, entityName);
    if (allColumns == null) return null;

    return allColumns
      .filter((c) => c.Label != null && !c.Hidden && c.IsVisible)
      .sort((a, b) =>
        (a?.DisplayOrderIndex || 0) > (b?.DisplayOrderIndex || 0) ? 1 : -1
      );
  }

  // Get a specific column
  function getColumn(
    metadata: IMetadata,
    entityName: string,
    internalName: string
  ): IColumnMetadata | null {
    return (
      getColumns(metadata, entityName)?.find(
        (column) => column.InternalName === internalName
      ) ?? null
    );
  }

  // Generates column metadata from the data and columnTemplate
  function getCustomColumnsFromRecords(
    columnTemplate: IColumnMetadata,
    records: ITableRecord[],
    tableName: string,
    startingDisplayOrderIndex = 1,
    maxNumberOfDisplayedColumns = 5
  ): IColumnMetadata[] {
    const id = columnTemplate.InternalName;
    const label = columnTemplate.Label ?? "";

    if (!id) return [] as IColumnMetadata[];

    const newColumns = records.map((record, index) => {
      const newColumn = getNewColumn(`${tableName}_${record[id]}`);

      newColumn.Label = record[label]?.toString();
      newColumn.DefaultValue = columnTemplate.DefaultValue;
      newColumn.RawType = columnTemplate.RawType;
      newColumn.Style = columnTemplate.Style;
      newColumn.IsVisible = true;

      if (index < maxNumberOfDisplayedColumns) {
        newColumn.Hidden = false;
        newColumn.DisplayOrderIndex = startingDisplayOrderIndex + index;
      }

      return newColumn;
    });

    return newColumns;
  }

  function getNewColumn(internalName: string): IColumnMetadata {
    return {
      DisplayOrderIndex: -1,
      Hidden: true,
      InternalName: internalName,
      IsVisible: false,
      Label: "",
      RawType: "string",
      Style: "",
    } as IColumnMetadata;
  }

  return {
    getGrouping,
    getGroup,
    getGroupingLevels,
    addColumns,
    getColumns,
    getViewableColumns,
    getDisplayColumns,
    getColumn,
    getCustomColumnsFromRecords,
    getNewColumn,
  };
}
