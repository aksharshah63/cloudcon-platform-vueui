import {
  IUpvise,
  IGridSlicing,
  IConstraint,
} from "../../../../store/modules/upvise.d";
import {
  IUtilizationLogs,
  IMappedUtilizationlogs,
  IToolRecord,
} from "../../../controller/reporting/utilization/utilization.d";
import { FilterMatchMode } from "primevue/api";

export default function useControllerUtilization(upvise: IUpvise) {
  const state = upvise.state();
  const fetch = () => upvise.fetch("equipment");
  const getMetadata = () => upvise.metadata("equipment");
  let mappedUtilizationlogs = {} as IMappedUtilizationlogs;

  function getTableData(tableName: string) {
    return upvise.entityData(tableName);
  }

  function getEquipmentCount() {
    return Object.keys(upvise.entityData("TableToolsTools")).length.toString();
  }

  function generateMappedUtilizationLogs() {
    const usagelogs = Object.values(
      upvise.entityData("TableToolsUsagelogs")
    ) as unknown as IUtilizationLogs[];
    usagelogs.forEach((el) => (el.date = formatDate(el.date)));

    //group the usagelogs by equipment id
    const infoGroupByToolId = groupBy(usagelogs, "toolid");

    const infoGroupByDate = {} as IMappedUtilizationlogs;
    // console.log("group by equipment id:", infoGroupByToolId);
    for (const [equipmentid, value] of Object.entries(infoGroupByToolId)) {
      infoGroupByDate[equipmentid] = groupBy(
        value as IUtilizationLogs[],
        "date"
      );
    }
    // toolDataInjection();
    mappedUtilizationlogs = infoGroupByDate;

    //testing purpose

    return infoGroupByDate;
  }

  function calUtilization(startDate: number, endDate: number) {
    // console.log("start calculating utilization", startDate, endDate);
    for (const [equipmentid, usageLogsGroupByDateObj] of Object.entries(
      mappedUtilizationlogs
    )) {
      //sort the date value to find the nearest date within the time range
      const loggedDateArr = Object.keys(usageLogsGroupByDateObj).sort();

      const lowestDate = loggedDateArr.find(
        (element) => parseInt(element) >= startDate
      );

      const highestDate = loggedDateArr
        .reverse()
        .find((element) => parseInt(element) <= endDate);

      //if equipment do not have usagelogs within time range, clear the previous utilzation data.
      if (
        !lowestDate ||
        !highestDate ||
        parseInt(lowestDate) > endDate ||
        parseInt(highestDate) < startDate
      ) {
        updateUtlizationToTable(equipmentid);
        continue;
      }

      //get start Odometer
      let usageLogsArr = usageLogsGroupByDateObj[lowestDate];
      const startOdo = Math.min(...usageLogsArr.map((log) => log.value));

      //get end odometer
      usageLogsArr = usageLogsGroupByDateObj[highestDate];
      const endOdo = Math.max(...usageLogsArr.map((log) => log.value));

      const total = endOdo - startOdo;
      let average =
        total /
        ((parseInt(highestDate) - parseInt(lowestDate)) / 1000 / 60 / 60 / 24 +
          1);

      average = parseFloat(average.toFixed(2));

      // console.log("Date information => ", lowestDate);
      updateUtlizationToTable(
        equipmentid,
        highestDate,
        lowestDate,
        startOdo,
        endOdo,
        average,
        total
      );
    }
  }

  // function clearUtilzationData(equipmentid: string) {
  //   const tableToUpdate = upvise.entityData("TableToolsTools");
  //   const equipmentToUpdate = tableToUpdate[
  //     equipmentid
  //   ] as unknown as IToolRecord;
  //   if (!equipmentToUpdate) return;
  //   equipmentToUpdate.startDate = undefined;
  //   equipmentToUpdate.endDate = undefined;
  //   equipmentToUpdate.startOdometer = undefined;
  //   equipmentToUpdate.endOdometer = undefined;
  //   equipmentToUpdate.total = undefined;
  //   equipmentToUpdate.average = undefined;
  // }

  function updateUtlizationToTable(
    equipmentid: string,
    highestDate?: string,
    lowestDate?: string,
    startOdo?: number,
    endOdo?: number,
    average?: number,
    total?: number
  ) {
    const tableToUpdate = upvise.entityData("TableToolsTools");
    const equipmentToUpdate = tableToUpdate[
      equipmentid
    ] as unknown as IToolRecord;
    if (!equipmentToUpdate) return;
    equipmentToUpdate.startDate = lowestDate;
    equipmentToUpdate.endDate = highestDate;
    equipmentToUpdate.startOdometer = startOdo;
    equipmentToUpdate.endOdometer = endOdo;
    equipmentToUpdate.total = total;
    equipmentToUpdate.average = average;
    // equipmentToUpdate.projectName = equipmentToUpdate.projectname;
  }

  //remove time part from date
  function formatDate(date: number) {
    return new Date(new Date(date).toDateString()).getTime();
  }

  function groupBy(object: IUtilizationLogs[], key: keyof IUtilizationLogs) {
    return object.reduce((rv: Record<string, IUtilizationLogs[]>, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  function getSlicingInformation(
    startOfMonth: number,
    endOfMonth: number,
    name: string | null = null,
    groups: [] = [],
    projects: [] = []
  ): Record<string, IGridSlicing[]> {
    //upviseData: IUpviseDataMessage
    //JSON Object, for each tab send filter that needs to be applied!
    //{[fieldNames], displayName, filterToApply}
    const groupNamesArr: IConstraint[] = [];
    groups.forEach((g: Record<string, unknown>) => {
      const groupNamesObj: IConstraint = { value: "", matchMode: "" };
      groupNamesObj.value = g.groupname;
      groupNamesObj.matchMode = FilterMatchMode.EQUALS;
      groupNamesArr.push(groupNamesObj);
    });
    const projectNamesArr: IConstraint[] = [];
    projects.forEach((g: Record<string, unknown>) => {
      const projectNamesObj: IConstraint = { value: "", matchMode: "" };
      projectNamesObj.value = g.projectname;
      projectNamesObj.matchMode = FilterMatchMode.EQUALS;
      projectNamesArr.push(projectNamesObj);
    });
    const returnArray: Record<string, IGridSlicing[]> = {
      ["TableToolsTools"]: [],
    };
    returnArray["TableToolsTools"].push({
      fieldNames: ["startDate", "endDate", "name", "groupName", "projectname"],
      displayName: "All",
      filtersToApply: {
        startDate: {
          operator: "and",
          constraints: [
            {
              value: startOfMonth,
              matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
            },
          ],
        },
        endDate: {
          operator: "and",
          constraints: [
            {
              value: endOfMonth,
              matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
            },
          ],
        },
        name: {
          operator: "and",
          constraints: [
            {
              value: name,
              matchMode: FilterMatchMode.CONTAINS,
            },
          ],
        },
        groupName: {
          operator: "or",
          constraints: groupNamesArr,
        },
        projectname: {
          operator: "or",
          constraints: projectNamesArr,
        },
      },
    });
    return returnArray;
  }

  function calInformationCardUtilization(
    startDate: number,
    endDate: number,
    perDayHours: number,
    perWeekDays: number
  ) {
    let totalMonthlyOdometer = 0;
    let toolQty = 0;
    for (const [equipmentid, usageLogsGroupByDateObj] of Object.entries(
      mappedUtilizationlogs
    )) {
      //sort the date value to find the nearest date within the time range
      const loggedDateArr = Object.keys(usageLogsGroupByDateObj).sort();

      const lowestDate = loggedDateArr.find(
        (element) => parseInt(element) >= startDate
      );

      const highestDate = loggedDateArr
        .reverse()
        .find((element) => parseInt(element) <= endDate);

      //if equipment do not have usagelogs within time range, clear the previous utilzation data.
      if (
        !lowestDate ||
        !highestDate ||
        parseInt(lowestDate) > endDate ||
        parseInt(highestDate) < startDate
      ) {
        updateUtlizationToTable(equipmentid);
        continue;
      }

      //get start Odometer
      let usageLogsArr = usageLogsGroupByDateObj[lowestDate];
      const startOdo = Math.min(...usageLogsArr.map((log) => log.value));

      //get end odometer
      usageLogsArr = usageLogsGroupByDateObj[highestDate];
      const endOdo = Math.max(...usageLogsArr.map((log) => log.value));

      totalMonthlyOdometer += endOdo - startOdo;
      toolQty += 1;
    }
    const monthHours = perDayHours * perWeekDays * 4;
    // console.log(
    //   "total monthly odometer: ",
    //   totalMonthlyOdometer,
    //   "| total quantity: ",
    //   toolQty
    // );
    return (totalMonthlyOdometer / (monthHours * toolQty)).toFixed(0);
  }

  function calLastMonthInformationCardUtilization(
    startDateOfLastMonth: number,
    endDateOfLastMonth: number,
    perDayHours: number,
    perWeekDays: number
  ) {
    // console.log(
    //   "start date of Last Month: ",
    //   startDateOfLastMonth,
    //   "end date of Last Month: ",
    //   endDateOfLastMonth
    // );
    let totalMonthlyOdometer = 0;
    let toolQty = 0;
    for (const [equipmentid, usageLogsGroupByDateObj] of Object.entries(
      mappedUtilizationlogs
    )) {
      //sort the date value to find the nearest date within the time range
      const loggedDateArr = Object.keys(usageLogsGroupByDateObj).sort();

      const lowestDate = loggedDateArr.find(
        (element) => parseInt(element) >= startDateOfLastMonth
      );

      const highestDate = loggedDateArr
        .reverse()
        .find((element) => parseInt(element) <= endDateOfLastMonth);

      //if equipment do not have usagelogs within time range, clear the previous utilzation data.
      if (
        !lowestDate ||
        !highestDate ||
        parseInt(lowestDate) > endDateOfLastMonth ||
        parseInt(highestDate) < startDateOfLastMonth
      ) {
        updateUtlizationToTable(equipmentid);
        continue;
      }

      //get start Odometer
      let usageLogsArr = usageLogsGroupByDateObj[lowestDate];
      const startOdo = Math.min(...usageLogsArr.map((log) => log.value));

      //get end odometer
      usageLogsArr = usageLogsGroupByDateObj[highestDate];
      const endOdo = Math.max(...usageLogsArr.map((log) => log.value));

      totalMonthlyOdometer += endOdo - startOdo;
      toolQty += 1;
    }
    const monthHours = perDayHours * perWeekDays * 4;
    // console.log(
    //   "total monthly odometer: ",
    //   totalMonthlyOdometer,
    //   "| total quantity: ",
    //   toolQty
    // );
    // console.log(
    //   "Utilization last month: ",
    //   (totalMonthlyOdometer / (monthHours * toolQty)).toFixed(0)
    // );
    return (totalMonthlyOdometer / (monthHours * toolQty)).toFixed(0);
  }

  return {
    state,
    fetch,
    getMetadata,
    getTableData,
    getEquipmentCount,
    generateMappedUtilizationLogs,
    calUtilization,
    getSlicingInformation,
    calInformationCardUtilization,
    calLastMonthInformationCardUtilization,
  };
}
