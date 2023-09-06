import {
  IGridSlicing,
  IRecord,
  ISort,
  IUpvise,
} from "../../../store/modules/upvise.d";
import { IProcessingRecord } from "./processing.d";
import { reactive } from "vue";
import { IAuditLog, IAuditLogMapped, ILot, IRelease } from "./workshop.d";
import useWorkshopController from "../../../use/controller/workshop/workshop";
import useDateAllocationController from "../../../use/function/dateAllocationController";
import useLocalForage from "../../../use/utils/useLocalForage";
import maths from "../../../use/utils/useNumberOperations";
import utils from "../../../use/function/useUtils";
import { IRecordDealsProduct } from "../sales/deals.d";
import { FilterMatchMode } from "primevue/api";
import {
  DateAllocationTypes,
  WorkshopSource,
} from "../../../use/utils/useConstants";

export default function useControllerProcessing(upvise: IUpvise) {
  const state = upvise.state();

  const fetch = () => upvise.fetch("processing");
  const getMetadata = () => upvise.metadata("processing");
  const dateAllocationController = useDateAllocationController();
  const workshopController = useWorkshopController(upvise);
  const allocationType = DateAllocationTypes.DAY;
  const allocationField = "installdate";

  const getForageData = async () =>
    await useLocalForage.getDataForkeys(
      [
        "unybiz.projects.projects",
        "unybiz.contacts.contacts",
        "unybiz.sales.products",
        "system.user.settings",
      ],
      useLocalForage.getInstance("upvise", "tables")
    );

  const getSlicingInformation = (): Record<string, IGridSlicing[]> => {
    const returnArray: Record<string, IGridSlicing[]> = {
      [dateAllocationController.tableName]: [],
      TableWorkshopProcessing: [],
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

    returnArray["TableWorkshopProcessing"].push({
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

    returnArray["TableWorkshopProcessing"].push({
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

    returnArray["TableWorkshopProcessing"].push({
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

  function getEditProcess(
    processId: string,
    manual = false
  ): IProcessingRecord | null {
    const originalProcess = upvise.recordData(
      workshopController.processingTable,
      processId
    ) as unknown as IProcessingRecord;
    const lotid = originalProcess["lotid"];
    const editProcessArray = upvise
      .entityFilter(workshopController.processingTable, "lotid", lotid)
      .filter((entry: Record<string, unknown>) => {
        return (
          entry["source"] ===
          (manual ? WorkshopSource.MANUAL : WorkshopSource.TEKLA)
        );
      }) as unknown as IProcessingRecord[];

    if (editProcessArray.length > 0) {
      return reactive(
        utils.deepCopy(editProcessArray.pop() as unknown as IProcessingRecord)
      );
    } else return null;
  }

  function getEditLot(lotId: string): ILot {
    const editLot = upvise.recordData(
      workshopController.lotTable,
      lotId
    ) as unknown as ILot;
    return reactive(utils.deepCopy(editLot));
  }

  function getTraceabilityOptions(
    products: IRecordDealsProduct[]
  ): IRecordDealsProduct[] {
    return products.filter(
      (product) =>
        product.categoryid === workshopController.traceabilityProductCategoryId
    );
  }

  function archiveProcessing(processingId: string) {
    const originalProcess = upvise.recordData(
      workshopController.processingTable,
      processingId
    ) as unknown as IProcessingRecord;
    const copyOfOriginal = utils.deepCopy(originalProcess);
    copyOfOriginal.isactive = 0;
    const newAuditLog = workshopController.createProcessingLog(
      originalProcess,
      copyOfOriginal,
      "Archive"
    );
    //
    return workshopController.doSaveModelEntities({
      TableWorkshopProcessing: [copyOfOriginal],
      TableWorkshopProcessinglogs: [newAuditLog],
    });
  }

  function validateProcessChanges(processModel: IProcessingRecord): boolean {
    //Get the value from state to compare to
    const originalProcess = upvise.recordData(
      workshopController.processingTable,
      processModel.id
    ) as unknown as IProcessingRecord;
    if (!originalProcess) return true;
    //Check if the original was tekla or manual
    const isManual = originalProcess.source !== "tekla";
    if (isManual) return true;
    //So need to make sure only total metres / metres completed are changed
    return (
      processModel.isactive == originalProcess.isactive &&
      processModel.lotid == originalProcess.lotid &&
      processModel.processingtime == originalProcess.processingtime &&
      processModel.steeldeliverydate == originalProcess.steeldeliverydate &&
      processModel.source == originalProcess.source
    );
  }

  function getInitialSort() {
    const sortOptions: ISort[] = [];
    sortOptions.push({
      field: "label",
      order: 1,
    } as ISort);
    sortOptions.push({
      field: "description",
      order: 1,
    } as ISort);
    sortOptions.push({
      field: "installdate",
      order: 1,
    } as ISort);
    sortOptions.push({
      field: "name",
      order: 1,
    } as ISort);
    sortOptions.push({
      field: "source",
      order: 1,
    });
    return sortOptions;
  }

  function notPersistedCalcs(forageData: Record<string, IRecord[]>) {
    const processingData = Object.values(
      upvise.entityData(workshopController.processingTable)
    ) as unknown as IProcessingRecord[];
    const releaseData = Object.values(
      upvise.entityData(workshopController.releaseTable)
    ) as unknown as IRelease[];

    processingData
      // .filter((entry) => entry._isCalculated === false)
      .forEach((entry) => {
        _updateProcessingEntry(entry, releaseData, forageData);
        // entry._isCalculated = true;
      });

    dateAllocationController.updateAllocationRecords(
      allocationType,
      processingData as unknown as IRecord[],
      upvise,
      allocationField
    );
  }

  async function populateProcessingData(forageData: Record<string, IRecord[]>) {
    const processingData = Object.values(
      upvise.entityData(workshopController.processingTable)
    ) as unknown as IProcessingRecord[];
    const releaseData = Object.values(
      upvise.entityData(workshopController.releaseTable)
    ) as unknown as IRelease[];

    processingData.forEach((entry) => {
      _updateProcessingEntry(entry, releaseData, forageData);
    });

    dateAllocationController.initialiseAllocations(
      upvise,
      allocationType,
      processingData as unknown as IRecord[],
      allocationField
    );

    dateAllocationController.deleteUnusedAllocations(
      upvise,
      Object.values(
        upvise.entityData(dateAllocationController.tableName)
      ) as unknown as IRecord[],
      processingData as unknown as IRecord[]
    );
  }

  function _updateProcessingEntry(
    entry: IProcessingRecord,
    releaseData: IRelease[],
    forageData: Record<string, IRecord[]>
  ) {
    const linkedLot = workshopController.findLinkedLot(entry.lotid);

    if (linkedLot) {
      const linkedProject = forageData["unybiz.projects.projects"]?.find(
        (project) => project.id === linkedLot.projectid
      );
      const linkedRelease = releaseData.find(
        (release) => release.id === linkedLot.releaseid
      );

      if (linkedProject)
        entry.projectInstallDate =
          workshopController.getProjectInstallDate(linkedProject);

      const totalMetres =
        entry.source == WorkshopSource.MANUAL
          ? linkedLot.totalmeters
          : maths.round(workshopController.getTotalMeters(linkedLot.id));

      if (linkedRelease) entry["releaseid"] = linkedRelease.id;

      entry["memberCount"] =
        entry.source == WorkshopSource.MANUAL
          ? linkedLot.membercount
          : workshopController.getMemberCount(linkedLot.id as string);
      entry["name"] = workshopController.getDisplayName(
        linkedProject,
        linkedRelease,
        linkedLot
      );
      entry["projectid"] = (linkedProject?.id as string) ?? "";
      entry["projectName"] = (linkedProject?.name as string) ?? "";
      entry["projectCode"] = (linkedProject?.code as string) ?? "";
      entry["totalMetres"] = maths.round(totalMetres);
      entry["completion"] = maths.round(
        entry["totalMetres"]
          ? (((entry["metrescompleted"] as number) ?? 0) /
              (entry["totalMetres"] as number)) *
              100
          : 0
      );
      entry["timeCompleted"] = maths.multiply(
        entry["processingtime"],
        entry["metrescompleted"]
      );
      entry["timeScheduled"] = maths.multiply(
        entry["processingtime"],
        entry["metresscheduled"]
      );
      entry["_rowColour"] = linkedRelease?.colour || "";
    }
  }

  function getAuditLogs(processId: string): IAuditLogMapped[] {
    const logs = upvise.entityFilter(
      "TableWorkshopProcessinglogs",
      "processingid",
      processId
    ) as unknown as IAuditLog[];

    return utils.deepCopy(logs).map((l) => {
      l.value = JSON.parse(l.value);
      l.oldvalue = JSON.parse(l.oldvalue);
      return l as unknown as IAuditLogMapped;
    });
  }

  return {
    state,
    fetch,
    getMetadata,
    getForageData,
    getSlicingInformation,
    getEditProcess,
    getEditLot,
    getTraceabilityOptions,
    notPersistedCalcs,
    populateProcessingData,
    getInitialSort,
    validateProcessChanges,
    getAuditLogs,
    archiveProcessing,
  };
}
