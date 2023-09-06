import { IRecord } from "../utilities/useGenericInterfaces";

export default function multiIdController() {
  function getMultiIdString(selectedOptions: IRecord[]): string {
    if (selectedOptions.length > 0)
      return selectedOptions
        .map((selected) => {
          return selected.id;
        })
        .join("|");
    return "";
  }

  // Takes a piped string of values and returns a piped string of ids
  function getMultiIdStringFromValues(
    pipedValues: string,
    fieldName: string,
    allData: IRecord[]
  ): string {
    return getMultiIdString(
      getSelectedObjects(pipedValues, fieldName, allData)
    );
  }

  // Takes a piped string of ids and returns a piped string of values
  function getMultiIdValueString(
    selectedIds: string,
    fieldName: string,
    allData: IRecord[]
  ): string {
    const selectedObjects = getSelectedObjects(selectedIds, "id", allData);
    const selectedValues: string[] = [];
    selectedObjects.forEach((obj) => {
      if (obj[fieldName])
        selectedValues.push(obj[fieldName]?.toString().trim() ?? "");
    });
    return selectedValues.filter(Boolean).join("|");
  }

  // Takes a piped string of values, returns the entire object that matches
  function getSelectedObjects(
    pipedValues: string,
    fieldName: string,
    allData: IRecord[]
  ): IRecord[] {
    const selectedObjects: IRecord[] = [];
    if (!allData) return selectedObjects;
    const selectedValues = pipedValues.split("|");
    selectedValues.forEach((value) => {
      const result = allData.find(
        (data) =>
          data[fieldName]?.toString().toLowerCase().trim() ===
          value.toLowerCase().trim()
      );
      if (result) selectedObjects.push(result);
    });
    return selectedObjects;
  }

  return {
    getMultiIdString,
    getMultiIdStringFromValues,
    getMultiIdValueString,
    getSelectedObjects,
  };
}
