import { IRecord, IUpvise } from "../../store/modules/upvise.d";
import { orderBy } from "lodash";
import utils from "./useUtils";
import dateOperation from "../utils/useDateOperations";
import { DateAllocationTypes } from "../utils/useConstants";

export default function useDateAllocationController() {
  const tableName = "_Dateallocation";

  function newAllocation(date: number, format: string): IRecord {
    return {
      id: date.toString(),
      label: dateOperation.getDateString(date, format),
      rank: 0,
    };
  }

  function initialiseAllocations(
    upvise: IUpvise,
    allocationType: DateAllocationTypes,
    upviseData: IRecord[],
    field: string,
    allocationFormat?: string
  ) {
    upvise.updateStore({
      [tableName]: mapAllocations(
        allocationType,
        upviseData,
        field,
        allocationFormat
      ),
    });
  }

  function mapAllocations(
    allocationType: DateAllocationTypes,
    upviseData: IRecord[],
    field: string,
    allocationFormat?: string
  ) {
    const format = allocationFormat
      ? allocationFormat
      : getDefaultFormat(allocationType);
    const allAllocations: IRecord[] = [];
    upviseData.forEach((data) => {
      const date = Number(data[field]);
      if (isNaN(date)) return;
      const allocationId = getAllocationId(allocationType, date).toString();
      const existingAllocation = allAllocations.find(
        (allocation) => allocation.id === allocationId
      );
      if (existingAllocation) {
        data.dateallocationid = existingAllocation.id;
      } else {
        allAllocations.push(newAllocation(Number(allocationId), format));
        data.dateallocationid = allocationId;
      }
    });

    const sortedAllocations = sortDateAllocations(allAllocations);
    // set ordering of all allocations
    sortedAllocations.forEach((allocation, index) => {
      allocation.rank = index;
    });
    return sortedAllocations;
  }

  function deleteUnusedAllocations(
    upvise: IUpvise,
    allocations: IRecord[],
    data: IRecord[]
  ) {
    const deleteIds = [] as string[];
    allocations.forEach((allocation) => {
      if (data.some((d) => d.dateallocationid == allocation.id)) return;
      else {
        deleteIds.push(allocation.id as string);
      }
    });
    if (deleteIds.length > 0) upvise.removeSchemaOnlyData(tableName, deleteIds);
  }

  function sortDateAllocations(allocationRecords: IRecord[]) {
    return orderBy(allocationRecords, ["id"], ["asc"]);
  }

  function updateAllocationRecords(
    allocationType: DateAllocationTypes,
    storeData: IRecord[],
    upvise: IUpvise,
    field: string,
    allocationFormat?: string
  ) {
    const dateAllocations = Object.values(
      upvise.entityData(tableName)
    ) as unknown as IRecord[];
    const format = allocationFormat
      ? allocationFormat
      : getDefaultFormat(allocationType);

    const affectedAllocations = new Set<string>();

    storeData.forEach((r) => {
      if (r.dateallocationid)
        affectedAllocations.add(r.dateallocationid as string);

      const date = Number(r[field]);
      if (utils.IsActive(r as unknown as IRecord) && !isNaN(date)) {
        r.dateallocationid = getAllocationId(allocationType, date);

        const existingAllocation = dateAllocations.find(
          (y) => y.id === r.dateallocationid
        );

        if (existingAllocation) {
          r.dateallocationid = existingAllocation.id;
        } else {
          // create new year week
          const newAllocationRecord = newAllocation(r.dateallocationid, format);
          upvise.updateStore({ [tableName]: [newAllocationRecord] });
          r.dateallocationid = newAllocationRecord.id;
        }
      }

      const updatedAllocations = Object.values(
        upvise.entityData(tableName)
      ) as unknown as IRecord[];
      // update ordering of all year week records
      const updatedOrder = sortDateAllocations(updatedAllocations).map(
        (allocation, index) => {
          return {
            id: allocation.id as string,
            rank: index,
          };
        }
      );

      upvise.updateStore({ [tableName]: updatedOrder });
    });

    affectedAllocations.forEach((allocationId) => {
      // if no records under allocation, delete allocation record
      if (storeData.some((r) => r.dateallocationid === allocationId)) return;
      delete upvise.entityData(tableName)[allocationId];
    });
  }

  function getDefaultFormat(type: DateAllocationTypes) {
    switch (type) {
      case DateAllocationTypes.DAY:
        return "DD-MM-YYYY";
      case DateAllocationTypes.WEEK:
        return "ww";
      case DateAllocationTypes.YEAR_WEEK:
        return "YYYY-ww";
      case DateAllocationTypes.MONTH:
        return "MMMM";
      case DateAllocationTypes.YEAR:
        return "YYYY";
      default:
        return "";
    }
  }

  function getAllocationId(type: string, date: number): number {
    if (date === 0) return 0;
    switch (type) {
      case DateAllocationTypes.DAY:
        return dateOperation.getStartOfDay(date);
      case DateAllocationTypes.WEEK:
      case DateAllocationTypes.YEAR_WEEK:
        return dateOperation.getStartOfWeek(date);
      case DateAllocationTypes.MONTH:
        return dateOperation.getStartOfMonth(date);
      case DateAllocationTypes.YEAR:
        return dateOperation.getStartOfYear(date);
      default:
        return 0;
    }
  }

  return {
    tableName,
    initialiseAllocations,
    mapAllocations,
    updateAllocationRecords,
    deleteUnusedAllocations,
  };
}
