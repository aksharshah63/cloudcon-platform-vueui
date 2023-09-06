import { IRecord } from "../../store/modules/upvise.d";
import localforage from "localforage";

export default {
  // creates and return the local forage instance
  getInstance: (name: string, storeName: string): LocalForage => {
    return localforage.createInstance({
      name: name,
      storeName: storeName,
    });
  },

  // gets the data for the specified key
  getData: async (key: string, instance: LocalForage): Promise<IRecord[] | null> => {
    const results = await instance
      .getItem(key);
    return results 
      ? (results as { name: string; items: IRecord[]; }).items
      : null;
  },

  // gets the data for an array of keys. Data is put into a dictionary
  getDataForkeys: async (keys: string[], instance: LocalForage): Promise<Record<string, IRecord[]>> => {
    const results: Record<string, IRecord[]> = {};

    for (const k of keys) {
      const data = await instance
        .getItem(k);
      if (data) results[k] = (data as { name: string; items: IRecord[]; }).items;
    }

    return results;
  }
};