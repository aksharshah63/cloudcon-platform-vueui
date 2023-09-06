export interface IFabricationProgressRecord {
  fabcheckstatus: number;
  fabstatus: number;
  fabtime: number;
  id: string;
  lotid: string;
  name: string;
  status: number;
  weldcheckstatus: number;
  weldstatus: number;
  weldtime: number;
  totalTime?: number;
}
