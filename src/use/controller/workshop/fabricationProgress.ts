import useLocalForage from "../../../use/utils/useLocalForage";
import {
  IGridSlicing,
  IRecord,
  IUpvise,
} from "../../../store/modules/upvise.d";
import { ILot, IRelease } from "./workshop.d";
import useWorkshopController from "./workshop";
import { FilterMatchMode } from "primevue/api";
import { IFabricationProgressRecord } from "./fabricationProgress.d";
import maths from "../../../use/utils/useNumberOperations";
import { IFabricationRecord } from "./fabrication.d";
import { useTableNames, WorkshopSource } from "../../../use/utils/useConstants";

export default function useControllerFabricationProgress(upvise: IUpvise) {
  const workshop = useWorkshopController(upvise);
  const fetch = () => upvise.fetch("fabricationProgress");
  const getMetadata = () => upvise.metadata("fabricationProgress");

  const getForageData = async () =>
    await useLocalForage.getDataForkeys(
      ["unybiz.projects.projects"],
      useLocalForage.getInstance("upvise", "tables")
    );

  function getLotOptions(forageData: Record<string, IRecord[]>) {
    const lotData = Object.values(upvise.entityData(useTableNames.WORKSHOP_LOT)) as unknown as ILot[];
    const releaseData = Object.values(
      upvise.entityData(workshop.releaseTable)
    ) as unknown as IRelease[];
    const fabricationData = Object.values(upvise.entityData(useTableNames.WORKSHOP_FABRICATION)) as unknown as IFabricationRecord[];

    return lotData.map((lot) => {
      const linkedProject = forageData?.["unybiz.projects.projects"]?.find(
        (project) => project.id === lot.projectid
      );
      const linkedRelease = releaseData.find(
        (release) => release.id === lot.releaseid
      );
      const linkedTeklaFabrication = fabricationData.find(
        (fab) => fab.lotid === lot.id && fab.source === WorkshopSource.TEKLA
      )
      const name = workshop.getDisplayName(
        linkedProject,
        linkedRelease,
        lot
      );
      const projectCode = (linkedProject?.code as string) ?? "";
      let estimatedTimeSpent = 0;

      if (linkedTeklaFabrication)
        estimatedTimeSpent = maths.multiply(maths.multiply(linkedTeklaFabrication.estimatedtime, 60 * 60 * 1000), lot.membercount);

      return {
        id: lot.id,
        name: linkedProject
          ? `${projectCode} - ${name}`
          : name,
        estimatedTimeSpent: estimatedTimeSpent,
      }
    });
  }

  function getSlicingInformation(selectedLotId: string) {
    const returnArray: Record<string, IGridSlicing[]> = { [useTableNames.WORKSHOP_FABRICATION_Progress]: [] };

    returnArray[useTableNames.WORKSHOP_FABRICATION_Progress].push({
      fieldNames: ["lotid"],
      displayName: "All",
      filtersToApply: {
        lotid: {
          operator: "and",
          constraints: [
            {
              value: selectedLotId || "no lot id",
              matchMode: FilterMatchMode.EQUALS,
            },
          ],
        },
      },
    });

    return returnArray;
  };

  function notPersistedCalcs() {
    const fabricationProgressData = Object.values(upvise.entityData(useTableNames.WORKSHOP_FABRICATION_Progress)) as unknown as IFabricationProgressRecord[];

    fabricationProgressData.forEach((fabProgress) => {
      fabProgress.totalTime = maths.sum(fabProgress.fabtime, fabProgress.weldtime, 0);
    });
  }

  return {
    fetch,
    getMetadata,
    getForageData,
    getLotOptions,
    getSlicingInformation,
    notPersistedCalcs,
  };
}
