export interface IToolRecord {
  address: string;
  advertisedprice: number;
  changelog: string;
  companyid: string;
  contactid: string;
  containerid: string;
  custom: string;
  dailycost: number;
  date: number;
  geo: string;
  groupid: string;
  id: string;
  kmcost: number;
  maintenancedate: number;
  maintenanceusage: number;
  manufacturer: string;
  model: string;
  name: string;
  owner: string;
  parentid: string;
  projectid: string;
  projectname: string;
  purchasedate: number;
  purchaseprice: number;
  regionid: string;
  saleprice: number;
  serialnumber: string;
  tag: string;
  usage: number;
  warrantydate: number;
  startOdometer?: number;
  startDate?: string;
  endOdometer?: number;
  endDate?: string;
  average?: number;
  total?: number;
}

export interface IUtilizationLogs {
  date: number;
  id: string;
  note: string;
  owner: string;
  toolid: string;
  value: number;
}

export interface IMappedUtilizationlogs {
  [key: string]: Record<string, IUtilizationLogs[]>;
}
