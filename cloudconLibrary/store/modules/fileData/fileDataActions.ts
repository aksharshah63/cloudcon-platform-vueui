import { State } from "../../../../src/store";
import { IFileDataState } from "./fileDataModule";
import { ActionContext } from "vuex";
import { UsersApi } from "../../../api/usersApi";
import { IUsersApi } from "../../../api/apiInterfaces";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";

type IFileDataContext = ActionContext<State, IFileDataState>;

const usersApi: IUsersApi = new UsersApi();

export default {
  fetchFiles: (
    { commit }: IFileDataContext,
    payload: { filters: IFilters; sort: ISort; pagination: IPagination }
  ): Promise<void> => {
    return usersApi
      .getFiles(payload.filters, payload.sort, payload.pagination)
      .then((response) => {
        if (response.data) {
          commit("updateFilesForTable", {
            data: response.data,
            totalRecords: response.metadata?.totalRecords ?? 0,
          });
          commit("updateFiles", response.data);
        }
      });
  },

  createFile: (
    { commit }: IFileDataContext,
    payload: { formData: FormData }
  ): Promise<void> => {
    return usersApi.createFile(payload.formData).then((response) => {
      if (response.data != null) commit("updateFiles", [response.data]);
    });
  },

  deleteFile: (
    { commit }: IFileDataContext,
    payload: { id: string; tenantName: string }
  ): Promise<void> => {
    return usersApi.deleteFile(payload).then(() => {
      commit("deleteFile", [payload.id]);
    });
  },
};
