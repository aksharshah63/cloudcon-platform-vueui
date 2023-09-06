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
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  IUsersApi,
  IUserApiResponse,
  IRequestContactCreate,
  IRequestContactUpdate,
  IRequestJobCreate,
  IRequestJobUpdate,
  IRequestWorkOrderUpdate,
  IRequestWorkOrderCreate,
  IRequestCompanyCreate,
  IRequestCompanyUpdate,
  IRequestFormTemplateCreate,
  IRequestFormTemplateUpdate,
  IRequestFormTemplateFieldCreate,
  IRequestFormTemplateFieldUpdate,
  IRequestFormTemplateGroupCreate,
  IRequestFormTemplateGroupUpdate,
  IResponseFormTemplateField,
  IRequestPlantCreate,
  IRequestPlantUpdate,
  IUserApiResponseWithMetadata,
  IGetRecordsMetadata,
  IRequestRoleCreate,
  IRequestJobItemCreate,
  IRequestJobItemUpdate,
  IRequestJobSubItemCreate,
  IRequestJobSubItemUpdate,
  IRequestJobBudgetLineCreate,
  IRequestJobBudgetLineUpdate,
  IRequestCustomFieldCreate,
  IRequestCustomFieldUpdate,
} from "./apiInterfaces";
import useCookies from "../utilities/useCookies";
import { cookieKeys, UserAdminLevel } from "../utilities/useConstants";
import { IFile } from "cloudconLibrary/store/modules/fileData/fileDataModule";
import {
  IContact,
  IContactGroup,
} from "cloudconLibrary/store/modules/contactData/contactDataModule";
import {
  IField,
  IFieldGroup,
  IFormTemplate,
  IFormTemplateField,
  IFormTemplateGroup,
} from "cloudconLibrary/store/modules/formTemplateData/formTemplateDataModule";
import moduleManagementAccess from "../store/modules/moduleManagementData/moduleManagementAccess";
import userManagementAccess from "../store/modules/userManagementData/userManagementAccess";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
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

const apiUrl = process.env.VUE_APP_ATLAS_API_URL;

enum Module {
  FIELD = "Fields",
  FIELDGROUP = "FieldGroups",
  FORMTEMPLATE = "FormTemplates",
  FORMTEMPLATEFIELD = "FormTemplateFields",
  FORMTEMPLATEGROUP = "FormTemplateGroups",
  FILES = "Files",
  COMPANIES = "Companies",
  CONTACTS = "Contacts",
  CONTACT_GROUPS = "ContactGroups",
  JOBS = "Jobs",
  JOB_ITEMS = "JobItems",
  JOB_SUB_ITEMS = "JobSubItems",
  JOB_BUDGET_LINES = "JobBudgetLines",
  PLANT = "Plant",
  PLANT_GROUPS = "PlantGroups",
  WORK_ORDERS = "WorkOrders",
  TENANTS = "Tenants",
  ROLES = "Roles",
  ACTIONS = "Actions",
  MODULES = "Modules",
  SUBMODULES = "Submodules",
  CLAIMS = "Claims",
  CLAIM_SETS = "ClaimSets",
  USERS = "Users",
  USER_GROUPS = "UserGroups",
  Custom_Fields = "CustomFields",
}

const USER_MODEL_ROUTE_PREFIX = "usermodel/";

export class UsersApi implements IUsersApi {
  loginWithEmail(email: string): Promise<IUserApiResponse<IUser>> {
    const params = new URLSearchParams();

    params.append("email", email);

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.USERS,
      {
        method: "get",
      },
      [],
      undefined,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getFields(
    tenantId: number,
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IField[], IGetRecordsMetadata>> {
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      Module.FIELD,
      {
        method: "get",
      },
      [],
      tenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getFieldGroups(
    tenantId: number,
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IFieldGroup[], IGetRecordsMetadata>> {
    const params = new URLSearchParams();
    params.set("withFields", "true");

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);
    params.set("withFields", "true");

    return callEndpoint(
      Module.FIELDGROUP,
      {
        method: "get",
      },
      [],
      tenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getFormTemplateGroups(
    tenantId: number,
    filters?: IFilters | undefined,
    sort?: ISort,
    pagination?: IPagination | undefined
  ): Promise<
    IUserApiResponseWithMetadata<IFormTemplateGroup[], IGetRecordsMetadata>
  > {
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    params.set("withTemplates", "true");
    return callEndpoint(
      Module.FORMTEMPLATEGROUP,
      {
        method: "get",
      },
      [],
      tenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }
  createFormTemplateGroup(
    tenantId: number,
    requestFormTemplateGroupCreate: IRequestFormTemplateGroupCreate
  ): Promise<IUserApiResponse<IFormTemplateGroup>> {
    return callEndpoint(
      Module.FORMTEMPLATEGROUP,
      {
        method: "post",
        data: requestFormTemplateGroupCreate,
      },
      [],
      tenantId
    ).then((response) => {
      return response.data;
    });
  }
  updateFormTemplateGroup(
    tenantId: number,
    requestFormTemplateGroupUpdate: IRequestFormTemplateGroupUpdate
  ): Promise<IUserApiResponse<IFormTemplateGroup>> {
    return callEndpoint(
      Module.FORMTEMPLATEGROUP,
      {
        method: "patch",
        data: requestFormTemplateGroupUpdate,
      },
      [requestFormTemplateGroupUpdate.id.toString()],
      tenantId
    ).then((response) => {
      return response.data;
    });
  }
  deleteFormTemplateGroup(tenantId: number, id: number): Promise<void> {
    return callEndpoint(
      Module.FORMTEMPLATEGROUP,
      {
        method: "delete",
      },
      [id.toString()],
      tenantId
    ).then(() => {
      return;
    });
  }

  getFormTemplates(
    tenantId: number,
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<
    IUserApiResponseWithMetadata<IFormTemplate[], IGetRecordsMetadata>
  > {
    const params = new URLSearchParams();
    params.set("showdata", "true");

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      Module.FORMTEMPLATE,
      {
        method: "get",
      },
      [],
      tenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  createFormTemplate(
    tenantId: number,
    requestFormTemplateCreate: IRequestFormTemplateCreate
  ): Promise<IUserApiResponse<IFormTemplate>> {
    return callEndpoint(
      Module.FORMTEMPLATE,
      {
        method: "post",
        data: requestFormTemplateCreate,
      },
      [],
      tenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateFormTemplate(
    tenantId: number,
    requestFormTemplateUpdate: IRequestFormTemplateUpdate
  ): Promise<IUserApiResponse<IFormTemplate>> {
    return callEndpoint(
      Module.FORMTEMPLATE,
      {
        method: "patch",
        data: requestFormTemplateUpdate,
      },
      [requestFormTemplateUpdate.id.toString()],
      tenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteFormTemplate(tenantId: number, id: number): Promise<void> {
    return callEndpoint(
      Module.FORMTEMPLATE,
      {
        method: "delete",
      },
      [id.toString()],
      tenantId
    ).then(() => {
      return;
    });
  }

  getFormTemplateFields(
    tenantId: number
  ): Promise<
    IUserApiResponseWithMetadata<IFormTemplateField[], IGetRecordsMetadata>
  > {
    const params = new URLSearchParams();
    params.set("showdata", "true");

    return callEndpoint(
      Module.FORMTEMPLATEFIELD,
      {
        method: "get",
      },
      [],
      tenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  createFormTemplateField(
    tenantId: number,
    requestFormTemplateFieldCreate: IRequestFormTemplateFieldCreate
  ): Promise<IUserApiResponse<IResponseFormTemplateField>> {
    return callEndpoint(
      Module.FORMTEMPLATEFIELD,
      {
        method: "post",
        data: requestFormTemplateFieldCreate,
      },
      [],
      tenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateFormTemplateField(
    tenantId: number,
    requestFormTemplateFieldUpdate: IRequestFormTemplateFieldUpdate
  ): Promise<IUserApiResponse<IFormTemplateField>> {
    return callEndpoint(
      Module.FORMTEMPLATEFIELD,
      {
        method: "patch",
        data: requestFormTemplateFieldUpdate,
      },
      [requestFormTemplateFieldUpdate.id.toString()],
      tenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateMultipleFormTemplateFields(
    tenantId: number,
    requestsFormTemplateFieldUpdate: IRequestFormTemplateFieldUpdate[]
  ): Promise<IUserApiResponse<IResponseFormTemplateField[]>> {
    return callEndpoint(
      Module.FORMTEMPLATEFIELD,
      {
        method: "patch",
        data: requestsFormTemplateFieldUpdate,
      },
      [],
      tenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteFormTemplateField(tenantId: number, id: number): Promise<void> {
    return callEndpoint(
      Module.FORMTEMPLATEFIELD,
      {
        method: "delete",
      },
      [id.toString()],
      tenantId
    ).then(() => {
      return;
    });
  }

  getContacts(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IContact[], IGetRecordsMetadata>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      Module.CONTACTS,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getContactById(id: number): Promise<IContact> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.CONTACTS,
      {
        method: "get",
      },
      [id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  createContact(
    requestContactCreate: IRequestContactCreate
  ): Promise<IUserApiResponse<IContact>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.CONTACTS,
      {
        method: "post",
        data: requestContactCreate,
      },
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateContact(
    requestContactUpdate: IRequestContactUpdate
  ): Promise<IUserApiResponse<IContact>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.CONTACTS,
      {
        method: "patch",
        data: requestContactUpdate,
      },
      [requestContactUpdate.id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteContact(id: number): Promise<void> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    return callEndpoint(
      Module.CONTACTS,
      {
        method: "delete",
      },
      [id.toString()],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getContactGroups(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<
    IUserApiResponseWithMetadata<IContactGroup[], IGetRecordsMetadata>
  > {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      Module.CONTACT_GROUPS,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getContactGroupById(id: number): Promise<IContactGroup> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.CONTACT_GROUPS,
      {
        method: "get",
      },
      [id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data as IContactGroup;
    });
  }

  createContactGroup(name: string): Promise<IUserApiResponse<IContactGroup>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const data = {
      name: name,
    };

    return callEndpoint(
      Module.CONTACT_GROUPS,
      {
        method: "post",
        data: data,
      },
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateContactGroup(
    id: number,
    name: string | null,
    contactToAdd: number[],
    contactToRemove: number[]
  ): Promise<IUserApiResponse<IContactGroup>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const data = {
      id: id,
      name: name,
      contacttoadd: contactToAdd,
      contacttoremove: contactToRemove,
    };
    return callEndpoint(
      Module.CONTACT_GROUPS,
      {
        method: "patch",
        data: data,
      },
      [data.id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteContactGroup(id: number): Promise<void> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    return callEndpoint(
      Module.CONTACT_GROUPS,
      {
        method: "delete",
      },
      [id.toString()],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getPlant(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IPlant[], IGetRecordsMetadata>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      Module.PLANT,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getPlantById(id: number): Promise<IPlant> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.PLANT,
      {
        method: "get",
      },
      [id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  createPlant(
    requestPlantCreate: IRequestPlantCreate
  ): Promise<IUserApiResponse<IPlant>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.PLANT,
      {
        method: "post",
        data: requestPlantCreate,
      },
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  updatePlant(
    requestPlantUpdate: IRequestPlantUpdate
  ): Promise<IUserApiResponse<IPlant>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.PLANT,
      {
        method: "patch",
        data: requestPlantUpdate,
      },
      [requestPlantUpdate.id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deletePlant(id: number): Promise<void> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    return callEndpoint(
      Module.PLANT,
      {
        method: "delete",
      },
      [id.toString()],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getPlantGroups(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IPlantGroup[], IGetRecordsMetadata>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      Module.PLANT_GROUPS,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getPlantGroupById(id: number): Promise<IPlantGroup> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.PLANT_GROUPS,
      {
        method: "get",
      },
      [id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data as IPlantGroup;
    });
  }

  createPlantGroup(name: string): Promise<IUserApiResponse<IPlantGroup>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const data = {
      name: name,
    };

    return callEndpoint(
      Module.PLANT_GROUPS,
      {
        method: "post",
        data: data,
      },
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  updatePlantGroup(
    id: number,
    name: string | null,
    plantToAdd: number[],
    plantToRemove: number[]
  ): Promise<IUserApiResponse<IPlantGroup>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const data = {
      id: id,
      name: name,
      planttoadd: plantToAdd,
      planttoremove: plantToRemove,
    };
    return callEndpoint(
      Module.PLANT_GROUPS,
      {
        method: "patch",
        data: data,
      },
      [data.id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deletePlantGroup(id: number): Promise<void> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    return callEndpoint(
      Module.PLANT_GROUPS,
      {
        method: "delete",
      },
      [id.toString()],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getJobs(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IJob[], IGetRecordsMetadata>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      Module.JOBS,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getJobById(id: number): Promise<IJob> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.JOBS,
      {
        method: "get",
      },
      [id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  createJob(
    requestJobCreate: IRequestJobCreate
  ): Promise<IUserApiResponse<IJob>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.JOBS,
      {
        method: "post",
        data: requestJobCreate,
      },
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateJob(
    requestJobUpdate: IRequestJobUpdate
  ): Promise<IUserApiResponse<IJob>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.JOBS,
      {
        method: "patch",
        data: requestJobUpdate,
      },
      [requestJobUpdate.id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteJob(id: number): Promise<void> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    return callEndpoint(
      Module.JOBS,
      {
        method: "delete",
      },
      [id.toString()],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getJobItems(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IJobItem[], IGetRecordsMetadata>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      Module.JOB_ITEMS,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getJobItemById(id: number): Promise<IJobItem> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.JOB_ITEMS,
      {
        method: "get",
      },
      [id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  createJobItem(
    requestJobItemCreate: IRequestJobItemCreate
  ): Promise<IUserApiResponse<IJobItem>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.JOB_ITEMS,
      {
        method: "post",
        data: requestJobItemCreate,
      },
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateJobItem(
    requestJobItemUpdate: IRequestJobItemUpdate
  ): Promise<IUserApiResponse<IJobItem>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.JOB_ITEMS,
      {
        method: "patch",
        data: requestJobItemUpdate,
      },
      [requestJobItemUpdate.id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteJobItem(id: number): Promise<void> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    return callEndpoint(
      Module.JOB_ITEMS,
      {
        method: "delete",
      },
      [id.toString()],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getJobSubItems(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IJobSubItem[], IGetRecordsMetadata>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      Module.JOB_SUB_ITEMS,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getJobSubItemById(id: number): Promise<IJobSubItem> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.JOB_SUB_ITEMS,
      {
        method: "get",
      },
      [id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  createJobSubItem(
    requestJobSubItemCreate: IRequestJobSubItemCreate
  ): Promise<IUserApiResponse<IJobSubItem>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.JOB_SUB_ITEMS,
      {
        method: "post",
        data: requestJobSubItemCreate,
      },
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateJobSubItem(
    requestJobSubItemUpdate: IRequestJobSubItemUpdate
  ): Promise<IUserApiResponse<IJobSubItem>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.JOB_SUB_ITEMS,
      {
        method: "patch",
        data: requestJobSubItemUpdate,
      },
      [requestJobSubItemUpdate.id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteJobSubItem(id: number): Promise<void> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    return callEndpoint(
      Module.JOB_SUB_ITEMS,
      {
        method: "delete",
      },
      [id.toString()],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getJobBudgetLines(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<
    IUserApiResponseWithMetadata<IJobBudgetLine[], IGetRecordsMetadata>
  > {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      Module.JOB_BUDGET_LINES,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getJobBudgetLineById(id: number): Promise<IJobBudgetLine> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.JOB_BUDGET_LINES,
      {
        method: "get",
      },
      [id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  createJobBudgetLine(
    requestJobBudgetLineCreate: IRequestJobBudgetLineCreate
  ): Promise<IUserApiResponse<IJobBudgetLine>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.JOB_BUDGET_LINES,
      {
        method: "post",
        data: requestJobBudgetLineCreate,
      },
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateJobBudgetLine(
    requestJobBudgetLineUpdate: IRequestJobBudgetLineUpdate
  ): Promise<IUserApiResponse<IJobBudgetLine>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.JOBS,
      {
        method: "patch",
        data: requestJobBudgetLineUpdate,
      },
      [requestJobBudgetLineUpdate.id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteJobBudgetLine(id: number): Promise<void> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    return callEndpoint(
      Module.JOB_BUDGET_LINES,
      {
        method: "delete",
      },
      [id.toString()],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getWorkOrders(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IWorkOrder[], IGetRecordsMetadata>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      Module.WORK_ORDERS,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getWorkOrderById(id: number): Promise<IWorkOrder> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.WORK_ORDERS,
      {
        method: "get",
      },
      [id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  createWorkOrder(
    requestWorkOrderCreate: IRequestWorkOrderCreate
  ): Promise<IUserApiResponse<IWorkOrder>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.WORK_ORDERS,
      {
        method: "post",
        data: requestWorkOrderCreate,
      },
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateWorkOrder(
    requestWorkOrderUpdate: IRequestWorkOrderUpdate
  ): Promise<IUserApiResponse<IWorkOrder>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.WORK_ORDERS,
      {
        method: "patch",
        data: requestWorkOrderUpdate,
      },
      [requestWorkOrderUpdate.id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteWorkOrder(id: number): Promise<void> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    return callEndpoint(
      Module.WORK_ORDERS,
      {
        method: "delete",
      },
      [id.toString()],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getCompanies(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<ICompany[], IGetRecordsMetadata>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      Module.COMPANIES,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getCompanyById(id: number): Promise<ICompany> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.COMPANIES,
      {
        method: "get",
      },
      [id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  createCompany(
    requestCompanyCreate: IRequestCompanyCreate
  ): Promise<IUserApiResponse<ICompany>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.COMPANIES,
      {
        method: "post",
        data: requestCompanyCreate,
      },
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateCompany(
    requestCompanyUpdate: IRequestCompanyUpdate
  ): Promise<IUserApiResponse<ICompany>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();

    return callEndpoint(
      Module.COMPANIES,
      {
        method: "patch",
        data: requestCompanyUpdate,
      },
      [requestCompanyUpdate.id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteCompany(id: number): Promise<void> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    return callEndpoint(
      Module.COMPANIES,
      {
        method: "delete",
      },
      [id.toString()],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getFiles(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IFile[], IGetRecordsMetadata>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      Module.FILES,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  createFile(formData: FormData): Promise<IUserApiResponse<IFile>> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    return callEndpoint(
      Module.FILES,
      {
        method: "post",
        data: formData,
      },
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteFile(payload: { id: string; tenantName: string }): Promise<void> {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    return callEndpoint(
      Module.FILES,
      {
        method: "delete",
        data: payload,
      },
      [payload.id],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getTenants(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<ITenant[], IGetRecordsMetadata>> {
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.TENANTS,
      {
        method: "get",
      },
      undefined,
      undefined,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getTenantIdsForUser(id: number): Promise<number[]> {
    return callEndpoint(USER_MODEL_ROUTE_PREFIX + Module.TENANTS, {
      method: "get",
      params: {
        userId: id,
      },
    }).then((response) => {
      return response.data as number[];
    });
  }

  createTenant(
    name: string,
    clientCode: string
  ): Promise<IUserApiResponse<ITenant>> {
    const data = {
      name: name,
      clientcode: clientCode,
    };

    return callEndpoint(USER_MODEL_ROUTE_PREFIX + Module.TENANTS, {
      method: "post",
      data: data,
    }).then((response) => {
      return response.data;
    });
  }

  updateTenant(
    id: number,
    name: string | null,
    clientCode: string | null
  ): Promise<IUserApiResponse<ITenant>> {
    const data = {
      name: name,
      clientcode: clientCode,
    };

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.TENANTS,
      {
        method: "patch",
        data: data,
      },
      [id.toString()]
    ).then((response) => {
      return response.data;
    });
  }

  deleteTenant(id: number): Promise<void> {
    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.TENANTS,
      {
        method: "delete",
      },
      [id.toString()]
    ).then(() => {
      return;
    });
  }

  getRoles(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IRole[], IGetRecordsMetadata>> {
    const selectedTenantId = userManagementAccess.getSelectedTenant()
      ? userManagementAccess.getSelectedTenant()
      : undefined;
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.ROLES,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  createRole(
    name: string,
    tenantId: number,
    claimids?: number[],
    claimsetids?: number[]
  ): Promise<IUserApiResponse<IRole>> {
    const selectedTenantId = userManagementAccess.getSelectedTenant()
      ? userManagementAccess.getSelectedTenant()
      : undefined;
    const data: IRequestRoleCreate = {
      name: name,
      tenantid: tenantId,
    };
    if (claimids) {
      data.claimids = claimids;
    }
    if (claimsetids) {
      data.claimsetids = claimsetids;
    }

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.ROLES,
      {
        method: "post",
        data: data,
      } as AxiosRequestConfig<IRequestRoleCreate>,
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateRole(
    id: number,
    name: string | null,
    claimIds: number[] | null,
    claimSetIds: number[] | null
  ): Promise<IUserApiResponse<IRole>> {
    const selectedTenantId = userManagementAccess.getSelectedTenant()
      ? userManagementAccess.getSelectedTenant()
      : undefined;
    const data = {
      name: name,
      claimIds: claimIds,
      claimSetIds: claimSetIds,
    };

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.ROLES,
      {
        method: "patch",
        data: data,
      },
      [id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteRole(id: number): Promise<void> {
    const selectedTenantId = userManagementAccess.getSelectedTenant()
      ? userManagementAccess.getSelectedTenant()
      : undefined;
    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.ROLES,
      {
        method: "delete",
      },
      [id.toString()],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getActions(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IAction[], IGetRecordsMetadata>> {
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.ACTIONS,
      {
        method: "get",
      },
      undefined,
      undefined,
      params
    ).then((response) => {
      return response.data;
    });
  }

  createAction(name: string): Promise<IUserApiResponse<IAction>> {
    const data = {
      name: name,
    };

    return callEndpoint(USER_MODEL_ROUTE_PREFIX + Module.ACTIONS, {
      method: "post",
      data: data,
    }).then((response) => {
      return response.data;
    });
  }

  updateAction(
    id: number,
    name: string | null
  ): Promise<IUserApiResponse<IAction>> {
    const data = {
      name: name,
    };

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.ACTIONS,
      {
        method: "patch",
        data: data,
      },
      [id.toString()]
    ).then((response) => {
      return response.data;
    });
  }

  deleteAction(id: number): Promise<void> {
    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.ACTIONS,
      {
        method: "delete",
      },
      [id.toString()]
    ).then(() => {
      return;
    });
  }

  getModules(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IModule[], IGetRecordsMetadata>> {
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.MODULES,
      {
        method: "get",
      },
      undefined,
      undefined,
      params
    ).then((response) => {
      return response.data;
    });
  }

  createModule(name: string): Promise<IUserApiResponse<IModule>> {
    const data = {
      name: name,
    };

    return callEndpoint(USER_MODEL_ROUTE_PREFIX + Module.MODULES, {
      method: "post",
      data: data,
    }).then((response) => {
      return response.data;
    });
  }

  updateModule(
    id: number,
    name: string | null
  ): Promise<IUserApiResponse<IModule>> {
    const data = {
      name: name,
    };

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.MODULES,
      {
        method: "patch",
        data: data,
      },
      [id.toString()]
    ).then((response) => {
      return response.data;
    });
  }

  deleteModule(id: number): Promise<void> {
    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.MODULES,
      {
        method: "delete",
      },
      [id.toString()]
    ).then(() => {
      return;
    });
  }

  getSubmodules(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<ISubmodule[], IGetRecordsMetadata>> {
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.SUBMODULES,
      {
        method: "get",
      },
      undefined,
      undefined,
      params
    ).then((response) => {
      return response.data;
    });
  }

  createSubmodule(
    name: string,
    moduleId: number
  ): Promise<IUserApiResponse<ISubmodule>> {
    const data = {
      name: name,
      moduleid: moduleId,
    };

    return callEndpoint(USER_MODEL_ROUTE_PREFIX + Module.SUBMODULES, {
      method: "post",
      data: data,
    }).then((response) => {
      return response.data;
    });
  }

  updateSubmodule(
    id: number,
    name: string | null,
    moduleId: number | null
  ): Promise<IUserApiResponse<ISubmodule>> {
    const data = {
      name: name,
      moduleid: moduleId,
    };

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.SUBMODULES,
      {
        method: "patch",
        data: data,
      },
      [id.toString()]
    ).then((response) => {
      return response.data;
    });
  }

  deleteSubmodule(id: number): Promise<void> {
    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.SUBMODULES,
      {
        method: "delete",
      },
      [id.toString()]
    ).then(() => {
      return;
    });
  }

  getClaims(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IClaim[], IGetRecordsMetadata>> {
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.CLAIMS,
      {
        method: "get",
      },
      undefined,
      undefined,
      params
    ).then((response) => {
      return response.data;
    });
  }

  getClaimsForUser(
    id: number,
    tenantId: number
  ): Promise<IUserApiResponseWithMetadata<IClaim[], IGetRecordsMetadata>> {
    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.CLAIMS,
      {
        method: "get",
        params: {
          userId: id,
        },
      },
      [],
      tenantId
    ).then((response) => {
      return response.data;
    });
  }

  createClaim(
    name: string,
    submoduleId: number,
    actionId: number
  ): Promise<IUserApiResponse<IClaim>> {
    const data = {
      name: name,
      subModuleId: submoduleId,
      actionId: actionId,
    };

    return callEndpoint(USER_MODEL_ROUTE_PREFIX + Module.CLAIMS, {
      method: "post",
      data: data,
    }).then((response) => {
      return response.data;
    });
  }

  updateClaim(
    id: number,
    name: string | null,
    submoduleId: number | null,
    actionId: number | null
  ): Promise<IUserApiResponse<IClaim>> {
    const data = {
      name: name,
      subModuleId: submoduleId,
      actionId: actionId,
    };

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.CLAIMS,
      {
        method: "patch",
        data: data,
      },
      [id.toString()]
    ).then((response) => {
      return response.data;
    });
  }

  deleteClaim(id: number): Promise<void> {
    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.CLAIMS,
      {
        method: "delete",
      },
      [id.toString()]
    ).then(() => {
      return;
    });
  }

  getClaimSets(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IClaimSet[], IGetRecordsMetadata>> {
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.CLAIM_SETS,
      {
        method: "get",
      },
      undefined,
      undefined,
      params
    ).then((response) => {
      return response.data;
    });
  }

  createClaimSet(name: string): Promise<IUserApiResponse<IClaimSet>> {
    const data = {
      name: name,
    };

    return callEndpoint(USER_MODEL_ROUTE_PREFIX + Module.CLAIM_SETS, {
      method: "post",
      data: data,
    }).then((response) => {
      return response.data;
    });
  }

  updateClaimSet(
    id: number,
    name: string | null,
    claimIds: number[] | null
  ): Promise<IUserApiResponse<IClaimSet>> {
    const data = {
      name: name,
      claimIds: claimIds,
    };

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.CLAIM_SETS,
      {
        method: "patch",
        data: data,
      },
      [id.toString()]
    ).then((response) => {
      return response.data;
    });
  }

  deleteClaimSet(id: number): Promise<void> {
    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.CLAIM_SETS,
      {
        method: "delete",
      },
      [id.toString()]
    ).then(() => {
      return;
    });
  }

  getUsers(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IUser[], IGetRecordsMetadata>> {
    const selectedTenantId = userManagementAccess.getSelectedTenant()
      ? userManagementAccess.getSelectedTenant()
      : undefined;
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.USERS,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  createUser(
    name: string,
    password: string,
    emailAddress: string,
    adminLevel: UserAdminLevel | null,
    userGroupIds: number[],
    roleIds: number[],
    tenantId: number
  ): Promise<IUserApiResponse<IUser>> {
    const selectedTenantId = userManagementAccess.getSelectedTenant()
      ? userManagementAccess.getSelectedTenant()
      : undefined;
    const data = {
      name: name,
      password: password,
      emailAddress: emailAddress,
      adminLevel: adminLevel,
      userGroupIds: userGroupIds,
      roleIds: roleIds,
      tenantId: tenantId,
    };

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.USERS,
      {
        method: "post",
        data: data,
      },
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateUser(
    id: number,
    name: string | null,
    adminLevel: UserAdminLevel | null,
    tenantIds: number[] | null,
    userGroupIdsMap: Record<number, number[]> | null,
    roleIdsMap: Record<number, number[]> | null
  ): Promise<IUserApiResponse<IUser>> {
    const selectedTenantId = userManagementAccess.getSelectedTenant()
      ? userManagementAccess.getSelectedTenant()
      : undefined;
    const data = {
      name: name,
      adminLevel: adminLevel,
      tenantIds: tenantIds,
      userGroupIdsMap: userGroupIdsMap,
      roleIdsMap: roleIdsMap,
    };

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.USERS,
      {
        method: "patch",
        data: data,
      },
      [id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteUser(id: number): Promise<void> {
    const selectedTenantId = userManagementAccess.getSelectedTenant()
      ? userManagementAccess.getSelectedTenant()
      : undefined;
    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.USERS,
      {
        method: "delete",
      },
      [id.toString()],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getUserGroups(
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<IUserApiResponseWithMetadata<IUserGroup[], IGetRecordsMetadata>> {
    const selectedTenantId = userManagementAccess.getSelectedTenant()
      ? userManagementAccess.getSelectedTenant()
      : undefined;
    const params = new URLSearchParams();

    addFiltersToParams(params, filters);
    addSortToParams(params, sort);
    addPaginationToParams(params, pagination);

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.USER_GROUPS,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  createUserGroup(
    name: string,
    tenantId: number,
    claimSetIds: number[] | null,
    roleIds: number[] | null
  ): Promise<IUserApiResponse<IUserGroup>> {
    const selectedTenantId = userManagementAccess.getSelectedTenant()
      ? userManagementAccess.getSelectedTenant()
      : undefined;
    const data = {
      name: name,
      tenantId: tenantId,
      claimSetIds: claimSetIds,
      roleIds: roleIds,
    };

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.USER_GROUPS,
      {
        method: "post",
        data: data,
      },
      [],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateUserGroup(
    id: number,
    name: string | null,
    claimSetIds: number[] | null,
    roleIds: number[] | null
  ): Promise<IUserApiResponse<IUserGroup>> {
    const selectedTenantId = userManagementAccess.getSelectedTenant()
      ? userManagementAccess.getSelectedTenant()
      : undefined;
    const data = {
      name: name,
      claimSetIds: claimSetIds,
      roleIds: roleIds,
    };

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.USER_GROUPS,
      {
        method: "patch",
        data: data,
      },
      [id.toString()],
      selectedTenantId
    ).then((response) => {
      return response.data;
    });
  }

  deleteUserGroup(id: number): Promise<void> {
    const selectedTenantId = userManagementAccess.getSelectedTenant()
      ? userManagementAccess.getSelectedTenant()
      : undefined;
    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.USER_GROUPS,
      {
        method: "delete",
      },
      [id.toString()],
      selectedTenantId
    ).then(() => {
      return;
    });
  }

  getAccessToken(id: number): Promise<string> {
    const data = {
      id: id,
    };

    return callEndpoint(
      USER_MODEL_ROUTE_PREFIX + Module.USERS,
      {
        method: "post",
        data: data,
      },
      ["GetAccessToken"]
    ).then((response) => {
      return response.data;
    });
  }

  getCustomFieldByEntity(
    entity?: string
  ): Promise<
    IUserApiResponseWithMetadata<ICustomField[], IGetRecordsMetadata>
  > {
    const selectedTenantId = moduleManagementAccess.getSelectedTenant();
    const params = new URLSearchParams();

    addEntityToParams(params, entity);

    return callEndpoint(
      Module.Custom_Fields,
      {
        method: "get",
      },
      [],
      selectedTenantId,
      params
    ).then((response) => {
      return response.data;
    });
  }

  createCustomField(
    tenantId: number,
    requestCustomFieldCreate: IRequestCustomFieldCreate
  ): Promise<IUserApiResponse<IResponseFormTemplateField>> {
    return callEndpoint(
      Module.Custom_Fields,
      {
        method: "post",
        data: requestCustomFieldCreate,
      },
      [],
      tenantId
    ).then((response) => {
      console.log(response, "response");
      return response.data;
    });
  }

  deleteCustomField(tenantId: number, id: number): Promise<void> {
    return callEndpoint(
      Module.Custom_Fields,
      {
        method: "delete",
      },
      [id.toString()],
      tenantId
    ).then(() => {
      return;
    });
  }

  updateCustomField(
    tenantId: number,
    requestCustomFieldUpdate: IRequestCustomFieldUpdate
  ): Promise<IUserApiResponse<ICustomField>> {
    return callEndpoint(
      Module.Custom_Fields,
      {
        method: "patch",
        data: requestCustomFieldUpdate,
      },
      [requestCustomFieldUpdate.id.toString()],
      tenantId
    ).then((response) => {
      return response.data;
    });
  }

  updateMultipleCustomFields(
    tenantId: number,
    requestCustomFieldUpdate: IRequestCustomFieldUpdate[]
  ): Promise<IUserApiResponse<ICustomField[]>> {
    return callEndpoint(
      Module.Custom_Fields,
      {
        method: "patch",
        data: requestCustomFieldUpdate,
      },
      [],
      tenantId
    ).then((response) => {
      return response.data;
    });
  }
}

function getUrl(
  module: string,
  additionalPaths?: string[],
  tenantId?: number
): string {
  const additionalPathsString =
    additionalPaths != null ? additionalPaths.map((p) => "/" + p).join("") : "";

  if (tenantId != undefined) {
    return `${apiUrl}/api/tenants/${tenantId}/${module}${additionalPathsString}`;
  }

  return `${apiUrl}/api/${module}${additionalPathsString}`;
}

function callEndpoint(
  module: string,
  config?: AxiosRequestConfig,
  additionalPaths?: string[],
  tenantId?: number,
  params?: URLSearchParams
): Promise<AxiosResponse> {
  return new Promise((resolve, reject) => {
    const token = useCookies.get(cookieKeys.AUTH0_ACCESS_TOKEN);

    return axios({
      ...config,
      url: getUrl(module, additionalPaths, tenantId),
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: params,
    })
      .then((response) => {
        //console.log("response", response);
        resolve(response);
      })
      .catch((error: AxiosError) => {
        //console.error(error);
        reject(error.response);
      });
  });
}

function addFiltersToParams(params: URLSearchParams, filters?: IFilters): void {
  if (filters) params.append("filters", JSON.stringify(filters));
}

function addSortToParams(params: URLSearchParams, sort?: ISort): void {
  if (sort) params.append("sort", JSON.stringify(sort));
}

function addPaginationToParams(
  params: URLSearchParams,
  pagination?: IPagination
): void {
  if (pagination) params.append("pagination", JSON.stringify(pagination));
}

function addEntityToParams(params: URLSearchParams, entity?: string): void {
  if (entity) params.append("entity", entity);
}
