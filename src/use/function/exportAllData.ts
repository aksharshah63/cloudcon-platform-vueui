import {
  IUpviseDataMessage,
  IColumnMetadata,
  IRecord,
  IUpvise,
} from "../../store/modules/upvise.d";
import moment from "moment-timezone";
import { orderBy } from "lodash";

export const exportAllData = (
  upviseDataMessage: IUpviseDataMessage,
  upvise: IUpvise,
  exportFilter?: IRecord
): void => {
  const grouping = upviseDataMessage.definition?.Grouping;
  const lowestLevel = Object.keys(grouping).length - 1;

  const lowestGroup = grouping[lowestLevel].Type;
  const lowestGroupName = grouping[lowestLevel].LookupKey;
  const lowestGroupSchema = upviseDataMessage.persistence[lowestGroup].Schema;
  const columnNames = getColumnNames(lowestGroupSchema);
  let csv =
    "data:text/csv;charset=utf-8," +
    columnNames
      .map((column) => {
        if (column.InternalName == "id") return "id";
        return column.Label;
      })
      .join(",") +
    "\n";

  const data = Object.values(
    upvise.entityData(lowestGroup)
  ) as unknown as IRecord[];
  const columnLength = columnNames.length - 1;

  const filteredResponse: string[] = [];
  const unfilteredResponse: string[] = [];

  data.forEach((data) => {
    if (filterValues(data, exportFilter))
      filteredResponse.push(getCSVResponse(data, columnNames, columnLength));
    else
      unfilteredResponse.push(getCSVResponse(data, columnNames, columnLength));
  });

  if (exportFilter && filteredResponse.length > 0)
    csv += filteredResponse.join("\n");
  else csv += unfilteredResponse.join("\n");
  const currentTime = Date.now();

  let encodedUri = encodeURI(csv);
  encodedUri = encodedUri.replaceAll("#", "%23");
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `${upvise.upviseClient}_${upvise.upvisePage}_${lowestGroupName}_${currentTime}.csv`
  );

  document.body.appendChild(link);
  link.click();
};

function getColumnNames(schema: IColumnMetadata[]) {
  return orderBy(
    schema.filter((column) => !column.Hidden || column.InternalName === "id"),
    ["DisplayOrderIndex"],
    ["asc"]
  );
}

function filterValues(data: IRecord, filter?: IRecord) {
  // Going to check through the supplied filter to see if the value should be added to the export or not
  // Filters should be in the format {[property name]: "value1|value2"}
  // eg. {value: "1|2"} will filter records where the value == 1 or 2
  if (filter) {
    let passedCheck = true;
    Object.keys(filter).forEach((property) => {
      const filterValues = filter[property];
      let dataValue = data[property];
      if (typeof filterValues !== "string") return;
      if (typeof dataValue !== "string")
        dataValue = dataValue?.toString().trim().toLowerCase() || null;
      else dataValue = dataValue?.trim().toLowerCase() || null;

      let foundMatch = false;
      filterValues.split("|").forEach((value) => {
        const filterValue = value.trim().toLowerCase();
        if (dataValue === filterValue) {
          foundMatch = true;
        }
      });
      if (!foundMatch) passedCheck = false;
    });
    return passedCheck;
  }
  return false;
}

function getCSVResponse(
  data: IRecord,
  columnNames: IColumnMetadata[],
  columnLength: number
) {
  let csv = "";
  columnNames.forEach((column, columnIndex) => {
    // May want to add other styles as they come up. Added multiId and date for now
    csv += '"';
    if (column.Style === "multiId") {
      csv +=
        data[column.InternalName as string]
          ?.toString()
          .split("|")
          .join(" | ") ?? "";
    } else if (column.Style === "date") {
      csv += moment(data[column.InternalName as string] as number, "x").format(
        "DD-MM-YYYY"
      );
    } else csv += data[column.InternalName as string] ?? "";
    if (columnIndex !== columnLength) csv += '",';
    else csv += '"';
  });
  return csv;
}
