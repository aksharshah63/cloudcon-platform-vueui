import utils from "../../../use/function/useUtils";
import { IUpvise } from "../../../store/modules/upvise.d";
import { IProjectDetails } from "./planner.d";
import { useTableNames } from "../../../use/utils/useConstants";

export default function useControllerProjectsTimeline(upvise: IUpvise) {
  const state = upvise.state();

  const fetch = () => upvise.fetch("projectsTimeline");
  const getMetadata = () => upvise.metadata("projectsTimeline");

  const _updateProject = (item: IProjectDetails) => {
    const actualData = upvise
      .entityFilter(useTableNames.PROJECT_PLANNER_ACTUALS, "projectid", item.id)
      .filter((row) => utils.IsActive(row));
    const accruedActualsApprovedData = actualData.filter((a) => a.status === 1);
    const accruedActualsUnapprovedData = actualData.filter(
      (a) => a.status === 0
    );
    const taskData = upvise
      .entityFilter("TableSchedulerTasks", "projectid", item.id)
      .filter((row) => utils.IsActive(row));

    item.approvedActualsTotal = Number(
      accruedActualsApprovedData
        .map((a) => (Number(a["qty"]) || 0) * (Number(a["unitprice"]) || 0))
        .reduce((a, b) => a + b, 0)
        .toFixed(2)
    );
    item.unapprovedActualsTotal = Number(
      accruedActualsUnapprovedData
        .map((a) => (Number(a["qty"]) || 0) * (Number(a["unitprice"]) || 0))
        .reduce((a, b) => a + b, 0)
        .toFixed(2)
    );
    item.forecast = utils.getTotalFromItems(taskData, "forecast", 2);
  };

  // calculations for data that is not persisted
  const notPersistedCalcs = () => {
    for (const project of Object.values(
      upvise.entityData("TableUnybizProjectsProjects")
    )) {
      if (utils.IsActive(project))
        _updateProject(project as unknown as IProjectDetails);
    }
    console.log("finished not persisted calcs...");
  };

  return {
    state,
    fetch,
    getMetadata,
    notPersistedCalcs,
  };
}
