import {
  IGridSlicing,
  IRecord,
  ISort,
  IUpvise,
} from "../../../store/modules/upvise.d";
import useDateAllocationController from "../../../use/function/dateAllocationController";
import { IFabricationRecord } from "./fabrication.d";
import { reactive } from "vue";
import {
  IAuditLog,
  IAuditLogMapped,
  ILot,
  IMember,
  IRelease,
} from "./workshop.d";
import useLocalForage from "../../../use/utils/useLocalForage";
import useWorkshopController from "../../../use/controller/workshop/workshop";
import maths from "../../../use/utils/useNumberOperations";
import utils from "../../../use/function/useUtils";
import { FilterMatchMode } from "primevue/api";
import {
  DateAllocationTypes,
  WorkshopSource,
} from "../../../use/utils/useConstants";

export default function useControllerFabrication(upvise: IUpvise) {
  const dateAllocationController = useDateAllocationController();
  const workshop = useWorkshopController(upvise);
  const state = upvise.state();
  const allocationType = DateAllocationTypes.DAY;
  const allocationField = "installdate";

  const fetch = () => upvise.fetch("fabrication");
  const getMetadata = () => upvise.metadata("fabrication");

  const getForageData = async () =>
    await useLocalForage.getDataForkeys(
      [
        "unybiz.projects.projects",
        "unybiz.contacts.contacts",
        "system.user.settings",
      ],
      useLocalForage.getInstance("upvise", "tables")
    );

  const getSlicingInformation = (): Record<string, IGridSlicing[]> => {
    const returnArray: Record<string, IGridSlicing[]> = {
      [dateAllocationController.tableName]: [],
      TableWorkshopFabrication: [],
    };

    returnArray[dateAllocationController.tableName].push({
      fieldNames: [""],
      displayName: "Active",
      filtersToApply: {
        none: {
          operator: "and",
          constraints: [],
        },
      },
    });

    returnArray[dateAllocationController.tableName].push({
      fieldNames: [""],
      displayName: "Inactive",
      filtersToApply: {
        none: {
          operator: "and",
          constraints: [],
        },
      },
    });

    returnArray[dateAllocationController.tableName].push({
      fieldNames: [""],
      displayName: "All",
      filtersToApply: {
        none: {
          operator: "and",
          constraints: [],
        },
      },
    });

    returnArray["TableWorkshopFabrication"].push({
      fieldNames: ["isactive"],
      displayName: "Active",
      filtersToApply: {
        isactive: {
          operator: "and",
          constraints: [
            {
              value: 1,
              matchMode: FilterMatchMode.EQUALS,
            },
          ],
        },
      },
    });

    returnArray["TableWorkshopFabrication"].push({
      fieldNames: ["isactive"],
      displayName: "Inactive",
      filtersToApply: {
        isactive: {
          operator: "and",
          constraints: [
            {
              value: 0,
              matchMode: FilterMatchMode.EQUALS,
            },
          ],
        },
      },
    });

    returnArray["TableWorkshopFabrication"].push({
      fieldNames: [""],
      displayName: "All",
      filtersToApply: {
        none: {
          operator: "and",
          constraints: [],
        },
      },
    });

    return returnArray;
  };

  const getEditFabrication = (
    fabId: string,
    manual = false
  ): IFabricationRecord | null => {
    const originalFab = upvise.recordData(
      workshop.fabricationTable,
      fabId
    ) as unknown as IFabricationRecord;
    const lotid = originalFab["lotid"];
    const editFabArray = upvise
      .entityFilter(workshop.fabricationTable, "lotid", lotid)
      .filter((entry: Record<string, unknown>) => {
        return (
          entry["source"] ===
          (manual ? WorkshopSource.MANUAL : WorkshopSource.TEKLA)
        );
      }) as unknown as IFabricationRecord[];

    if (editFabArray.length > 0) {
      return reactive(
        utils.deepCopy(editFabArray.pop() as unknown as IFabricationRecord)
      );
    } else return null;
  };

  const getEditLot = (id: string): ILot => {
    const editLot = upvise.recordData(workshop.lotTable, id) as unknown as ILot;
    return reactive(JSON.parse(JSON.stringify(editLot)));
  };

  function archiveFabrication(id: string) {
    const originalFab = upvise.recordData(
      workshop.fabricationTable,
      id
    ) as unknown as IFabricationRecord;
    const copyOfOriginal = JSON.parse(JSON.stringify(originalFab));
    copyOfOriginal.isactive = 0;
    const newAuditLog = workshop.createFabricationLog(
      originalFab,
      copyOfOriginal,
      "Archive"
    );
    return workshop.doSaveModelEntities({
      TableWorkshopFabrication: [copyOfOriginal],
      TableWorkshopFabricationlogs: [newAuditLog],
    });
  }

  async function initialiseData(forageData: Record<string, IRecord[]>) {
    const fabricationRecords = Object.values(
      upvise.entityData(workshop.fabricationTable)
    ) as unknown as IFabricationRecord[];
    const releaseData = Object.values(
      upvise.entityData(workshop.releaseTable)
    ) as unknown as IRelease[];

    dateAllocationController.initialiseAllocations(
      upvise,
      allocationType,
      fabricationRecords as unknown as IRecord[],
      allocationField
    );

    fabricationRecords.forEach((fabrication) => {
      _updateFabrication(fabrication, releaseData, forageData);
    });

    dateAllocationController.deleteUnusedAllocations(
      upvise,
      Object.values(
        upvise.entityData(dateAllocationController.tableName)
      ) as unknown as IRecord[],
      fabricationRecords as unknown as IRecord[]
    );
  }

  function notPersistedCalcs(forageData: Record<string, IRecord[]>) {
    const fabricationData = Object.values(
      upvise.entityData(workshop.fabricationTable)
    ) as unknown as IFabricationRecord[];
    const releaseData = Object.values(
      upvise.entityData(workshop.releaseTable)
    ) as unknown as IRelease[];

    fabricationData
      // .filter((lot) => lot._isCalculated === false)
      .forEach((lot) => {
        _updateFabrication(lot, releaseData, forageData);
        // lot._isCalculated = true;
      });

    dateAllocationController.updateAllocationRecords(
      allocationType,
      fabricationData as unknown as IRecord[],
      upvise,
      allocationField
    );
  }

  function _updateFabrication(
    fabrication: IFabricationRecord,
    releaseData: IRelease[],
    forageData: Record<string, IRecord[]>
  ) {
    const linkedLot = workshop.findLinkedLot(fabrication.lotid);

    if (!linkedLot) return;

    const fabricationLogs = workshop.getFabricationLogs(fabrication.id);
    // const latestLog =
    //   fabricationLogs.length > 0
    //     ? (workshop.getLatestLog(fabricationLogs)
    //         .value as unknown as IFabricationRecord)
    //     : null;
    const linkedProject = forageData["unybiz.projects.projects"]?.find(
      (project) => project.id === linkedLot.projectid
    );
    const linkedRelease = releaseData.find(
      (release) => release.id === linkedLot.releaseid
    );

    if (linkedProject)
      fabrication.projectInstallDate =
        workshop.getProjectInstallDate(linkedProject);

    fabrication.name = workshop.getDisplayName(
      linkedProject,
      linkedRelease,
      linkedLot
    );
    fabrication.projectName = (linkedProject?.name as string) ?? "";
    fabrication.projectCode = (linkedProject?.code as string) ?? "";

    if (!fabrication.source) fabrication.source = WorkshopSource.MANUAL;

    fabrication.treatmentid =
      fabrication.source == WorkshopSource.MANUAL
        ? fabrication.treatmentid
        : getPaintIdsFromMembers(fabrication);

    fabrication.memberCount =
      fabrication.source == WorkshopSource.MANUAL
        ? linkedLot.membercount
        : workshop.getMemberCount(linkedLot.id as string);

    fabrication.totalFabTime = maths.round(
      (fabrication.memberCount *
        fabrication.estimatedtime *
        fabrication.toFab) /
        100
    );

    fabrication.fabTime = maths.round(
      (fabrication.memberCount *
        fabrication.estimatedtime *
        fabrication.completedToday) /
        100
    );

    fabrication.totalCompleted = getTotalCompleted(fabricationLogs);

    fabrication._rowColour = linkedRelease?.colour || "";
  }

  function getPaintIdsFromMembers(fabrication: IFabricationRecord) {
    const members = Object.values(
      upvise.entityData(workshop.memberTable)
    ).filter(
      (member) => member.lotid == fabrication.lotid
    ) as unknown as IMember[];
    return [...new Set(members.map((member) => member.paintid))].join("|");
  }

  function getTotalCompleted(allAuditLogs: IAuditLogMapped[]) {
    let total = 0;
    workshop.filterFabricationLogsForTotalCount(allAuditLogs).forEach((log) => {
      const value = log.value as IFabricationRecord;
      if (value) total += value.completedToday || 0;
    });
    return total;
  }

  function getInitialSort() {
    const sortOptions: ISort[] = [
      {
        field: "installdate",
        order: 1,
      },
      {
        field: "projectName",
        order: 1,
      },
      {
        field: "source",
        order: 1,
      },
    ];
    return sortOptions;
  }

  function getAuditLogs(lotid: string): {
    processing: IAuditLog[];
    fabrication: IAuditLog[];
  } {
    const returnData: {
      processing: IAuditLog[];
      fabrication: IAuditLog[];
    } = reactive({
      processing: [],
      fabrication: [],
    });
    returnData.fabrication = Object.values(
      upvise.entityData(workshop.fabLogsTable)
    ).filter((l) => lotid == l.lotid) as unknown as IAuditLog[];
    returnData.processing = Object.values(
      upvise.entityData(workshop.processingLogsTable)
    ).filter((l) => lotid == l.lotid) as unknown as IAuditLog[];

    return returnData;
  }

  // TODO: Need a way to specify this dynamically, currently hardcoded for stegr
  function getQualifiedWelders(contacts: IRecord[]) {
    return contacts.filter((contact) => {
      if (
        typeof contact.groupid === "string" &&
        typeof contact.custom === "string"
      )
        return (
          (contact.groupid.includes("1D233887E0D6C5E316493B0B475A6A") ||
            contact.groupid.includes("AFC011F65B4303924BBA157D2B6A59")) &&
          (contact.custom.includes("2C3515DFB20DB865FB9DD5176DD992") ||
            contact.custom.includes("8DAAD9D5CC9C3AD86104852B905257"))
        );
    });
  }

  return {
    state,
    fetch,
    getMetadata,
    getForageData,
    getSlicingInformation,
    getEditFabrication,
    getEditLot,
    initialiseData,
    notPersistedCalcs,
    getInitialSort,
    getAuditLogs,
    getQualifiedWelders,
    archiveFabrication,
  };
}
