import {
  IAction,
  IClaim,
  IClaimSet,
  IModule,
  IRole,
  ISubmodule,
  ITenant,
  IUser,
  IUserGroup,
} from "../store/modules/userData/userDataModule";
import {
  IField,
  IFieldGroup,
  IFormTemplate,
  IFormTemplateField,
  IFormTemplateGroup,
} from "cloudconLibrary/store/modules/formTemplateData/formTemplateDataModule";
import {
  IContact,
  IContactGroup,
} from "cloudconLibrary/store/modules/contactData/contactDataModule";
import { IFile } from "cloudconLibrary/store/modules/fileData/fileDataModule";
import { IDatatableSortObject } from "./databaseWebApi";
import {
  IFilter,
  IResponseData,
  ITableRecord,
} from "cloudconLibrary/store/modules/tableData/tableDataModule";
import { IDataFilters } from "cloudconLibrary/dataFilter/dataFilterInterfaces";
import {
  IFilters,
  IPagination,
  IRecord,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
import { UserAdminLevel } from "cloudconLibrary/utilities/useConstants";
import {
  IJob,
  IJobBudgetLine,
  IJobItem,
  IJobSubItem,
} from "cloudconLibrary/store/modules/jobData/jobDataModule";
import { IWorkOrder } from "cloudconLibrary/store/modules/workOrderData/workOrderDataModule";
import { ICompany } from "cloudconLibrary/store/modules/companyData/companyDataModule";
import {
  IPlant,
  IPlantGroup,
} from "cloudconLibrary/store/modules/plantData/plantDataModule";

import { ICustomField } from "cloudconLibrary/store/modules/customFieldData/customFieldDataModule";

export interface IDatabaseApi {
  fetchTableData: (
    tableName: string,
    columns?: string[],
    filters?: Record<string, IDataFilters>,
    sort?: Record<string, IDatatableSortObject[]>,
    paginationPage?: number,
    paginationItemsPerPage?: number
  ) => Promise<IResponseData>;
  fetchRecord: (
    tableName: string,
    id: string,
    columns?: string[],
    filters?: IFilter[]
  ) => Promise<IResponseData>;
  upsertRecords: (
    tableName: string,
    data: ITableRecord[]
  ) => Promise<IResponseData>;
  deleteRecord: (tableName: string, id: string) => Promise<void>;
  deleteRecords: (tableName: string, ids: string[]) => Promise<void>;
}

export interface IAuthApi {
  fetchUserInfo: () => Promise<IAuthUserData>;
  forgetPassword: (username: string) => Promise<string>;
  loginAuth: (username: string, password: string) => Promise<IAuthLoginData>;

  refreshSession: () => Promise<IAuthLoginData>;
}

export interface IAuthUserData {
  sub: string;
  email: string;
  email_verified: boolean;
}

export interface IAuthRequestRefreshData {
  client_id?: string;
  grant_type?: string;
  client_secret?: string;
  refresh_token?: string;
}

export interface IAuthRequestLoginData {
  client_id?: string;
  grant_type?: string;
  password: string;
  scope?: string;
  username: string;
}

export interface IAuthForgetPasswordData {
  client_id?: string;
  email: string;
  connection: string;
}

export interface IAuthLoginData {
  access_token: string;
  refresh_token: string;
  id_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
}

export interface IUserApiResponse<T> {
  data: T | null;
  error: string | null;
  message: string | null;
  success: boolean;
}

export interface IUserApiResponseWithMetadata<T, TU>
  extends IUserApiResponse<T> {
  metadata: TU | null;
}

export interface IGetRecordsMetadata {
  totalRecords: number;
}

export interface IRequestRoleCreate {
  name: string;
  tenantid: number;
  claimids?: number[];
  claimsetids?: number[];
}

interface IRequestContact {
  jobTitle?: string | null;
  email?: string | null;
  email2?: string | null;
  mobile?: string | null;
  phone?: string | null;
  phone2?: string | null;
  name?: string;
  city?: string | null;
  code?: string | null;
  country?: string | null;
  custom?: Record<string, IRecord> | null;
  fax?: string | null;
  notes?: string | null;
  rate?: number | null;
  salutation?: string | null;
  skypeName?: string | null;
  state?: string | null;
  street?: string | null;
  webpage?: string | null;
  weekendRate?: number | null;
  zipCode?: string | null;
  contactGroupIds?: number[];
  companyId?: number | null;
  ownerIds?: number[];
  photoId?: string | null;
  relatedCompanyIds?: number[];
}

export interface IRequestContactCreate extends IRequestContact {
  name: string;
}

export interface IRequestContactUpdate extends IRequestContact {
  id: number;
}

export interface IRequestFormTemplateCreate {
  name: string;
  formtemplategroupid?: number;
}

export interface IRequestFormTemplateUpdate {
  id: number;
  name: string;
  formtemplategroupid?: number;
}

export interface IRequestFormTemplateFieldCreate {
  name: string;
  label: string;
  position: number;
  hidden: boolean;
  mandatory: boolean;
  options: string;
  onchange: string;
  status: number;
  value: string;
  fieldId: number;
  formTemplateId: number;
}

export interface IRequestCustomFieldCreate {
  name: string;
  entity: string;
  type: string;
  label: string;
  position: number;
  hidden: boolean;
  mandatory: boolean;
  options: string;
  onchange: string;
  status: number;
  value: string;
}

export interface IRequestCustomFieldUpdate {
  id: number;
  name: string;
  entity: string;
  type: string;
  label?: string;
  position: number;
  hidden: boolean;
  mandatory: boolean;
  options?: string;
  onchange: string;
  status: number;
  value: string;
}

export interface IRequestFormTemplateFieldUpdate {
  id: number;
  name: string;
  label: string;
  position: number;
  hidden: boolean;
  mandatory: boolean;
  options: string;
  onchange: string;
  status: number;
  value: string;
  fieldId: number;
  formTemplateId: number;
}

export interface IRequestFormTemplateGroupUpdate {
  id: number;
  name: string;
}
export interface IRequestFormTemplateGroupCreate {
  name: string;
}

export interface IResponseFormTemplateField {
  id: number;
  name: string;
  label: string;
  position: number;
  hidden: boolean;
  mandatory: boolean;
  options: string;
  onchange: string;
  status: number;
  value: string;
  fieldId: number;
  formTemplateId: number;
  field: IFieldInResponseFormTemplateField;
}

interface IFieldInResponseFormTemplateField {
  id: number;
  name: string;
}

interface IRequestJob {
  name?: string;
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
  contactIds?: number[];
  companyIds?: number[];
  formGroupIds?: number[];
  ownerIds?: number[];
}

export interface IRequestJobCreate extends IRequestJob {
  name: string;
}

export interface IRequestJobUpdate extends IRequestJob {
  id: number;
}

interface IRequestJobItem {
  name?: string;
  description?: string;
  startDate?: number | null;
  endDate?: number | null;
  budget?: number;
  isBudgetCalculated?: boolean;
  position?: number;
  code?: string;
  isComplete?: boolean;
  colour?: string | null;
  useColour?: boolean;
  applyMarginAndContingency?: string;
}

export interface IRequestJobItemCreate extends IRequestJobItem {
  name: string;
  jobId: number;
  parentJobItemId?: number;
}

export interface IRequestJobItemUpdate extends IRequestJobItem {
  id: number;
}

interface IRequestJobSubItem {
  name?: string;
  description?: string;
  startDate?: number | null;
  endDate?: number | null;
  budget?: number;
  isBudgetCalculated?: boolean;
  position?: number;
  code?: string;
  output?: string;
  outputUom?: string;
  outputQty?: number;
  outputRate?: number;
  forecast?: number;
  progress?: number;
  isProgressPercentage?: boolean;
  isComplete?: boolean;
  retention?: number;
  applyRetention?: boolean;
  qtyToComplete?: number;
  rateToComplete?: number;
}

export interface IRequestJobSubItemCreate extends IRequestJobSubItem {
  name: string;
  jobId: number;
  parentJobItemId: number;
}

export interface IRequestJobSubItemUpdate extends IRequestJobSubItem {
  id: number;
}

interface IRequestJobBudgetLine {
  resourceName?: string;
  costUnitPrice?: number;
  qty?: number;
  unitPrice?: number;
  quotedQty?: number;
  quotedUnitPrice?: number;
  resourceProductId?: number;
  resourceCompanyId?: number;
}

export interface IRequestJobBudgetLineCreate extends IRequestJobBudgetLine {
  jobId: number;
  jobSubItemId: number;
  jobResourceTypeId: number;
}

export interface IRequestJobBudgetLineUpdate extends IRequestJobBudgetLine {
  id: number;
}

interface IRequestWorkOrder {
  name?: string;
  notes?: string | null;
  city?: string | null;
  country?: string | null;
  custom?: Record<string, IRecord> | null;
  dueDate?: number | null;
  duration?: number | null;
  endDate?: number | null;
  state?: string | null;
  street?: string | null;
  zipCode?: string | null;
  companyId?: number | null;
  contactId?: number | null;
  ownerIds?: number[];
  mandatoryFormTemplateIds?: number[];
  jobId?: number | null;
}

export interface IRequestWorkOrderCreate extends IRequestWorkOrder {
  name: string;
}

export interface IRequestWorkOrderUpdate extends IRequestWorkOrder {
  id: number;
}

interface IRequestCompany {
  city?: string | null;
  country?: string | null;
  custom?: string | null;
  email?: string | null;
  fax?: string | null;
  name?: string;
  note?: string | null;
  phone?: string | null;
  state?: string | null;
  street?: string | null;
  abn?: string | null;
  webPage?: string | null;
  zipCode?: string | null;
  childCompanyIds?: number[];
  ownerIds?: number[];
}

export interface IRequestCompanyCreate extends IRequestCompany {
  name: string;
}

export interface IRequestCompanyUpdate extends IRequestCompany {
  id: number;
}

interface IRequestPlant {
  name?: string;
  address?: string | null;
  custom?: Record<string, IRecord> | null;
  geo?: string | null;
  maintenanceUsage?: number | null;
  manufacturer?: string | null;
  model?: string | null;
  purchaseDate?: number | null;
  purchasePrice?: number | null;
  serialNumber?: string | null;
  usage?: number | null;
  warrantyDate?: number | null;
  contactId?: number | null;
  companyId?: number | null;
  jobId?: number | null;
  ownerIds?: number[];
  parentId?: number | null;
  plantGroupIds?: number[];
  tagId?: number | null;
}

export interface IRequestPlantCreate extends IRequestPlant {
  name: string;
}

export interface IRequestPlantUpdate extends IRequestPlant {
  id: number;
}

export interface IUsersApi {
  loginWithEmail: (email: string) => Promise<IUserApiResponse<IUser>>;

  getFormTemplateGroups: (
    tenantId: number,
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<
    IUserApiResponseWithMetadata<IFormTemplateGroup[], IGetRecordsMetadata>
  >;
  createFormTemplateGroup: (
    tenantId: number,
    requestFormTemplateGroupCreate: IRequestFormTemplateGroupCreate
  ) => Promise<IUserApiResponse<IFormTemplateGroup>>;
  updateFormTemplateGroup: (
    tenantId: number,
    requestFormTemplateGroupUpdate: IRequestFormTemplateGroupUpdate
  ) => Promise<IUserApiResponse<IFormTemplateGroup>>;
  deleteFormTemplateGroup: (tenantId: number, id: number) => Promise<void>;

  getFields: (
    tenantId: number,
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IField[], IGetRecordsMetadata>>;
  getFieldGroups: (
    tenantId: number,
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<
    IUserApiResponseWithMetadata<IFieldGroup[], IGetRecordsMetadata>
  >;
  getFormTemplates: (
    tenantId: number,
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<
    IUserApiResponseWithMetadata<IFormTemplate[], IGetRecordsMetadata>
  >;
  createFormTemplate: (
    tenantId: number,
    requestFormTemplateCreate: IRequestFormTemplateCreate
  ) => Promise<IUserApiResponse<IFormTemplate>>;
  updateFormTemplate: (
    tenantId: number,
    requestFormTemplateUpdate: IRequestFormTemplateUpdate
  ) => Promise<IUserApiResponse<IFormTemplate>>;
  deleteFormTemplate: (tenantId: number, id: number) => Promise<void>;

  getFormTemplateFields: (
    tenantId: number
  ) => Promise<
    IUserApiResponseWithMetadata<IFormTemplateField[], IGetRecordsMetadata>
  >;

  createFormTemplateField: (
    tenantId: number,
    requestFormTemplateFieldCreate: IRequestFormTemplateFieldCreate
  ) => Promise<IUserApiResponse<IResponseFormTemplateField>>;
  updateFormTemplateField: (
    tenantId: number,
    requestFormTemplateFieldUpdate: IRequestFormTemplateFieldUpdate
  ) => Promise<IUserApiResponse<IFormTemplateField>>;
  updateMultipleFormTemplateFields: (
    tenantId: number,
    requestsFormTemplateFieldUpdate: IRequestFormTemplateFieldUpdate[]
  ) => Promise<IUserApiResponse<IResponseFormTemplateField[]>>;
  deleteFormTemplateField: (tenantId: number, id: number) => Promise<void>;

  getContacts: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IContact[], IGetRecordsMetadata>>;
  getContactById: (id: number) => Promise<IContact>;
  createContact: (
    requestContactCreate: IRequestContactCreate
  ) => Promise<IUserApiResponse<IContact>>;
  updateContact: (
    requestContactUpdate: IRequestContactUpdate
  ) => Promise<IUserApiResponse<IContact>>;
  deleteContact: (id: number) => Promise<void>;

  getContactGroups: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<
    IUserApiResponseWithMetadata<IContactGroup[], IGetRecordsMetadata>
  >;
  getContactGroupById: (id: number) => Promise<IContactGroup>;
  createContactGroup: (
    name: string
  ) => Promise<IUserApiResponse<IContactGroup>>;
  updateContactGroup: (
    id: number,
    name: string | null,
    contactToAdd: number[],
    contactToRemove: number[]
  ) => Promise<IUserApiResponse<IContactGroup>>;
  deleteContactGroup: (id: number) => Promise<void>;

  getJobs: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IJob[], IGetRecordsMetadata>>;
  getJobById: (id: number) => Promise<IJob>;
  createJob: (
    requestJobCreate: IRequestJobCreate
  ) => Promise<IUserApiResponse<IJob>>;
  updateJob: (
    requestJobUpdate: IRequestJobUpdate
  ) => Promise<IUserApiResponse<IJob>>;
  deleteJob: (id: number) => Promise<void>;

  getJobItems: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IJobItem[], IGetRecordsMetadata>>;
  getJobItemById: (id: number) => Promise<IJobItem>;
  createJobItem: (
    requestJobCreate: IRequestJobItemCreate
  ) => Promise<IUserApiResponse<IJobItem>>;
  updateJobItem: (
    requestJobUpdate: IRequestJobItemUpdate
  ) => Promise<IUserApiResponse<IJobItem>>;
  deleteJobItem: (id: number) => Promise<void>;

  getJobSubItems: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<
    IUserApiResponseWithMetadata<IJobSubItem[], IGetRecordsMetadata>
  >;
  getJobSubItemById: (id: number) => Promise<IJobSubItem>;
  createJobSubItem: (
    requestJobSubItemCreate: IRequestJobSubItemCreate
  ) => Promise<IUserApiResponse<IJobSubItem>>;
  updateJobSubItem: (
    requestJobSubItemUpdate: IRequestJobSubItemUpdate
  ) => Promise<IUserApiResponse<IJobSubItem>>;
  deleteJobSubItem: (id: number) => Promise<void>;

  getJobBudgetLines: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<
    IUserApiResponseWithMetadata<IJobBudgetLine[], IGetRecordsMetadata>
  >;
  getJobBudgetLineById: (id: number) => Promise<IJobBudgetLine>;
  createJobBudgetLine: (
    requestJobBudgetLineCreate: IRequestJobBudgetLineCreate
  ) => Promise<IUserApiResponse<IJobBudgetLine>>;
  updateJobBudgetLine: (
    requestJobBudgetLineUpdate: IRequestJobBudgetLineUpdate
  ) => Promise<IUserApiResponse<IJobBudgetLine>>;
  deleteJobBudgetLine: (id: number) => Promise<void>;

  getWorkOrders: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IWorkOrder[], IGetRecordsMetadata>>;

  getCustomFieldByEntity: (
    entity?: string
  ) => Promise<
    IUserApiResponseWithMetadata<ICustomField[], IGetRecordsMetadata>
  >;

  createCustomField: (
    tenantId: number,
    requestCustomFieldCreate: IRequestCustomFieldCreate
  ) => Promise<IUserApiResponse<IResponseFormTemplateField>>;

  deleteCustomField: (tenantId: number, id: number) => Promise<void>;

  updateCustomField: (
    tenantId: number,
    requestCustomFieldUpdate: IRequestCustomFieldUpdate
  ) => Promise<IUserApiResponse<ICustomField>>;

  updateMultipleCustomFields: (
    tenantId: number,
    requestCustomFieldUpdate: IRequestCustomFieldUpdate[]
  ) => Promise<IUserApiResponse<ICustomField[]>>;

  getWorkOrderById: (id: number) => Promise<IWorkOrder>;
  createWorkOrder: (
    requestWorkOrderCreate: IRequestWorkOrderCreate
  ) => Promise<IUserApiResponse<IWorkOrder>>;
  updateWorkOrder: (
    requestWorkOrderUpdate: IRequestWorkOrderUpdate
  ) => Promise<IUserApiResponse<IWorkOrder>>;
  deleteWorkOrder: (id: number) => Promise<void>;

  getCompanies: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<ICompany[], IGetRecordsMetadata>>;
  getCompanyById: (id: number) => Promise<ICompany>;
  createCompany: (
    requestCompanyCreate: IRequestCompanyCreate
  ) => Promise<IUserApiResponse<ICompany>>;
  updateCompany: (
    requestCompanyUpdate: IRequestCompanyUpdate
  ) => Promise<IUserApiResponse<ICompany>>;
  deleteCompany: (id: number) => Promise<void>;

  getPlant: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IPlant[], IGetRecordsMetadata>>;
  getPlantById: (id: number) => Promise<IPlant>;
  createPlant: (
    requestPlantCreate: IRequestPlantCreate
  ) => Promise<IUserApiResponse<IPlant>>;
  updatePlant: (
    requestPlantUpdate: IRequestPlantUpdate
  ) => Promise<IUserApiResponse<IPlant>>;
  deletePlant: (id: number) => Promise<void>;

  getPlantGroups: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<
    IUserApiResponseWithMetadata<IPlantGroup[], IGetRecordsMetadata>
  >;
  getPlantGroupById: (id: number) => Promise<IPlantGroup>;
  createPlantGroup: (name: string) => Promise<IUserApiResponse<IPlantGroup>>;
  updatePlantGroup: (
    id: number,
    name: string | null,
    plantToAdd: number[],
    plantToRemove: number[]
  ) => Promise<IUserApiResponse<IPlantGroup>>;
  deletePlantGroup: (id: number) => Promise<void>;

  getFiles: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IFile[], IGetRecordsMetadata>>;
  createFile: (formData: FormData) => Promise<IUserApiResponse<IFile>>;
  deleteFile: (payload: { id: string; tenantName: string }) => Promise<void>;

  getTenants: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<ITenant[], IGetRecordsMetadata>>;
  getTenantIdsForUser: (id: number) => Promise<number[]>;
  createTenant: (
    name: string,
    clientCode: string
  ) => Promise<IUserApiResponse<ITenant>>;
  updateTenant: (
    id: number,
    name: string | null,
    clientCode: string | null
  ) => Promise<IUserApiResponse<ITenant>>;
  deleteTenant: (id: number) => Promise<void>;

  getRoles: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IRole[], IGetRecordsMetadata>>;
  createRole: (
    name: string,
    tenantId: number,
    claimids?: number[],
    claimsetids?: number[]
  ) => Promise<IUserApiResponse<IRole>>;
  updateRole: (
    id: number,
    name: string | null,
    claimIds: number[] | null,
    claimSetIds: number[] | null
  ) => Promise<IUserApiResponse<IRole>>;
  deleteRole: (id: number) => Promise<void>;

  getActions: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IAction[], IGetRecordsMetadata>>;
  createAction: (name: string) => Promise<IUserApiResponse<IAction>>;
  updateAction: (
    id: number,
    name: string | null
  ) => Promise<IUserApiResponse<IAction>>;
  deleteAction: (id: number) => Promise<void>;

  getModules: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IModule[], IGetRecordsMetadata>>;
  createModule: (name: string) => Promise<IUserApiResponse<IModule>>;
  updateModule: (
    id: number,
    name: string | null
  ) => Promise<IUserApiResponse<IModule>>;
  deleteModule: (id: number) => Promise<void>;

  getSubmodules: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<ISubmodule[], IGetRecordsMetadata>>;
  createSubmodule: (
    name: string,
    moduleId: number
  ) => Promise<IUserApiResponse<ISubmodule>>;
  updateSubmodule: (
    id: number,
    name: string | null,
    moduleId: number | null
  ) => Promise<IUserApiResponse<ISubmodule>>;
  deleteSubmodule: (id: number) => Promise<void>;

  getClaims: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IClaim[], IGetRecordsMetadata>>;
  getClaimsForUser: (
    id: number,
    tenantId: number
  ) => Promise<IUserApiResponseWithMetadata<IClaim[], IGetRecordsMetadata>>;
  createClaim: (
    name: string,
    submoduleId: number,
    actionId: number
  ) => Promise<IUserApiResponse<IClaim>>;
  updateClaim: (
    id: number,
    name: string | null,
    submoduleId: number | null,
    actionId: number | null
  ) => Promise<IUserApiResponse<IClaim>>;
  deleteClaim: (id: number) => Promise<void>;

  getClaimSets: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IClaimSet[], IGetRecordsMetadata>>;
  createClaimSet: (name: string) => Promise<IUserApiResponse<IClaimSet>>;
  updateClaimSet: (
    id: number,
    name: string | null,
    claimIds: number[] | null
  ) => Promise<IUserApiResponse<IClaimSet>>;
  deleteClaimSet: (id: number) => Promise<void>;

  getUsers: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IUser[], IGetRecordsMetadata>>;
  createUser: (
    name: string,
    password: string,
    emailAddress: string,
    adminLevel: UserAdminLevel | null,
    userGroupIds: number[],
    roleIds: number[],
    tenantId: number
  ) => Promise<IUserApiResponse<IUser>>;
  updateUser: (
    id: number,
    name: string | null,
    adminLevel: UserAdminLevel | null,
    tenantIds: number[] | null,
    userGroupIdsMap: Record<number, number[]> | null,
    roleIdsMap: Record<number, number[]> | null
  ) => Promise<IUserApiResponse<IUser>>;
  deleteUser: (id: number) => Promise<void>;

  getUserGroups: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ) => Promise<IUserApiResponseWithMetadata<IUserGroup[], IGetRecordsMetadata>>;
  createUserGroup: (
    name: string,
    tenantId: number,
    claimSetIds: number[] | null,
    roleIds: number[] | null
  ) => Promise<IUserApiResponse<IUserGroup>>;
  updateUserGroup: (
    id: number,
    name: string | null,
    claimSetIds: number[] | null,
    roleIds: number[] | null
  ) => Promise<IUserApiResponse<IUserGroup>>;
  deleteUserGroup: (id: number) => Promise<void>;

  getAccessToken: (id: number) => Promise<string>;
}
