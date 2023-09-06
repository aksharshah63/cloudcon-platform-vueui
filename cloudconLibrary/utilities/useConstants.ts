// enums

export enum ClaimsType {
  RESTRICTED = -1,
  LIMITED_RESTRICTION = 0,
  NO_RESTRICTION = 1,
}

export enum DateAllocationTypes {
  DAY = "day",
  WEEK = "week",
  YEAR_WEEK = "yearWeek",
  MONTH = "month",
  YEAR = "year",
}

export enum FilterOperation {
  EQUALS = "equals",
  IN = "in",
  LESS_THAN = "lessThan",
  LESS_THAN_OR_EQUALS = "lessThanOrEquals",
  GREATER_THAN = "greaterThan",
  GREATER_THAN_OR_EQUALS = "greaterThanOrEquals",
}

export enum ModuleNames {
  FABRICATION = "fabrication",
  PROCESSING = "processing",
}

export enum useTableNames {
  ADMIN_CLAIMS = "TableClaims",
  ADMIN_COMPANY = "TableCompany",
  ADMIN_ROLES = "TableRoles",
  ADMIN_USERS = "TableUsers",
  CONTACTS = "TableUnybizContactsContacts",
  LOOKUPS = "TableEmployeedashboardLookups",
  METADATA = "TableEmployeedashboardMetadata",
  METADATA_SECTIONS = "TableEmployeedashboardNew_Metadata_Sections",
  TOOLS = "TableToolsTools",
  TOOLS_GROUPS = "TableToolsGroups",
  TOOLS_USAGE_LOGS = "TableToolsUsageLogs",
  WORKSHOP_FABRICATION = "TableWorkshopFabrication",
  WORKSHOP_FABRICATION_Progress = "TableWorkshopFabricationprogress",
  WORKSHOP_LOT = "TableWorkshopLot",
  WORKSHOP_PROCESSING = "TableWorkshopProcessing",
  WORKSHOP_PROCESSING_EQUIPMENT = "TableWorkshopProcessingequipment",
  WORKSHOP_RELEASE = "TableWorkshopRelease",
  PAYROLL_TIMESHEETS = "TablePayrollv3Timesheets",
  PROJECTS = "TableUnybizProjectsProjects",
  PROJECT_PLANNER_ACTUALS = "TableEmployeedashboardActuals",
  PROJECT_PLANNER_BUDGETS = "TableEmployeedashboardBudgets",
  PROJECT_PLANNER_TASKS = "TableSchedulerTasks",
  PROJECT_PLANNER_MILESTONES = "TableSchedulerMilestones",
}

export enum LegendIconTypes {
  SQUARE = "square",
}

export enum PlannerTaskProgressType {
  PERCENTAGE = 0,
  UNIT_VALUE = 1,
}

export enum ProgressStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
}

export enum TimesheetsStatus {
  NOT_SET = -100,
  REJECTED = -2,
  WARNING = -1,
  DRAFT = 0,
  APPROVED = 1,
  SENT = 2,
  CONFLICTING_STATUS = 4,
}

export enum TimesheetsShiftTypes {
  SETTING = "payroll_shiftTypes",
  ANNUAL_LEAVE = "annualLeave",
  OTHER_LEAVE = "otherLeave",
  OVERTIME_1 = "overtime1",
  OVERTIME_2 = "overtime2",
  PERSONAL_LEAVE = "personalLeave",
  REGULAR = "regular",
  RDO_TAKEN = "rdoTaken",
  SICK_LEAVE = "sickLeave",
  UNPAID_LEAVE = "unpaidLeave",
  ALLOWANCE = "allowance",
  OTHER = "other",
}

export enum ToastSeverity {
  SUCCESS = "success",
  INFO = "info",
  WARNING = "warn",
  ERROR = "error",
}

export enum UpviseCheckboxTypeStatus {
  FALSE = "0",
  TRUE = "1",
}

export enum WorkshopSource {
  TEKLA = "Tekla",
  MANUAL = "Manual",
}

// options used in select and multiselect inputs

export const OptionsProgressStatus = [
  { label: "Not Started", value: ProgressStatus.NOT_STARTED, colour: "red" },
  { label: "In Progress", value: ProgressStatus.IN_PROGRESS, colour: "yellow" },
  { label: "Completed", value: ProgressStatus.COMPLETED, colour: "green" },
];

export enum UserAdminLevel {
  STANDARD = 0,
  SUPER_ADMIN = 1,
}

// Link submodule to id in MySql
export enum SubmoduleId {
  ADMIN = 46,

  DATABASE_MIGRATION_TOOL = 2,
  TENANTS = 3,
  ROLES = 4,
  ACTIONS = 5,
  MODULES = 6,
  CLAIMS = 7,
  USERS = 8,
  EQUIPMENT = 9,
  EQUIPMENT_CMMIS = 16,
  EQUIPMENT_COMPLIANCE = 17,
  EQUIPMENT_FORMS = 18,
  EQUIPMENT_PRESTART = 19,
  EQUIPMENT_UTILIZATION = 20,
  EQUIPMENT_CATEGORIES = 21,
  COMPANIES = 30,
  CONTACTS = 32,
  FILES = 35,
}

// Link action to id in MySql
export enum ActionId {
  CREATE = 2,
  READ = 3,
  UPDATE = 1,
  DELETE = 4,
}

export enum cookieKeys {
  AUTH0_ACCESS_TOKEN = "auth0AccessToken",
  AUTH0_REFRESH_TOKEN = "auth0RefreshToken",
  TENANT_ID = "atlasTenantId",
  EMAIL_ADDRESS = "atlasEmailAddress",
}

export enum SortOrderOption {
  ASCENDING = "asc",
  DESCENDING = "desc",
}

export enum FilterCondition {
  AND = "and",
  OR = "or",
}

export enum FilterType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

export enum FilterStringOperator {
  EQUAL = "equal",
  NOT_EQUAL = "not_equal",
  IN = "in",
  NOT_IN = "not_in",
  BEGINS_WITH = "begins_with",
  NOT_BEGINS_WITH = "not_begins_with",
  CONTAINS = "contains",
  NOT_CONTAINS = "not_contains",
  ENDS_WITH = "ends_with",
  NOT_ENDS_WITH = "not_ends_with",
  IS_EMPTY = "is_empty",
  IS_NOT_EMPTY = "is_not_empty",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",
}

export enum FilterNumberOperator {
  EQUAL = "equal",
  NOT_EQUAL = "not_equal",
  IN = "in",
  NOT_IN = "not_in",
  LESS = "less",
  LESS_OR_EQUAL = "less_or_equal",
  GREATER = "greater",
  GREATER_OR_EQUAL = "greater_or_equal",
  BETWEEN = "between",
  NOT_BETWEEN = "not_between",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",
}

export enum FilterBooleanOperator {
  EQUAL = "equal",
  NOT_EQUAL = "not_equal",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",
}

export enum JobResourceType {
  PRODUCT = 0,
  COMPANY = 1,
  NAME = 2,
}
