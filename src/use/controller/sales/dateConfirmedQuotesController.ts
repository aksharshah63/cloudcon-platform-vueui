import moment from "moment";
import { IRecord } from "../../../store/modules/upvise.d";
import { orderBy } from "lodash";
import maths from "../../../use/utils/useNumberOperations";

export default function dateConfirmedQuotesController() {
  function getDate(epochDate: number) {
    const date = moment(epochDate);
    return date.format("DD-MMM-YYYY");
  }

  function newDateConfirmedQuote(
    date: string
  ): Record<string, string | number> {
    return {
      epochDate: new Date(date).getTime(),
      id: date,
      name: date,
      companyName: "",
      total: 0,
      draftingAmount: 0,
      workshopAmount: 0,
      transportAmount: 0,
      siteAmount: 0,
      tonnes: 0,
    };
  }

  async function mapDateConfirmedQuote(upviseData: IRecord[]) {
    // Going to create an array of year/month values
    // Each will be assigned an id as it is created
    // Any data that falls under that year week will be given that id
    const allDateConfirmedQuote: IRecord[] = [];
    for (const i of upviseData) {
      const data = i;
      if (typeof data.date != "number") return;
      const currentDate = getDate(data.date);
      // Going to look to see if the record currently exists or if it needs to be created
      let existingDate = allDateConfirmedQuote.find(
        (date) => date.name == currentDate
      );
      if (existingDate) {
        data.dateQuoteConfirmedid = existingDate.id;
      } else {
        const newDateRecord = newDateConfirmedQuote(currentDate);
        allDateConfirmedQuote.push(newDateRecord);
        data.dateQuoteConfirmedid = newDateRecord.id;
        existingDate = newDateRecord;
      }
      //Filling up the total values for the grouped invoices
      addToProperty(existingDate, data, "total");
      addToProperty(existingDate, data, "draftingAmount");
      addToProperty(existingDate, data, "workshopAmount");
      addToProperty(existingDate, data, "transportAmount");
      addToProperty(existingDate, data, "siteAmount");
      addToProperty(existingDate, data, "tonnes");
    }
    roundEntireArray(allDateConfirmedQuote);
    return sortDateRecords(allDateConfirmedQuote);
  }

  function roundEntireArray(array: IRecord[]) {
    for (const i of array) {
      i["total"] = maths.round(i["total"] as number);
      i["draftingAmount"] = maths.round(i["draftingAmount"] as number);
      i["workshopAmount"] = maths.round(i["workshopAmount"] as number);
      i["transportAmount"] = maths.round(i["transportAmount"] as number);
      i["siteAmount"] = maths.round(i["siteAmount"] as number);
      i["tonnes"] = maths.round(i["tonnes"] as number);
    }
  }

  function addToProperty(
    dataToAddTo: IRecord,
    dataToAddFrom: IRecord,
    property: string
  ): void {
    if (
      dataToAddFrom[property] !== undefined &&
      dataToAddFrom[property] !== null
    )
      (dataToAddTo[property] as number) += parseFloat(
        dataToAddFrom[property] as string
      );
  }

  function sortDateRecords(dateRecords: IRecord[]) {
    return orderBy(dateRecords, ["epochDate"], ["desc"]);
  }

  return { mapDateConfirmedQuote };
}
