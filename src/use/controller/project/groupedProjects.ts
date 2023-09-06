import { IRecord, IUpvise } from "../../../store/modules/upvise.d";
import { IProjectDetails, IRecordPlannerBudget, IRecordPlannerTask } from "./planner.d";
import utils from "../../function/useUtils";
import maths from "../../utils/useNumberOperations";
import useLocalForage from "../../../use/utils/useLocalForage";
import { UpviseCheckboxTypeStatus, useTableNames } from "../../../use/utils/useConstants";

export default function useControllerGroupedProjects(upvise: IUpvise) {
  const state = upvise.state();
  const fetch = () => upvise.fetch("groupedProjects");
  const getMetadata = () => upvise.metadata("groupedProjects");
  const getForageData = async () => await useLocalForage.getDataForkeys([
    "system.user.settings",
  ], useLocalForage.getInstance("upvise", "tables"));

  function _updateProject (
    item: IProjectDetails,
    projectsData: Record<string, IProjectDetails>,
    linkedProjectCustomField: string,
    isTopLevelProjectCustomField: string
  ) {
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
    const customObject = item.custom ? JSON.parse(item.custom) : {};

    if (linkedProjectCustomField && isTopLevelProjectCustomField) {
      const isTopLevelProject = customObject[isTopLevelProjectCustomField] === UpviseCheckboxTypeStatus.TRUE;

      if (isTopLevelProject) item.projectid = "";
      else {
        const linkedProjectId = customObject[linkedProjectCustomField];
        const linkedProject = linkedProjectId ? projectsData[linkedProjectId] : undefined;
        item.projectid = linkedProject?.id ?? "no_linked_project";
      }
    } else item.projectid = "";
      
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
  function notPersistedCalcs(linkedProjectCustomField: string, isTopLevelProjectCustomField: string) {
    const projectsData =
      upvise.entityData("TableUnybizProjectsProjects") as unknown as Record<string, IProjectDetails>;

    for (const project of Object.values(projectsData)) {
      if (utils.IsActive(project as unknown as IRecord) && project.id !== "no_linked_project")
        _updateProject(project, projectsData, linkedProjectCustomField, isTopLevelProjectCustomField);
    }
    console.log("finished not persisted calcs...");
  };

  // Create a project to add to the store. Any Unlinked projects will be show under this project
  function createUnlinkedProject(): IProjectDetails {
    return {
      custom: "",
      id: "no_linked_project",
      name: "No linked projects",
      projectid: "",
    } as IProjectDetails;
  }

  return {
    state,
    fetch,
    getMetadata,
    getForageData,
    notPersistedCalcs,
    createUnlinkedProject,
  };
}
