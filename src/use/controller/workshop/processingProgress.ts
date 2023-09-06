import useLocalForage from "../../../use/utils/useLocalForage";
import {
  IGridSlicing,
  IRecord,
  IUpvise,
} from "../../../store/modules/upvise.d";
import { FilterMatchMode } from "primevue/api";
import useWorkshopController from "./workshop";
import { IProcessingRecord } from "./processing.d";
import { IRelease } from "./workshop.d";
import { IProcessingEquipmentRecord } from "./processingProgress.d"
import { reactive } from "vue";
import utils from "../../../use/function/useUtils";
import { useTableNames } from "../../../use/utils/useConstants";

export default function useControllerProcessingProgress(upvise: IUpvise) {
  const workshop = useWorkshopController(upvise);
  const fetch = () => upvise.fetch("processingProgress");
  const getMetadata = () => upvise.metadata("processingProgress");

  const getForageData = async () =>
    await useLocalForage.getDataForkeys([
      "unybiz.contacts.contacts",
      "unybiz.projects.groups",
      "unybiz.projects.projects",
      "system.user.settings"
    ], useLocalForage.getInstance("upvise", "tables")
    );

  function getSlicingInformation() {
    const returnArray: Record<string, IGridSlicing[]> = { TableWorkshopProcessing: [] };

    returnArray["TableWorkshopProcessing"].push({
      fieldNames: ["source"],
      displayName: "All",
      filtersToApply: {
        source: {
          operator: "and",
          constraints: [
            {
              value: "Tekla",
              matchMode: FilterMatchMode.EQUALS,
            },
          ],
        },
      },
    });

    return returnArray;
  };

  function getEditProcessing(processingId: string): IProcessingRecord {
    const editProcessing = upvise.recordData(
      useTableNames.WORKSHOP_PROCESSING,
      processingId
    ) as unknown as IProcessingRecord;

    return reactive(utils.deepCopy(editProcessing));
  }

  function doSaveProcessing(processingRecords: IProcessingRecord[]): Promise<void> {
    const payload = {
      [useTableNames.WORKSHOP_PROCESSING]: processingRecords as unknown as IRecord[],
    } as Record<string, IRecord[]>;
    return upvise.update(payload);
  };

  function notPersistedCalcs(forageData: Record<string, IRecord[]>) {
    const processingData = Object.values(
      upvise.entityData(workshop.processingTable)
    ) as unknown as IProcessingRecord[];
    const processingEquipmentData = Object.values(
      upvise.entityData(useTableNames.WORKSHOP_PROCESSING_EQUIPMENT)
    ) as unknown as IProcessingEquipmentRecord[];
    const releaseData = Object.values(
      upvise.entityData(workshop.releaseTable)
    ) as unknown as IRelease[];
    const processingStatusYellowGroupIds = (forageData["system.user.settings"]
      ?.find((setting) => setting.id === "PROCESSING_STATUS_YELLOW_PROJECT_GROUPS")
      ?.value as string)
      ?.split("|") ?? [];
    const processingStatusOrangeGroupIds = (forageData["system.user.settings"]
      ?.find((setting) => setting.id === "PROCESSING_STATUS_ORANGE_PROJECT_GROUPS")
      ?.value as string)
      ?.split("|") ?? [];

    processingData
      .forEach((entry) => {
        _updateProcessingEntry(entry, releaseData, processingEquipmentData, forageData, processingStatusYellowGroupIds, processingStatusOrangeGroupIds);
      });
  }

  function _updateProcessingEntry(
    entry: IProcessingRecord,
    releaseData: IRelease[],
    processingEquipmentData: IProcessingEquipmentRecord[],
    forageData: Record<string, IRecord[]>,
    processingStatusYellowGroupIds: string[],
    processingStatusOrangeGroupIds: string[]
  ) {
    const linkedLot = workshop.findLinkedLot(entry.lotid);

    if (linkedLot) {
      const linkedProject = forageData?.["unybiz.projects.projects"]?.find(
        (project) => project.id === linkedLot.projectid
      );
      const linkedRelease = releaseData.find(
        (release) => release.id === linkedLot.releaseid
      );
      const linkedProcessingEquipment = processingEquipmentData.filter(
        (equipment) => equipment.processingprogressid === entry.id
      );
      const projectCode = (linkedProject?.code as string) ?? "";
      const projectGroup = (linkedProject?.groupid as string) ?? "";
      const name = workshop.getDisplayName(
        linkedProject,
        linkedRelease,
        linkedLot
      );

      entry.name = linkedProject
        ? `${projectCode} - ${name}`
        : name;
      entry.projectGroupName = (forageData?.["unybiz.projects.groups"]?.find(
        (group) => group.id === projectGroup
      )?.name as string) ?? "";

      linkedProcessingEquipment.forEach((equipment) => {
        const equipmentId = equipment.equipmentid;
        //@ts-ignore
        //Not sure why this gives a compile error
        entry[`${useTableNames.CONTACTS}_${equipmentId}`] = equipment.status;
      });
      
      if (processingStatusYellowGroupIds.includes(projectGroup)) entry.processingStatusGroup = 1;
      else if (processingStatusOrangeGroupIds.includes(projectGroup)) entry.processingStatusGroup = 2;
    }
  }

  return {
    fetch,
    getMetadata,
    getForageData,
    getSlicingInformation,
    getEditProcessing,
    doSaveProcessing,
    notPersistedCalcs,
  };
}
