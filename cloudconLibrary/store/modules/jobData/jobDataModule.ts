import { JobResourceType } from "cloudconLibrary/utilities/useConstants";
import storeHelper, {
  IStoreDataForTable,
} from "../../../../cloudconLibrary/store/storeHelper/storeHelper";
import { IRecord } from "../../../utilities/useGenericInterfaces";
import jobDataActions from "./jobDataActions";
import jobDataGetters from "./jobDataGetters";
import jobDataMutations from "./jobDataMutations";

export interface IJob {
  id: number;
  name: string;
  creationDate: number;
  breakDuration?: number | null;
  budget?: number | null;
  city?: string | null;
  code?: string | null;
  colour?: string | null;
  country?: string | null;
  custom?: Record<string, IRecord> | null;
  endDate?: number | null;
  notes?: string | null;
  notifMessage?: string | null;
  percentComplete?: number | null;
  startDate?: number | null;
  startHour?: number | null;
  startTime?: number | null;
  state?: string | null;
  street?: string | null;
  workDuration?: number | null;
  zipCode?: string | null;
  contacts: {
    id: string;
    name: string;
  }[];
  companies: {
    id: string;
    name: string;
  }[];
  formGroups: {
    id: string;
    name: string;
  }[];
  owners: {
    id: string;
  }[];
}

export interface IJobItem {
  id: number;
  name: string;
  description: string;
  startDate?: number | null;
  endDate?: number | null;
  budget: number;
  isBudgetCalculated: boolean;
  position: number;
  code: string;
  isComplete: boolean;
  colour?: string | null;
  useColour: boolean;
  applyMarginAndContingency: boolean;
  jobid: number;
  parentJobItemId: number;
}

export interface IJobSubItem {
  id: number;
  name: string;
  description: string;
  startDate?: number | null;
  endDate?: number | null;
  budget: number;
  isBudgetCalculated: boolean;
  position: number;
  code: string;
  output: string;
  outputUom: string;
  outputQty: number;
  outputRate: number;
  forecast: number;
  progress: number;
  isProgressPercentage: boolean;
  isComplete: boolean;
  retention: number;
  applyRetention: boolean;
  qtyToComplete: number;
  rateToComplete: number;
  jobId: number;
  jobItemId: number;
}

export interface IJobBudgetLine {
  id: number;
  resourceName?: string | null;
  costUnitPrice: number;
  qty: number;
  unitPrice: number;
  quotedQty: number;
  quotedUnitPrice: number;
  jobId: number;
  jobSubItemId: number;
  resourceProduct?: {
    id: number;
    name: string;
  } | null;
  resourceCompany?: {
    id: number;
    name: string;
  } | null;
  jobResourceType: {
    id: number;
    name: string;
    code?: string | null;
    resourceType: JobResourceType;
  };
}

export interface IJobData {
  jobs: Record<number, IJob>;
  jobsForTable: IStoreDataForTable<IJob>;
  jobItems: Record<number, IJobItem>;
  jobSubItems: Record<number, IJobSubItem>;
  jobBudgetLines: Record<number, IJobBudgetLine>;
}

export type IJobTableDataKeys =
  | "jobs"
  | "jobItems"
  | "jobSubItems"
  | "jobBudgetLines";

const state: IJobData = {
  jobs: {},
  jobsForTable: storeHelper.emptyStoreDataForTable<IJob>(),
  jobItems: {},
  jobSubItems: {},
  jobBudgetLines: {},
};

export type IJobDataState = Record<string, Record<string, IRecord>>;

export default {
  namespaced: true,
  state,
  getters: jobDataGetters,
  actions: jobDataActions,
  mutations: jobDataMutations,
};
