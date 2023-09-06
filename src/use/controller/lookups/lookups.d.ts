export interface ILookupRecord {
  id: string;
  lookuptype: string;
  lookupname: string;
  lookupvalue: string;
  startdate: number;
  enddate: number;
  isactive: number;
  owner: string;
  managingrole: string;
}
