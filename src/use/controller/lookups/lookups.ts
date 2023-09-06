import {
  IUpvise,
  IGridSlicing,
  IRecord,
} from "../../../store/modules/upvise.d";
import { ILookupRecord } from "./lookups.d";
import { reactive } from "vue";

export default function useControllerLookups(upvise: IUpvise) {
  const state = upvise.state();
  const fetch = () => upvise.fetch("catalogue");
  const getMetadata = () => upvise.metadata("catalogue");

  // function copyModelEntities(lookup: ILookupRecord[]): IUpviseDataMessage {
  //   const state = upvise.state(ENDPOINTS.FETCH);
  //   const result = new UpviseDataMessage(
  //     state.client,
  //     state.module,
  //     state.selection,
  //     state.configuration,
  //     state.definition
  //   );
  //   result.persistence.model.lookup = new TableResponse(
  //     state.persistence.model.lookup.title,
  //     state.persistence.model.lookup.schema,
  //     lookup as unknown as ITable
  //   );

  //   return result;
  // }

  const getEditLookup = (lookupId: string): ILookupRecord => {
    const editLookup = upvise.recordData(
      "TableEmployeedashboardLookups",
      lookupId
    ) as unknown as ILookupRecord;
    return reactive(JSON.parse(JSON.stringify(editLookup)));
  };

  // I've picked an arbitrary date of 2100/01/01 as the max value of long gives and invalid date
  const getNewLookup = () => {
    return reactive({
      id: "",
      lookuptype: "",
      lookupname: "",
      lookupvalue: "",
      startdate: 0,
      enddate: 4102444800000,
      isactive: 1,
      owner: "",
      managingrole: "",
    } as ILookupRecord);
  };

  // TODO: Add in local forage to get the owner name from upvise and store
  // It's the email address stored in local storage
  const doSaveLookup = (
    TableEmployeedashboardLookups: ILookupRecord[]
  ): Promise<void> => {
    const payload = {
      TableEmployeedashboardLookups: verifyLookups(
        TableEmployeedashboardLookups
      ) as unknown as IRecord[],
    } as Record<string, IRecord[]>;
    return upvise.update(payload);
  };

  const doDeleteLookup = (
    TableEmployeedashboardLookup: ILookupRecord
  ): Promise<void> => {
    const copyTableEmployeedashboardLookup = JSON.parse(
      JSON.stringify(TableEmployeedashboardLookup)
    ) as IRecord;

    copyTableEmployeedashboardLookup.isactive = 0;

    return upvise.update({
      TableEmployeedashboardLookups: [copyTableEmployeedashboardLookup],
    });
  };

  function getSlicingInformation(): Record<string, IGridSlicing[]> {
    //JSON Object, for each tab send filter that needs to be applied!
    //{[fieldNames], displayName, filterToApply}
    const returnArray: Record<string, IGridSlicing[]> = {
      TableEmployeedashboardLookups: [],
    };
    returnArray["TableEmployeedashboardLookups"].push({
      fieldNames: [""],
      displayName: "All",
      filtersToApply: {
        none: {
          operator: "and",
          constraints: [
            {
              value: null,
              matchMode: "equals",
            },
          ],
        },
      },
    });
    const typesCreated: string[] = [];
    const lookupsData = Object.values(
      upvise.entityData("TableEmployeedashboardLookups")
    );
    lookupsData.forEach((entry: Record<string, unknown>) => {
      if (!typesCreated.includes(entry.lookuptype as string)) {
        returnArray["TableEmployeedashboardLookups"].push({
          fieldNames: ["lookuptype"],
          displayName: entry.lookuptype as string,
          filtersToApply: {
            lookuptype: {
              operator: "and",
              constraints: [
                {
                  value: entry.lookuptype as string,
                  matchMode: "equals",
                },
              ],
            },
          },
        });
        typesCreated.push(entry.lookuptype as string);
      }
    });
    return returnArray;
  }

  const doValidateLookup = (lookup: ILookupRecord) => {
    if (!lookup.lookuptype) {
      alert("Please select a type");
      return false;
    }
    if (!lookup.lookupvalue) {
      alert("Please input a value");
      return false;
    }
    if (lookup.lookupname.includes("|")) {
      alert("Invalid name - pipes are not allowed");
      return false;
    }
    if (!lookup.lookupname) {
      alert("Please input a name");
      return false;
    }
    if (lookup.startdate > lookup.enddate) {
      alert("The Start Date cannot be before the End Date");
      return false;
    }
    if (findMatchingLookup(lookup)) {
      alert(
        "You are attempting to create a new lookup when one with the same name already exists. Search the catalogue before adding a new record."
      );
      return false;
    }
    return true;
  };

  function verifyLookups(newRiskLookup: ILookupRecord[]) {
    return newRiskLookup.map((lookup) => {
      if (!lookup.enddate) {
        console.log("updating end date");
        lookup.enddate = 4102444800000;
      }
      if (typeof lookup.isactive === "undefined") {
        console.log("setting active");
        lookup.enddate = 0;
      }
      lookup.lookupname = lookup.lookupname.trim();
      lookup.lookuptype = lookup.lookuptype.trim();
      return lookup;
    });
  }

  function findMatchingLookup(lookup: ILookupRecord) {
    const lookups = Object.values(
      upvise.entityData("TableEmployeedashboardLookups")
    ) as unknown as ILookupRecord[];
    return lookups.some(
      (l) =>
        l.lookupname.toLowerCase().trim() ===
          lookup.lookupname.toLowerCase().trim() &&
        l.lookuptype.toLowerCase().trim() ===
          lookup.lookuptype.toLowerCase().trim() &&
        l.lookupvalue.toLowerCase().trim() ===
          lookup.lookupvalue.toLowerCase().trim() &&
        l.id !== lookup.id
    );
  }

  return {
    state,
    fetch,
    getMetadata,
    getEditLookup,
    getNewLookup,
    doSaveLookup,
    doDeleteLookup,
    doValidateLookup,
    getSlicingInformation,
  };
}
