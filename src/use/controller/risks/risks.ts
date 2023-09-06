import {
  IGridSlicing,
  IUpvise,
  IRecord,
} from "../../../store/modules/upvise.d";
import { IRiskRecord } from "../../../use/controller/risks/risks.d";
import { reactive } from "vue";
import label from "../../function/labels";

export default function useControllerRisks(upvise: IUpvise) {
  const getMetadata = () => upvise.metadata("risks");
  const fetch = () => upvise.fetch("risks");

  function getInitialNames() {
    const riskData = Object.values(
      upvise.entityData("TableQhseRisks")
    ) as IRecord[];
    const lookupsData = upvise.entityData("TableEmployeedashboardLookups");

    riskData.forEach((r) => {
      const riskType = lookupsData[r.risktypeid as string];
      if (riskType) r.riskTypeName = riskType.lookupvalue as unknown as string;
      const activity = lookupsData[r.activityid as string];
      if (activity) r.activityName = activity.lookupvalue as unknown as string;
      r.consequenceName = label.consequence[r.consequence as number];
      r.likelihoodName = label.likelihood[r.likelihood as number];
      r.postConsequenceName = label.consequence[r.postconsequence as number];
      r.postLikelihoodName = label.likelihood[r.postlikelihood as number];
    });
  }

  const getEditRisk = (riskId: string): IRiskRecord => {
    const editRisk = upvise.recordData(
      "TableQhseRisks",
      riskId
    ) as unknown as IRiskRecord;

    return reactive(JSON.parse(JSON.stringify(editRisk)));
  };

  const getNewRisk = () => {
    return reactive({
      id: "",
      name: "",
      risktypeid: "",
      departmentid: "",
      activityid: "",
      hazardid: "",
      consequence: 0,
      likelihood: 0,
      controlmeasureid: "",
      postconsequence: 0,
      postlikelihood: 0,
    } as IRiskRecord);
  };

  const doSaveRisk = (TableQhseRisks: unknown): Promise<void> => {
    const payload = {
      TableQhseRisks: TableQhseRisks as unknown as IRecord[],
    } as Record<string, IRecord[]>;
    upvise.updateStore(payload);
    return Promise.resolve();
  };

  const doDeleteRisk = (TableQhseRisk: IRiskRecord): Promise<void> => {
    const copyTableQhseRisk = JSON.parse(
      JSON.stringify(TableQhseRisk)
    ) as IRecord;

    copyTableQhseRisk._type = "DELETE";

    return upvise.update({
      TableQhseRisks: [copyTableQhseRisk],
    });
  };

  const doValidateRisk = (risk: IRiskRecord) => {
    if (!risk.name) {
      alert("Please input a name");
      return false;
    }
    return true;
  };
  function getSlicingInformation(): Record<string, IGridSlicing[]> {
    const returnArray: Record<string, IGridSlicing[]> = { TableQhseRisks: [] };
    returnArray["TableQhseRisks"].push({
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
        returnArray["TableQhseRisks"].push({
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
    fetch,
    getMetadata,
    getInitialNames,
    getEditRisk,
    getNewRisk,
    doSaveRisk,
    doDeleteRisk,
    doValidateRisk,
    getSlicingInformation,
  };
}
