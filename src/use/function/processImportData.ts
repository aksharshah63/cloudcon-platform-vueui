import {
  IColumnMetadata,
  IUpviseDataMessage,
  IRecord,
  IUpvise,
} from "../../store/modules/upvise.d";
//import { ILookupRecord } from "../../use/controller/lookups/lookups.d";
import moment from "moment-timezone";
import backingField from "../../use/utils/useBackingField";
import useLocalForage from "../../use/utils/useLocalForage";
import useTypes from "../../use/utils/useTypes";

/* NOTE: ID field should always be in the first position
 *
 * */

let passedCheck = true;
let currentGroup = "";
let upviseDataMessage: IUpviseDataMessage;
let forageResponses: Record<string, IRecord[]>;
const numberTypes = [
  ...useTypes.numberTypes,
  ...useTypes.dateTypes,
  ...useTypes.checkboxTypes,
  ...useTypes.toggleTypes,
];

// If the preprocessing is successful it will tell the component with a bool
export async function processImportData(
  upviseData: IUpviseDataMessage,
  upvise: IUpvise,
  importData: any
) {
  // NOTE: This will NOT work for multilayered data.
  // Always going to import to the lowest data level
  passedCheck = true;
  upviseDataMessage = upviseData;
  let responseCsv = "";

  const grouping = upviseDataMessage.definition.Grouping;
  const lowestLevel = Object.keys(grouping).length - 1;
  currentGroup = grouping[lowestLevel].Type;
  const currentData = Object.values(upvise.entityData(currentGroup));

  const allColumns = upviseDataMessage.persistence[currentGroup].Schema;
  const columns = getColumnsFromImport(allColumns, importData[0]);
  responseCsv += buildResponseHeader(columns, importData[0]);
  await getLocalForageData(columns).then(
    (results) => (forageResponses = results)
  );

  let missingRequiredField = false;
  const requiredHeadersError = checkRequiredColumns(columns, allColumns);
  if (requiredHeadersError) {
    missingRequiredField = true;
  }

  if (!checkIdFirst(columns)) {
    outputCsv(responseCsv);
    return [false, []];
  }

  // Going to return an object now, so import can handle multiple types at once
  // Ie. for fab table, import will need to upload/change lots as well as audit logs
  const dataForUpvise: IRecord[] = [];
  //const dataForUpvise: Record <string, IRecord[]> = {};
  //dataForUpvise.currentGroup = []

  // Slice off the header row as we're finished with it now
  importData.slice(1).forEach((row: string[]) => {
    let recordObject: [boolean, string | IRecord] = [false, ""];
    if (row.length > 1) {
      responseCsv += '"' + row.join('","');
      // Make sure the id field isn't empty (trim in case there is whitespace)
      if (row[0].trim()) {
        const currentRecord = getPreviousRecordById(
          row[0],
          currentData as unknown as IRecord[]
        );
        if (currentRecord) {
          // Record with that ID already exists. Going to compare to old record
          //recordObject = compareRecords(upvise, row, currentRecord, columns);
          recordObject = checkRecord(upvise, row, columns);
          if (!recordObject[0]) {
            passedCheck = false;
            responseCsv += '","' + recordObject[1];
          }
        } else {
          // Invalid header: throw an error
          passedCheck = false;
          responseCsv +=
            '","The ID provided is invalid: leave id field empty for adding new items. ';
          recordObject = checkRecord(upvise, row, columns);
          if (!recordObject[0]) {
            passedCheck = false;
            responseCsv += recordObject[1];
          }
        }
      } else {
        // No ID provided: we'll be adding a new record entirely
        responseCsv += '","';
        if (missingRequiredField) {
          passedCheck = false;
          responseCsv += requiredHeadersError;
        }
        recordObject = checkRecord(upvise, row, columns);
        if (!recordObject[0]) {
          passedCheck = false;
          responseCsv += recordObject[1];
        }
      }
      responseCsv += '"\n';
      // If an error has already been found don't need to worry about building the upvise object
      if (passedCheck && recordObject[0])
        dataForUpvise.push(recordObject[1] as IRecord);
    }
  });

  // if (passedCheck) sendToUpvise(dataForUpvise);
  // else outputCsv(responseCsv);

  if (!passedCheck) outputCsv(responseCsv);
  return passedCheck ? [true, dataForUpvise] : [false, []];
  //console.log("Data that's to be saved to upvise: ", dataForUpvise)
  //return [false, []]
}

function getColumnsFromImport(
  schema: IColumnMetadata[],
  importHeaders: string[]
): (IColumnMetadata | null)[] {
  const columns: (IColumnMetadata | null)[] = [];
  importHeaders.forEach((name) => {
    let found;
    if (compareStrings(name, "id"))
      found = schema.find((column) => {
        if (typeof column.InternalName === "string") {
          return compareStrings(column.InternalName, name);
        }
      });
    else
      found = schema.find((column) => {
        if (typeof column.Label === "string")
          return compareStrings(column.Label, name);
      });

    if (found) columns.push(found);
    // Important to push null so we know to ignore bad header names
    else {
      passedCheck = false;
      columns.push(null);
    }
  });
  return columns;
}

function buildResponseHeader(
  columns: (IColumnMetadata | null)[],
  importHeaders: string[]
): string {
  let responseString = "data:text/csv;charset=utf-8,";
  let errors = "";
  columns.forEach((column, index) => {
    if (column) {
      if (compareStrings(column.InternalName as string, "id")) {
        responseString += "id";
        if (index !== 0) errors += "ID must be the first column. ";
      } else responseString += column.Label;
    } else {
      responseString += importHeaders[index];
      errors += importHeaders[index] + " is not a valid header name. ";
    }
    responseString += ",";
  });
  responseString += "Errors Found";

  if (errors) responseString += "," + errors;
  responseString += "\n";
  return responseString;
}

function checkRequiredColumns(
  columns: (IColumnMetadata | null)[],
  allColumns: IColumnMetadata[]
) {
  let errors = "";
  allColumns.forEach((schema) => {
    if (schema.IsRequired) {
      if (
        !columns.find((column) => column?.InternalName === schema.InternalName)
      ) {
        errors += `${schema.Label} is a required field for this table, you must include it when adding new records. `;
      }
    }
  });
  return errors;
}

function checkRecord(
  upvise: IUpvise,
  row: string[],
  columns: (IColumnMetadata | null)[]
): [boolean, string | IRecord] {
  let errorFound = false;
  let errors = "";
  const recordObject: IRecord = {};

  row.forEach((value, index: number) => {
    if (columns[index] !== null) {
      recordObject[columns[index]?.InternalName as string] = value;
      const backingFieldDetails =
        columns[index]?.BackingFieldInternalName?.split(":");
      const style = columns[index]?.Style || "";
      if (columns[index]?.InternalName == "lookupname") {
        if (value.includes("|")) {
          errorFound = true;
          errors += `${columns[index]?.Label}: Names of catalogue items cannot contain pipes (|)`;
        }
      }
      if (
        value ||
        !columns[index]?.IsRequired ||
        columns[index]?.InternalName === "id"
      ) {
        if (backingFieldDetails && backingFieldDetails[0]) {
          const backingField = backingFieldDetails[0] as string;
          const result = findBackingData(
            upvise,
            backingFieldDetails,
            value,
            style
          );
          if (result === null && value) {
            errorFound = true;
            errors += `${columns[index]?.Label}: ${value} is invalid. `;
          } else recordObject[backingField] = result;
        } else {
          if (columns[index]?.Style === "date") {
            const date = convertDate(value);
            if (date || date === 0) {
              recordObject[columns[index]?.InternalName as string] = date;
            } else {
              errorFound = true;
              errors += `${columns[index]?.Label}: ${value} is not a valid date string. Format should be DD/MM/YYYY `;
            }
          }
        }
        if (
          numberTypes.includes(
            columns[index]?.RawType?.toLowerCase()?.trim() || ""
          ) &&
          columns[index]?.Style !== "date"
        ) {
          if (Number.isNaN(Number(value))) {
            errorFound = true;
            errors += `${columns[index]?.Label} only allows numbers.`;
          } else {
            recordObject[columns[index]?.InternalName as string] =
              Number(value);
          }
        }
      } else {
        errorFound = true;
        errors += `${columns[index]?.Label} is a required field: do not leave this empty. `;
      }
    }
  });
  return errorFound ? [false, errors] : [true, recordObject];
}

function getPreviousRecordById(id: string, data: IRecord[]) {
  return data.find((entry) => compareStrings(entry.id as string, id));
}

function compareStrings(string1: string, string2: string): boolean {
  return string1.toLowerCase().trim() === string2.toLowerCase().trim();
}

function checkIdFirst(columns: (IColumnMetadata | null)[]) {
  if (columns[0]) return columns[0].InternalName === "id";
  return false;
}

function convertDate(value: string): number | undefined {
  const regex =
    /^(0?[1-9]|[12][0-9]|3[01])[- /.](0?[1-9]|1[012])[- /.]\d\d\d\d$/;
  if (regex.test(value)) {
    const convertedDate =
      moment(value, "DD/MM/YYYY").format("YYYY/MM/DD").toString() +
      " 00:00:00 GMT";
    return Date.parse(convertedDate);
  }
}

function outputCsv(csv: string) {
  const currentTime = Date.now();

  let encodedUri = encodeURI(csv);
  encodedUri = encodedUri.replaceAll("#", "%23");
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `ErrorLog_${currentTime}.csv`);

  document.body.appendChild(link);
  link.click();
}

function findBackingData(
  _: IUpvise,
  backingFieldDetails: string[],
  value: string,
  style: string
) {
  const backingFieldController = backingField();
  const method = backingFieldDetails[1];
  if (method === "labels") {
    const result = backingFieldController.findBackingDataForLabels(
      value,
      backingFieldDetails
    );
    return result || null;
  } else if (method === "store") {
    const result = backingFieldController.findBackingDataForStore(
      value,
      backingFieldDetails,
      style
    );
    return result || null;
  } else if (method === "forage") {
    const result = backingFieldController.findBackingDataForForage(
      value,
      backingFieldDetails,
      forageResponses,
      style
    );
    return result || null;
  }
  return null;
}

async function getLocalForageData(columns: (IColumnMetadata | null)[]) {
  const tableNames = new Set();

  columns.forEach((column) => {
    if (column && column?.BackingFieldInternalName) {
      const backingData = column.BackingFieldInternalName.split(":");
      if (backingData[1] === "forage") tableNames.add(backingData[2]);
    }
  });

  const localForageInstance = await useLocalForage.getInstance(
    "upvise",
    "tables"
  );
  return useLocalForage.getDataForkeys(
    Array.from(tableNames) as string[],
    localForageInstance
  );
}
