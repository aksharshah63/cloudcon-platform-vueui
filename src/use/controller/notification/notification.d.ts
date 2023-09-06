export interface IRecordNotification {
  _type: string;
  id: string;
  isactive: number;
  message: string;
  name: string;
  notifycontacts: string;
  notifyfields: string;
  owner: string;
  timezone: string;
  type?: string | null;
  rules?: string | null;
}

export interface IRecordRule {
  _type: string;
  id: string;
  notificationid: string;
  rules: string | IRecordRuleField[];
  type: string;
  typename: string;
  name?: string | null;
  isactive?: boolean | null;
}

export interface IRecordRuleField {
  _type: string;
  fieldid: string;
  fieldname: string;
  fieldtype: string;
  ruledetails: string | Record<string, unknown>;
}
