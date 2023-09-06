import { IUpvise } from "../../../store/modules/upvise.d";

export default function useControllerProjects(upvise: IUpvise) {
  const state = upvise.state();
  const fetch = () => upvise.fetch("equipmentCategories");
  const getMetadata = () => upvise.metadata("equipmentCategories");

  return {
    state,
    fetch,
    getMetadata,
  };
}
