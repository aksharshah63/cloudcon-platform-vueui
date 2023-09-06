import { IFile } from "./fileDataModule";
import { store } from "../../../../src/store";
import {
  IFilters,
  IPagination,
  ISort,
} from "cloudconLibrary/utilities/useGenericInterfaces";

export default {
  getFiles: (): IFile[] => {
    return store.getters["fileData/getFiles"]();
  },
  getFilesForTable: (): IFile[] => {
    return store.getters["fileData/getFilesForTable"]();
  },
  getTotalFilesForTable: (): number => {
    return store.getters["fileData/getTotalFilesForTable"]();
  },
  fetchFiles: (
    filters?: IFilters,
    sort?: ISort,
    pagination?: IPagination
  ): Promise<void> => {
    return store.dispatch("fileData/fetchFiles", { filters, sort, pagination });
  },
  createFile: (formData: FormData): Promise<void> => {
    return store.dispatch("fileData/createFile", { formData });
  },

  deleteFile: (id: string, tenantName: string): Promise<void> => {
    return store.dispatch("fileData/deleteFile", { id, tenantName });
  },
};
