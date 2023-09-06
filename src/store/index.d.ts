import { IUpvise } from "./modules/upvise.d";

export interface IRootState {
  version: string;
  $localForage?: null;
  upvise: IUpvise;
}
export type Primitive = string | boolean | number | Date;
export type NullablePrimitive = Primitive | null;

export interface IPrimeToast {
  add(args: {
    severity?: string;
    summary?: string;
    detail?: string;
    life?: number;
    closable?: boolean;
    group?: string;
  }): void;
  removeGroup(group: string): void;
  removeAllGroups(): void;
}
