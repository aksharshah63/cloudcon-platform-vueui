import { IFileData, IFile } from "./fileDataModule";

export default {
  getFiles: (state: IFileData) => (): IFile[] => {
    return Object.values(state.files);
  },

  getFilesForTable: (state: IFileData) => (): IFile[] => {
    return state.filesForTable.data;
  },

  getTotalFilesForTable: (state: IFileData) => (): number => {
    return state.filesForTable.totalRecords;
  },
};
