import { IChartOptions, IRecord } from "../../../store/modules/upvise.d";

export interface IDashlet {
  id: string;
  type: string;
  config: string;
  dataconfig: string;
  dropzoneid: string;
  dashletorder: number;
  name: string;
  module: string;
  _type?: string;
}

export interface IDashletTemplate extends Partial<IDashlet> {
  type: string;
  config: string;
  dataconfig: string;
}

export interface IDashletFilter {
  label: string;
  description: string;
  selector: string;
  type: string;
  default?: string | string[] | Date;
}

export interface IDashletFilterTemplate extends IDashletFilter {
  value: { name: string; value: string }[];
}

export interface IFilterModel {
  [key: string]: string | string[] | Date;
}

export interface IFilterModelSaved {
  id: string;
  filter: string;
  name: string;
  module: string;
}

export interface IDropZone {
  id: string;
  width: number;
  zoneorder: number;
  name: string;
  module: string;
  _type?: string;
}

export interface IDropZoneTemplate extends Partial<IDropZone> {
  width: number;
}
export interface IDashletCard {
  id: string;
  name: string;
  description: string;
  category?: string;
  imgEncoding?: string;
  type: string;
  dataconfig?: Record<string, unknown>;
  config?: Record<string, unknown>;
  reportdemands?: Record<string, unknown>;
  selectionOptions?: IDashletCardSelectionOptions[];
}

export interface IDashletCardSelectionOptions {
  name: string;
  field: string;
  labelField: string;
  options: IRecord[];
}

export interface IDashletCacheKey {
  chartEndpoint: string;
  selector: string;
  body: IChartOptions;
  filters: IFilterModel;
}
