import workOrderDataAccess from "../../cloudconLibrary/store/modules/workOrderData/workOrderDataAccess";
import { UsersApi } from "../../cloudconLibrary/api/usersApi";
import {
  IFilters,
  IPagination,
  ISort,
} from "../../cloudconLibrary/utilities/useGenericInterfaces";
import {
  IRequestWorkOrderCreate,
  IRequestWorkOrderUpdate,
} from "cloudconLibrary/api/apiInterfaces";
import { IUserDetails } from "../../cloudconLibrary/store/modules/userData/userDataModule";

export default function workOrderController() {
  const usersApi = new UsersApi();
  const getallworkorders = async () => {
    await workOrderDataAccess.fetchWorkOrders();
    const data = await workOrderDataAccess.getWorkOrders();
    return JSON.stringify(data);
  };

  const getworkorderbysearch = async (
    filters_item?: IFilters,
    sort_item?: ISort,
    paginate?: IPagination
  ) => {
    await workOrderDataAccess.fetchWorkOrders(
      filters_item,
      sort_item,
      paginate
    );
    const data = await workOrderDataAccess.getWorkOrdersForTable();
    const totalData = await workOrderDataAccess.getTotalWorkOrdersForTable();
    return { data, totalData };
  };

  const deleteworkorder = (id: number): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      workOrderDataAccess
        .deleteWorkOrder(id)
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

  const getworkorderbyid = async (id: number) => {
    await workOrderDataAccess.fetchWorkOrderById(id);
    const data = await workOrderDataAccess.getWorkOrderById(id);
    return JSON.stringify(data);
  };

  const addworkorder = (
    workordercreaterequest: IRequestWorkOrderCreate
  ): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      workOrderDataAccess
        .createWorkOrder(workordercreaterequest)
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

  const updateworkorder = (
    workorderupdaterequest: IRequestWorkOrderUpdate
  ): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      workOrderDataAccess
        .updateWorkOrder(workorderupdaterequest)
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
    getallworkorders,
    getworkorderbysearch,
    deleteworkorder,
    getworkorderbyid,
    addworkorder,
    updateworkorder,
    emaillogin,
  };
}
