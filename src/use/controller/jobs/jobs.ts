import {
  IUpvise,
  IRecord,
  //IUpviseDataMessage,
  IGridSlicing,
} from "../../../store/modules/upvise.d";
import _ from "lodash";
import { IJobRecord } from "../../../use/controller/jobs/jobs.d";
import localforage from "localforage";
import { FilterMatchMode } from "primevue/api";

export default function useControllerJobs(upvise: IUpvise) {
  const state = upvise.state();
  const fetch = () => upvise.fetch("jobs");
  const getMetadata = () => upvise.metadata("jobs");

  const getSlicingInformation = (
    comparedDay: Date
  ): Record<string, IGridSlicing[]> => {
    const returnArray: Record<string, IGridSlicing[]> = { TableJobsJobs: [] };
    returnArray["TableJobsJobs"].push({
      fieldNames: ["duedate"],
      displayName: "All",
      filtersToApply: {
        duedate: {
          operator: "and",
          constraints: [
            {
              value: comparedDay,
              matchMode: FilterMatchMode.DATE_IS,
            },
            // {
            //   value: nextDate,
            //   matchMode: FilterMatchMode.LESS_THAN
            // },
          ],
        },
      },
    });
    return returnArray;
  };

  const doValidateJobs = (jobs: Record<string, any>[]) => {
    if (jobs.length <= 0) {
      alert("Please choose a job");
      return false;
    }
    return true;
  };

  async function getCompanyNames() {
    const localForageInstance = localforage.createInstance({
      name: "upvise",
      storeName: "tables",
    });

    const companies = await localForageInstance
      .getItem("unybiz.contacts.companies")
      .then((results: unknown) => {
        return (results as { name: string; items: Record<string, any>[] })
          .items;
      });

    const jobsData = Object.values(upvise.entityData("TableJobsJobs"));
    jobsData.forEach((job) => {
      const company = companies.find(
        (company: Record<string, unknown>) => company.id === job.companyid
      );
      if (company) job.companyName = company.name;
    });
    //console.log("client Name");
  }

  const doSaveJobs = (TableJobsJobs: IJobRecord[]): Promise<void> => {
    const payload = {
      TableJobsJobs: TableJobsJobs as unknown as IRecord[],
    } as Record<string, IRecord[]>;
    return upvise.update(payload);
  };

  async function makeAddress() {
    const jobsData = Object.values(upvise.entityData("TableJobsJobs"));
    jobsData.forEach((job) => {
      const address = [
        job.street,
        job.city,
        job.state,
        job.zipcode,
        job.country,
      ].join(", ");
      job.address = address;
    });
  }

  async function showStatus() {
    const jobsData = Object.values(upvise.entityData("TableJobsJobs"));
    const jobsStatus = upvise.entityData("_jobsStatus");
    jobsData.forEach((job) => {
      job.statusName = jobsStatus[job.status as number]?.value;
    });
  }
  async function showPriority() {
    const jobsData = Object.values(upvise.entityData("TableJobsJobs"));
    const jobsPriority = upvise.entityData("_jobsPriority");
    jobsData.forEach((job) => {
      job.priorityName = jobsPriority[job.priority as number]?.value;
    });
  }

  async function getEmployees() {
    const localForageInstance = localforage.createInstance({
      name: "upvise",
      storeName: "tables",
    });

    const employees = await localForageInstance
      .getItem("unybiz.contacts.contacts")
      .then((results: unknown) => {
        return (results as { name: string; items: Record<string, any>[] })
          .items;
      });

    return employees
      .map((employee) => {
        return { name: employee.name };
      })
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
  }

  async function getBulkJobUpdateString() {
    const localForageInstance = localforage.createInstance({
      name: "upvise",
      storeName: "tables",
    });
    const updateJobSettingsValue = await localForageInstance
      .getItem("system.user.settings")
      .then((results: unknown) => {
        return (results as { name: string; items: Record<string, any>[] })
          .items;
      });

    return updateJobSettingsValue.find((setting) => {
      if (setting.id == "JOBS_BULK_UPDATE_FIELDS") return true;
    })?.value;
  }

  async function getUpviseTableData(table: string) {
    const localForageInstance = localforage.createInstance({
      name: "upvise",
      storeName: "tables",
    });
    const updateJobSettingsValue = await localForageInstance
      .getItem(table)
      .then((results: unknown) => {
        return (results as { name: string; items: Record<string, any>[] })
          .items;
      });
    //console.log(updateJobSettingsValue);
    return updateJobSettingsValue;
  }

  async function getStateTableData(table: string) {
    const iteratedMap = upvise.entityData(table);
    return _.cloneDeep(Object.values(iteratedMap));
  }

  async function getBulkJobOptions(source: string): Promise<string[]> {
    const sourceSplit = source.split("|");
    let returnArray: string[] = [];
    if (sourceSplit.length == 1 || sourceSplit.length == 0) return returnArray;
    else {
      const sourceTable = sourceSplit[0];
      let tableValue = [];
      switch (sourceTable) {
        case "upvise":
          tableValue = await getUpviseTableData(sourceSplit[1]);
          returnArray = tableValue.map((record) => {
            return record[sourceSplit[2]] as string;
          });
          break;
        case "state":
          tableValue = await getStateTableData(sourceSplit[1]);
          returnArray = tableValue.map((record) => {
            return record[sourceSplit[2]] as string;
          });
          break;
        case "custom":
          returnArray = sourceSplit[1].split(":");
          break;
      }
    }
    return returnArray.sort();
  }

  async function getBulkJobOptionsMap(
    source: string,
    returnValue: string
  ): Promise<Record<string, any>> {
    const sourceSplit = source.split("|");
    const returnMap: Record<string, any> = {};
    if (sourceSplit.length == 1 || sourceSplit.length == 0) return returnMap;
    else {
      const sourceTable = sourceSplit[0];
      let tableValue = [];
      switch (sourceTable) {
        case "upvise":
          tableValue = await getUpviseTableData(sourceSplit[1]);
          tableValue.forEach((record) => {
            returnMap[record[sourceSplit[2]]] = record[returnValue];
          });
          break;
        case "state":
          tableValue = await getStateTableData(sourceSplit[1]);
          tableValue.forEach((record) => {
            returnMap[record[sourceSplit[2]] as string] = record[returnValue];
          });
          break;
        case "custom":
          break;
      }
    }
    return returnMap;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async function initialiseStore() {
    await getCompanyNames();
  }

  return {
    getBulkJobOptions,
    getBulkJobOptionsMap,
    state,
    fetch,
    getMetadata,
    getBulkJobUpdateString,
    initialiseStore,
    makeAddress,
    showStatus,
    showPriority,
    getEmployees,
    doSaveJobs,
    doValidateJobs,
    getSlicingInformation,
  };
}
