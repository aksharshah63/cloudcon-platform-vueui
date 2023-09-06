export interface IDataFilter {
  filterArray<T extends Record<string, unknown>>(
    data: T[],
    filters: IDataFilters
  ): T[];
  filterDictionary<T extends Record<string, unknown>>(
    data: Record<string, T>,
    filters: IDataFilters
  ): Record<string, T>;
  getFilterOperatorLabel(
    operator: DataFilterOperator,
    type: DataFilterType
  ): string;
  getFilterConditionLabel(condition: DataFilterCondition): string;
  isValidRule(rule: Partial<IDataFilterRule>): boolean;
  getFilterType(rawType: string): DataFilterType | null;
}

export type IDataFilters = IDataFilterGroup | IDataFilterRule;

export interface IDataFilterGroup {
  condition: DataFilterCondition;
  rules: IDataFilters[];
}

export interface IDataFilterRule {
  field: string;
  type: DataFilterType;
  operator: DataFilterOperator;
  value?: DataFilterValue;
}

export enum DataFilterCondition {
  AND = "and",
  OR = "or",
}

export enum DataFilterType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

export type DataFilterValue = string | number | boolean | string[] | number[];

export type DataFilterOperator =
  | DataFilterStringOperator
  | DataFilterNumberOperator
  | DataFilterBooleanOperator;

export enum DataFilterStringOperator {
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

export enum DataFilterNumberOperator {
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

export enum DataFilterBooleanOperator {
  EQUAL = "equal",
  NOT_EQUAL = "not_equal",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",
}
