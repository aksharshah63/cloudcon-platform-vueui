import { NullablePrimitive } from "../../store/index";
import { Ref } from "vue";
import { CancelTokenSource } from "axios";
import { FilterOperation } from "../../use/utils/useConstants";

export interface IFilter {
  Column: string;
  Operation: FilterOperation;
  Value: (string | number | boolean)[];
}

export interface IResponseData {
  data: IResponseTableData;
  linkedData: Record<string, IResponseTableData>;
  timeTaken: string | null;
}

export interface IResponseTableData {
  tableData: IRecord[];
  source: string;
  timeTaken: string | null;
}

export type IRecord = Record<
  string,
  NullablePrimitive | Record<string, NullablePrimitive>
>;

export interface IUpviseResponseRecord {
  tableName: string;
  id: string;
  row: IRecord;
}

export interface IFavourite {
  recordid?: string;
  owner: string;
  isGlobal: boolean;
  columnLayout: Record<string, Record<string, number>>;
  filters: Record<string, Record<string, IGridSlicingFilter>>;
  sort: ISort[];
  name: string;
  itemsPerPage: number;
  whoFavourited: string[];
  _type?: string;
}

export type IUpviseResponse = IUpviseResponseRecord[];

export type IStore = Record<string, IEntity>;

export type IEntity = Record<string, IRecord>;

export type ITable = IRecord[];

export interface IColumnMetadata {
  BackingFieldInternalName?: string | null; // stores the internal name of any fields related to this one. eg. companyName as companyid as a backingFieldInternalName
  CustomId?: string | null;
  ColumnIndex?: number;
  CustomRank?: number;
  DefaultValue?: string | null;
  DisplayOrderIndex?: number | null;
  Hidden?: boolean | undefined;
  InternalName?: string | null;
  IsCalculated?: boolean | null;
  IsCustom?: boolean;
  IsKey?: boolean;
  IsPersisted?: boolean;
  IsRequired?: boolean;
  IsVisible?: boolean;
  Key?: string | null;
  Label?: string | null;
  Lookup?: string | null;
  LookupValue?: string | null;
  RawType?: string | null;
  Section?: number | null;
  SelectOptions?: Record<string, string> | null;
  SortDirection?: number | undefined;
  SortIndex?: number | undefined;
  Style?: string | null;
  SupportsFiltering?: boolean | null;
  Title?: string | null;
  TooltipValue?: string | null;
  Type?: string | null;
  WatermarkValue?: string | null;
  Width?: string | null; // saving the width of parent element to carry over to child
}

export interface ITableResponse {
  Location: ILocationMetadata;
  Schema: IColumnMetadata[];
  Type: number;
}

export interface ILocationMetadata {
  ApiEndpoint?: string | null;
  Filter?: Record<string, unknown>[] | null;
  Name: string;
  Type: number;
  Values?: Record<string, unknown> | null;
}

export type ISlicing = Record<string, string>;
export type IGrouping = Record<number, IGroupDetail>;
export interface IGroupDetail {
  Type: string;
  Name?: string | null;
  ReflectiveName?: string | null;
  BaseType: string | null;
  LookupKey: string;
}
export interface IGridSlicing {
  fieldNames: string[];
  displayName: string;
  filtersToApply: Record<string, IGridSlicingFilter>;
}

export interface IGridSlicingFilter {
  operator: string | undefined;
  constraints: IConstraint[];
}

export interface IConstraint {
  value: unknown;
  matchMode: string | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ILookup = Record<string, ITable | IRecord | any>;

export interface IUpviseDataMessage {
  selection: Record<string, string>;
  persistence: Record<string, ITableResponse>;
  configuration: {
    Filters?: Record<string, Record<string, unknown>>;
    GlobalSearch: { Global: { Value: string | null; MatchMode: string } };
  };
  definition: { Grouping: IGrouping; Slicing: ISlicing };
}

export type ISort = { field: string; order: number };

export interface IChartMessage {
  data: Record<string, IChartData>;
  series: IChartSeriesData[] | IPieChartSeriesData[];
  categories: string[];
}

export interface IChartData {
  Y: number;
  className?: string;
}
export interface IChartOptions {
  security?: string;
  chartName: string;
  xField: string;
  yField: string;
  timeZone: string;
  slicing?: unknown;
}

export interface IChartSeriesData {
  name: string;
  colorByPoint?: boolean;
  data: number[];
}

export interface IPieChartSeriesData {
  name: string;
  colorByPoint?: boolean;
  data: Record<string, string | number>[];
}

export interface IModuleOption {
  id: string;
  path: string;
  name: string;
  menuGroups: IMenuGroup[];
  visible: boolean;
}

export interface IModuleOption1 {
  asssetNumber: string;
  name: string;
  startOdometer: number;
  starDate: string;
  endOdometer:number;
  endDate: string;
  average: number;
  total: number;
}

export interface IModuleOptionPeople {
  name: string;
  company: string;
  groups: string;
  email: string;
  mobile: number;
  status: string;
  action: string;
}

export interface IMenuGroup {
  id: string;
  name: string;
  menuItems: IMenuItem[];
}

export interface IMenuItem {
  id: string;
  path: string;
  name: string;
  icon: string;
  visible: boolean;
}

export interface IUpvise {
  upvise?: IUpvise;
  readonly isFetchComplete: Ref<boolean>;
  readonly upviseUser: string;
  readonly upviseUserIsAdmin: boolean;
  readonly userEmail: string;
  readonly entityFilter: (
    entityName: string,
    field: string,
    value: unknown
  ) => ITable;
  readonly upviseSelector: Record<number, string>;
  readonly upviseDashboardPage: string;
  readonly metadata: (
    moduleName: string,
    viewName?: string
  ) => Promise<IUpviseDataMessage>;
  readonly upvisePage: string;
  update: (
    data: Record<string, IRecord[]>,
    upviseDataMessage?: IUpviseDataMessage | null
  ) => Promise<void>;
  readonly updateStore: (data: Record<string, IRecord[]>) => void;
  readonly upviseClient: string;
  fetch: (moduleName: string, stream?: boolean) => Promise<void>;
  fetchChartData: (
    endpoint: string,
    body: IChartOptions,
    cancelToken?: CancelTokenSource
  ) => Promise<IChartMessage>;
  readonly upviseApiUrl: string;
  readonly upviseApiKey: string;
  readonly state: () => IStore;
  readonly recordData: (entity: string, id: string) => IRecord;
  readonly entityData: (entity: string) => IEntity;
  readonly removeRecordData: (entity: string, id: string) => void;
  readonly removeSchemaOnlyData: (tableName: string, ids: string[]) => void;
}
