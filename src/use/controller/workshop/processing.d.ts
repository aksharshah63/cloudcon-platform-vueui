import { useTableNames } from "../../../use/utils/useConstants";

export interface IProcessingRecord {
  _isCalculated?: boolean;
  _rowColour?: string;
  _type?: string;
  comments: string;
  equipment: string;
  id: string;
  installdate: number; // being used as the work date
  isactive: number;
  lotid: string;
  metrescompleted: number;
  metresscheduled: number;
  notes: string;
  owner: string;
  processingtime: number;
  sort: number;
  source: string;
  status: number;
  steeldeliverydate: number;
  traceabilityrequired: string;
  releaseid?: string;
  completion?: number;
  memberCount?: number;
  name?: string;
  processingStatusGroup?: number;
  projectid?: string;
  projectCode?: string;
  projectGroupName?: string;
  projectName?: string;
  timeCompleted?: number;
  timeScheduled?: number;
  totalMetres?: number;
  traceabilityNames?: string;
  dateallocationid?: string;
  projectInstallDate?: number;
  [key: `${useTableNames.CONTACTS}_${string}`]: number;
}
