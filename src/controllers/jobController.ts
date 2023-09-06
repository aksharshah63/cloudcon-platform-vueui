import jobDataAccess from "../../cloudconLibrary/store/modules/jobData/jobDataAccess";
import { UsersApi } from "../../cloudconLibrary/api/usersApi";
import {
  IFilters,
  IPagination,
  ISort,
} from "../../cloudconLibrary/utilities/useGenericInterfaces";
import {
  IRequestJobCreate,
  IRequestJobUpdate,
} from "cloudconLibrary/api/apiInterfaces";
import { IUserDetails } from "../../cloudconLibrary/store/modules/userData/userDataModule";

export default function jobController() {
  const usersApi = new UsersApi();
  const getalljobs = async () => {
    await jobDataAccess.fetchJobs();
    const data = await jobDataAccess.getJobs();
    return JSON.stringify(data);
  };

  const getjobbysearch = async (
    filters_item?: IFilters,
    sort_item?: ISort,
    paginate?: IPagination
  ) => {
    await jobDataAccess.fetchJobs(filters_item, sort_item, paginate);
    const data = await jobDataAccess.getJobsForTable();
    const totalData = await jobDataAccess.getTotalJobsForTable();
    return { data, totalData };
  };

  const deletejob = (id: number): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      jobDataAccess
        .deleteJob(id)
        .then(() => {
          return resolve("Success");
        })
        .catch(() => {
          return reject({
            main: "Error",
            message: "Something went wrong",
          });
        });
    });
  };

  const getjobbyid = async (id: number) => {
    await jobDataAccess.fetchJobById(id);
    const data = await jobDataAccess.getJobById(id);
    return JSON.stringify(data);
  };

  const addjob = (jobcreaterequest: IRequestJobCreate): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      jobDataAccess
        .createJob(jobcreaterequest)
        .then(() => {
          return resolve("success");
        })
        .catch((error) => {
          return reject({
            main: "Error",
            message: error.data.AlreadyExists[0],
          });
        });
    });
  };

  const updatejob = (jobupdaterequest: IRequestJobUpdate): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      jobDataAccess
        .updateJob(jobupdaterequest)
        .then(() => {
          return resolve("success");
        })
        .catch((error) => {
          return reject({
            main: "Error",
            message: error.data.AlreadyExists[0],
          });
        });
    });
  };

  const emaillogin = (username: string): Promise<void | IUserDetails> => {
    return new Promise<void | IUserDetails>((resolve, reject) => {
      usersApi
        .loginWithEmail(username)
        .then((response) => {
          const userDetails: IUserDetails = {
            user: response.data ?? undefined,
          };
          return resolve(userDetails);
        })
        .catch(() => {
          return reject({
            main: "Error",
            message: "Something went wrong",
          });
        });
    });
  };

  return {
    getalljobs,
    getjobbysearch,
    deletejob,
    getjobbyid,
    addjob,
    updatejob,
    emaillogin,
  };
}
