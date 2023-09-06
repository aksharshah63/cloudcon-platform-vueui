/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-var-requires,@typescript-eslint/no-non-null-assertion */
import {
  IGrouping,
  ISlicing,
  IRecord,
  ITable,
  IUpviseDataMessage,
  ITableResponse,
  IUpvise,
  IUpviseResponse,
  IStore,
  IEntity,
  IChartMessage,
  IChartOptions,
} from "./upvise.d";
import { reactive, ref } from "vue";
import axios, { CancelTokenSource } from "axios";
import localforage from "localforage";

import { UpvideData } from "./upvideData";
import utils from "../../use/function/useUtils";
import _ from "lodash";
import { _populateLocalForage } from "../mock/localForage/_populateLocalForage";

const deletedIds = UpvideData.Instance.DeletedIds;
const fetchCounter: Record<string, number> = {};
let timer = 0;
const isFetchComplete = ref(false);
const timedOut = ref(false);

export class UpviseDataMessage implements IUpviseDataMessage {
  selection: Record<string, string>;
  persistence: Record<string, ITableResponse>;
  configuration: {
    GlobalSearch: { Global: { Value: string | null; MatchMode: string } };
  } = { GlobalSearch: { Global: { Value: null, MatchMode: "" } } };
  definition: { Grouping: IGrouping; Slicing: ISlicing } = {
    Grouping: {},
    Slicing: {},
  };

  constructor(
    selection: Record<string, string> = {},
    persistence: Record<string, ITableResponse> = {},
    configuration: {
      GlobalSearch: { Global: { Value: string | null; MatchMode: string } };
    } = { GlobalSearch: { Global: { Value: null, MatchMode: "" } } },
    definition: { Grouping: IGrouping; Slicing: ISlicing } = {
      Grouping: {},
      Slicing: {},
    }
  ) {
    this.selection = selection;
    this.persistence = persistence;
    this.configuration = configuration;
    this.definition = definition;
  }
}

// Initialise store from local forage
let isStoreInitialise = false;

const store = UpvideData.Instance.Store;

const payloadStore = {} as IStore;

const initialiseStore = async (): Promise<void> => {
  if (!isStoreInitialise) {
    const localForageInstance = localforage.createInstance({
      name: "kui",
      storeName: "tables",
    });

    await localForageInstance.iterate((value, key, _) => {
      deletedIds[key] = {};
      Object.entries(value as IEntity).forEach(([id, record]) => {
        const row = getRecordData(key, id);
        Object.assign(row, utils.deepCopy(record));
        deletedIds[key][id] = id;
      });
    });
    isStoreInitialise = true;
  }
};

// initialiseStore().then((_) => (isStoreInitialise = true));
const getState = (): IStore => {
  return store;
};

// deletes a record for a specific entity
const deleteRecordData = (entity: string, id: string): void => {
  if (store[entity] && store[entity][id]) delete store[entity][id];
};

// get data for a specific entity
const getEntityData = (entity: string): IEntity => {
  if (!store[entity]) store[entity] = reactive({}) as IEntity;
  return store[entity];
};

// get data for a specific record
const getRecordData = (entity: string, id: string): IRecord => {
  if (!store[entity]) store[entity] = reactive({}) as IEntity;
  if (!store[entity][id]) store[entity][id] = reactive({}) as IRecord;
  return store[entity][id];
};

const getEntityFilter = (
  entityName: string,
  field: string,
  value: unknown
): ITable => {
  if (!store[entityName]) store[entityName] = reactive({}) as IEntity;
  return Object.values(store[entityName]).filter(
    (r) => r !== null && r[field] === value
  );
};

export type IMetadataRecord = {
  id: string;
  keyname: string;
  persistence: string;
  configuration: string;
  definition: string;
};

// get entity names for a module
const getEntityNamesAndTypes = async (
  moduleName: string
): Promise<{ name: string; type: number }[]> => {
  const localForageInstance = localforage.createInstance({
    name: "upvise",
    storeName: "tables",
  });

  return await localForageInstance
    .getItem(
      `${replaceSpecialCharacters(getUpviseClient())}employeedashboard.metadata`
    )
    .then((result: unknown) => {
      const metadata = (result as Record<string, unknown>).items as Record<
        string,
        unknown
      >[];
      return metadata
        .filter((m) => m.keyname === moduleName)
        .map((m) => {
          return {
            name: (m.id as string)?.split("|")[1],
            type: JSON.parse(m.persistence as string).Location?.Type,
          };
        });
      // .map((m) => (m.persistence as ITableResponse).Location.Name);
    })
    .catch(() => {
      console.log("Can't get entity names");
      return [];
    });
};
const replaceSpecialCharacters = (stringName: string) => {
  return stringName.replace(/[_]/g, "");
};
// get metadata for a particular module from upvise metadata table
const getMetadata = async (
  moduleName: string,
  viewName = "default"
): Promise<IUpviseDataMessage> => {
  await initialiseStore();
  await _populateLocalForage();

  const metadataTableData = await axios
    .get(`${getUpviseApiUrl()}/api/${getUpviseClient()}/GetMetadata`, {
      headers: {
        "cloudcon-api-key": getUpviseApiKey(),
        "cloudcon-user": getUpviseUser(),
        // "datahub-connection-id": dataHub?.connectionId ?? "",
      },
    })
    .then((result: unknown) => {
      console.log("result", result);
      return (result as Record<string, unknown>).data as Record<
        string,
        unknown
      >[];
    })
    .catch(() => {
      console.log("Can't get metadata table");
      return null;
    });

  const metadata = !metadataTableData
    ? null
    : metadataTableData.filter(
        (m: any) => m.keyname === `${moduleName}|${viewName}`
      );

  if (!metadata || metadata.length === 0) return new UpviseDataMessage();
  else {
    const persistence = {} as Record<string, ITableResponse>;

    metadata.forEach((m) => {
      const p = JSON.parse(m.persistence as string) as ITableResponse;
      const name = p.Location.Name;

      persistence[name] = p;
    });

    // May need to module and selection here as well
    const data = new UpviseDataMessage(
      {},
      persistence,
      JSON.parse(metadata[0].configuration as string),
      JSON.parse(metadata[0].definition as string)
    );
    console.log(data);
    return data;
  }
};

const getIgnoreDeletedRecordsTables = async (
  moduleName: string
): Promise<Array<string>> => {
  const localForageInstance = localforage.createInstance({
    name: "upvise",
    storeName: "tables",
  });

  return await localForageInstance
    .getItem(
      `${replaceSpecialCharacters(getUpviseClient())}employeedashboard.metadata`
    )
    .then((result: unknown) => {
      const metadata = (result as Record<string, unknown>).items as Record<
        string,
        unknown
      >[];
      const configString = metadata.find((m) => m.keyname === moduleName)
        ?.configuration as string | undefined;
      try {
        return (
          configString
            ? JSON.parse(configString)?.IgnoreDeleteRecords ?? []
            : []
        ) as Array<string>;
      } catch (er) {
        console.log("Invalid configstring", configString);
        return [];
      }
    })
    .catch(() => {
      console.log("Can't get deleted records tables");
      return [];
    });
};

// remove deleted records from the store and local forage
const removeDeletedRecords = async (
  module: string,
  totalCount: number
): Promise<void> => {
  return new Promise((resolve) => {
    if (!(module in fetchCounter) || fetchCounter[module] === totalCount) {
      getIgnoreDeletedRecordsTables(module).then(
        async (ignoreDeletedRecordsTables) => {
          getEntityNamesAndTypes(module).then(async (entityNames) => {
            entityNames.map(async (e): Promise<void> => {
              return new Promise((resolve) => {
                // Ignore any schema only tables. Their deletions will be handled by their own controllers
                if (e.type === 3) return resolve();
                const name = e.name;
                // Ignore deletions for tables in IgnoreDeleteRecords in metadata -> configuration
                if (ignoreDeletedRecordsTables.includes(name)) return resolve();
                if (name in deletedIds)
                  Object.keys(deletedIds[name]).forEach((id) => {
                    if (name in store && id in store[name])
                      delete store[name][id];
                  });
                saveTable(name).then(() => {
                  return resolve();
                });
              });
            });

            Promise.all(entityNames).then(() => {
              console.log(
                "removed deleted records from store and local forage"
              );
              return resolve();
            });
          });
        }
      );
    } else
      setTimeout(() => {
        return resolve(removeDeletedRecords(module, totalCount));
      }, 3000);
  });
};

const removeSchemaOnlyData = (tableName: string, ids: string[]) => {
  ids.forEach((id) => {
    deleteRecordData(tableName, id);
  });
  saveTable(tableName);
};

const removeDeletedRecordsUnstreamed = (
  module: string,
  upviseResponse: IUpviseResponse
) => {
  upviseResponse.forEach((payload) => {
    if (
      payload.tableName in deletedIds &&
      payload.id in deletedIds[payload.tableName]
    )
      delete deletedIds[payload.tableName][payload.id];
  });

  fetchCounter[module] = 0;
  removeDeletedRecords(module, 0);

  console.log(
    "removed deleted records from store and local forage (unstreamed)"
  );
};

const saveTable = (entityName: string): Promise<void> => {
  const localForageInstance = localforage.createInstance({
    name: "kui",
    storeName: "tables",
  });

  return localForageInstance
    .setItem(
      entityName,
      JSON.parse(JSON.stringify(getEntityData(entityName))) || {}
    )
    .then();
};

// update data in store only
const updateStore = (data: Record<string, IRecord[]>): void => {
  mutationUpdateModel(formattedData(data));
};

const mutationUpdateModel = (upviseResponse: IUpviseResponse) => {
  upviseResponse.forEach((payload) => {
    const row = getRecordData(payload.tableName, payload.id);
    if (row) {
      Object.assign(row, utils.deepCopy(payload.row));
      row._isCalculated = false;
    } else {
      const newRow = utils.deepCopy(payload.row);
      newRow._isCalculated = false;
      store[payload.tableName][payload.id] = reactive(newRow) as IRecord;
    }
  });
};

// update data in payload store

const clearPayloadStore = (): void => {
  Object.keys(payloadStore).forEach((x) => delete payloadStore[x]);
};

const mutationUpdatePayloadStore = (upviseResponse: IUpviseResponse) => {
  upviseResponse.forEach((payload) => {
    const row = getPayloadRecordData(payload.tableName, payload.id);

    if (row) {
      Object.assign(row, utils.deepCopy(payload.row));
    } else {
      payloadStore[payload.tableName][payload.id] = reactive(
        utils.deepCopy(payload.row)
      ) as IRecord;
    }
  });
};

const getPayloadRecordData = (entity: string, id: string): IRecord => {
  if (!payloadStore[entity]) payloadStore[entity] = reactive({}) as IEntity;
  if (!payloadStore[entity][id])
    payloadStore[entity][id] = reactive({}) as IRecord;
  return payloadStore[entity][id];
};

const updateDeletedData = (
  data: Record<string, IRecord[]>,
  upviseDataMessage: IUpviseDataMessage
): void => {
  const grouping = upviseDataMessage?.definition?.Grouping;
  if (!grouping) return;

  const copyData = JSON.parse(JSON.stringify(data)) as Record<
    string,
    IRecord[]
  >;

  Object.entries(copyData).forEach(([entityName, records]) => {
    records.forEach((r) => {
      if (r._type === "DELETE") deleteChildData(r, entityName, grouping, data);
    });
  });
};

// updates data to delete child data for a given record
const deleteChildData = (
  record: IRecord,
  entityName: string,
  grouping: IGrouping,
  data: Record<string, IRecord[]>
): void => {
  const group = Object.entries(grouping).find(
    ([_, g]) => g.Type === entityName
  );
  if (!group) return;

  const groupLevel = Number(group[0]);
  const groupDetails = group[1];

  // if the level is reflective, delete child items that are in the same level (e.g. delete milestones under given milestone)
  if (groupDetails.ReflectiveName) {
    const reflectiveData = Object.values(
      JSON.parse(
        JSON.stringify(upvise.entityData(groupDetails.Type))
      ) as IEntity
    ).filter((r) => r[groupDetails.LookupKey + "id"] === record.id);

    reflectiveData.forEach((r) => {
      const recordInData = data[groupDetails.Type].find((d) => d.id === r.id);
      if (recordInData) recordInData._type = "DELETE";
      else {
        r._type = "DELETE";
        data[groupDetails.Type].push(r);
      }

      deleteChildData(r, groupDetails.Type, grouping, data);
    });
  }

  // if there is a level under current level, delete child items under that level related to the given record
  if (grouping[groupLevel + 1]) {
    const childGroup = grouping[groupLevel + 1];
    const childData = Object.values(
      JSON.parse(JSON.stringify(upvise.entityData(childGroup.Type))) as IEntity
    ).filter((r) => r[groupDetails.LookupKey + "id"] === record.id);

    childData.forEach((r) => {
      if (!data[childGroup.Type]) data[childGroup.Type] = [] as IRecord[];
      const recordInData = data[childGroup.Type].find((d) => d.id === r.id);
      if (recordInData) recordInData._type = "DELETE";
      else {
        r._type = "DELETE";
        data[childGroup.Type].push(r);
      }

      deleteChildData(r, childGroup.Type, grouping, data);
    });
  }
};

const formattedData = (data: Record<string, IRecord[]>): IUpviseResponse => {
  const formattedData = [] as IUpviseResponse;

  Object.entries(data).forEach(([tableName, records]) => {
    records
      .filter((r) => r != null)
      .forEach((row) => {
        // check if id is empty, if it is assign id
        if ("id" in row && !row.id) row.id = utils.generateId();
        formattedData.push({
          tableName,
          id: (row.id || row.key) as string,
          row,
        });
      });
  });

  return formattedData;
};

const axiosFetch = (moduleName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (timedOut.value) return reject();
    isFetchComplete.value = false;
    console.log("DATAHUB: fetching data...");
    const start = Date.now();

    fetcher(
      `${getUpviseApiUrl()}/api/${getUpviseClient()}/Get/${moduleName}?resultAsStream=false`
    ).then((response) => {
      if (response) {
        console.debug("Response received: ", response);
        if (response.data.length > 0) {
          mutationUpdateModel(response.data);
          removeDeletedRecordsUnstreamed(moduleName, response.data);
          clearPayloadStore();
          mutationUpdatePayloadStore(response.data);
          timer = Date.now() - start;
          console.log(`Total time taken to receive records: ${timer}`);
          if (moduleName != "favourite") isFetchComplete.value = true;
        }
        return resolve();
      }
    });
  });
};

const fetcher = function (url: string) {
  return axios.post(url, getUpviseSelector(), {
    headers: {
      "cloudcon-api-key": getUpviseApiKey(),
      "cloudcon-user": getUpviseUser(),
      // "datahub-connection-id": dataHub?.connectionId ?? "",
    },
  });
};

const fetchChartData = function (
  endpoint: string,
  body: IChartOptions,
  cancelToken?: CancelTokenSource
): Promise<IChartMessage> {
  return new Promise<IChartMessage>((resolve, reject) => {
    axios
      .post<IChartMessage>(
        `${getUpviseApiUrl()}/api/${getUpviseClient()}${endpoint}`,
        body,
        {
          headers: { "cloudcon-api-key": getUpviseApiKey() },
          cancelToken: cancelToken?.token,
        }
      )
      .then((response) => {
        return resolve(response.data);
      })
      .catch((error) => {
        console.error(error);
        return reject(error);
      });
  });
};

const getUpviseUser = () =>
  <string>(
    (window?.User?.email ||
      process.env.VUE_APP_TEST_UPVISE_EMAIL ||
      "test22@cloudcon.com.au")
  );

const getUpviseUserIsAdmin = () => <boolean>(window?.User?.isAdmin() || false);

const getUpviseApiUrl = () =>
  <string>(
    (window.document.querySelector("div#kui")?.getAttribute("__apiUrl") ||
      "https://cache.app.cloudcon.com.au")
  );

const getUpviseClient = () => "test";

const getUpviseApiKey = () =>
  "gqLfIGHs37aFZDMVJywzuYnX9uAp1hhw57oYDJQuZPCcJANWMW2kJ0A2Ku6T82OtEPYkdULwENbabDRwxrF7PYY0Ri7UH4P9GQ9OnBh1pdpwCK3GjlECPwHDfJIQWxO";

const getUpvisePage = () =>
  <string>window.document.querySelector("div#kui")?.getAttribute("__page");

const getUpviseSelector = () =>
  <Record<number, string>>(
    JSON.parse(
      <string>(
        window.document.querySelector("div#kui")?.getAttribute("__selector")
      ) || "{}"
    )
  );

const getDashboardPage = () =>
  <string>(
    window.document.querySelector("div#kui")!.getAttribute("__dashboardPage")
  ) || "";

const getUserEmail = () => {
  if (localStorage["accounts.current"]) {
    return JSON.parse(localStorage["accounts.current"])["email"];
  } else {
    return process.env.VUE_APP_TEST_USER_EMAIL;
  }
};

declare global {
  interface Window {
    Query: Query;
    Toast: Toast;
    R: R;
    Cache: Cache;
    Sales: Sales;
    User: User;
    Engine: Engine;
    createPurchaseOrder(
      itemsToUse: { id: string; type: string }[]
    ): Promise<unknown>;
  }

  interface Engine {
    eval(func: string, offset: number): void;
  }
  interface Sales {
    viewOpp(id: string): void;
    getNewQuoteName(status: number): string;
  }
  interface User {
    getName(): string;
    isAdmin(): boolean;
    email: string;
  }
  interface Query {
    insert(tableName: string, newTask: Record<string, unknown>): string;

    selectId(tableName: string, id: string): Record<string, unknown> | null;

    updateId(
      tableName: string,
      id: string,
      column: string,
      value: unknown
    ): unknown;
  }

  interface Toast {
    showProgress(p: string): unknown;

    hideProgress(): unknown;
  }

  interface Cache {
    LBD_KEY: string;
    DURATION: number;

    sync(p: (outcome: boolean) => void): void;

    lastBuildDate: number;

    invalidate(): unknown;
  }

  interface R {
    SYNCING: string;
  }
}

export const upvise: IUpvise = {
  get isFetchComplete() {
    return isFetchComplete;
  },
  get upviseUser() {
    return getUpviseUser();
  },
  get upviseUserIsAdmin() {
    return getUpviseUserIsAdmin();
  },
  get userEmail() {
    return getUserEmail();
  },
  get upviseApiUrl() {
    return getUpviseApiUrl();
  },
  get upviseApiKey() {
    return getUpviseApiKey();
  },
  get upviseClient() {
    return getUpviseClient();
  },
  get upvisePage() {
    return getUpvisePage();
  },
  get upviseSelector() {
    return getUpviseSelector();
  },
  get upviseDashboardPage() {
    return getDashboardPage();
  },
  get state() {
    return getState;
  },
  get removeRecordData() {
    return deleteRecordData;
  },
  get entityData() {
    return getEntityData;
  },
  get recordData() {
    return getRecordData;
  },
  get entityFilter() {
    return getEntityFilter;
  },
  get metadata() {
    return getMetadata;
  },
  get updateStore() {
    return updateStore;
  },
  get removeSchemaOnlyData() {
    return removeSchemaOnlyData;
  },

  fetchChartData: (
    endpoint: string,
    body: IChartOptions,
    cancelToken?: CancelTokenSource
  ): Promise<IChartMessage> => fetchChartData(endpoint, body, cancelToken),

  fetch: (moduleName: string): Promise<void> => axiosFetch(moduleName),

  update: (
    data: Record<string, IRecord[]>,
    upviseDataMessage: IUpviseDataMessage | null = null
  ): Promise<void> => {
    if (upviseDataMessage) updateDeletedData(data, upviseDataMessage);
    const upsertData = formattedData(data);
    console.log("data in update", upsertData);
    return new Promise((resolve, reject) => {
      axios
        .put(
          `${getUpviseApiUrl()}/api/${getUpviseClient()}/Save?resultAsStream=true`,
          upsertData,
          {
            headers: {
              "cloudcon-api-key": getUpviseApiKey(),
              "cloudcon-user": getUpviseUser(),
            },
          }
        )
        .then(() => {
          mutationUpdateModel(upsertData);
          clearPayloadStore();
          [...new Set(Object.keys(data))].forEach(saveTable);
          updateStore(data);
          return resolve();
        })
        .catch((error) => {
          console.error(error);
          return reject();
        });
    });
  },
};

export default upvise;
