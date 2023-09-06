//import localforage from "localforage";
import { IUpviseDataMessage } from "./../../store/modules/upvise.d";

function getMonthName(monthUtcValue: number): string {
  if (monthUtcValue > 11) {
    monthUtcValue = monthUtcValue % 12;
  }
  const monthArray = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return monthArray[monthUtcValue];
}
function getMonthNameWithYear(
  monthUtcValue: number,
  yearFullUtcValue: number
): string {
  if (monthUtcValue > 11) {
    monthUtcValue = monthUtcValue % 12;
    yearFullUtcValue++;
  }
  return (
    getMonthName(monthUtcValue) + " " + yearFullUtcValue.toString().substr(-2)
  );
}
function getOverdueOpportunities(
  upviseDataMessage: IUpviseDataMessage
): Record<string, unknown>[] {
  const data = upviseDataMessage.persistence?.model.opportunity?.data;
  if (data) {
    const currentDate = new Date();
    const currentMonth = currentDate.getUTCMonth();
    const currentYear = currentDate.getUTCFullYear();
    return data.filter((entry: Record<string, unknown>) => {
      if (typeof entry.duedate === "number") {
        const dealDate = new Date(entry.duedate as number);
        const dealYear = dealDate.getUTCFullYear();
        const dealMonth = dealDate.getUTCMonth();
        return (
          dealMonth < currentMonth &&
          dealYear <= currentYear &&
          entry.status === 0
        );
      } else {
        return false;
      }
    });
  }
  return [];
  /*const localForageInstance = localforage.createInstance({
    name: "upvise",
    storeName: "tables",
  });
  const currentDate = new Date();
  const currentMonth = currentDate.getUTCMonth();
  const currentYear = currentDate.getUTCFullYear();
  return localForageInstance
    .getItem("unybiz.sales.opportunities")
    .then((result: unknown) => {
      return (
        result as {
          name: string;
          items: Record<string, unknown>[];
        }
      ).items.filter((entry: Record<string, unknown>) => {
        if (typeof entry.duedate === "number") {
          const dealDate = new Date(entry.duedate as number);
          const dealYear = dealDate.getUTCFullYear();
          const dealMonth = dealDate.getUTCMonth();
          return dealMonth < currentMonth && dealYear <= currentYear;
        } else {
          return false;
        }
      });
    });*/
}
function getForecastChartData(
  upviseDataMessage: IUpviseDataMessage
): Record<string, unknown> {
  const data = upviseDataMessage.persistence?.model.opportunity?.data;
  /*const localForageInstance = localforage.createInstance({
    name: "upvise",
    storeName: "tables",
  });
  await localForageInstance.setItem("unybiz.sales.opportunities", {
    name: "unybiz.sales.opportunities",
    items: [
      {
        amount: 300,
        commission: 0,
        companyid: "153548718B35327A9E02F54840A8D2",
        contactid: "",
        creationdate: 1621318242101,
        currency: "AUD",
        custom: '{"F1":"Commercial","F2":"Primary"}',
        duedate: 1622469600000,
        id: "534B77AD78B7471EAC1C873D0A5882",
        name: "TEST DEAL",
        note: "",
        owner: "Cloudcon Pty Ltd",
        priority: 0,
        probability: 20,
        productid: "",
        referenceid: "",
        stage2: "0",
        status: 0,
      },
    ],
  });
  const allDeals = (
    (await localForageInstance.getItem("unybiz.sales.opportunities")) as {
      name: string;
      items: Record<string, unknown>[];
    }
  ).items;
  const incomingDeals = allDeals.filter(
    (deal: Record<string, unknown>) => deal.status === 0
  );*/
  //Now we need to get all the deals with status 0 (Incoming Deals)

  //Now to move them into groups based on month
  //First we get the current month and the next 5 months, everything else goes into later or overdue,
  //We only need to sum the forecast
  //OVERDUE, CURRENT MONTH, +1, +2, +3, +4, +5, later
  if (data) {
    const incomingDeals = data.filter(
      (deal: Record<string, unknown>) => deal.status === 0
    );
    const monthValues = [0, 0, 0, 0, 0, 0, 0, 0];
    const monthNames = ["Overdue"];

    const currentDate = new Date();
    const currentMonth = currentDate.getUTCMonth();
    const currentYear = currentDate.getUTCFullYear();

    for (let i = 0; i <= 5; i++) {
      monthNames.push(getMonthNameWithYear(currentMonth + i, currentYear));
    }
    monthNames.push("Later");
    incomingDeals.forEach((entry: Record<string, unknown>) => {
      if (
        typeof entry.duedate === "number" &&
        typeof entry.amount === "number" &&
        typeof entry.probability === "number"
      ) {
        const dealDate = new Date(entry.duedate as number);
        const dealYear = dealDate.getUTCFullYear();
        const dealMonth = dealDate.getUTCMonth();
        if (dealMonth < currentMonth && dealYear <= currentYear) {
          //Increase overdue
          monthValues[0] += entry.amount * (entry.probability / 100);
        } else if (
          currentYear === dealYear &&
          dealMonth >= currentMonth &&
          dealMonth <= currentMonth + 5
        ) {
          monthValues[1 + (dealMonth - currentMonth)] +=
            entry.amount * (entry.probability / 100);
        }
        //If we go to the next year
        else if (
          currentMonth + 5 > 11 &&
          dealYear == currentYear + 1 &&
          dealMonth <= (currentMonth + 5) % 12
        ) {
          monthValues[1 + (11 - currentMonth + (1 + dealMonth))] +=
            entry.amount * (entry.probability / 100);
        } else {
          //Its overdue
          monthValues[7] += entry.amount * (entry.probability / 100);
        }
      }
    });
    //Now constructing the data used for display
    const returnData: Record<string, Record<string, unknown>> = {};
    console.log(monthNames);
    for (let i = 0; i < monthNames.length; i++) {
      if (i == 0) {
        returnData[monthNames[i]] = {
          y: monthValues[i],
          className: "overdue-column",
        };
      } else {
        returnData[monthNames[i]] = {
          y: monthValues[i],
          className: "normal-column",
        };
      }
    }
    return returnData;
  }
  return {};
}
function getTopCompaniesChartData(
  upviseDataMessage: IUpviseDataMessage
): Record<string, unknown> {
  const data = upviseDataMessage.persistence?.model.opportunity?.data;
  if (data) {
    const entryArray: Record<string, Record<string, unknown>> = {};
    data
      .filter((entry: Record<string, unknown>) => {
        if (typeof entry.status === "number") {
          return entry.status === 0;
        }
        return false;
      })
      .forEach((entry: Record<string, unknown>) => {
        if (
          typeof entry.companyName === "string" &&
          typeof entry.amount === "number" &&
          typeof entry.probability === "number"
        )
          if (entryArray[entry.companyName]) {
            entryArray[entry.companyName].y =
              (entryArray[entry.companyName].y as number) +
              entry.amount * (entry.probability / 100);
          } else {
            entryArray[entry.companyName] = {
              y: entry.amount * (entry.probability / 100),
              className: "top-company-row",
            };
          }
      });
    return entryArray;
  }
  return {};
}
function getForecastEveryoneValue(upviseDataMessage: IUpviseDataMessage): {
  value: number;
  total: number;
} {
  const data = upviseDataMessage.persistence?.model.opportunity?.data;
  if (data) {
    let returnValue = 0;
    let total = 0;
    data.forEach((entry: Record<string, unknown>) => {
      if (entry.status === 0) {
        if (
          typeof entry.amount === "number" &&
          typeof entry.probability === "number"
        ) {
          total += entry.amount;
          returnValue += entry.amount * (entry.probability / 100);
        }
      }
    });
    return {
      total: total,
      value: returnValue,
    };
  }
  return { total: 0, value: 0 };
}
function getNewDealsLastMonth(
  upviseDataMessage: IUpviseDataMessage
): Record<string, unknown>[] {
  const data = upviseDataMessage.persistence?.model.opportunity?.data;
  if (data) {
    const currentDate = new Date().getTime();
    console.log(currentDate);
    return data.filter((entry: Record<string, unknown>) => {
      return (entry.creationdate as number) >= currentDate - 2678400000;
    });
  }
  return [];
}

function getForecastByStaff(
  upviseDataMessage: IUpviseDataMessage
): Record<string, unknown> {
  const data = upviseDataMessage.persistence?.model.opportunity?.data;
  if (data) {
    const entryArray: Record<string, unknown> = {};
    data
      .filter((entry: Record<string, unknown>) => {
        if (typeof entry.status === "number") {
          return entry.status === 0;
        }
        return false;
      })
      .forEach((entry: Record<string, unknown>) => {
        if (
          typeof entry.owner === "string" &&
          typeof entry.amount === "number" &&
          typeof entry.probability === "number"
        )
          if (entryArray[entry.owner]) {
            entryArray[entry.owner] =
              (entryArray[entry.owner] as number) +
              entry.amount * (entry.probability / 100);
          } else {
            entryArray[entry.owner] = entry.amount * (entry.probability / 100);
          }
      });
    return entryArray;
  }
  return {};
}

function getForecastByStage(
  upviseDataMessage: IUpviseDataMessage
): Record<string, unknown> {
  const data = upviseDataMessage.persistence?.model.opportunity?.data;
  const stageMapping: Record<string, string> = upviseDataMessage.definition
    ?.slicing?.stage2 as unknown as Record<string, string>;
  if (data && stageMapping) {
    const entryArray: Record<string, unknown> = {};
    data
      .filter((entry: Record<string, unknown>) => {
        if (typeof entry.status === "number") {
          return entry.status === 0;
        }
        return false;
      })
      .forEach((entry: Record<string, unknown>) => {
        if (
          typeof entry.stage2 === "string" &&
          typeof entry.amount === "number" &&
          typeof entry.probability === "number"
        ) {
          const mappedStage = stageMapping[entry.stage2];
          if (entryArray[mappedStage]) {
            entryArray[mappedStage] =
              (entryArray[mappedStage] as number) +
              entry.amount * (entry.probability / 100);
          } else {
            entryArray[mappedStage] = entry.amount * (entry.probability / 100);
          }
        }
      });
    return entryArray;
  }
  return {};
}
export { getForecastChartData as getForecastChartData };
export { getOverdueOpportunities as getOverdueOpportunities };
export { getTopCompaniesChartData as getTopCompaniesChartData };
export { getForecastEveryoneValue as getForecastEveryoneValue };
export { getNewDealsLastMonth as getNewDealsLastMonth };
export { getForecastByStaff as getForecastByStaff };
export { getForecastByStage as getForecastByStage };
