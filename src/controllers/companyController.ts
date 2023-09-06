import companyDataAccess from "../../cloudconLibrary/store/modules/companyData/companyDataAccess";
import { UsersApi } from "../../cloudconLibrary/api/usersApi";
import {
  IFilters,
  IPagination,
  ISort,
} from "../../cloudconLibrary/utilities/useGenericInterfaces";
import { IUserDetails } from "../../cloudconLibrary/store/modules/userData/userDataModule";
import {
  IRequestCompanyCreate,
  IRequestCompanyUpdate,
} from "../../cloudconLibrary/api/apiInterfaces";

export default function companyController() {
  const usersApi = new UsersApi();
  const getallcompanies = async () => {
    await companyDataAccess.fetchCompanies();
    const data = await companyDataAccess.getCompanies();
    return JSON.stringify(data);
  };

  const getcompaniesbysearch = async (
    filters_item?: IFilters,
    sort_item?: ISort,
    paginate?: IPagination
  ) => {
    await companyDataAccess.fetchCompanies(filters_item, sort_item, paginate);
    const data = await companyDataAccess.getCompaniesForTable();
    const totalData = await companyDataAccess.getTotalCompaniesForTable();
    return { data, totalData };
  };

  const deletecompany = (id: number): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      companyDataAccess
        .deleteCompany(id)
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

  const getcompanybyid = async (id: number) => {
    await companyDataAccess.fetchCompanyById(id);
    const data = await companyDataAccess.getCompanyById(id);
    return JSON.stringify(data);
  };

  const addcompany = (
    companycreaterequest: IRequestCompanyCreate
  ): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      companyDataAccess
        .createCompany(companycreaterequest)
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

  const updatecompany = (
    companyupdaterequest: IRequestCompanyUpdate
  ): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
      companyDataAccess
        .updateCompany(companyupdaterequest)
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
    getallcompanies,
    getcompaniesbysearch,
    deletecompany,
    addcompany,
    updatecompany,
    getcompanybyid,
    emaillogin,
  };
}
