import {
  FilterStringOperator,
  FilterType,
  SortOrderOption,
} from "../../cloudconLibrary/utilities/useConstants";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";
import moment from "moment-timezone";

export default function commonController() {
  function formatDate(date: any) {
    return moment(new Date(date)).format("DD MMM, YYYY");
  }

  function getPagination(
    itemsPerPage: number,
    pageNumber: number
  ): IPagination {
    return {
      ItemsPerPage: itemsPerPage,
      PageNumber: pageNumber,
    };
  }

  function getFilter(field: string, searchKey: string): IFilters {
    return {
      Field: field,
      Type: FilterType.STRING,
      Operator: FilterStringOperator.CONTAINS,
      Value: searchKey,
    };
  }

  function getSort(field: string, order: SortOrderOption): ISort {
    return [{ Field: field, Order: order }];
  }

  async function getRecords(
    endpoint: any,
    searchKey: string,
    sortKey: string,
    sortOrders: SortOrderOption,
    itemsPerPage: number,
    pageNumber: number
  ) {
    try {
      const data = await endpoint(
        itemsPerPage,
        pageNumber,
        "name",
        searchKey,
        sortKey,
        sortOrders
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  return {
    formatDate,
    getPagination,
    getFilter,
    getSort,
    getRecords,
  };
}
