import { WorkshopSource } from "../../../use/utils/useConstants";

export interface IFabricationRecord {
  _isCalculated?: boolean;
  _rowColour?: string;
  _type?: string;
  completedToday: number;
  estimatedtime: number;
  id: string;
  installdate: number; // being used as the work date
  isactive: number;
  lotid: string;
  notes: string;
  sort: number;
  source: WorkshopSource;
  toFab: number;
  treatmentid: string;
  welderid: string;
  releaseid?: string;
  dateallocationid?: string;
  projectid?: string;
  projectCode?: string;
  projectName?: string;
  treatment?: string;
  welderName?: string;
  memberCount?: number;
  totalFabTime?: number;
  fabTime?: number;
  totalCompleted?: number;
  name?: string;
  lotCode?: number;
  releaseCode?: number;
  projectInstallDate?: number;
}
