import {
  IColumnMetadata,
  IRecord,
  IUpviseDataMessage,
} from "../../store/modules/upvise.d";
import labels from "../function/labels";
import useLocalForage from "./useLocalForage";
import useMultiIdController from "../../../cloudconLibrary/utilities/multiId";

export default function backingField() {
  const multiId = useMultiIdController();

  // Get data for every BackingFieldInternalName in upviseDataMessage as a dictionary (method -> location -> records)
  // Currently only need to get forage data
  async function getData(
    backingFieldDictionary: Record<string, Record<string, IColumnMetadata>>
  ): Promise<Record<string, Record<string, IRecord[]>>> {
    const data: Record<string, Record<string, IRecord[]>> = { forage: {} };
    const backingFieldDetails = [
      ...new Set(
        Object.values(backingFieldDictionary)
          .map((d) => Object.values(d))
          .flat()
      ),
    ];
    const forageInstance = useLocalForage.getInstance("upvise", "tables");

    for (const d of backingFieldDetails) {
      const details = d.BackingFieldInternalName?.split(":");
      if (!details) continue;
      const method = details[1];
      const location = details[2];

      if (method === "forage" && location) {
        await useLocalForage
          .getData(location, forageInstance)
          .then((result) => {
            if (result) data["forage"][location] = result;
          });
      }
    }

    return data;
  }

  // Get all the BackingFieldInternalName fields in a dictionary (entity name -> field name -> backingfield details)
  function getDictionary(
    upviseDataMessage: IUpviseDataMessage
  ): Record<string, Record<string, IColumnMetadata>> {
    const dictionary: Record<string, Record<string, IColumnMetadata>> = {};
    Object.entries(upviseDataMessage.persistence).forEach(([key, value]) => {
      const backingFieldArray = value?.Schema?.filter(
        (c) => c.BackingFieldInternalName && c.InternalName
      );

      if (backingFieldArray && backingFieldArray.length > 0) {
        dictionary[key] = {};
        backingFieldArray.forEach((c) => {
          dictionary[key][c.InternalName as string] = c;
        });
      }
    });
    return dictionary;
  }

  // Set all properties with a BackingFieldInternalName in the store
  function setData(
    dictionary: Record<string, Record<string, IColumnMetadata>>,
    data: Record<string, Record<string, IRecord[]>>
  ): void {
    Object.entries(dictionary).forEach(([_, d]) => {
      const entityData = [] as IRecord[];

      entityData.forEach((r) => {
        Object.entries(d).forEach(([field, b]) => {
          const backingDetails = b.BackingFieldInternalName?.split(":");
          if (!backingDetails) return;
          const backingMethod = backingDetails[1];

          switch (backingMethod) {
            case "forage":
              _setRecordForForage(
                r,
                field,
                backingDetails,
                data["forage"],
                b.Style || ""
              );
              break;
            case "labels":
              _setRecordForLabels(r, field, backingDetails);
              break;
            case "store":
              _setRecordForStore(r, field, backingDetails, b.Style || "");
              break;
            case "property":
              _setRecordForProperty(r, field, backingDetails);
              break;
          }
        });
      });
    });
  }

  // sets the field of the given record using forage data
  function _setRecordForForage(
    record: IRecord,
    field: string,
    backingDetails: string[],
    forageData: Record<string, IRecord[]>,
    style: string
  ) {
    const backingParentInternalName = backingDetails[0];
    const backingLocation = backingDetails[2];
    const backingField = backingDetails[3];

    if (forageData && backingLocation in forageData) {
      const r = forageData[backingLocation].find(
        (e) => e.id === record[backingParentInternalName]
      );

      if (
        style === "multiId" &&
        backingParentInternalName &&
        backingParentInternalName in record &&
        backingField &&
        backingLocation
      )
        record[field] = multiId.getMultiIdValueString(
          record[backingParentInternalName] as string,
          backingField,
          forageData[backingLocation]
        );
      else if (r && backingField in r) record[field] = r[backingField];
      else record[field] = null;
    }
  }

  // sets the field of the given record using labels data
  function _setRecordForLabels(
    record: IRecord,
    field: string,
    backingDetails: string[]
  ) {
    const backingParentInternalName = backingDetails[0];
    const backingLocation = backingDetails[2].toLowerCase().trim();

    if (backingLocation in labels && labels[backingLocation]) {
      const r = labels[backingLocation];
      const key = record[backingParentInternalName];

      if (r && key && typeof key === "number") record[field] = r[key];
      else record[field] = null;
    }
  }

  // sets the field of the given record using store data
  function _setRecordForStore(
    record: IRecord,
    field: string,
    backingDetails: string[],
    style: string
  ) {
    const backingParentInternalName = backingDetails[0];
    // const backingLocation = backingDetails[2] as useTableNames;
    const backingField = backingDetails[3];

    if (typeof record[backingParentInternalName] === "string") {
      const records = {} as Record<string, IRecord>;
      const r = records[record[backingParentInternalName] as string];

      if (
        style === "multiId" &&
        backingParentInternalName &&
        backingParentInternalName in record &&
        backingField
      )
        record[field] = multiId.getMultiIdValueString(
          record[backingParentInternalName] as string,
          backingField,
          Object.values(records) as unknown as IRecord[]
        );
      else if (r && backingField in r)
        record[field] = r[backingField] as string;
      else record[field] = null;
    }
  }

  // sets the field of the given record using another field from the record itself
  function _setRecordForProperty(
    record: IRecord,
    field: string,
    backingDetails: string[]
  ) {
    const backingLocation = backingDetails[2];
    const backingField = backingDetails[3];

    if (record[backingLocation]) {
      const JSONObject = JSON.parse(record[backingLocation] as string);

      if (backingField in JSONObject) record[field] = JSONObject[backingField];
      else record[field] = null;
    }
  }

  // gets the id of the record from forage based on the value
  function findBackingDataForForage(
    value: string,
    backingDetails: string[],
    forageData: Record<string, IRecord[]>,
    style: string
  ): string | null {
    const backingLocation = backingDetails[2];
    const backingField = backingDetails[3];

    if (backingLocation in forageData) {
      if (style === "multId")
        return (
          multiId.getMultiIdStringFromValues(
            value.toString(),
            backingField,
            forageData[backingLocation]
          ) ?? null
        );
      else
        return (
          (forageData[backingLocation].find((e) => e[backingField] == value)
            ?.id as string) ?? null
        );
    }

    return null;
  }

  // gets the key from labels based on the value
  function findBackingDataForLabels(
    value: string,
    backingDetails: string[]
  ): string | null {
    const labelData = labels[backingDetails[2].toLowerCase().trim()];
    return (
      Object.keys(labelData).find(
        (key) => labelData[key].toLowerCase() === value.toLowerCase()
      ) ?? null
    );
  }

  // gets the key from the store based on the value
  function findBackingDataForStore(
    value: string,
    backingDetails: string[],
    style: string
  ): string | null {
    // const backingLocation = backingDetails[2] as useTableNames;
    const backingField = backingDetails[3];
    const storeData = [] as IRecord[];
    if (style === "multiId") {
      return (
        multiId.getMultiIdStringFromValues(value, backingField, storeData) ??
        null
      );
    } else
      return (
        (storeData.find((record) => record[backingField] === value)
          ?.id as string) ?? null
      );
  }

  return {
    getData,
    getDictionary,
    setData,
    findBackingDataForForage,
    findBackingDataForLabels,
    findBackingDataForStore,
  };
}
