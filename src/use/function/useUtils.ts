/* eslint-disable @typescript-eslint/ban-ts-comment,@typescript-eslint/no-explicit-any */
import { IColumnMetadata, IRecord } from "../../store/modules/upvise.d";
import { UnwrapNestedRefs } from "@vue/reactivity";
import moment from "moment";
import useLocalForage from "../utils/useLocalForage";
import types from "../utils/useTypes";
import { v4 as uuidv4 } from "uuid";
import localforage from "localforage";
import { debounce } from "lodash";

export default {
  GetEndpoint: (str: string, selector: Record<number, string>): string =>
    // @ts-ignore
    str.format(JSON.stringify(selector)),

  IsActive: (row: UnwrapNestedRefs<IRecord> | IRecord | null): boolean =>
    row
      ? !Object.keys(row).includes("_type") ||
        row["_type"] === "" ||
        row["_type"] === "POST"
      : false,

  IsNumeric: (cell: Record<string, any>, property: string): boolean =>
    cell &&
    Object.keys(cell).includes(property) &&
    !isNaN(parseFloat(cell[property]?.toString())),

  GetNumeric: (cell: string, property: string): number =>
    parseFloat(JSON.parse(cell)[property]?.toString()) || 0,

  GetString: (cell: string, property: string): string =>
    JSON.parse(cell)[property]?.toString() || "",

  SetProperty: (
    cell: string,
    property: string,
    value: string | number
  ): string => {
    const parsedCell = JSON.parse(cell) as Record<string, string | number>;
    parsedCell[property] = value;
    return JSON.stringify(parsedCell);
  },

  // convert epoch into formatted date string or date object
  getDate: (date: string, dateFormat = ""): string | Date => {
    if (dateFormat) return moment(parseInt(date)).format(dateFormat);
    else return new Date(parseInt(date));
  },

  addDaysToDate: (date: number, numberOfDays: number): number | Date => {
    const d = new Date(date);
    d.setDate(d.getDate() + numberOfDays);
    return d.getTime();
  },

  getEpoch: (date: string | Date): number => {
    return moment(date).valueOf();
  },

  getStartOfDay(date: Date): number {
    const currentDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0
    );
    return currentDate.getTime();
  },

  // Get number from a boolean (true = 1, false = 0, else null)
  getNumFromBool(boolean: boolean) {
    const number = boolean === true ? 1 : boolean === false ? 0 : null;

    return number;
  },

  // Get number from a boolean (1 = true, 0 = false, else null)
  getBoolFromNum(number: number) {
    const boolean = number === 1 ? true : number === 0 ? false : null;

    return boolean;
  },

  compareStrings(string1: string, string2: string) {
    return string1.toLowerCase().trim() === string2.toLowerCase().trim();
  },

  equalObjects<T>(object1: T, object2: T) {
    return JSON.stringify(object1) === JSON.stringify(object2);
  },

  // get name of custom fields stored as properties in the object (e.g. project_Manager_F1)
  getCustomFieldName(internalName: string, title: string | undefined | null) {
    return title
      ? title[0].toLowerCase() + title.substring(1) + "_" + internalName
      : "_" + internalName;
  },

  getFieldName(c: IColumnMetadata) {
    return c.IsCustom
      ? this.getCustomFieldName(c.InternalName as string, c.Title)
      : c.InternalName || "";
  },

  // check whether selOptions is a function
  isSelOptionsFunction(selOptions: string) {
    if (
      selOptions &&
      typeof selOptions === "string" &&
      selOptions.charAt(0) === "="
    )
      return true;
    else return false;
  },

  // return selOptions string an as array
  getSelOptions(selOptions: string) {
    return selOptions
      ? selOptions.split("|").map((o) => ({ name: o, value: o }))
      : [];
  },

  // parse custom string
  parseCustomField(custom: string, schema: IColumnMetadata[]) {
    const result: Record<string, number | string> = JSON.parse(custom);

    Object.entries(result).forEach(([field, value]) => {
      const column = schema.find((c) => c.InternalName === field);
      if (
        column &&
        column.RawType &&
        types.numberTypes.includes(column.RawType.toLowerCase()) &&
        !isNaN(Number(value))
      ) {
        result[field] = Number(value);
      }
    });

    return result;
  },

  // stringify custom object
  stringifyCustomField(custom: Record<string, number | string>) {
    const result: Record<string, unknown> = {};

    Object.entries(custom).forEach(([field, value]) => {
      if (value !== null && value !== undefined)
        result[field] = value.toString();
    });

    return JSON.stringify(result);
  },

  // return sum of a given property for every item
  getTotalFromItems(
    items: Record<string, any>[],
    property: string,
    rounding: number
  ) {
    let total = 0;

    items.forEach((item) => {
      if (item[property] && !isNaN(item[property])) total += item[property];
    });

    return Number(total.toFixed(rounding));
  },

  async getUpviseTableData(
    tables: Record<
      string,
      { table: string; filters?: { field: string; value: unknown }[] }
    >
  ) {
    const upviseTableData: Record<
      string,
      { tableName: string; data: Record<string, unknown>[] }
    > = {};
    const localForageInstance = useLocalForage.getInstance("upvise", "tables");

    for (const key in tables) {
      await useLocalForage
        .getData(tables[key]["table"], localForageInstance)
        .then((result: unknown) => {
          if (result) {
            let filteredResults = result as IRecord[];
            const filters = tables[key]["filters"];

            if (filters)
              filters.forEach((f) => {
                filteredResults = filteredResults.filter(
                  (e) => e[f.field] === f.value
                );
              });

            upviseTableData[key] = {
              tableName: tables[key]["table"],
              data: filteredResults as IRecord[],
            };
          } else
            upviseTableData[key] = {
              tableName: tables[key]["table"],
              data: [],
            };
        })
        .catch();
    }
    return upviseTableData;
  },

  async getUpviseLocalForageRecord(table: string, id: string) {
    const localForageInstance = localforage.createInstance({
      name: "upvise",
      storeName: "tables",
    });
    const records = await localForageInstance
      .getItem(table)
      .then((results: unknown) => {
        return (results as { name: string; items: Record<string, any>[] })
          .items;
      });

    return records.find((record: Record<string, unknown>) => record.id === id);
  },

  deepCopy<T>(data: T): T {
    // TODO This should probably be updated to use Lodash's deep copy
    return JSON.parse(JSON.stringify(data));
  },

  deepCopySet<T>(data: Set<T>): Set<T> {
    return new Set(this.deepCopy(Array.from(data)));
  },

  debounce(func: (...args: any) => any, delay = 1000) {
    return debounce(func, delay);
  },

  generateId(): string {
    return uuidv4().toUpperCase().replace(/-/g, "");
  },

  getSetting(settingsData: IRecord[], settingId: string): string | null {
    return (
      (settingsData.find((setting) => setting.id === settingId)
        ?.value as string) ?? null
    );
  },

  forceSync: (
    mustFetch = false,
    success: (() => void) | null = null
  ): Promise<void> => {
    window.Toast.showProgress(window.R.SYNCING);
    if (!mustFetch) {
      try {
        window.eval("Cache.invalidate()");
      } catch {
        console.log("window.Cache.invalidate() is not a function");
      }
    } else {
      const lastBuildDate =
        parseInt(window.localStorage.getItem(window.Cache.LBD_KEY) ?? "0") -
          window.Cache.DURATION -
          1 || 0;
      window.localStorage.setItem(
        window.Cache.LBD_KEY,
        String(window.Cache.lastBuildDate)
      );
      window.Cache.lastBuildDate = lastBuildDate;

      try {
        window.eval("Cache.setLastBuildDate(" + lastBuildDate + ")");
      } catch {
        console.log("Couldn't use setLastBuildDate");
      }
    }

    return new Promise<void>((resolve) => {
      try {
        window.Cache.sync(() => {
          window.Toast.hideProgress();
          // eslint-disable-next-line no-extra-boolean-cast
          if (success) success();
          resolve();
        });
      } catch {
        console.log("Using window.eval to sync");
        window.eval("Cache.sync();");
        if (success) success();
        resolve();
      }
    });
  },
  groupBy: (xs: any, key: string): object => {
    return xs.reduce(function (rv: any, x: any) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  },
};
