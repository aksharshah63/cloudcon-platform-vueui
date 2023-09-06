import { IFabricationRecord } from "./fabrication.d";
import { IProcessingRecord } from "./processing.d";

export interface IAuditLog {
  date: number;
  datecreated: number;
  fabricationid?: string;
  id: string;
  oldvalue: string;
  owner: string;
  processingid?: string;
  reason: string;
  value: string;
}

export interface IAuditLogMapped {
  id: string;
  owner: string;
  processingid?: string;
  fabricationid?: string;
  lotid: string;
  value: IFabricationRecord | IProcessingRecord;
  oldvalue: IFabricationRecord | IProcessingRecord;
  date: number;
  datecreated: number;
  reason: string;
}

export interface ILot {
  id: string;
  projectid: string;
  releaseid: string;
  code: number;
  description: string;
  draftedtime: number;
  source: string;
  membercount: number;
  treatmentids: string;
  totalmeters: number;
}

export interface IMember {
  adjustedcount: number;
  assemblynumber: string;
  bundlecode: string;
  id: string;
  length: number;
  lotid: string;
  paintid: string;
  profile: string;
  projectid: string;
  qty: number;
  status: string;
  weight: number;
}

export interface IRelease {
  _isCalculated?: boolean;
  _date?: number;
  id: string;
  projectid: string;
  code: number;
  description: string;
  colour: string;
  name: string;
}

export interface IMappedRelease {
  id: string;
  label?: string;
  installdate: number;
  releaseid: string;
  dateallocationid?: string;
}

export interface ILotName {
  lot?: number;
  release?: number;
  stage?: number;
}
