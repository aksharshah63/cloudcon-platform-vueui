import { PlannerTaskProgressType } from "../../../use/utils/useConstants";

export interface IRecordPlannerMilestone {
  // _date: any;
  _type?: string;
  id: string;
  name: string;
  description: string;
  projectid: string;
  milestoneid?: string | null;
  startdate: string;
  enddate: string;
  budget: number;
  budgettype: number;
  rank: number;
  wbscode: string;
  actualsTotal?: number | null;
  budgetForecast?: number | null;
  duration?: number | null;
  forecast?: number | null;
  requiredFormatted?: string;
  progressFormatted?: string;
  velocity?: number | null;
  velocityPercentage?: number | null;
  approvedActualsTotal?: number | null;
  unapprovedActualsTotal?: number | null;
  actualsProfitability?: number | null;
  actualsProfitabilityPercentage?: number | null;
  actualsProfitabilityBudget?: number | null;
  actualsProfitabilityBudgetPercentage?: number | null;
  actualsProfitabilityTarget?: number | null;
  actualsProfitabilityTargetPercentage?: number | null;
  actualsFinancialCompletionBudgetPercentage?: number | null;
  originalTotal?: number | null;
  purchaseTotal?: number | null;
  purchaseProfitability?: number | null;
  purchaseProfitabilityPercentage?: number | null;
  targetProfitability?: number | null;
  targetProfitabilityPercentage?: number | null;
  targetProfitabilityBudget?: number | null;
  targetProfitabilityBudgetPercentage?: number | null;
}

export interface IRecordPlannerTask {
  // _date: any;
  _type?: string;
  id: string;
  name: string;
  description: string;
  projectid: string;
  milestoneid: string;
  startdate: string;
  enddate: string;
  budget: number;
  budgettype: number; // 0 = budget is calculated, 1 = budget is manually set
  rank: number;
  wbscode: string;
  status: number;
  output: string;
  outputuom: string;
  outputamount: number;
  outputprogress?: number | null;
  forecast: number;
  progress: number;
  progresstype: PlannerTaskProgressType;
  actualsTotal?: number | null;
  budgetForecast?: number | null;
  duration?: number | null;
  requiredFormatted?: string;
  progressFormatted?: string;
  progressPercentage?: number;
  progressUnitValue?: number;
  velocity?: number | null;
  velocityPercentage?: number | null;
  approvedActualsTotal?: number | null;
  unapprovedActualsTotal?: number | null;
  actualsProfitability?: number | null;
  actualsProfitabilityPercentage?: number | null;
  actualsProfitabilityBudget?: number | null;
  actualsProfitabilityBudgetPercentage?: number | null;
  actualsProfitabilityTarget?: number | null;
  actualsProfitabilityTargetPercentage?: number | null;
  actualsFinancialCompletionBudgetPercentage?: number | null;
  originalTotal?: number | null;
  purchaseTotal?: number | null;
  purchaseProfitability?: number | null;
  purchaseProfitabilityPercentage?: number | null;
  targetProfitability?: number | null;
  targetProfitabilityPercentage?: number | null;
  targetProfitabilityBudget?: number | null;
  targetProfitabilityBudgetPercentage?: number | null;
}

export interface IRecordPlannerBudget {
  // _date: any;
  _showInTable?: boolean;
  _showInTableId?: string;
  _type?: string;
  id: string;
  projectid: string;
  taskid: string;
  resourceid: string;
  resourcetype: string;
  resourcecategory: string | IRecordPlannerResourceCategory;
  qty: number;
  unitprice: number | null;
  description: string;
  uom: string;
  original: string | IRecordPlannerOriginalBudget;
  status: number;
  uomName?: string;
  resourceName?: string;
  subtype?: string | null;
  mincap?: number | null;
  maxcap?: number | null;
  chargeType?: string | null;
  total?: number | null;
  approvedActualsQty?: number | null;
  approvedActualsTotal?: number | null;
  unapprovedActualsQty?: number | null;
  unapprovedActualsTotal?: number | null;
  actualsQty?: number | null;
  actualsTotal?: number | null;
  actualsProfitability?: number | null;
  actualsProfitabilityPercentage?: number | null;
  actualsProfitabilityBudget?: number | null;
  actualsProfitabilityBudgetPercentage?: number | null;
  actualsProfitabilityTarget?: number | null;
  actualsProfitabilityTargetPercentage?: number | null;
  actualsFinancialCompletionBudgetPercentage?: number | null;
  originalQty?: number | null;
  originalUnitPrice?: number | null;
  originalTotal?: number | null;
  purchaseUnitPrice?: number | null;
  purchaseTotal?: number | null;
  purchaseProfitability?: number | null;
  purchaseProfitabilityPercentage?: number | null;
  targetProfitability?: number | null;
  targetProfitabilityPercentage?: number | null;
  targetProfitabilityBudget?: number | null;
  targetProfitabilityBudgetPercentage?: number | null;
}

export interface IRecordPlannerActual {
  // _date: any;
  _showInTableId?: string;
  _type?: string;
  id: string;
  budgetid: string;
  date: string;
  datequery: number;
  description: string;
  formid: string;
  projectid: string;
  qty: number;
  resourcecategory: string;
  resourceid: string;
  resourcetype: string;
  status: number; // 0 = draft, 1 = approved, 2 = deleted/declined
  taskid: string;
  unitprice: number;
}

interface IRecordPlannerResourceCategory {
  subtype?: string;
  mincap?: number;
  maxcap?: number;
  chargeType?: string;
}

interface IRecordPlannerOriginalBudget {
  qty?: number;
  unitprice?: number;
}

export interface ITaskLog{
  datecreated: number;
  id: string;
  oldvalue: string;
  owner: string;
  reason: string;
  taskid: string;
  value: string;
}

export interface IProjectDetails {
  custom: string;
  id?: string | null;
  startdate?: string | null;
  enddate?: string | null;
  code?: string;
  name?: string;
  approvedActualsTotal?: number | null;
  unapprovedActualsTotal?: number | null;
  forecast?: number;
  budget?: number;
  duration?: number;
  jobs?: IJobDetails[];
  purchaseTotal?: number;
  projectid?: string;
}

export interface IJobDetails {
  id: string;
  projectId: string;
  name: string;
  type: string;
  status: string;
  staff: number;
  plant: number;
  startDate: string;
  endDate: string;
  assignees: IAssigneeDetails[];
  level?: number; // determines the level in the timeline
}

export interface IAssigneeDetails {
  id?: string;
  assignedJobs?: string[];
  name: string;
  image: string;
}

export interface IStaffDetails {
  id: string;
  name: string;
  image: string;
  role: string;
  subRole: string;
  status: string;
  attendance?: IStaffAttendanceDetails[];
}

export interface IPlantDetails {
  id: string;
  category: string;
  subCategory: string;
  name: string;
  details: string;
  status: string;
}

export interface IStaffAttendanceDetails {
  date: string;
  times: IAttendanceTimeDetails[];
  status: string;
  isApproved: boolean;
}

export interface IAttendanceTimeDetails {
  timeStart: string;
  timeEnd?: string;
  type: string;
  tags: string[];
}

export interface IFormSubmissionDetails {
  name: string;
  email: string;
  uploadDate: string;
  type: string;
  message?: string;
}
