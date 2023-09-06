import {
  DataFilterBooleanOperator,
  DataFilterCondition,
  DataFilterNumberOperator,
  DataFilterOperator,
  DataFilterStringOperator,
  DataFilterType,
  IDataFilter,
  IDataFilterRule,
  IDataFilters,
} from "./dataFilterInterfaces";

export class DataFilter implements IDataFilter {
  filterArray<T extends Record<string, unknown>>(
    data: T[],
    filters: IDataFilters
  ): T[] {
    return data.filter((d) => {
      return filterItem(d, filters);
    });
  }

  filterDictionary<T extends Record<string, unknown>>(
    data: Record<string, T>,
    filters: IDataFilters
  ): Record<string, T> {
    return Object.fromEntries(
      Object.entries(data).filter(([_, d]) => {
        return filterItem(d, filters);
      })
    );
  }

  getFilterOperatorLabel(
    operator: DataFilterOperator,
    type: DataFilterType
  ): string {
    switch (type) {
      case DataFilterType.STRING:
        return getDataFilterStringOperatorLabel(
          operator as DataFilterStringOperator
        );
      case DataFilterType.NUMBER:
        return getDataFilterNumberOperatorLabel(
          operator as DataFilterNumberOperator
        );
      case DataFilterType.BOOLEAN:
        return getDataFilterBooleanOperatorLabel(
          operator as DataFilterBooleanOperator
        );
    }
  }

  getFilterConditionLabel(condition: DataFilterCondition): string {
    const conditionLabelsMap: Record<DataFilterCondition, string> = {
      [DataFilterCondition.AND]: "AND",
      [DataFilterCondition.OR]: "OR",
    };

    return conditionLabelsMap[condition] ?? "";
  }

  isValidRule(rule: Partial<IDataFilterRule>): boolean {
    if ("field" in rule && "operator" in rule && "type" in rule) return true;
    return false;
  }

  getFilterType(rawType: string): DataFilterType | null {
    switch (rawType.toLowerCase()) {
      case "company":
      case "contact":
      case "email":
      case "form":
      case "label":
      case "link":
      case "opp":
      case "owner":
      case "phone":
      case "product":
      case "project":
      case "risk":
      case "tool":
      case "select":
      case "selectmulti":
      case "string":
      case "text":
      case "textarea":
      case "user":
        return DataFilterType.STRING;
      case "date":
      case "datetime":
      case "decimal":
      case "duration":
      case "integer":
      case "numeric":
      case "real":
      case "score":
      case "time":
        return DataFilterType.NUMBER;
      case "boolean":
      case "checkbox":
      case "toggle":
        return DataFilterType.BOOLEAN;
      default:
        return null;
    }
  }
}

export const stringOperatorLabelsMap: Record<DataFilterStringOperator, string> =
  {
    [DataFilterStringOperator.BEGINS_WITH]: "Begins With",
    [DataFilterStringOperator.CONTAINS]: "Contains",
    [DataFilterStringOperator.ENDS_WITH]: "Ends With",
    [DataFilterStringOperator.EQUAL]: "Equals",
    [DataFilterStringOperator.IN]: "In",
    [DataFilterStringOperator.IS_EMPTY]: "Is Empty",
    [DataFilterStringOperator.IS_NOT_EMPTY]: "Is Not Empty",
    [DataFilterStringOperator.IS_NOT_NULL]: "Exists",
    [DataFilterStringOperator.IS_NULL]: "Does Not Exist",
    [DataFilterStringOperator.NOT_BEGINS_WITH]: "Does Not Begin With",
    [DataFilterStringOperator.NOT_CONTAINS]: "Does Not Contain",
    [DataFilterStringOperator.NOT_ENDS_WITH]: "Does Not End With",
    [DataFilterStringOperator.NOT_EQUAL]: "Not Equal To",
    [DataFilterStringOperator.NOT_IN]: "Not In",
  };

export const numberOperatorLabelsMap: Record<DataFilterNumberOperator, string> =
  {
    [DataFilterNumberOperator.BETWEEN]: "Between",
    [DataFilterNumberOperator.EQUAL]: "Equals",
    [DataFilterNumberOperator.GREATER]: "Greater Than",
    [DataFilterNumberOperator.GREATER_OR_EQUAL]: "Greater Than Or Equal To",
    [DataFilterNumberOperator.IN]: "In",
    [DataFilterNumberOperator.IS_NOT_NULL]: "Exists",
    [DataFilterNumberOperator.IS_NULL]: "Does Not Exist",
    [DataFilterNumberOperator.LESS]: "Less Than",
    [DataFilterNumberOperator.LESS_OR_EQUAL]: "Less Than Or Equal To",
    [DataFilterNumberOperator.NOT_BETWEEN]: "Not Between",
    [DataFilterNumberOperator.NOT_EQUAL]: "Not Equal To",
    [DataFilterNumberOperator.NOT_IN]: "Not In",
  };

export const booleanOperatorLabelsMap: Record<
  DataFilterBooleanOperator,
  string
> = {
  [DataFilterBooleanOperator.EQUAL]: "Equals",
  [DataFilterBooleanOperator.IS_NOT_NULL]: "Exists",
  [DataFilterBooleanOperator.IS_NULL]: "Does Not Exist",
  [DataFilterBooleanOperator.NOT_EQUAL]: "Not Equal To",
};

function filterItem(
  item: Record<string, unknown>,
  filters: IDataFilters
): boolean {
  if ("condition" in filters) {
    switch (filters.condition) {
      case DataFilterCondition.AND:
        return filters.rules.every((r) => filterItem(item, r));
      case DataFilterCondition.OR:
        return filters.rules.some((r) => filterItem(item, r));
    }
  } else {
    return applyFilterRule(item, filters);
  }
}

function applyFilterRule(
  item: Record<string, unknown>,
  filter: IDataFilterRule
): boolean {
  switch (filter.type) {
    case DataFilterType.NUMBER:
      return applyNumberFilterRule(item, filter);
    case DataFilterType.STRING:
      return applyStringFilterRule(item, filter);
    case DataFilterType.BOOLEAN:
      return applyBooleanFilterRule(item, filter);
    default:
      return false;
  }
}

function applyStringFilterRule(
  item: Record<string, unknown>,
  filter: IDataFilterRule
): boolean {
  const itemValue = item[filter.field];

  switch (filter.operator) {
    case DataFilterStringOperator.EQUAL:
      return typeof itemValue === "string" && itemValue == filter.value;
    case DataFilterStringOperator.NOT_EQUAL:
      return typeof itemValue !== "string" || itemValue != filter.value;
    case DataFilterStringOperator.IN:
      return (
        typeof itemValue === "string" &&
        Array.isArray(filter.value) &&
        filter.value.some(
          (v: string | number) => typeof v === "string" && v == itemValue
        )
      );
    case DataFilterStringOperator.NOT_IN:
      return (
        typeof itemValue === "string" &&
        Array.isArray(filter.value) &&
        !filter.value.some(
          (v: string | number) => typeof v === "string" && v == itemValue
        )
      );
    case DataFilterStringOperator.BEGINS_WITH:
      return (
        typeof itemValue === "string" &&
        typeof filter.value === "string" &&
        itemValue.startsWith(filter.value)
      );
    case DataFilterStringOperator.NOT_BEGINS_WITH:
      return (
        typeof itemValue !== "string" ||
        (typeof filter.value === "string" &&
          !itemValue.startsWith(filter.value))
      );
    case DataFilterStringOperator.CONTAINS:
      return (
        typeof itemValue === "string" &&
        typeof filter.value === "string" &&
        itemValue.includes(filter.value)
      );
    case DataFilterStringOperator.NOT_CONTAINS:
      return (
        typeof itemValue !== "string" ||
        (typeof filter.value === "string" && !itemValue.includes(filter.value))
      );
    case DataFilterStringOperator.ENDS_WITH:
      return (
        typeof itemValue === "string" &&
        typeof filter.value === "string" &&
        itemValue.endsWith(filter.value)
      );
    case DataFilterStringOperator.NOT_ENDS_WITH:
      return (
        typeof itemValue !== "string" ||
        (typeof filter.value === "string" && !itemValue.endsWith(filter.value))
      );
    case DataFilterStringOperator.IS_EMPTY:
      return typeof itemValue === "string" && itemValue === "";
    case DataFilterStringOperator.IS_NOT_EMPTY:
      return typeof itemValue !== "string" || itemValue !== "";
    case DataFilterStringOperator.IS_NULL:
      return itemValue == null;
    case DataFilterStringOperator.IS_NOT_NULL:
      return itemValue != null;
    default:
      return false;
  }
}

function applyNumberFilterRule(
  item: Record<string, unknown>,
  filter: IDataFilterRule
): boolean {
  const itemValue = item[filter.field];
  const numberValue = Number(itemValue);

  switch (filter.operator) {
    case DataFilterNumberOperator.EQUAL:
      return (
        itemValue != null && !isNaN(numberValue) && numberValue == filter.value
      );
    case DataFilterNumberOperator.NOT_EQUAL:
      return (
        itemValue == null || isNaN(numberValue) || numberValue != filter.value
      );
    case DataFilterNumberOperator.IN:
      return (
        itemValue != null &&
        !isNaN(numberValue) &&
        Array.isArray(filter.value) &&
        filter.value.some((v: string | number) => {
          const n = Number(v);
          return n != null && !isNaN(n) && n == numberValue;
        })
      );
    case DataFilterNumberOperator.NOT_IN:
      return (
        itemValue == null ||
        isNaN(numberValue) ||
        (Array.isArray(filter.value) &&
          !filter.value.some((v: string | number) => {
            const n = Number(v);
            return n != null && !isNaN(n) && n == numberValue;
          }))
      );
    case DataFilterNumberOperator.LESS:
      return (
        itemValue != null &&
        filter.value != null &&
        !isNaN(numberValue) &&
        numberValue < filter.value
      );
    case DataFilterNumberOperator.LESS_OR_EQUAL:
      return (
        itemValue != null &&
        filter.value != null &&
        !isNaN(numberValue) &&
        numberValue <= filter.value
      );
    case DataFilterNumberOperator.GREATER:
      return (
        itemValue != null &&
        filter.value != null &&
        !isNaN(numberValue) &&
        numberValue > filter.value
      );
    case DataFilterNumberOperator.GREATER_OR_EQUAL:
      return (
        itemValue != null &&
        filter.value != null &&
        !isNaN(numberValue) &&
        numberValue >= filter.value
      );
    case DataFilterNumberOperator.BETWEEN:
      return (
        itemValue != null &&
        !isNaN(numberValue) &&
        Array.isArray(filter.value) &&
        filter.value.length == 2 &&
        numberValue >= filter.value[0] &&
        numberValue <= filter.value[1]
      );
    case DataFilterNumberOperator.NOT_BETWEEN:
      return (
        itemValue == null ||
        isNaN(numberValue) ||
        (Array.isArray(filter.value) &&
          filter.value.length == 2 &&
          !(numberValue >= filter.value[0] && numberValue <= filter.value[1]))
      );
    case DataFilterNumberOperator.IS_NULL:
      return itemValue == null;
    case DataFilterNumberOperator.IS_NOT_NULL:
      return itemValue != null;
    default:
      return false;
  }
}

function applyBooleanFilterRule(
  item: Record<string, unknown>,
  filter: IDataFilterRule
): boolean {
  const itemValue = item[filter.field];

  switch (filter.operator) {
    case DataFilterBooleanOperator.EQUAL:
      return typeof itemValue === "boolean" && itemValue == filter.value;
    case DataFilterBooleanOperator.NOT_EQUAL:
      return typeof itemValue !== "boolean" || itemValue != filter.value;
    case DataFilterBooleanOperator.IS_NULL:
      return itemValue == null;
    case DataFilterBooleanOperator.IS_NOT_NULL:
      return itemValue != null;
    default:
      return false;
  }
}

function getDataFilterStringOperatorLabel(
  operator: DataFilterStringOperator
): string {
  return stringOperatorLabelsMap[operator] ?? "";
}

function getDataFilterNumberOperatorLabel(
  operator: DataFilterNumberOperator
): string {
  return numberOperatorLabelsMap[operator] ?? "";
}

function getDataFilterBooleanOperatorLabel(
  operator: DataFilterBooleanOperator
): string {
  return booleanOperatorLabelsMap[operator] ?? "";
}
