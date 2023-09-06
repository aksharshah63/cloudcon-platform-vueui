export interface ISalesDealsRecord {
  _date: number;
  id: string;
  name: string;
  creationdate: number;
  duedate: number;
  owner: string;
  companyid: string;
  contactid: string;
  referenceid: string;
  amount: number;
  priority: number;
  probability: number;
  note: string;
  productid: string;
  custom: string;
  status: number;
  stage2: string;
  commission: number;
  currency: string;
  DealType: string;
  BuildType: string;
}

export interface IRecordDealsQuote {
  id: string;
  accountid: string;
  address: string;
  assetid: string;
  commission: number;
  companyid: string;
  confirmationdate: number;
  contactid: string;
  currency: string;
  custom: string;
  date: number;
  deliverydate: number;
  description: string;
  discount: number;
  duedate: number;
  hideitemprice: number;
  invoiceid: string;
  jobid: string;
  name: string;
  opportunityid: string;
  owner: string;
  paidamount: number;
  paiddate: number;
  plannermilestoneid: string;
  projectid: string;
  sent: number;
  signature: string;
  status: number;
  termfileid: string;
  terms: string;
  toolid: string;
  total: number;
  totalex: number;
  transactionfee: number;
  vat: number;
  vatincluded: number;
  wholesale: number;
}

export interface IRecordDealsQuoteProduct {
  id: string;
  activity: string;
  budgetid: string;
  commission: number;
  currency: string;
  custom: string;
  date: number;
  description: string;
  discount: number;
  plannermilestoneid: string;
  plannertaskid: string;
  prevshipqty: number;
  price: number;
  productid: string;
  productname: string;
  projectid: string;
  purchaseprice: number;
  quantity: number;
  quoteid: string;
  shipquantity: number;
  type: number;
  unitid: string;
  user: string;
  vat: number;
  Task_Activity?: string | null;
  Project?: string | null;
  LinkedId?: string | null;
  LinkedIdType?: string | null;
}

export interface IRecordDealsProduct {
  id: string;
  categoryid: string;
  code: string;
  commission: number;
  currency: string;
  custom: string;
  date: number;
  description: string;
  discount: number;
  lowstock: number;
  manufacturerid: string;
  name: string;
  owner: string;
  price: number;
  purchaseprice: number;
  status: number;
  stock: number;
  termfileid: string;
  type: number;
  unitid: string;
  vat: number;
  wholesaleprice: number;
}
