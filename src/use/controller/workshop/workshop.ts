import {
  IAuditLogMapped,
  IAuditLog,
  ILot,
  IRelease,
  IMember,
  ILotName,
} from "./workshop.d";
import utils from "../../../use/function/useUtils";
import { IProcessingRecord } from "../../../use/controller/workshop/processing.d";
import { IFabricationRecord } from "../../../use/controller/workshop/fabrication.d";
import { IRecord, IUpvise } from "../../../store/modules/upvise.d";
import { isMatch, orderBy } from "lodash";
import { reactive } from "vue";
import {
  UpviseCheckboxTypeStatus,
  WorkshopSource,
} from "../../../../cloudconLibrary/utilities/useConstants";

export default function useWorkshopController(upvise: IUpvise) {
  const lotTable = "TableWorkshopLot";
  const processingTable = "TableWorkshopProcessing";
  const fabricationTable = "TableWorkshopFabrication";
  const releaseTable = "TableWorkshopRelease";
  const paintTypeTable = "TableWorkshopPainttype";
  const memberTable = "TableWorkshopMember";
  const fabLogsTable = "TableWorkshopFabricationlogs";
  const processingLogsTable = "TableWorkshopProcessinglogs";
  const mappedReleaseTable = "_Mappedrelease";
  const traceabilityProductCategoryId = "4B94C672BD07A10106C10343599102";
  const projectStageCodeField = "F124";
  const projectInstallDateField = "F6";
  let importTemplateId = "";

  const headerButtons = [
    {
      action: "teklaImport",
      tooltip: "Import members from Tekla",
      icon: "TeklaUploadSVG.svg",
    },
    {
      action: "bulkUpdate",
      tooltip: "Update Selected Records",
      icon: "pen",
    },
  ];

  const accountInfo =
    process.env.NODE_ENV == "development"
      ? { email: "test@cloudcon.com.au" }
      : JSON.parse(localStorage.getItem("accounts.current") as string);
  const accountEmail = accountInfo.email;

  function createFabricationLog(
    oldValues: IFabricationRecord,
    newValues: IFabricationRecord,
    reasonString: string,
    date?: number
  ): IAuditLog {
    const newLog = newFabricationLog(date);
    newLog.value = JSON.stringify(newValues);
    newLog.oldvalue = JSON.stringify(oldValues);
    newLog.reason = reasonString;
    newLog.fabricationid = oldValues.id;
    return newLog;
  }

  function createProcessingLog(
    oldValues: IProcessingRecord,
    newValues: IProcessingRecord,
    reasonString: string,
    date?: number
  ): IAuditLog {
    const newLog = newProcessingLog(date);
    newLog.value = JSON.stringify(newValues);
    newLog.oldvalue = JSON.stringify(oldValues);
    newLog.reason = reasonString;
    newLog.processingid = oldValues.id;
    return newLog;
  }

  function newFabricationLog(date?: number): IAuditLog {
    return {
      id: utils.generateId(),
      fabricationid: "",
      value: "{}",
      oldvalue: "{}",
      owner: accountEmail,
      datecreated: Date.now(),
      date: date ?? Date.now(),
      reason: "",
    };
  }

  function newProcessingLog(date?: number): IAuditLog {
    return {
      id: utils.generateId(),
      processingid: "",
      value: "{}",
      oldvalue: "{}",
      owner: accountEmail,
      datecreated: Date.now(),
      date: date ?? Date.now(),
      reason: "",
    };
  }

  function newFabrication(): IFabricationRecord {
    return reactive({
      completedToday: 0,
      estimatedtime: 0,
      id: utils.generateId(),
      installdate: Date.now(),
      isactive: 1,
      lotid: "",
      notes: "",
      sort: 100,
      source: WorkshopSource.MANUAL,
      toFab: 0,
      treatmentid: "",
      welderid: "",
    });
  }

  function newProcessing(): IProcessingRecord {
    return reactive({
      comments: "",
      equipment: "",
      id: utils.generateId(),
      installdate: Date.now(),
      isactive: 1,
      lotid: "",
      metrescompleted: 0,
      metresscheduled: 0,
      notes: "",
      owner: "",
      processingtime: 0,
      sort: 100,
      source: "Manual",
      status: 0,
      steeldeliverydate: Date.now(),
      traceabilityrequired: "",
    });
  }

  function newLot(
    projectId = "",
    releaseId = "",
    code = 0,
    memberCount = 0
  ): ILot {
    return reactive({
      id: utils.generateId(),
      projectid: projectId,
      releaseid: releaseId,
      code: code,
      description: "",
      draftedtime: 0,
      source: "Manual",
      membercount: memberCount,
      treatmentids: "",
      totalmeters: 0,
    });
  }

  function findLinkedLot(lotId: string) {
    const lots = Object.values(
      upvise.entityData(lotTable)
    ) as unknown as ILot[];
    return lots.find((lot) => lot.id === lotId);
  }

  function getMemberCount(id: string) {
    return Object.values(upvise.entityData(memberTable)).filter(
      (member) => member.lotid === id && member.name !== "Extension"
    ).length;
  }

  function getTotalMeters(id: string) {
    const members = Object.values(upvise.entityData(memberTable)).filter(
      (member) => member.lotid === id
    ) as unknown as IMember[];
    let totalMetres = 0;
    members.forEach((m) => {
      totalMetres += (m.length || 0) * (m.qty || 0) * 0.0001;
    });
    return totalMetres;
  }

  function getDisplayName(
    project: IRecord | null = null,
    release: IRelease | null = null,
    lot: ILot | null = null
  ) {
    const projectCustomObject = project?.custom
      ? JSON.parse(project.custom as string)
      : {};
    const stageCode = Number(projectCustomObject?.[projectStageCodeField]) || 0;

    return `Lot ${stageCode}${release?.code ?? 0}${lot?.code ?? 0}`;
  }

  function getProjectInstallDate(project: IRecord) {
    const customObject = project.custom
      ? JSON.parse(project.custom as string)
      : {};
    return Number(customObject[projectInstallDateField]) || undefined;
  }

  function getEditLinkedLot(lotId: string) {
    const linkedLot = findLinkedLot(lotId);
    return linkedLot ? reactive(utils.deepCopy(linkedLot)) : null;
  }

  function getValidSave(payload: {
    TableWorkshopLot?: ILot[];
    TableWorkshopFabrication?: IFabricationRecord[];
    TableWorkshopFabricationlogs?: IAuditLog[];
    TableWorkshopProcessing?: IProcessingRecord[];
    TableWorkshopProcessinglogs?: IAuditLog[];
  }) {
    let triggerAlert = false;
    const alertMessage = new Set();
    if (payload.TableWorkshopLot) {
      payload.TableWorkshopLot.forEach((lot) => {
        if (!lot.projectid) {
          alertMessage.add("Cannot create lots without an associated project");
          triggerAlert = true;
        }
        if (!lot.code) {
          alertMessage.add("Cannot create lots without a code (lot number)");
          triggerAlert = true;
        }
        const existingLot = getPairRecord(lot);
        if (existingLot) {
          alertMessage.add(
            "Cannot create this lot as it already exists. (A record with the same project, release and lot number already exist)"
          );
          triggerAlert = true;
        }
      });
    }
    if (triggerAlert) alert([...alertMessage].join("\n"));
    return !triggerAlert;
  }

  function doSaveModelEntities(payload: {
    TableWorkshopLot?: ILot[];
    TableWorkshopFabrication?: IFabricationRecord[];
    TableWorkshopFabricationlogs?: IAuditLog[];
    TableWorkshopProcessing?: IProcessingRecord[];
    TableWorkshopProcessinglogs?: IAuditLog[];
  }): Promise<void> {
    return upvise.update(payload as Record<string, IRecord[]>);
  }

  function getFabricationLogs(fabricationId: string): IAuditLogMapped[] {
    const logs = upvise.entityFilter(
      "TableWorkshopFabricationlogs",
      "fabricationid",
      fabricationId
    ) as unknown as IAuditLog[];

    return utils.deepCopy(logs).map((l) => {
      l.value = JSON.parse(l.value);
      l.oldvalue = JSON.parse(l.oldvalue);
      return l as unknown as IAuditLogMapped;
    });
  }

  function getProcessingLogs(processId: string): IAuditLogMapped[] {
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

  function getLatestLog(fabricationLogs: IAuditLogMapped[]) {
    return orderBy(fabricationLogs, ["date"], ["desc"])[0];
  }

  function getPairRecord(selectedLot: ILot) {
    const matchingLot = Object.values(upvise.entityData(lotTable)).find(
      (lot) =>
        lot.id !== selectedLot.id &&
        lot.projectid === selectedLot.projectid &&
        lot.releaseid === selectedLot.releaseid &&
        lot.code === selectedLot.code
    ) as unknown as ILot;
    if (!matchingLot) return null;
    return matchingLot;
  }

  function getLotNameBreakdown(name: string) {
    const lotNumber = name.split(" ")[1];
    if (!lotNumber || isNaN(Number(lotNumber))) return null;
    const number = lotNumber.split("");
    const lotCode: ILotName = {};
    lotCode.lot = Number(number.pop());
    lotCode.release = Number(number.pop());
    lotCode.stage = Number(number.pop());
    return lotCode;
  }

  function getLinkedProject(
    projectCode: string,
    stage: number,
    projects: IRecord[]
  ) {
    const matchingProjects = projects?.filter(
      (project) => project.code === projectCode
    );

    return isNaN(stage)
      ? matchingProjects[0]
      : matchingProjects.find((project) => {
          const custom = JSON.parse((project.custom as string) ?? "");
          if (custom.F124 == stage) return true;
          return false;
        });
  }

  function getLinkedRelease(
    projectId: string,
    releaseCode: number
  ): IRelease | null {
    const releases = Object.values(
      upvise.entityData(releaseTable)
    ) as unknown as IRelease[];
    const matchedReleases = releases.filter(
      (release) =>
        release.code === releaseCode && release.projectid === projectId
    );
    return matchedReleases.length > 0 ? matchedReleases[0] : null;
  }

  function getLinkedLot(
    data: IFabricationRecord | IProcessingRecord,
    linkedRelease: string,
    code: number
  ): ILot | null {
    const lots = Object.values(
      upvise.entityData(lotTable)
    ) as unknown as ILot[];
    if (!code) return null;
    const matchedLots = lots.filter(
      (lot) =>
        lot.code === code &&
        lot.projectid === data.projectid &&
        lot.releaseid === linkedRelease
    );
    return matchedLots.length > 0
      ? data.lotid
        ? matchedLots.find((lot) => data.lotid === lot.id) ?? null
        : matchedLots[0]
      : null;
  }

  function getStageProjects(forageData: Record<string, IRecord[]>) {
    const allProjects = forageData["unybiz.projects.projects"] ?? [];
    const isTopLevelProjectCustomField =
      utils.getSetting(
        forageData["system.user.settings"] ?? [],
        "PROJECTS_IS_TOP_LEVEL_PROJECT_CUSTOM_FIELD"
      ) ?? "";

    return allProjects.filter((project) => {
      const customObject = project.custom
        ? JSON.parse(project.custom as string)
        : {};
      const isTopLevelProject =
        customObject[isTopLevelProjectCustomField] ===
        UpviseCheckboxTypeStatus.TRUE;

      return !isTopLevelProject;
    });
  }

  function getCode(name: string, type: string): number | null {
    const nameArray = name.split(" ");
    const typeIndex = nameArray
      .map((x) => x.trim().toLowerCase())
      .indexOf(type.trim().toLowerCase());
    if (typeIndex == -1) return null;
    return !isNaN(Number(nameArray[typeIndex + 1]))
      ? Number(nameArray[typeIndex + 1])
      : null;
  }

  // Makes sure that logs created by things such as date changes are excluded from the total progression check
  function filterFabricationLogsForTotalCount(logs: IAuditLogMapped[]) {
    return logs.filter((log) => {
      const value = log.value as IFabricationRecord;
      const oldValue = log.oldvalue as IFabricationRecord;
      return (
        value["toFab"] != oldValue["toFab"] ||
        value["totalFabTime"] != oldValue["totalFabTime"] ||
        value["completedToday"] != oldValue["completedToday"] ||
        value["fabTime"] != oldValue["fabTime"] ||
        value["totalCompleted"] != oldValue["totalCompleted"]
      );
    });
  }

  function filterProcessingLogsForTotalCount(logs: IAuditLogMapped[]) {
    return logs.filter((log) => {
      const value = log.value as IProcessingRecord;
      const oldValue = log.oldvalue as IProcessingRecord;
      return (
        value["metrescompleted"] != oldValue["metrescompleted"] ||
        value["metresscheduled"] != oldValue["metresscheduled"]
      );
    });
  }

  function processImportData(
    importData: IProcessingRecord[] | IFabricationRecord[],
    fabrication: boolean,
    projects: IRecord[]
  ) {
    const auditToSave: IAuditLog[] = [];
    const lotsToSave: ILot[] = [];
    const processingData = Object.values(
      upvise.entityData(processingTable)
    ) as unknown as IProcessingRecord[];
    const fabricationData: IFabricationRecord[] = Object.values(
      upvise.entityData(fabricationTable)
    ) as unknown as IFabricationRecord[];
    let failedImport = false;

    importData.forEach((data: IFabricationRecord | IProcessingRecord) => {
      if (failedImport) return;

      const originalData = fabrication
        ? fabricationData.find((d) => d.id === data.id)
        : processingData.find((d) => d.id === data.id);

      if (!originalData) data.source = WorkshopSource.MANUAL;
      else data.source = originalData.source;

      const lotCode = getLotNameBreakdown(data.name || "");
      if (!lotCode) {
        alert(
          `Please enter a valid lot name. The lot name should be in the format like 'Lot 123' for example. Please correct the record and try again.`
        );
        failedImport = true;
        return;
      }
      data;

      const linkedProjectId = getLinkedProject(
        data.projectCode || "",
        lotCode?.stage ?? 0,
        projects
      )?.id as string;
      if (!linkedProjectId) {
        alert(
          `Cannot find a project associated with the following record: \n${data.projectCode} - ${data.name}. \nPlease correct, then attempt to import again. Ensure that the stage number matches the project you are attempting to import to.`
        );
        failedImport = true;
        return;
      }

      const linkedReleaseId = getLinkedRelease(
        linkedProjectId,
        lotCode?.release || 0
      )?.id;

      const linkedLot = getLinkedLot(
        data,
        linkedReleaseId ?? "",
        lotCode?.lot ?? 0
      );
      if (linkedLot) {
        if (data.memberCount) {
          linkedLot.membercount = data.memberCount;
          lotsToSave.push(linkedLot);
          data.lotid = linkedLot.id;
        } else {
          const lot = newLot(
            data.projectid,
            linkedReleaseId,
            lotCode.lot,
            data.memberCount
          );
          lotsToSave.push(lot);
          data.lotid = lot.id;
        }
      }
      if (!originalData) return;

      if (isMatch(data, originalData)) return;

      if (fabrication)
        auditToSave.push(
          createFabricationLog(
            originalData as IFabricationRecord,
            data as IFabricationRecord,
            "Log created via import."
          )
        );
      else
        auditToSave.push(
          createProcessingLog(
            originalData as IProcessingRecord,
            data as IProcessingRecord,
            "Log created via import."
          )
        );
    });

    if (failedImport) return null;
    return fabrication
      ? {
          TableWorkshopFabrication: importData as IFabricationRecord[],
          TableWorkshopFabricationlogs: auditToSave,
          TableWorkshopLot: lotsToSave,
        }
      : {
          TableWorkshopProcessing: importData as IProcessingRecord[],
          TableWorkshopProcessinglogs: auditToSave,
          TableWorkshopLot: lotsToSave,
        };
  }

  function setTemplateId(settings: IRecord[]) {
    importTemplateId =
      (settings.find((s) => s.id === "WORKSHOP_IMPORT_TEMPLATE")
        ?.value as string) ?? "";
    return;
  }

  function openTeklaImportForm() {
    window.eval("Forms.newForm('" + importTemplateId + "')");
    return;
  }

  return {
    lotTable,
    processingTable,
    fabricationTable,
    releaseTable,
    paintTypeTable,
    memberTable,
    fabLogsTable,
    processingLogsTable,
    mappedReleaseTable,
    headerButtons,
    traceabilityProductCategoryId,
    projectStageCodeField,
    projectInstallDateField,
    importTemplateId,
    newFabrication,
    newProcessing,
    newLot,
    findLinkedLot,
    getMemberCount,
    getTotalMeters,
    getDisplayName,
    getProjectInstallDate,
    getEditLinkedLot,
    getValidSave,
    doSaveModelEntities,
    createFabricationLog,
    createProcessingLog,
    getFabricationLogs,
    getProcessingLogs,
    getLatestLog,
    getPairRecord,
    getLinkedRelease,
    getLinkedLot,
    getStageProjects,
    getCode,
    filterFabricationLogsForTotalCount,
    filterProcessingLogsForTotalCount,
    processImportData,
    setTemplateId,
    openTeklaImportForm,
  };
}
