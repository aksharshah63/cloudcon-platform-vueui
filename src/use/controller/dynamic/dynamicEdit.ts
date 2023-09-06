import { ITableRecord } from "../../../../cloudconLibrary/store/modules/tableData/tableDataModule";
import { useTableNames } from "../../../../cloudconLibrary/utilities/useConstants";

export default function useControllerDynamicEdit(table: useTableNames) {
  const getItem = (itemId: string) => {
    return {
      id: itemId,
      table: table,
    };
  };

  const saveItem = (
    tableName: useTableNames,
    item: ITableRecord
  ): Promise<void> => {
    console.log(tableName, item);
    return Promise.resolve();
  };

  const deleteItem = (
    tableName: useTableNames,
    item: ITableRecord
  ): Promise<void> => {
    console.log(tableName, item);
    return Promise.resolve();
  };

  const returnLookup = (lookupType: string): ITableRecord[] => {
    switch (lookupType) {
      case "project":
        return [];
      case "group":
        return [];
    }
    return [];
  };

  const getSectionDetails = (entityLookup: string) => {
    const entries: ITableRecord[] = [];
    const relevantSections: ITableRecord[] = [];
    for (const section of Object.values(entries)) {
      if (section.entity == entityLookup) {
        relevantSections.push(section);
      }
    }
    relevantSections.sort(
      (a, b) => (a.position as number) - (b.position as number)
    );
    return relevantSections;
  };

  return {
    getItem,
    saveItem,
    deleteItem,
    returnLookup,
    getSectionDetails,
  };
}
