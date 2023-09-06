import { IRecord } from "../../../utilities/useGenericInterfaces";
import formTemplateDataGetters from "./formTemplateDataGetters";
import formTemplateDataActions from "./formTemplateDataActions";
import formTemplateDataMutations from "./formTemplateDataMutations";
import storeHelper, {
  IStoreDataForTable,
} from "../../../../cloudconLibrary/store/storeHelper/storeHelper";

export interface IField {
  id: number;
  name: string;
  description?: string | null;
  fieldGroup: {
    id: string;
    name: string;
  };
}

export interface IFieldGroup {
  id: number;
  name: string;
  fields: IField[];
}

export interface IFormTemplateData {
  fields: Record<number, IField>;
  fieldsForTable: IStoreDataForTable<IField>;
  fieldGroups: Record<number, IFieldGroup>;
  fieldGroupsForTable: IStoreDataForTable<IFieldGroup>;
  formTemplates: Record<number, IFormTemplate>;
  formTemplatesForTable: IStoreDataForTable<IFormTemplate>;
  formTemplateFields: Record<number, IFormTemplateField>;
  formTemplateGroups: Record<number, IFormTemplateGroup>;
}

export type IFormTemplateTableDataKeys =
  | "fields"
  | "fieldGroups"
  | "formTemplates"
  | "formTemplateFields"
  | "formTemplateGroups";

const state: IFormTemplateData = {
  fields: {},
  fieldsForTable: storeHelper.emptyStoreDataForTable<IField>(),
  fieldGroups: {},
  fieldGroupsForTable: storeHelper.emptyStoreDataForTable<IFieldGroup>(),
  formTemplates: {},
  formTemplatesForTable: storeHelper.emptyStoreDataForTable<IFormTemplate>(),
  formTemplateFields: {},
  formTemplateGroups: {},
};

export type IFormTemplateDataState = Record<string, Record<string, IRecord>>;

export interface IFieldMenu {
  key: string;
  label: string;
  items: IFieldMenuItems[];
}

export interface IFieldMenuItems {
  key: string;
  label: string;
  command: () => void;
}

export interface IFieldSearchMap {
  [key: number]: string;
}

export interface IFormTemplateGroup {
  id: number;
  name: string;
  formTemplates: IFormTemplate[]
}
export interface IFormTemplate {
  id: number;
  name: string;
  formTemplateGroupId: number;
  formTemplateGroup: IFormTemplateGroup;
  // formTemplateFields?: IFormTemplateField[]
}

export interface IFormTemplateField {
  id: number;
  name: string;
  label: string;
  position: number;
  hidden: boolean;
  mandatory: boolean;
  options: string;
  onchange: string;
  status: number;
  value: string;
  fieldId: number;
  formTemplateId: number;
  field: IFieldInResponseFormTemplateField
}

interface IFieldInResponseFormTemplateField {
  id: number,
  name: string
}

export default {
  namespaced: true,
  state,
  getters: formTemplateDataGetters,
  actions: formTemplateDataActions,
  mutations: formTemplateDataMutations,
  // plugins,
};
