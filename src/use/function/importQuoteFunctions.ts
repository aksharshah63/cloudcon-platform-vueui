// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import localforage from "localforage";
import useControllerProjectPlanner from "../controller/project/planner";
import {
  IRecordPlannerMilestone,
  IRecordPlannerTask,
  IRecordPlannerBudget,
} from "../controller/project/planner.d";
import {
  IRecord,
  IUpvise,
  IUpviseDataMessage,
} from "../../store/modules/upvise.d";
import { UnwrapNestedRefs } from "@vue/reactivity";
import { useTableNames } from "../utils/useConstants";

export const importQuotes = async (
  selectedQuotes: IRecord[],
  selectedMilestone: IRecordPlannerMilestone | null,
  projectId: string,
  upvise: IUpvise
): Promise<UnwrapNestedRefs<IUpviseDataMessage> | void> => {
  const controller = useControllerProjectPlanner(upvise);
  let plantId = "";
  let labourId = "";
  let materialId = "";
  let subcontractorId = "";

  const localForageInstance = localforage.createInstance({
    name: "upvise",
    storeName: "tables",
  });

  await localForageInstance
    .getItem("system.user.settings")
    .then((result: unknown) => {
      const typedResult = result as {
        name: string;
        items: { id: string; value: string }[];
      };
      typedResult.items.forEach((entry) => {
        switch (entry.id) {
          case "sales.plant_group_id":
            plantId = entry.value;
            break;
          case "sales.subcontractor_group_id":
            subcontractorId = entry.value;
            break;
          case "sales.material_group_id":
            materialId = entry.value;
            break;
          case "sales.labour_group_id":
            labourId = entry.value;
            break;
        }
      });
    });

  if (!projectId) return;

  const newMilestones: IRecordPlannerMilestone[] = [];
  const newTasks: IRecordPlannerTask[] = [];
  const newBudgets: IRecordPlannerBudget[] = [];
  let quoteProducts: Record<string, unknown>[] = [];
  const customStrings: Record<string, string> = {};

  const allQuoteProducts = await localForageInstance
    .getItem("unybiz.sales.quoteproducts")
    .then((results: unknown) => {
      return (results as { name: string; items: Record<string, unknown>[] })
        .items;
    });

  selectedQuotes.forEach((q) => {
    let newMilestone;
    let customJson;

    try {
      customJson = JSON.parse(q.custom as string);
    } catch (e) {
      customJson = {};
    }

    customJson.F4 = projectId;

    customStrings[q.id as string] = JSON.stringify(customJson);

    if (selectedMilestone === null) {
      newMilestone = controller.getNewMilestone(null);
      newMilestone.budget = q.totalex as number;
      newMilestone.budgettype = 0;
      newMilestone.projectid = projectId;
      newMilestone.name = q.name as string;
    } else newMilestone = selectedMilestone;

    newMilestones.push(newMilestone);

    const newTask = controller.getNewTask(newMilestone.id as string);
    newTask.projectid = projectId as string;
    newTask.budget = q.totalex as number;
    newTask.budgettype = 1;
    newTask.projectid = projectId as string;
    newTask.name = q.name as string;

    newTasks.push(newTask);

    quoteProducts = allQuoteProducts.filter(
      (quoteProduct) => quoteProduct.quoteid === q.id
    );

    quoteProducts.forEach(async (p) => {
      if (p.productid === "") return;

      const productDetails = await localForageInstance
        .getItem("unybiz.sales.products")
        .then((results: unknown) => {
          return (
            results as { name: string; items: Record<string, unknown>[] }
          ).items.find((entry: Record<string, unknown>) => {
            return entry.id === p.productid;
          });
        });

      if (typeof productDetails === "undefined") return;

      let resourceType = "";
      if (productDetails.categoryid == labourId) resourceType = "Labour";
      else if (productDetails.categoryid == plantId) resourceType = "Plant";
      else if (productDetails.categoryid == subcontractorId)
        resourceType = "Subcontractor";
      else if (productDetails.categoryid == materialId)
        resourceType = "Material";

      const newBudget: IRecordPlannerBudget = controller.getNewBudget(
        newTask.id,
        resourceType
      );
      newBudget.projectid = projectId;
      newBudget.qty = Number(p.quantity ?? 0);
      newBudget.unitprice = Number(p.price ?? 0);
      newBudget.resourceid = p.productid as string;

      newBudgets.push(newBudget);
    });
  });

  return await controller
    .doSaveModelEntities({
      TableSchedulerMilestones: newMilestones,
      TableSchedulerTasks: newTasks,
      [useTableNames.PROJECT_PLANNER_BUDGETS]: newBudgets,
    })
    .then(() => {
      selectedQuotes.forEach((q) => {
        window.Query.updateId(
          "unybiz.sales.quotes",
          q.id as string,
          "projectid",
          projectId
        );

        window.Query.updateId(
          "unybiz.sales.quotes",
          q.id as string,
          "custom",
          customStrings[q.id as string]
        );
      });
    });
};
