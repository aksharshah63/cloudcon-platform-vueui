import { IRecord, IUpvise } from "../../store/modules/upvise.d";
import { orderBy } from "lodash";
import utils from "./useUtils";
import dateOperation from "../utils/useDateOperations";

export default function useYearWeekController() {
  function newYearWeek(yearWeek: string) {
    return { id: yearWeek, label: yearWeek };
  }

  function mapYearWeeks(upviseData: IRecord[]) {
    // Going to create an array of year/month values
    // Each will be assigned an id as it is created
    // Any data that falls under that year week will be given that id
    const allYearWeeks: IRecord[] = [];
    upviseData.forEach((data) => {
      if (typeof data.installdate != "number") return;
      const currentYearWeek = dateOperation.getYearWeekString(data.installdate);
      // Going to look to see if the record currently exists or if it needs to be created
      const existingYearWeekRecord = allYearWeeks.find(
        (yearWeek) => yearWeek.label == currentYearWeek
      );
      if (existingYearWeekRecord) {
        data.yearweekid = existingYearWeekRecord.id;
      } else {
        const newYearWeekRecord = newYearWeek(currentYearWeek);
        allYearWeeks.push(newYearWeekRecord);
        data.yearweekid = newYearWeekRecord.id;
      }
    });

    const sortedAllYearWeeks = sortYearWeekRecords(allYearWeeks)

    // set ordering of all year week records
    sortedAllYearWeeks.forEach((yearWeek, index) => {
      yearWeek.rank = index;
    })

    return sortedAllYearWeeks;
  }

  function deleteUnusedYearWeeks(
    upvise: IUpvise,
    yearWeeks: IRecord[],
    lots: IRecord[]
  ) {
    const deleteIds = [] as string[];
    yearWeeks.forEach((yearWeek) => {
      if (lots.some((lot) => lot.yearweekid == yearWeek.id)) return;
      else {
        deleteIds.push(yearWeek.id as string);
      }
    });
    if (deleteIds.length > 0)
      upvise.removeSchemaOnlyData("_Yearweek", deleteIds);
  }

  function sortYearWeekRecords(yearWeekRecords: IRecord[]) {
    return orderBy(yearWeekRecords, ["label"], ["asc"]);
  }

  function updateYearWeekRecords(storeData: IRecord[], upvise: IUpvise) {
    const yearWeekData = Object.values(
      upvise.entityData("_Yearweek")
    ) as unknown as IRecord[];

    const affectedYearWeekRecords = new Set<string>();

    storeData.forEach((r) => {
      if (r.yearweekid) affectedYearWeekRecords.add(r.yearweekid as string);

      if (
        utils.IsActive(r as unknown as IRecord) &&
        typeof r.installdate === "number"
      ) {
        r.yearweekid = dateOperation.getYearWeekString(r.installdate);

        const existingYearWeekRecord = yearWeekData.find(
          (y) => y.id === r.yearweekid
        );

        if (existingYearWeekRecord) {
          r.yearweekid = existingYearWeekRecord.id;
        } else {
          // create new year week
          const newYearWeekRecord = newYearWeek(r.yearweekid);
          upvise.updateStore({ _Yearweek: [newYearWeekRecord] });
          r.yearweekid = newYearWeekRecord.id;
        }
      }
      
      const updatedYearWeekData = Object.values(
        upvise.entityData("_Yearweek")
      ) as unknown as IRecord[];
      // update ordering of all year week records
      const updatedOrder = sortYearWeekRecords(updatedYearWeekData).map((yearWeek, index) => {
        return {
          id: yearWeek.id as string,
          rank: index,
        }
      });

      console.log("updatedOrder", updatedOrder)

      upvise.updateStore({ _Yearweek: updatedOrder });
    });

    affectedYearWeekRecords.forEach((yearWeekId) => {
      // if no records under year week, delete year week record
      if (storeData.filter((r) => r.yearweekid === yearWeekId).length === 0)
        delete upvise.entityData("_Yearweek")[yearWeekId];
    });
  }

  return {
    mapYearWeeks,
    updateYearWeekRecords,
    deleteUnusedYearWeeks,
  };
}
