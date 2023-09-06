export interface IRiskRecord {
  id: string;
  name: string;
  type: string;
  severity: number;
  probablity: number;
  measures: string;
  note: string;
  procedureid: string;
  risktypeid: string;
  departmentid: string;
  activityid: string;
  hazardid: string;
  consequence: number;
  likelihood: number;
  controlmeasureid: string;
  postconsequence: number;
  postlikelihood: number;
  riskTypeName?: string;
  consequenceName?: string;
  likelihoodName?: string;
  postConsequenceName?: string;
  postLikelihoodName?: string;
}
