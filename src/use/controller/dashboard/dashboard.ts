// import moment from "moment";
// import {
//   IRecordPlannerBudget,
//   IRecordPlannerMilestone,
//   IRecordPlannerTask,
// } from "../../../use/controller/project/planner.d";
import {
  IChartMessage,
  // IChartData,
  // IChartSeriesData,
  IChartOptions,
  IRecord,
  IUpvise,
} from "../../../store/modules/upvise.d";
import { reactive, ref } from "vue";
import {
  IDashlet,
  IDashletTemplate,
  IDropZone,
  IDashletCard,
  IDashletFilter,
  IDashletFilterTemplate,
  IFilterModel,
  IFilterModelSaved,
  IDashletCacheKey,
} from "./dashboard.d";
import localforage from "localforage";
import { CancelTokenSource } from "axios";
import utils from "../../../use/function/useUtils";
import useControllerBaywatch from "../baywatch/baywatch";

export const updating = ref(true);
export const filterUpdating = ref(false);
let filters = {} as IFilterModel;
const dashletDataCache = new Map<string, IChartMessage>();

const templateOptions = [
  { description: "1 COL", value: [12] },
  { description: "2 COL", value: [6, 6] },
  { description: "3 COL", value: [4, 4, 4] },
  { description: "4 COL", value: [3, 3, 3, 3] },
  { description: "6 COL", value: Array(6).fill(2) },
  { description: "12 COL", value: Array(12).fill(1) },
  { description: "SKINNY COL", value: [3, 9] },
];

export default function useControllerDashboard(upvise: IUpvise) {
  // const state = upvise.state();
  const state = {};

  const fetch = () => upvise.fetch("dashlets", true);
  const pageName = upvise.upviseSelector[0];
  const baywatchController = useControllerBaywatch(upvise);
  const dropzoneTable = "TableEmployeedashboardDropzones";
  const dashletsTable = "TableEmployeedashboardDashlets";
  const filtersTable = "TableEmployeedashboardDashletfilters";
  // initialise store early so that it does not overrwrite later
  upvise.metadata("jobs");

  const localForageInstace = localforage.createInstance({
    name: "upvise",
    storeName: "tables",
  });
  function getTemplateOptions() {
    return templateOptions;
  }
  function getCurrentDashlets(reportArray: IDashletCard[]) {
    let schedulerKey = "";
    let reports = {};

    return localForageInstace
      .getItem("system.user.settings")
      .then((result: unknown) => {
        const typedResult = result as {
          name: string;
          items: { id: string; value: string }[];
        };
        typedResult.items.forEach((entry) => {
          if (entry.id === "APP_EMPLOYEEDASHBOARD") {
            schedulerKey = entry.value;
          }
        });

        const userSettingReports = typedResult.items.find(
          (x) => x.id === "REPORTS_" + pageName
        );
        if (userSettingReports) {
          JSON.parse(userSettingReports.value).forEach(
            (entry: IDashletCard) => {
              reportArray.push(entry);
            }
          );
        }
        if (schedulerKey != "") {
          localForageInstace
            .getItem(schedulerKey + ".metadata")
            .then((result: unknown) => {
              const typedResult = result as {
                name: string;
                items: Record<string, unknown>[];
              };
              typedResult.items.forEach((entry) => {
                if (
                  entry["keyname"] &&
                  (entry["keyname"] as string) == pageName &&
                  entry.reports
                ) {
                  reports = JSON.parse(entry["reports"] as string);
                }
              });
              if (Array.isArray(reports)) {
                reports.forEach((entry: IDashletCard) => {
                  // add selection options for baywatch view but this should be some sort of config
                  if (pageName === "baywatch") {
                    entry.selectionOptions = [
                      {
                        name: "Bay",
                        field: "sourceid",
                        labelField: "bayContactName",
                        options: _getBayOptions(),
                      },
                    ];
                  }
                  reportArray.push(entry);
                });
              }
            });
        }
      });
  }
  async function getFilters(filters: IDashletFilter[]) {
    //await localForagePopulateZinmet();
    const realValues = [] as IDashletFilterTemplate[];
    for (let i = 0; i < filters.length; i++) {
      const filter: IDashletFilter = filters[i];
      const filterTemplate = {} as IDashletFilterTemplate;
      filterTemplate.type = filter.type;
      filterTemplate.selector = filter.selector;
      filterTemplate.description = filter.description;
      filterTemplate.default = filter.default;
      filterTemplate.label = filter.label;
      filterTemplate.value = [];
      if (filter.type !== "date") {
        const steps = filter.selector.split("|") as string[];
        if (steps[0] == "upvise") {
          const returnedItem: unknown = await localForageInstace.getItem(
            steps[1]
          );
          const allItems = (returnedItem as Record<string, unknown>)
            .items as Record<string, unknown>[];

          // console.log(allItems);
          // apply steps[2] filter if appropriate
          let filteredItems = allItems;
          if (steps[2]) {
            const itemFilters = JSON.parse(steps[2]) as Record<
              string,
              Array<string>
            >;
            Object.entries(itemFilters).forEach(([key, value]) => {
              filteredItems = filteredItems.filter((x) => {
                const propertyValue = key.startsWith("custom_")
                  ? x.custom
                    ? JSON.parse(x.custom as string)?.[key.split("_")[1]] ??
                      null
                    : null
                  : x?.[key] ?? null;
                return value.includes(propertyValue);
              });
            });
          }
          // for (const item of allItems) {
          //   const customString: { name: string; value: string } = {
          //     value: item.id as string,
          //     name: item[steps[3]] as string,
          //   };
          //   filterTemplate.value.push(customString);
          // }

          // temp solution for CLD-1011
          filterTemplate.value = [
            ...new Set(filteredItems.map((x) => x[steps[3]])),
          ].map(
            (x) => ({ name: x, value: x } as { name: string; value: string })
          );
        }
      }
      realValues.push(filterTemplate);
    }
    return realValues;
  }

  // function update(payload: Record<string, IRecord[]>): Promise<void> {
  //   if (!updating.value && payload) {
  //     updating.value = true;
  //     return upvise.update(payload).then(
  //       (value) => {
  //         updating.value = false;
  //         return value;
  //       },
  //       (error) => {
  //         updating.value = false;
  //         console.log(error);
  //         return error;
  //       }
  //     );
  //   }
  //   // todo: notify user of error
  //   return Promise.reject(new Error("already updating")).catch((error) => {
  //     console.log(error);
  //     return error;
  //   });
  // }

  function update(payload: Record<string, IRecord[]>): Promise<void> {
    if (updating.value) {
      console.log("currently saving");
      return Promise.reject();
    }
    upvise.updateStore(payload);
    return Promise.resolve();
  }

  function save(): Promise<void> {
    const payload: Record<string, IRecord[]> = {};
    // TODO: Make sure that only dashlets/dropzones for this user and module exist in store to be returned
    // TODO: Only save layout changes
    payload[dropzoneTable] = Object.values(
      upvise.entityData(dropzoneTable)
    ).filter(
      (x) => x.name === upvise.upviseUser && x.module === pageName
    ) as unknown as IRecord[];

    payload[dashletsTable] = Object.values(
      upvise.entityData(dashletsTable)
    ).filter(
      (x) => x.name === upvise.upviseUser && x.module === pageName
    ) as unknown as IRecord[];

    if (pageName === "baywatch") {
      payload[baywatchController.bayTable] = Object.values(
        upvise.entityData(baywatchController.bayTable)
      )
        .filter((bay) => utils.IsActive(bay))
        .map((bay) => {
          return { id: bay.id, notes: bay.notes, _updateStore: false };
        }) as unknown as IRecord[];
    }

    if (!updating.value && payload) {
      updating.value = true;
      return upvise.update(payload).then(
        (value) => {
          updating.value = false;
          return value;
        },
        (error) => {
          updating.value = false;
          console.log(error);
          return error;
        }
      );
    }
    // todo: notify user of error
    return Promise.reject(new Error("already saving")).catch((error) => {
      console.log(error);
      return error;
    });
  }

  const getDashlet = (dashletid: string): IDashlet => {
    const dashlet = upvise.recordData(
      dashletsTable,
      dashletid
    ) as unknown as IDashlet;

    return reactive(JSON.parse(JSON.stringify(dashlet)));
  };

  const getDropZone = (dropzoneid: string): IDropZone => {
    const dropzone = upvise.recordData(
      dropzoneTable,
      dropzoneid
    ) as unknown as IDropZone;

    return reactive(JSON.parse(JSON.stringify(dropzone)));
  };

  const getDropZones = (): IDropZone[] => {
    const dropzones = Object.values(
      upvise.entityData(dropzoneTable)
    ) as unknown as IDropZone[];
    // get all non deleted dropzones only
    return reactive(
      JSON.parse(
        JSON.stringify(
          dropzones.filter(
            (x) =>
              !(x?._type == "DELETE") &&
              x.name === upvise.upviseUser &&
              x.module === pageName
          )
        )
      )
    );
  };

  const getLinkedDashlets = (dropzoneid: string): IDashlet[] => {
    const dashlets = Object.values(
      upvise.entityFilter(dashletsTable, "dropzoneid", dropzoneid)
    ) as unknown as IDashlet[];
    return reactive(
      JSON.parse(
        JSON.stringify(dashlets.filter((x) => !(x?._type == "DELETE")))
      )
    );
  };

  const getDropZoneIds = (): string[] => {
    const dropzones = getDropZones();

    return reactive(
      dropzones.sort((a, b) => a.zoneorder - b.zoneorder).map((x) => x.id)
    );
  };

  const deleteDashlet = (dashletid: string): Promise<void> => {
    const deletedDashlet = getDashlet(dashletid) as IDashlet;
    const colDashlets = getLinkedDashlets(
      deletedDashlet.dropzoneid
    ) as IDashlet[];

    colDashlets
      .sort((a, b) => a.dashletorder - b.dashletorder)
      .splice(deletedDashlet.dashletorder, 1);
    colDashlets.forEach((dashlet, index) => (dashlet.dashletorder = index));

    deletedDashlet._type = "DELETE";

    return update({
      TableEmployeedashboardDashlets: [deletedDashlet].concat(
        colDashlets
      ) as unknown as IRecord[],
    });
  };

  // const getData = async (chartName: string) => {
  //   if (chartName === "" || chartName === undefined)
  //     return { test: 1, test2: 2 };
  //   const chartString = "/charts/{0}?selector={}";
  //   const chartFetchKey = chartString.replace("{0}", chartName);
  //   return upvise.fetch(chartFetchKey);
  // };

  // TODO update this function
  const fetchChartData = async (
    chartEndpoint: string,
    selector: string,
    body: IChartOptions,
    cancelToken?: CancelTokenSource
  ): Promise<IChartMessage> => {
    const chartString = "/charts/{0}?selector={1}";
    if (selector == "") selector = "{}";
    const chartFetchString = chartString
      .replace("{0}", chartEndpoint)
      .replace("{1}", selector);
    return upvise.fetchChartData(chartFetchString, body, cancelToken);

    // return new Promise<IChartMessage>

    // if (body && chartFetchString) return upvise.update({});
    // console.log(chartEndpoint, selector, body);
    // return {
    //   series: [] as IChartSeriesData[],
    //   categories: [] as string[],
    //   data: {} as Record<string, IChartData>,
    // } as IChartMessage;
  };

  const getChartDataFiltered = async (
    chartEndpoint: string,
    selector: string,
    body: IChartOptions,
    cancelToken?: CancelTokenSource
  ): Promise<IChartMessage> => {
    // stringified for now, as reference based equality in map
    const cacheKey = JSON.stringify({
      chartEndpoint,
      selector,
      body,
      filters,
    } as IDashletCacheKey);
    if (dashletDataCache.has(cacheKey)) {
      return Promise.resolve(dashletDataCache.get(cacheKey)!);
    }
    body.slicing = filters;
    // console.log(chartEndpoint, selector, body);
    return fetchChartData(chartEndpoint, selector, body, cancelToken).then(
      (value) => {
        dashletDataCache.set(cacheKey, value);
        return Promise.resolve(value);
      }
    );
  };

  const getLinkedDashletIds = (dropzoneid: string): string[] => {
    const dashlets = getLinkedDashlets(dropzoneid);
    return reactive(
      dashlets.sort((a, b) => a.dashletorder - b.dashletorder).map((x) => x.id)
    );
  };

  const moveDashlet = async (
    dashletid: string,
    colid: string,
    index: number
  ): Promise<void> => {
    const draggedDashlet = getDashlet(dashletid);
    const colDashlets = getLinkedDashlets(colid);

    // fix index of prevdashlets after removal
    let prevColDashlets = getLinkedDashlets(draggedDashlet.dropzoneid);

    prevColDashlets
      .sort((a, b) => a.dashletorder - b.dashletorder)
      .splice(draggedDashlet.dashletorder, 1);

    if (colid === draggedDashlet.dropzoneid) {
      prevColDashlets.splice(
        index > draggedDashlet.dashletorder ? Math.max(index - 1, 0) : index,
        0,
        draggedDashlet
      );
      draggedDashlet.dropzoneid = colid;
      prevColDashlets.forEach(
        (dashlet, index) => (dashlet.dashletorder = index)
      );
    } else {
      draggedDashlet.dropzoneid = colid;
      colDashlets.sort((a, b) => a.dashletorder - b.dashletorder);
      colDashlets.splice(index, 0, draggedDashlet);
      colDashlets.forEach((dashlet, index) => (dashlet.dashletorder = index));
      prevColDashlets.forEach(
        (dashlet, index) => (dashlet.dashletorder = index)
      );
      prevColDashlets = prevColDashlets.concat(colDashlets);
    }
    /*for (const dashlet of prevColDashlets) {
      //await upvise.upsertRecord(_fetchKey, "dashlet", dashlet);
    }*/
    return update({
      TableEmployeedashboardDashlets: prevColDashlets as unknown as IRecord[],
    });
  };

  const addDashlet = (
    dashlet: IDashletTemplate,
    colid: string,
    index: number
  ): Promise<void> => {
    const colDashlets = getLinkedDashlets(colid);

    colDashlets.forEach(
      (dashlet) =>
        (dashlet.dashletorder =
          dashlet.dashletorder >= index
            ? dashlet.dashletorder + 1
            : dashlet.dashletorder)
    );
    /*for (const colDashlet of colDashlets) {
      //await upvise.upsertRecord(_fetchKey, "dashlet", colDashlet);
    }*/
    dashlet.id = "";
    dashlet.dashletorder = index;
    dashlet.dropzoneid = colid;
    dashlet.name = upvise.upviseUser;
    dashlet.module = pageName;
    //await upvise.upsertRecord(_fetchKey, "dashlet", dashlet);
    colDashlets.push(dashlet as IDashlet);

    console.log("colDashlets", colDashlets);

    return update({
      TableEmployeedashboardDashlets: colDashlets as unknown as IRecord[],
    });
  };

  const addDashletToStart = (
    options: Record<string, unknown>
  ): Promise<void> => {
    const dashletTemplate = {
      type: options.type as string,
      config: options.config
        ? JSON.stringify(options.config)
        : '{"title": "generated"}',
      dataconfig: options.dataconfig
        ? JSON.stringify(options.dataconfig)
        : "{}",
    } as IDashletTemplate;
    const dropzones = getDropZones();

    const firstDropzone = dropzones.filter((x) => x.zoneorder === 0)[0].id;

    return addDashlet(dashletTemplate, firstDropzone, 0);
  };

  const changeLayout = (layout: number[]): Promise<void> => {
    const dropzones = getDropZones();
    let payload;
    dropzones.sort((a, b) => a.zoneorder - b.zoneorder);

    // fix dropzone arrays upon new layout
    if (layout.length < dropzones.length) {
      // move dashlets to last valid column
      const lastDropzone = dropzones[layout.length - 1];
      let curIndex = getLinkedDashlets(lastDropzone.id).length;
      const concatDashlets = dropzones
        .slice(layout.length)
        .map((x) =>
          getLinkedDashlets(x.id).sort(
            (a, b) => a.dashletorder - b.dashletorder
          )
        )
        .flat();
      concatDashlets.forEach((x) => {
        x.dropzoneid = lastDropzone.id;
        x.dashletorder = curIndex;
        curIndex += 1;
      });

      layout.forEach((val, index) => {
        dropzones[index].width = val;
      });

      for (let i = layout.length; i < dropzones.length; i++) {
        //await upvise.deleteRecord(_fetchKey, "dropzone", dropzones[i]);
        dropzones[i]._type = "DELETE";
      }

      payload = {
        TableEmployeedashboardDropzones: dropzones as unknown as IRecord[],
        TableEmployeedashboardDashlets: concatDashlets as unknown as IRecord[],
      };

      /*for (const dashlet of concatDashlets) {
        //await upvise.upsertRecord(_fetchKey, "dashlet", dashlet);
      }*/
    } else {
      dropzones.forEach((_, index) => {
        dropzones[index].width = layout[index];
      });
      for (let i = dropzones.length; i < layout.length; i++) {
        dropzones.push({
          id: "",
          zoneorder: i,
          width: layout[i],
          name: upvise.upviseUser,
          module: pageName,
        } as IDropZone);
        //await upvise.upsertRecord(_fetchKey, "dropzone", dropzone);
      }

      payload = {
        TableEmployeedashboardDropzones: dropzones as unknown as IRecord[],
      };
    }
    return update(payload);
  };

  const changeFilters = (newFilters: IFilterModel) => {
    filters = newFilters;
    // console.log(filters);
  };

  const saveFilters = (filters: IFilterModel) => {
    if (filterUpdating.value) console.log("filters already saving");
    else {
      // check if saved filter already exists
      const currentFilter = getSavedFilterModel();
      const id = currentFilter ? currentFilter.id : "";

      const payload: Record<string, IRecord[]> = {};
      payload[filtersTable] = [
        {
          id,
          name: upvise.upviseUser,
          module: pageName,
          filter: JSON.stringify(filters),
        },
      ];
      filterUpdating.value = true;
      return upvise.update(payload).then(
        (value) => {
          filterUpdating.value = false;
          return value;
        },
        (error) => {
          filterUpdating.value = false;
          console.log(error);
          return error;
        }
      );
    }
  };

  const getSavedFilterModel = () => {
    const filters = (
      Object.values(
        upvise.entityData(filtersTable)
      ) as unknown as IFilterModelSaved[]
    ).filter((x) => x.name === upvise.upviseUser && x.module === pageName);
    return filters.length > 0 ? filters[0] : null;
  };

  const getSavedFilter = () => {
    const model = getSavedFilterModel();
    return model ? JSON.parse(model.filter) : null;
  };

  // TODO this function should be in a seperate controller and passed through dashlet components
  function _getBayOptions() {
    const baywatchWidgetsData = Object.values(
      upvise.entityData(baywatchController.bayTable)
    ) as unknown as IRecord[];
    return baywatchWidgetsData;
  }

  return {
    pageName,
    getFilters,
    getCurrentDashlets,
    getDashlet,
    getDropZone,
    getLinkedDashletIds,
    getDropZoneIds,
    state,
    fetch,
    // getData,
    fetchChartData,
    moveDashlet,
    addDashletToStart,
    addDashlet,
    changeLayout,
    getDropZones,
    deleteDashlet,
    getTemplateOptions,
    getChartDataFiltered,
    changeFilters,
    save,
    saveFilters,
    getSavedFilter,
  };
}
