import contactDataAccess from "../../cloudconLibrary/store/modules/contactData/contactDataAccess";
import {
  IFilters,
  IPagination,
  ISort,
} from "../../cloudconLibrary/utilities/useGenericInterfaces";

export default function peopleGroupController() {
  const getallpeoplegroups = async () => {
    await contactDataAccess.fetchContactGroups();
    const data = await contactDataAccess.getContactGroups();
    return JSON.stringify(data);
  };

  const getpeoplegroupbysearch = async (
    filters_item?: IFilters,
    sort_item?: ISort,
    paginate?: IPagination
  ) => {
    await contactDataAccess.fetchContactGroups(
      filters_item,
      sort_item,
      paginate
    );
    const data = await contactDataAccess.getContactGroupsForTable();
    const totalData = await contactDataAccess.getTotalContactGroupsForTable();
    return { data, totalData };
  };

  const deletepeoplegroup = (id: number): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      contactDataAccess
        .deleteContactGroup(id)
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

  const getpeoplegroupbyid = async (id: number) => {
    await contactDataAccess.fetchContactGroupById(id);
    const data = await contactDataAccess.getContactGroupById(id);
    return JSON.stringify(data);
  };

  const addpeoplegroup = (name: string): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      contactDataAccess
        .createContactGroup(name)
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

  const updatepeoplegroup = (
    id: number,
    name: string,
    addContactArray: number[],
    removeContactArray: number[]
  ): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      contactDataAccess
        .updateContactGroup(id, name, addContactArray, removeContactArray)
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
    getallpeoplegroups,
    getpeoplegroupbysearch,
    deletepeoplegroup,
    addpeoplegroup,
    updatepeoplegroup,
    getpeoplegroupbyid,
  };
}
