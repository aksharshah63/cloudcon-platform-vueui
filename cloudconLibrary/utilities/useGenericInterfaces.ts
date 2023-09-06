import {
  FilterBooleanOperator,
  FilterCondition,
  FilterNumberOperator,
  FilterStringOperator,
  FilterType,
  SortOrderOption,
} from "./useConstants";

export type Primitive = string | boolean | number | Date;
export type NullablePrimitive = Primitive | null | undefined;
export interface IRecord {
  [key: string]: NullablePrimitive | Record<string, NullablePrimitive>;
}

export type IFilters = IFilterGroup | IFilterRule;

export interface IFilterGroup {
  Condition: FilterCondition;
  Rules: IFilters[];
}

export interface IFilterRule {
  Field: string;
  Type: FilterType;
  Operator: FilterOperator;
  Value?: FilterValue;
}

export interface IPagination {
  PageNumber: number;
  ItemsPerPage: number;
}

export type ISort = ISortItem[];

export interface ISortItem {
  Field: string;
  Order: SortOrderOption;
}

export type FilterValue = string | number | boolean | string[] | number[];

export type FilterOperator =
  | FilterStringOperator
  | FilterNumberOperator
  | FilterBooleanOperator;
