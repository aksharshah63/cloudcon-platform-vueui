export interface IBaywatchBayinfo {
  baycontactid: string;
  currentcontactid: string;
  currentjob: string;
  id: string;
  notes: string;
  lastscanstage: string;
  lastscantime: number;
  lotid: string;
  bayContactName?: string | null;
  currentContactName?: string | null;
  currentJobBundle?: string | null;
  currentJobName?: string | null;
  formattedLastScanTime?: string | null;
  releaseColour?: string;
}

export interface IBaywatchBundle {
  id: string;
  name: string;
}
