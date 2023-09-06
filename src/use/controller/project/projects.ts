import { IUpvise } from "../../../store/modules/upvise.d";
import { IProjectDetails, IRecordPlannerBudget, IRecordPlannerTask } from "./planner.d";
import utils from "../../function/useUtils";
import maths from "../../utils/useNumberOperations";
import { useTableNames } from "../../../use/utils/useConstants";

export default function useControllerProjects(upvise: IUpvise) {
  const state = upvise.state();
  const fetch = () => upvise.fetch("projects");
  const getMetadata = () => upvise.metadata("projects");

  const _updateProject = (item: IProjectDetails) => {
    const actualData = upvise
      .entityFilter(useTableNames.PROJECT_PLANNER_ACTUALS, "projectid", item.id)
      .filter((row) => utils.IsActive(row));
    const accruedActualsApprovedData = actualData.filter((a) => a.status === 1);
    const accruedActualsUnapprovedData = actualData.filter(
      (a) => a.status === 0
    );
    const budgetData = upvise
      .entityFilter(useTableNames.PROJECT_PLANNER_BUDGETS, "projectid", item.id)
      .filter((row) => utils.IsActive(row) && row.status !== 2) as unknown as IRecordPlannerBudget[];
    const taskData = upvise
      .entityFilter("TableSchedulerTasks", "projectid", item.id)
      .filter((row) => utils.IsActive(row)) as unknown as IRecordPlannerTask[];

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
    item.purchaseTotal = Number(
      budgetData
        .map((a) => maths.multiply(a["originalQty"], a["purchaseUnitPrice"]))
        .reduce((a, b) => maths.sum(a, b), 0)
        .toFixed(2)
    );
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
