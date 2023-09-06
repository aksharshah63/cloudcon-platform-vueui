import plantDataAccess from "../../cloudconLibrary/store/modules/plantData/plantDataAccess";
import {
  IFilters,
  IPagination,
  ISort,
} from "../../cloudconLibrary/utilities/useGenericInterfaces";

export default function plantGroupController() {
  const getallplantgroups = async () => {
    await plantDataAccess.fetchPlantGroups();
    const data = await plantDataAccess.getPlantGroups();
    return JSON.stringify(data);
  };

  const getplantgroupbysearch = async (
    filters_item?: IFilters,
    sort_item?: ISort,
    paginate?: IPagination
  ) => {
    await plantDataAccess.fetchPlantGroups(filters_item, sort_item, paginate);
    const data = await plantDataAccess.getPlantGroupsForTable();
    const totalData = await plantDataAccess.getTotalPlantGroupsForTable();
    return { data, totalData };
  };

  const deleteplantgroup = (id: number): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      plantDataAccess
        .deletePlantGroup(id)
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

  const getplantgroupbyid = async (id: number) => {
    await plantDataAccess.fetchPlantGroupById(id);
    const data = await plantDataAccess.getPlantGroupById(id);
    return JSON.stringify(data);
  };

  const addplantgroup = (name: string): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      plantDataAccess
        .createPlantGroup(name)
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

  const updateplantgroup = (
    id: number,
    name: string,
    addContactArray: number[],
    removeContactArray: number[]
  ): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      plantDataAccess
        .updatePlantGroup(id, name, addContactArray, removeContactArray)
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

  return {
    getallplantgroups,
    getplantgroupbysearch,
    deleteplantgroup,
    addplantgroup,
    updateplantgroup,
    getplantgroupbyid,
  };
}
