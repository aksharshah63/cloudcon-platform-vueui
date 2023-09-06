import storeHelper, {
  IStoreDataForTable,
} from "../../../../cloudconLibrary/store/storeHelper/storeHelper";
import { IRecord } from "../../../utilities/useGenericInterfaces";
import fileDataGetters from "./fileDataGetters";
import fileDataActions from "./fileDataActions";
import fileDataMutations from "./fileDataMutations";

export interface IFile {
  id: string; // guid file id
  name: string;
  linkedTable: string;
  linkedId: number;
  linkedField: string;
}

export interface IFileData {
  files: Record<string, IFile>;
  filesForTable: IStoreDataForTable<IFile>;
}

export type IFileTableDataKeys = "files";

const state: IFileData = {
  files: {},
  filesForTable: storeHelper.emptyStoreDataForTable<IFile>(),
};

export type IFileDataState = Record<string, Record<string, IRecord>>;

export default {
  namespaced: true,
  state,
  getters: fileDataGetters,
  actions: fileDataActions,
  mutations: fileDataMutations,
  // plugins,
};
