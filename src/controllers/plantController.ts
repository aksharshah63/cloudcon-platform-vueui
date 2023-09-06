import plantDataAccess from "../../cloudconLibrary/store/modules/plantData/plantDataAccess";
import { UsersApi } from "../../cloudconLibrary/api/usersApi";
import {
  IFilters,
  IPagination,
  ISort,
} from "../../cloudconLibrary/utilities/useGenericInterfaces";
import { IUserDetails } from "../../cloudconLibrary/store/modules/userData/userDataModule";
import {
  IRequestPlantCreate,
  IRequestPlantUpdate,
} from "../../cloudconLibrary/api/apiInterfaces";

export default function plantController() {
  const usersApi = new UsersApi();
  const getallplants = async () => {
    await plantDataAccess.fetchPlant();
    const data = await plantDataAccess.getPlant();
    return JSON.stringify(data);
  };

  const getplantbysearch = async (
    filters_item?: IFilters,
    sort_item?: ISort,
    paginate?: IPagination
  ) => {
    await plantDataAccess.fetchPlant(filters_item, sort_item, paginate);
    const data = await plantDataAccess.getPlantForTable();
    const totalData = await plantDataAccess.getTotalPlantForTable();
    return { data, totalData };
  };

  const deleteplant = (id: number): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      plantDataAccess
        .deletePlant(id)
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

  const getplantbyid = async (id: number) => {
    await plantDataAccess.fetchPlantById(id);
    const data = await plantDataAccess.getPlantById(id);
    return JSON.stringify(data);
  };

  const addplant = (plantcreaterequest: IRequestPlantCreate): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      plantDataAccess
        .createPlant(plantcreaterequest)
        .then(() => {
          return resolve("success");
        })
        .catch((error) => {
          return reject({
            main: "Error",
            message: error.data,
          });
        });
    });
  };

  const updateplant = (
    plantupdaterequest: IRequestPlantUpdate
  ): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      plantDataAccess
        .updatePlant(plantupdaterequest)
        .then(() => {
          return resolve("success");
        })
        .catch((error) => {
          return reject({
            main: "Error",
            message: error.data,
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
    getallplants,
    getplantbysearch,
    deleteplant,
    addplant,
    updateplant,
    getplantbyid,
    emaillogin,
  };
}
