import contactDataAccess from "../../cloudconLibrary/store/modules/contactData/contactDataAccess";
import { UsersApi } from "../../cloudconLibrary/api/usersApi";
import {
  IFilters,
  IPagination,
  ISort,
} from "../../cloudconLibrary/utilities/useGenericInterfaces";
import { IUserDetails } from "../../cloudconLibrary/store/modules/userData/userDataModule";
import {
  IRequestContactCreate,
  IRequestContactUpdate,
} from "../../cloudconLibrary/api/apiInterfaces";

export default function peopleController() {
  const usersApi = new UsersApi();
  const getallpeoples = async () => {
    await contactDataAccess.fetchContacts();
    const data = await contactDataAccess.getContacts();
    return JSON.stringify(data);
  };

  const getpeoplebysearch = async (
    filters_item?: IFilters,
    sort_item?: ISort,
    paginate?: IPagination
  ) => {
    await contactDataAccess.fetchContacts(filters_item, sort_item, paginate);
    const data = await contactDataAccess.getContactsForTable();
    const totalData = await contactDataAccess.getTotalContactsForTable();
    return { data, totalData };
  };

  const deletepeople = (id: number): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      contactDataAccess
        .deleteContact(id)
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

  const getpeoplebyid = async (id: number) => {
    await contactDataAccess.fetchContactById(id);
    const data = await contactDataAccess.getContactById(id);
    return JSON.stringify(data);
  };

  const addpeople = (
    contactcreaterequest: IRequestContactCreate
  ): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      contactDataAccess
        .createContact(contactcreaterequest)
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

  const updatepeople = (
    contactupdaterequest: IRequestContactUpdate
  ): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      contactDataAccess
        .updateContact(contactupdaterequest)
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
    getallpeoples,
    getpeoplebysearch,
    deletepeople,
    addpeople,
    updatepeople,
    getpeoplebyid,
    emaillogin,
  };
}
