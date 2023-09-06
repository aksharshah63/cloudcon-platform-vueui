import axios from "axios";
import { IGridSlicing, IUpvise } from "../../../store/modules/upvise.d";

export default function useControllerEquipmentDetails(upvise: IUpvise) {
  const state = upvise.state();
  const fetch = () => upvise.fetch("equipment");
  const getMetadata = () => upvise.metadata("equipment");

  const getForms = () => upvise.fetch("forms");

  const getCalcs = async () => {
    const response = await axios.get(
      "https://localhost:5000/api/test/Get/Calculations?calculationType=equipmentDetails",
      {
        headers: {
          "cloudcon-api-key": upvise.upviseApiKey,
          "cloudcon-user": upvise.upviseUser,
        },
      }
    );
    const equipmentDetails = response.data;
    console.log(response.data);
    return equipmentDetails;
  };

  function getSlicingInformation(): Record<string, IGridSlicing[]> {
    const returnArray: Record<string, IGridSlicing[]> = { TableToolsTools: [] };
    returnArray["TableToolsTools"].push({
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
    const riskTypes = lookupsData.filter((l) => l.lookuptype === "Risk Type");
    riskTypes.forEach((entry: Record<string, unknown>) => {
      if (!typesCreated.includes(entry.lookupname as string)) {
        returnArray["TableToolsTools"].push({
          fieldNames: ["riskTypeName"],
          displayName: entry.lookupname as string,
          filtersToApply: {
            riskTypeName: {
              operator: "and",
              constraints: [
                {
                  value: entry.lookupname as string,
                  matchMode: "equals",
                },
              ],
            },
          },
        });
        typesCreated.push(entry.lookupname as string);
      }
    });
    return returnArray;
  }

  return {
    state,
    fetch,
    getMetadata,
    getForms,
    getCalcs,
    getSlicingInformation,
  };
}
