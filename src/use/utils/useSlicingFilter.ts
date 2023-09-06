import {
  IConstraint,
  IGridSlicingFilter,
  IRecord,
} from "../../store/modules/upvise.d";
import { FilterMatchMode, FilterOperator } from "primevue/api";

export default function useSlicingFilter() {
  function applySliceFilter(
    record: IRecord,
    filters: Record<string, IGridSlicingFilter>
  ) {
    return Object.entries(filters).every(([attribute, filter]) => {
      const constraints = filter.constraints;
      if (filter.operator === FilterOperator.AND) {
        return constraints.every((c) => applyFilter(record[attribute], c));
      } else if (filter.operator === FilterOperator.OR) {
        return constraints.some((c) => applyFilter(record[attribute], c));
      } else
        console.log(
          "The slicing information is not set up correctly. Operator should be either 'and' or 'or'"
        );
      return true;
    });
  }

  function applyFilter(value: unknown, constraint: IConstraint): boolean {
    const matchMode = constraint.matchMode;
    const constraintValue = constraint.value;

    if (matchMode === FilterMatchMode.EQUALS)
      return checkEqual(value, constraintValue);
    else if (matchMode === FilterMatchMode.NOT_EQUALS)
      return !checkEqual(value, constraintValue);
    else if (matchMode === FilterMatchMode.CONTAINS)
      return checkContains(value as string, constraintValue as string);
    else if (matchMode === FilterMatchMode.NOT_CONTAINS)
      return !checkContains(value as string, constraintValue as string);
    else if (matchMode === FilterMatchMode.STARTS_WITH)
      return checkStartsWith(value as string, constraintValue as string);
    else if (matchMode === FilterMatchMode.ENDS_WITH)
      return checkEndsWith(value as string, constraintValue as string);

    return true;
  }

  function checkEqual(value: unknown, constraintValue: unknown): boolean {
    return value === constraintValue;
  }

  function checkContains(value: string, constraintValue: string): boolean {
    return value?.includes(constraintValue) ?? false;
  }

  function checkStartsWith(value: string, constraintValue: string): boolean {
    return value?.startsWith(constraintValue) ?? false;
  }

  function checkEndsWith(value: string, constraintValue: string): boolean {
    return value?.endsWith(constraintValue) ?? false;
  }

  return {
    applySliceFilter,
  };
}
