// eslint-disable-next-line vue/script-setup-uses-vars
import { IStore } from "./upvise.d";
import { reactive } from "vue";

export class UpvideData {
  /** The singleton instance of the {@link @microsoft/signalr.NullLogger}. */
  public static Instance = new UpvideData();

  private constructor() {
    this.Store = reactive({});
    this.DeletedIds = {};
  }

  // tslint:disable-next-line
  public Store: IStore;

  // tslint:disable-next-line
  public DeletedIds: Record<string, Record<string, string>>;
}
