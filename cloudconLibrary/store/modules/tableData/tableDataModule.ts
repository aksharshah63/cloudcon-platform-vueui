import { NullablePrimitive } from "../../../utilities/useGenericInterfaces";
import tableDataGetters from "./tableDataGetters";
import tableDataMutations from "./tableDataMutations";
import tableDataActions from "./tableDataActions";
import { FilterOperation } from "../../../utilities/useConstants";

export interface ITableRecord {
  id?: string;
  _rowColour?: string;
  [key: string]: NullablePrimitive | Record<string, NullablePrimitive>;
}

export type IEntity = Record<string, ITableRecord>;

export interface IMetadata {
  selection: Record<string, string>;
  persistence: Record<string, ITableResponse>;
  configuration: {
    Filters?: Record<string, Record<string, unknown>>;
    GlobalSearch: { Global: { Value: string | null; MatchMode: string } };
  };
  definition: { Grouping: IGrouping; Slicing: ISlicing };
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

export type IGrouping = Record<number, IGroupDetail>;

export interface IGroupDetail {
  Type: string;
  Name?: string | null;
  ReflectiveName?: string | null;
  BaseType: string | null;
  LookupKey: string;
}

export type ISlicing = Record<string, string>;

export interface IFilter {
  Column: string;
  Operation: FilterOperation;
  Value: (string | number | boolean)[];
}

export interface IResponseData {
  data: IResponseTableData;
  linkedData: Record<string, IResponseTableData>;
  timeTaken: string | null;
  metadata: IResponseMetadata;
}

export interface IResponseTableData {
  tableData: ITableRecord[];
  source: string;
  timeTaken: string | null;
}

export interface IResponseMetadata {
  paginationPage: number | null;
  paginationItemsPerPage: number | null;
  paginationTotalPages: number | null;
  paginationFirstLink: number | null;
  paginationNextLink: number | null;
  paginationPreviousLink: number | null;
  paginationLastLink: number | null;
  numberOfRecords: number | null;
  totalNumberOfRecords: number | null;
}

export type ITableDataState = Record<string, Record<string, ITableRecord>>;

export class Metadata implements IMetadata {
  selection: Record<string, string>;
  persistence: Record<string, ITableResponse>;
  configuration: {
    GlobalSearch: { Global: { Value: string | null; MatchMode: string } };
  } = { GlobalSearch: { Global: { Value: null, MatchMode: "" } } };
  definition: { Grouping: IGrouping; Slicing: ISlicing } = {
    Grouping: {},
    Slicing: {},
  };

  constructor(
    selection: Record<string, string> = {},
    persistence: Record<string, ITableResponse> = {},
    configuration: {
      GlobalSearch: { Global: { Value: string | null; MatchMode: string } };
    } = { GlobalSearch: { Global: { Value: null, MatchMode: "" } } },
    definition: { Grouping: IGrouping; Slicing: ISlicing } = {
      Grouping: {},
      Slicing: {},
    }
  ) {
    this.selection = selection;
    this.persistence = persistence;
    this.configuration = configuration;
    this.definition = definition;
  }
}

const state: ITableDataState = {};

export default {
  namespaced: true,
  state,
  getters: tableDataGetters,
  mutations: tableDataMutations,
  actions: tableDataActions,
};
