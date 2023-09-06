import {
  IRecord,
  IUpvise,
  // IFavourite,
  // IFavouriteOptionMessage,
} from "../../../store/modules/upvise.d";
import { reactive } from "vue";
import { IFavouriteRecord } from "./favouriteManager.d";
import utils from "../../../use/function/useUtils";

export function favouriteManager(upvise: IUpvise) {
  // const favourites = upvise.getEntity;
  // const accountInfo = JSON.parse(
  //   localStorage.getItem("accounts.current") as string
  // );
  const fetch = () => upvise.fetch("favourite");
  //
  //   // function getModuleName() {
  //   //   switch (getUpvisePage()) {
  //   //     case "salesDeals":
  //   //       return "salesOpportunities";
  //   //     case "projectPlanner":
  //   //       return "planner";
  //   //     default:
  //   //       return getUpvisePage();
  //   //   }
  //   // }
  function updateFavourite(favourite: IFavouriteRecord): Promise<void> {
    const payload = {
      TableEmployeedashboardFavouriteslist: [favourite] as unknown as IRecord[],
    } as Record<string, IRecord[]>;
    // console.log("saveFavourite", payload)
    // return new Promise(resolve => resolve());
    return upvise.update(payload);
  }

  // function toggleFavourite(
  //   favouriteId: string,
  //   favouriteName: string,
  //   isFavourite: boolean
  // ): Promise<void> {
  //   // console.log("toggleFavourite", favouriteId, favouriteName, isFavourite)
  //   // return new Promise(resolve => resolve());
  //   return new  //upvise.toggleFavourite(favouriteId, favouriteName, isFavourite);
  // }
  // function deleteFavourite(
  //   favourite: IFavouriteRecord
  // ): Promise<void> {
  //   const copyFavourite = JSON.parse(JSON.stringify(
  //     favourite
  //   )) as IRecord;
  //   copyFavourite._type = "DELETE";
  //   const payload = {
  //     TableEmployeedashboardFavourites: [copyFavourite],
  //   } as Record<string, IRecord[]>;
  //   console.log("deleteFavourite", payload)
  //   return new Promise(resolve => resolve());
  //   // return upvise.update(payload);
  // }

  const getNewFavourite = (
    favorite: string,
    module: string,
    user: string,
    name: string,
    isGlobal: boolean,
    id: string | null
  ): IFavouriteRecord =>
    reactive({
      id: id ? id : utils.generateId(),
      favourite: favorite,
      module: module,
      user: user,
      name: name,
      isglobal: isGlobal ? "_global" : user,
    } as IFavouriteRecord);

  return {
    // favourites,
    fetch,
    updateFavourite,

    // deleteFavourite,
    getNewFavourite,
  };
}
