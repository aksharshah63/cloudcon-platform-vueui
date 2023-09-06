import {
  IChartMessage,
  // IChartData,
  IChartSeriesData,
  IPieChartSeriesData,
  //IRecord,
  IUpvise,
} from "../../../store/modules/upvise.d";
//import utils from "../../../use/function/useUtils";
import useNumberOperations from "../../../use/utils/useNumberOperations";
import useDateOperations from "../../../use/utils/useDateOperations";
import localforage from "localforage";
import { IFabricationRecord } from "../../../use/controller/workshop/fabrication.d";
import { IProcessingRecord } from "../../../use/controller/workshop/processing.d";

export default function useControllerDashboard(upvise: IUpvise) {
  const state = upvise.state();

  const getFabProcessingRecords = async (
    allRecords: Record<string, Record<string, any>>,
    weekFormat: Record<string, any>[]
  ): Promise<Record<string, any>[]> => {
    const allWeeks = weekFormat.map((week) => week.id);
    const properResult: Record<string, any>[] = [];
    for (const i of Object.keys(allRecords)) {
      if (allWeeks.includes(allRecords[i].dateallocationid))
        properResult.push(allRecords[i]);
    }
    return properResult;
  };

  // initialise store early so that it does not overrwrite later
  //console.log("Current State: ",  state);

  const fetchChartSettings = async (title: string) => {
    const dashletTitle = "staticdashlet_" + title;
    const localForageInstance = localforage.createInstance({
      name: "upvise",
      storeName: "tables",
    });
    const settings = await localForageInstance
      .getItem("system.user.settings")
      .then((results: unknown) => {
        return (results as { name: string; items: Record<string, any>[] })
          .items;
      });
    const value =
      settings.find((x) => x.id === dashletTitle) !== undefined
        ? (settings.find((x) => x.id === dashletTitle)?.value as string)
        : "";
    return value;
  };

  const fetchChartData = async (
    record: Record<string, any>[],
    propertiesUsed: Record<string, any>,
    type: string
  ): Promise<IChartMessage> => {
    let chartData: IChartMessage = { data: {}, series: [], categories: [] };
    const parameterLocations: Record<string, any> = propertiesUsed;
    switch (type) {
      case "bar-chart":
        chartData = await createBarChart(record, parameterLocations);
        break;
      case "line-chart":
      case "grouped-bar-chart":
      case "multi-bar-chart":
        chartData = await createMultiBarChart(record, parameterLocations);
        break;
      case "pie-chart":
        chartData = await createPieChart(record, parameterLocations);
        break;
    }

    // console.log(chartEndpoint, selector, body);
    return chartData;
  };

  const formatPieChartData = async (
    record: Record<string, any>[],
    parameterLocations: Record<string, any>
  ): Promise<Record<string, any>> => {
    const resourceMap: Record<string, any> = { total: 0, name: "", value: {} };
    const rawResourceMap: Record<string, number> = {};
    const xAxis = parameterLocations["xAxis"] as string;
    const yAxis = parameterLocations["yAxis"] as number;
    //console.log(record);

    //need to add logic where xAxis is not in the record like month date or whatever

    if (!xAxis.toLowerCase().includes("date")) {
      record = record.sort((a, b) => (a[xAxis] > b[xAxis] ? 1 : -1));
      resourceMap.name =
        (parameterLocations["seriesName"] as string) != undefined
          ? parameterLocations["seriesName"]
          : "";
      let totalRevenue = 0;
      for (const i of record) {
        const name = i[xAxis] !== null ? i[xAxis] : "Other";
        if (!(name in rawResourceMap)) {
          rawResourceMap[name] = 0;
        }
        totalRevenue += parseFloat(i[yAxis]);
        rawResourceMap[name] += parseFloat(i[yAxis]);
      }
      resourceMap.total = totalRevenue;
      if (Object.keys(rawResourceMap).length <= 4)
        resourceMap.value = rawResourceMap;
      else {
        const newResourceMap: Record<string, any> = {};
        let otherTotals = 0;
        Object.entries(rawResourceMap)
          .sort((a, b) => (a[1] > b[1] ? -1 : 1))
          .forEach((record, index) => {
            if (index <= 3 && record[0] !== "Other")
              newResourceMap[record[0]] = record[1];
            else {
              otherTotals += record[1];
            }
          });
        newResourceMap["Other"] = otherTotals;
        resourceMap.value = newResourceMap;
      }
    }
    return resourceMap;
  };

  const createPieChart = async (
    record: Record<string, any>[],
    parameterLocations: Record<string, any>
  ): Promise<IChartMessage> => {
    const resourceMap: Record<string, any> = await formatPieChartData(
      record,
      parameterLocations
    );
    //console.log(resourceMap);
    const values = resourceMap.value;
    const totalRevenue = resourceMap.total;

    const seriesData: IPieChartSeriesData = {
      name: resourceMap.name,
      data: [],
    };
    const dataElements: Record<string, string | number>[] = [];
    for (const i of Object.keys(values)) {
      const dataObject: Record<string, string | number> = {};
      const value = useNumberOperations.round(values[i], 2);
      const percentage = (values[i] / totalRevenue) * 100;
      dataObject.name = i + ` (${percentage.toFixed(2)}%)`;
      dataObject.y = value;
      dataElements.push(dataObject);
    }
    seriesData.data = dataElements;

    return { data: {}, series: [seriesData], categories: [] };
  };

  const formatMultiBarChartData = async (
    record: Record<string, any>[],
    parameterLocations: Record<string, any>,
    custom: null | string = null
  ): Promise<Record<string, any>> => {
    const resourceMap: Record<string, any> = {};
    const xAxis = parameterLocations["xAxis"] as string;
    const yAxis = parameterLocations["yAxis"] as number;
    const splitBy = parameterLocations["splitBy"] as string;
    let isDate: null | string = null;
    if (!custom) {
      let distinctSplitBy = [...new Set(record.map((x) => x[splitBy]))].sort();
      if (distinctSplitBy.includes(null)) {
        distinctSplitBy = distinctSplitBy.filter((x) => x !== null);
        distinctSplitBy.push("Other");
      }

      if ("isDate" in parameterLocations)
        isDate = parameterLocations["isDate"] as string;

      if (isDate !== null) {
        //We always assume that the x axis is the date
        const interval = parseInt(parameterLocations["interval"] as string);
        let dateFormat = "";
        switch (isDate) {
          case "month":
            dateFormat = "MMM YY";
            break;
          case "day":
            dateFormat = "DD MMM YY";
            break;
          case "year":
            dateFormat = "YY";
            break;
        }
        const currentDate = new Date().getTime();
        const currentDateFormat = useDateOperations.getFormattedDateString(
          currentDate,
          dateFormat
        );
        const dateArray = [currentDateFormat];
        for (let i = 1; i < interval; i++) {
          dateArray.unshift(
            useDateOperations.getPreviousFormattedDateString(
              currentDate,
              dateFormat,
              i,
              isDate
            )
          );
        }
        dateArray.forEach((value) => {
          resourceMap[value] = {};
          distinctSplitBy.forEach((splitby) => {
            resourceMap[value][splitby] = 0;
          });
        });

        for (const i of record) {
          const xValue =
            typeof i[xAxis] === "number" || typeof i[xAxis] === "string"
              ? useDateOperations.getFormattedDateString(
                  new Date(i[xAxis]).getTime(),
                  dateFormat
                )
              : useDateOperations.getFormattedDateString(i[xAxis], dateFormat);
          const yValue = i[yAxis];
          const splitValue = i[splitBy] !== null ? i[splitBy] : "Other";
          if (xValue in resourceMap) resourceMap[xValue][splitValue] += yValue;
        }
      } else {
        record = record.sort((a, b) => (a[xAxis] > b[xAxis] ? 1 : -1));
        let distinctXValues = [...new Set(record.map((x) => x[xAxis]))].sort();
        if (distinctXValues.includes(null)) {
          distinctXValues = distinctXValues.filter((x) => x !== null);
          distinctXValues.push("Other");
        }
        distinctXValues.forEach((value) => {
          resourceMap[value] = {};
          distinctSplitBy.forEach((splitby) => {
            resourceMap[value][splitby] = 0;
          });
        });

        for (const i of record) {
          const xValue = i[xAxis] !== null ? i[xAxis] : "Other";
          const yValue = i[yAxis];
          const splitValue = i[splitBy] !== null ? i[splitBy] : "Other";
          resourceMap[xValue][splitValue] += yValue;
        }
      }
    }
    //This section is to calculate fabrication and processing
    else {
      if (custom.includes("fabrication") || custom.includes("processing")) {
        //const distinctSplitBy = ["Target", "Actual"]
        const localForageInstance = localforage.createInstance({
          name: "upvise",
          storeName: "tables",
        });
        const projects = await localForageInstance
          .getItem("unybiz.projects.projects")
          .then((results: unknown) => {
            return (results as { name: string; items: Record<string, any>[] })
              .items;
          });

        const projectCodeMap: Record<string, any> = {};
        projects.forEach((x) => {
          projectCodeMap[x.id] = x.code;
        });

        const projectCodeList: string[] = [];
        const recordProjectMap: Record<string, any> = {};
        record.forEach((x) => {
          const projectCode =
            x.projectid !== "" ? projectCodeMap[x.projectid] : "Other";
          recordProjectMap[x.id] = projectCode;
          if (!projectCodeList.includes(projectCode))
            projectCodeList.push(projectCode);
        });
        const realRecord = await getFabProcessingLogData(record, custom);
        //console.log(realRecord);

        if (custom.includes("fabrication"))
          await formatFabData(
            realRecord,
            resourceMap,
            recordProjectMap,
            custom.split("|")[1],
            projectCodeList
          );
        if (custom.includes("processing"))
          await formatProcessingData(
            realRecord,
            resourceMap,
            recordProjectMap,
            custom.split("|")[1],
            projectCodeList
          );
      }
    }

    return resourceMap;
    //return {};
  };

  const formatProcessingData = async (
    record: Record<string, any>[],
    resourceMap: Record<string, any>,
    recordProjectMap: Record<string, any>,
    type: string,
    projectCodeList: string[]
  ) => {
    const distinctSplitBy = ["Actual", "Target"];
    const targetField = type === "hours" ? "timeCompleted" : "metresscheduled";
    const actualField = type === "hours" ? "timeScheduled" : "metrescompleted";
    const fabricationDateMap: Record<string, any> = {};

    //This is to initialise the resourceMapping.
    projectCodeList.forEach((value) => {
      resourceMap[value] = {};
      distinctSplitBy.forEach((splitby) => {
        resourceMap[value][splitby] = 0;
      });
    });

    for (const i of record) {
      //if (type === "hours") console.log(i);
      const xValue = i["processingid"] !== null ? i["processingid"] : "Other";
      const valueObj = i.value !== "" ? JSON.parse(i.value) : {};

      //If the fabid is not in the datemap
      if (!(xValue in fabricationDateMap)) {
        fabricationDateMap[xValue] = {};
      }

      //get Currrent date to get the actuals and target on that day
      const currentDate = useDateOperations.getDateString(
        parseInt(i["date"] as string)
      );
      // if(recordProjectMap[xValue] === "KKA3ChecRD") {
      //   console.log("date", currentDate)
      //   console.log("id", i.id)
      //   console.log("val Obj", valueObj);
      // }
      if (!(currentDate in fabricationDateMap[xValue])) {
        fabricationDateMap[xValue][currentDate] = {};
        fabricationDateMap[xValue][currentDate].actuals = 0;
        fabricationDateMap[xValue][currentDate].target = 0;
      }

      if (targetField in valueObj) {
        const yTarValue = valueObj[targetField];
        //We're taking the highest Target Value
        if (yTarValue > fabricationDateMap[xValue][currentDate].target)
          fabricationDateMap[xValue][currentDate].target = yTarValue;
      }
      if (actualField in valueObj) {
        const yActValue = valueObj[actualField];
        fabricationDateMap[xValue][currentDate].actuals += yActValue;
      }
      //console.log(fabricationDateMap)
    }
    //console.log(fabricationDateMap);

    for (const fabid of Object.keys(fabricationDateMap)) {
      const projectCode = fabid === "Other" ? "Other" : recordProjectMap[fabid];
      //Grab all the data for each fabrication
      let inputActuals = 0;
      let inputTarget = 0;
      for (const date of Object.keys(fabricationDateMap[fabid])) {
        inputActuals += fabricationDateMap[fabid][date].actuals;
        inputTarget += fabricationDateMap[fabid][date].target;
      }
      resourceMap[projectCode]["Target"] += inputTarget;
      resourceMap[projectCode]["Actual"] += inputActuals;
    }
  };

  const formatFabData = async (
    record: Record<string, any>[],
    resourceMap: Record<string, any>,
    recordProjectMap: Record<string, any>,
    type: string,
    projectCodeList: string[]
  ) => {
    const distinctSplitBy = ["Actual", "Target"];
    const targetField = type === "hours" ? "totalFabTime" : "toFab";
    const actualField = type === "hours" ? "fabTime" : "completedToday";
    const fabricationDateMap: Record<string, any> = {};

    //This is to initialise the resourceMapping.
    projectCodeList.forEach((value) => {
      resourceMap[value] = {};
      distinctSplitBy.forEach((splitby) => {
        resourceMap[value][splitby] = 0;
      });
    });

    for (const i of record) {
      //if (type === "hours") console.log(i);
      const xValue = i["fabricationid"] !== null ? i["fabricationid"] : "Other";
      const valueObj = i.value !== "" ? JSON.parse(i.value) : {};

      //If the fabid is not in the datemap
      if (!(xValue in fabricationDateMap)) {
        fabricationDateMap[xValue] = {};
      }

      //get Currrent date to get the actuals and target on that day
      const currentDate = useDateOperations.getDateString(
        parseInt(i["date"] as string)
      );
      if (!(currentDate in fabricationDateMap[xValue])) {
        fabricationDateMap[xValue][currentDate] = {};
        fabricationDateMap[xValue][currentDate].actuals = 0;
        fabricationDateMap[xValue][currentDate].target = 0;
      }

      if (targetField in valueObj) {
        const yTarValue = valueObj[targetField];
        //We're taking the highest Target Value
        if (yTarValue > fabricationDateMap[xValue][currentDate].target)
          fabricationDateMap[xValue][currentDate].target = yTarValue;
      }
      if (actualField in valueObj) {
        const yActValue = valueObj[actualField];
        fabricationDateMap[xValue][currentDate].actuals += yActValue;
      }
    }

    for (const fabid of Object.keys(fabricationDateMap)) {
      const projectCode = fabid === "Other" ? "Other" : recordProjectMap[fabid];
      //Grab all the data for each fabrication
      let inputActuals = 0;
      let inputTarget = 0;
      for (const date of Object.keys(fabricationDateMap[fabid])) {
        inputActuals += fabricationDateMap[fabid][date].actuals;
        inputTarget += fabricationDateMap[fabid][date].target;
      }
      resourceMap[projectCode]["Target"] += inputTarget;
      resourceMap[projectCode]["Actual"] += inputActuals;
    }
  };

  const getFabProcessingLogData = async (
    record: Record<string, any>[],
    custom: string
  ) => {
    const recordIds = record.map((x) => x.id);
    let properRecords: Record<string, any>[] = [];
    const table = custom.includes("fabrication")
      ? upvise.entityData("TableWorkshopFabricationlogs")
      : upvise.entityData("TableWorkshopProcessinglogs");
    Object.keys(table).forEach((rec) => {
      if (
        custom.includes("fabrication") &&
        recordIds.includes(table[rec].fabricationid)
      )
        properRecords.push(table[rec]);
      else if (
        custom.includes("processing") &&
        recordIds.includes(table[rec].processingid)
      )
        properRecords.push(table[rec]);
    });

    if (custom.includes("fabrication")) {
      properRecords = properRecords.filter((log) => {
        const value = JSON.parse(log.value) as IFabricationRecord;
        const oldValue = JSON.parse(log.oldvalue) as IFabricationRecord;
        return (
          value["toFab"] != oldValue["toFab"] ||
          value["totalFabTime"] != oldValue["totalFabTime"] ||
          value["completedToday"] != oldValue["completedToday"] ||
          value["fabTime"] != oldValue["fabTime"] ||
          value["totalCompleted"] != oldValue["totalCompleted"]
        );
      });
    } else {
      properRecords = properRecords.filter((log) => {
        const value = JSON.parse(log.value) as IProcessingRecord;
        const oldValue = JSON.parse(log.oldvalue) as IProcessingRecord;
        return (
          value["metrescompleted"] != oldValue["metrescompleted"] ||
          value["metresscheduled"] != oldValue["metresscheduled"]
        );
      });
    }

    return properRecords;
  };

  const createMultiBarChart = async (
    record: Record<string, any>[],
    parameterLocations: Record<string, any>
  ): Promise<IChartMessage> => {
    const custom = !parameterLocations.custom
      ? null
      : parameterLocations.custom;
    const resourceMap: Record<string, any> = await formatMultiBarChartData(
      record,
      parameterLocations,
      custom
    );

    const listOfX = Object.keys(resourceMap);
    const listOfSplits =
      listOfX.length > 0 ? Object.keys(resourceMap[listOfX[0]]) : [];
    const seriesArray = [];
    for (const i of listOfSplits) {
      const seriesData: IChartSeriesData = { name: i, data: [] as number[] };
      for (const j of listOfX) {
        const insert = useNumberOperations.round(
          resourceMap[j][i] as number,
          2
        );
        seriesData.data.push(insert);
      }
      seriesArray.push(seriesData);
    }

    return {
      data: {},
      series: seriesArray,
      categories: Object.keys(resourceMap),
    };
  };

  const formatBarChartData = async (
    record: Record<string, any>[],
    parameterLocations: Record<string, any>
  ): Promise<Record<string, any>> => {
    const resourceMap: Record<string, any> = {};
    const xAxis = parameterLocations["xAxis"] as string;
    const yAxis = parameterLocations["yAxis"] as number;
    //const splitBy = parameterLocations["splitBy"] as string;
    let isDate: null | string = null;
    // let distinctSplitBy = [...new Set(record.map((x) => x[splitBy]))].sort();
    // if (distinctSplitBy.includes(null)) {
    //   distinctSplitBy = distinctSplitBy.filter((x) => x !== null);
    //   distinctSplitBy.push("Other");
    // }

    if ("isDate" in parameterLocations)
      isDate = parameterLocations["isDate"] as string;

    if (isDate !== null) {
      //We always assume that the x axis is the date
      const interval = parseInt(parameterLocations["interval"] as string);
      let dateFormat = "";
      switch (isDate) {
        case "month":
          dateFormat = "MMM YY";
          break;
        case "day":
          dateFormat = "DD MMM YY";
          break;
        case "year":
          dateFormat = "YY";
          break;
      }
      const currentDate = new Date().getTime();
      const currentDateFormat = useDateOperations.getFormattedDateString(
        currentDate,
        dateFormat
      );
      const dateArray = [currentDateFormat];
      for (let i = 1; i < interval; i++) {
        dateArray.unshift(
          useDateOperations.getPreviousFormattedDateString(
            currentDate,
            dateFormat,
            i,
            isDate
          )
        );
      }
      dateArray.forEach((value) => {
        resourceMap[value] = 0;
      });

      for (const i of record) {
        const xValue =
          typeof i[xAxis] === "number" || typeof i[xAxis] === "string"
            ? useDateOperations.getFormattedDateString(
                new Date(i[xAxis]).getTime(),
                dateFormat
              )
            : useDateOperations.getFormattedDateString(i[xAxis], dateFormat);
        const yValue = i[yAxis];
        if (xValue in resourceMap) resourceMap[xValue] += yValue;
      }
    } else {
      record = record.sort((a, b) => (a[xAxis] > b[xAxis] ? 1 : -1));
      let distinctXValues = [...new Set(record.map((x) => x[xAxis]))].sort();
      if (distinctXValues.includes(null)) {
        distinctXValues = distinctXValues.filter((x) => x !== null);
        distinctXValues.push("Other");
      }
      distinctXValues.forEach((value) => {
        resourceMap[value] = 0;
      });

      for (const i of record) {
        const xValue = i[xAxis] !== null ? i[xAxis] : "Other";
        const yValue = i[yAxis];
        resourceMap[xValue] += yValue;
      }
    }

    return resourceMap;
    //return {};
  };

  const createBarChart = async (
    record: Record<string, any>[],
    parameterLocations: Record<string, any>
  ): Promise<IChartMessage> => {
    const resourceMap: Record<string, any> = await formatBarChartData(
      record,
      parameterLocations
    );

    const properlegend = !parameterLocations.legend
      ? ""
      : parameterLocations.legend;

    const listOfX = Object.keys(resourceMap);
    const seriesArray = [];
    const seriesData: IChartSeriesData = {
      name: properlegend,
      data: [] as number[],
    };
    for (const j of listOfX) {
      const insert = useNumberOperations.round(resourceMap[j] as number, 2);
      seriesData.data.push(insert);
    }
    seriesArray.push(seriesData);
    return {
      data: {},
      series: seriesArray,
      categories: Object.keys(resourceMap),
    };
  };

  return {
    state,
    fetch,
    fetchChartData,
    fetchChartSettings,
    getFabProcessingRecords,
    // getData,
  };
}
