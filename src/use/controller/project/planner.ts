/* eslint-disable */
import moment from "moment";
import { reactive } from "vue";
import {
  IRecordPlannerActual,
  IRecordPlannerBudget,
  IRecordPlannerMilestone,
  IRecordPlannerTask,
  ITaskLog,
} from "../../../use/controller/project/planner.d";
import {
  IEntity,
  IGridSlicing,
  IRecord,
  IStore,
  IUpvise,
  IUpviseDataMessage,
} from "../../../store/modules/upvise.d";
import utils from "../../../use/function/useUtils";
import { UnwrapNestedRefs } from "vue";
import useLocalForage from "../../../use/utils/useLocalForage";
import { FilterMatchMode } from "primevue/api";
import maths from "../../utils/useNumberOperations"
import { PlannerTaskProgressType, useTableNames } from "../../../use/utils/useConstants";

export default function useControllerProjectPlanner(upvise: IUpvise) {
  const projectid = upvise.upviseSelector[0];
  const state = upvise.state();

  const fetch = () => upvise.fetch("planner");
  const getMetadata = () => upvise.metadata("planner");
  const getForageData = async () => await useLocalForage.getDataForkeys([
    "system.user.settings",
    "unybiz.sales.products",
    "unybiz.contacts.companies",
  ], useLocalForage.getInstance("upvise", "tables"));

  const getProject = () => upvise.recordData("TableUnybizProjectsProjects", projectid);

  const getBudgetOptionsData = (forageData: Record<string, IRecord[]>) => {
    const budgetOptionsData: Record<string, IRecord[]> = {};
    const labourIds = (forageData["system.user.settings"]?.find(r => r.id === "PLANNER_LABOUR_GROUP_IDS")?.value as string ?? "").split("|");
    const plantIds = (forageData["system.user.settings"]?.find(r => r.id === "PLANNER_PLANT_GROUP_IDS")?.value as string ?? "").split("|");
    const subcontractorIds = (forageData["system.user.settings"]?.find(r => r.id === "PLANNER_SUBCONTRACTOR_GROUP_IDS")?.value as string ?? "").split("|");

    if (labourIds.length > 0)
      budgetOptionsData["Labour"] =
        forageData["unybiz.sales.products"]?.filter(product =>
          labourIds.some((labourId) =>
            (product.categoryid as string).includes(labourId)
          )
        ) ?? [];
    else budgetOptionsData["Labour"] = [];

    if (plantIds.length > 0)
      budgetOptionsData["Plant"] =
        forageData["unybiz.sales.products"]?.filter(product =>
          plantIds.some((plantId) =>
            (product.categoryid as string).includes(plantId)
          )
        ) ?? [];
    else budgetOptionsData["Plant"] = [];

    if (subcontractorIds.length > 0)
      budgetOptionsData["Subcontractor"] =
        forageData["unybiz.contacts.companies"]?.filter(company =>
          subcontractorIds.some((subcontractorId) =>
            (company.groupid as string).includes(subcontractorId)
          )
        ) ?? [];
    else budgetOptionsData["Subcontractor"] = [];

    return budgetOptionsData;
  }

  const _getDay = (dateValue: string) =>
    moment(Number(dateValue), "x").startOf("day");

  const _updateProject = (
    item: IRecordPlannerMilestone
  ) => {
    const childData = Object.values(upvise.entityData("TableSchedulerMilestones")).filter(
      (row) =>
        row.projectid === item.id && utils.IsActive(row) && !row.milestoneid
    ) as unknown as IRecord[];

    item.actualsTotal = _getTotalFromItems(childData, "actualsTotal");
    item.approvedActualsTotal = _getTotalFromItems(childData, "approvedActualsTotal");
    item.unapprovedActualsTotal = _getTotalFromItems(childData, "unapprovedActualsTotal");
    item.originalTotal = _getTotalFromItems(childData, "originalTotal");
    item.purchaseTotal = _getTotalFromItems(childData, "purchaseTotal");
    item.forecast = _getTotalFromItems(childData, "forecast");
    item.velocity = _getTotalFromItems(childData, "velocity");

    item.budgetForecast = item.budget
      ? Math.trunc(
        ((item.forecast + item.actualsTotal - item.budget) / item.budget) * 100
      )
      : 0;
    item.duration = _getDaysDuration(item.startdate, item.enddate);

    item.velocityPercentage = item.budget
      ? Math.trunc(
        (item.velocity / item.budget) * 100
      )
      : 0;
    item.actualsProfitability = maths.subtract(item.originalTotal, item.actualsTotal);
    item.actualsProfitabilityPercentage = maths.multiply(maths.divide(item.actualsProfitability, item.originalTotal), 100, 0);
    item.actualsProfitabilityBudget = maths.subtract(item.purchaseTotal, item.actualsTotal);
    item.actualsProfitabilityBudgetPercentage = maths.multiply(maths.divide(item.actualsProfitabilityBudget, item.purchaseTotal), 100, 0);
    item.actualsProfitabilityTarget = maths.subtract(item.budget, item.actualsTotal);
    item.actualsProfitabilityTargetPercentage = maths.multiply(maths.divide(item.actualsProfitabilityTarget, item.budget), 100, 0);
    item.actualsFinancialCompletionBudgetPercentage = maths.multiply(maths.divide(item.actualsTotal, item.purchaseTotal), 100, 0);
    item.purchaseProfitability = maths.subtract(item.originalTotal, item.purchaseTotal);
    item.purchaseProfitabilityPercentage = maths.multiply(maths.divide(item.purchaseProfitability, item.originalTotal), 100, 0);
    item.targetProfitability = maths.subtract(item.originalTotal, item.budget);
    item.targetProfitabilityPercentage = maths.multiply(maths.divide(item.targetProfitability, item.originalTotal), 100, 0);
    item.targetProfitabilityBudget = maths.subtract(item.purchaseTotal, item.budget);
    item.targetProfitabilityBudgetPercentage = maths.multiply(maths.divide(item.targetProfitabilityBudget, item.purchaseTotal), 100, 0);
  };

  const _updateMilestone = (
    item: IRecordPlannerMilestone
  ) => {
    const taskChildData = Object.values(upvise.entityData("TableSchedulerTasks")).filter(
      (row) => row.milestoneid === item.id && utils.IsActive(row)
    ) as unknown as IRecord[];

    const milestoneChildData =
      Object.values(upvise.entityData("TableSchedulerMilestones")).filter(
        (row) => row.milestoneid === item.id && utils.IsActive(row)
      ) as unknown as IRecord[];

    const childData = taskChildData.concat(milestoneChildData);

    item.actualsTotal = _getTotalFromItems(childData, "actualsTotal");
    item.approvedActualsTotal = _getTotalFromItems(childData, "approvedActualsTotal");
    item.unapprovedActualsTotal = _getTotalFromItems(childData, "unapprovedActualsTotal");
    item.originalTotal = _getTotalFromItems(childData, "originalTotal");
    item.purchaseTotal = _getTotalFromItems(childData, "purchaseTotal");
    item.forecast = _getTotalFromItems(childData, "forecast");
    item.velocity = _getTotalFromItems(childData, "velocity");

    item.budgetForecast = item.budget
      ? Math.trunc(
        ((item.forecast + item.actualsTotal - item.budget) / item.budget) * 100
      )
      : 0;
    item.duration = _getDaysDuration(item.startdate, item.enddate);

    item.velocityPercentage = item.budget
      ? Math.trunc(
        (item.velocity / item.budget) * 100
      )
      : 0;
    item.actualsProfitability = maths.subtract(item.originalTotal, item.actualsTotal);
    item.actualsProfitabilityPercentage = maths.multiply(maths.divide(item.actualsProfitability, item.originalTotal), 100, 0);
    item.actualsProfitabilityBudget = maths.subtract(item.purchaseTotal, item.actualsTotal);
    item.actualsProfitabilityBudgetPercentage = maths.multiply(maths.divide(item.actualsProfitabilityBudget, item.purchaseTotal), 100, 0);
    item.actualsProfitabilityTarget = maths.subtract(item.budget, item.actualsTotal);
    item.actualsProfitabilityTargetPercentage = maths.multiply(maths.divide(item.actualsProfitabilityTarget, item.budget), 100, 0);
    item.actualsFinancialCompletionBudgetPercentage = maths.multiply(maths.divide(item.actualsTotal, item.purchaseTotal), 100, 0);
    item.purchaseProfitability = maths.subtract(item.originalTotal, item.purchaseTotal);
    item.purchaseProfitabilityPercentage = maths.multiply(maths.divide(item.purchaseProfitability, item.originalTotal), 100, 0);
    item.targetProfitability = maths.subtract(item.originalTotal, item.budget);
    item.targetProfitabilityPercentage = maths.multiply(maths.divide(item.targetProfitability, item.originalTotal), 100, 0);
    item.targetProfitabilityBudget = maths.subtract(item.purchaseTotal, item.budget);
    item.targetProfitabilityBudgetPercentage = maths.multiply(maths.divide(item.targetProfitabilityBudget, item.purchaseTotal), 100, 0);
  };

  const _updateTask = (item: IRecordPlannerTask) => {
    // list of all budgets showing in budgets table
    const childData = Object.values(upvise.entityData(useTableNames.PROJECT_PLANNER_BUDGETS)).filter(
      (row) => row.taskid === item.id && row._showInTable === true
    ) as unknown as IRecord[];

    item.actualsTotal = _getTotalFromItems(childData, "actualsTotal");
    item.approvedActualsTotal = _getTotalFromItems(childData, "approvedActualsTotal");
    item.unapprovedActualsTotal = _getTotalFromItems(childData, "unapprovedActualsTotal");
    item.originalTotal = _getTotalFromItems(childData, "originalTotal");
    item.purchaseTotal = _getTotalFromItems(childData, "purchaseTotal");

    item.budgetForecast = item.budget
      ? Math.trunc(
        ((item.forecast + item.actualsTotal - item.budget) / item.budget) * 100
      )
      : 0;
    item.duration = _getDaysDuration(item.startdate, item.enddate);
    item.requiredFormatted = `
      ${item.outputamount}
      ${item.outputuom === "" ? "" : ` ${item.outputuom}`}
      ${item.output === "" ? "" : ` ${item.output}`}
    `;

    if (item.progresstype === PlannerTaskProgressType.PERCENTAGE) {
      item.progressUnitValue = maths.multiply(maths.divide(item.progress, 100), item.outputamount);
      item.progressPercentage = item.progress;
    } else {
      item.progressUnitValue = item.progress;
      item.progressPercentage = maths.multiply(maths.divide(item.progress, item.outputamount), 100);
    }
    
    item.progressFormatted = `
      ${item.progressUnitValue}
      ${item.outputuom === "" ? "" : ` ${item.outputuom}`}
      ${item.output === "" ? "" : ` ${item.output}`}
    `;
    item.velocity = item.progressUnitValue
      ? Math.trunc(
        item.outputamount / item.progressUnitValue * item.actualsTotal - item.budget
      )
      : 0;
    item.velocityPercentage = item.budget
      ? Math.trunc(
        (item.velocity / item.budget) * 100
      )
      : 0;
    item.actualsProfitability = maths.subtract(item.originalTotal, item.actualsTotal);
    item.actualsProfitabilityPercentage = maths.multiply(maths.divide(item.actualsProfitability, item.originalTotal), 100, 0);
    item.actualsProfitabilityBudget = maths.subtract(item.purchaseTotal, item.actualsTotal);
    item.actualsProfitabilityBudgetPercentage = maths.multiply(maths.divide(item.actualsProfitabilityBudget, item.purchaseTotal), 100, 0);
    item.actualsProfitabilityTarget = maths.subtract(item.budget, item.actualsTotal);
    item.actualsProfitabilityTargetPercentage = maths.multiply(maths.divide(item.actualsProfitabilityTarget, item.budget), 100, 0);
    item.actualsFinancialCompletionBudgetPercentage = maths.multiply(maths.divide(item.actualsTotal, item.purchaseTotal), 100, 0);
    item.purchaseProfitability = maths.subtract(item.originalTotal, item.purchaseTotal);
    item.purchaseProfitabilityPercentage = maths.multiply(maths.divide(item.purchaseProfitability, item.originalTotal), 100, 0);
    item.targetProfitability = maths.subtract(item.originalTotal, item.budget);
    item.targetProfitabilityPercentage = maths.multiply(maths.divide(item.targetProfitability, item.originalTotal), 100, 0);
    item.targetProfitabilityBudget = maths.subtract(item.purchaseTotal, item.budget);
    item.targetProfitabilityBudgetPercentage = maths.multiply(maths.divide(item.targetProfitabilityBudget, item.purchaseTotal), 100, 0);
  };

  const _updateBudget = (item: IRecordPlannerBudget, budgetOptionsData: Record<string, IRecord[]>) => {
    if (!item._showInTable) {
      item.total = maths.multiply(item.qty, item.unitprice);
      item.originalTotal = maths.multiply(item.originalQty, item.originalUnitPrice);
      item.purchaseTotal = maths.multiply(item.originalQty, item.purchaseUnitPrice);
    }

    item.resourceName = item.resourcetype === "Materials"
      ? item.resourceid
      : budgetOptionsData[item.resourcetype]?.find(r => r.id === item.resourceid)?.name as string ?? "";

    item.actualsQty = maths.sum(item.approvedActualsQty, item.unapprovedActualsQty);
    item.actualsTotal = maths.sum(item.approvedActualsTotal, item.unapprovedActualsTotal);
    item.actualsProfitability = maths.subtract(item.originalTotal, item.actualsTotal);
    item.actualsProfitabilityPercentage = maths.multiply(maths.divide(item.actualsProfitability, item.originalTotal), 100, 0);
    item.actualsProfitabilityBudget = maths.subtract(item.purchaseTotal, item.actualsTotal);
    item.actualsProfitabilityBudgetPercentage = maths.multiply(maths.divide(item.actualsProfitabilityBudget, item.purchaseTotal), 100, 0);
    item.actualsProfitabilityTarget = maths.subtract(item.total, item.actualsTotal);
    item.actualsProfitabilityTargetPercentage = maths.multiply(maths.divide(item.actualsProfitabilityTarget, item.total), 100, 0);
    item.actualsFinancialCompletionBudgetPercentage = maths.multiply(maths.divide(item.actualsTotal, item.purchaseTotal), 100, 0);
    item.purchaseProfitability = maths.subtract(item.originalTotal, item.purchaseTotal);
    item.purchaseProfitabilityPercentage = maths.multiply(maths.divide(item.purchaseProfitability, item.originalTotal), 100, 0);
    item.targetProfitability = maths.subtract(item.originalTotal, item.total);
    item.targetProfitabilityPercentage = maths.multiply(maths.divide(item.targetProfitability, item.originalTotal), 100, 0);
    item.targetProfitabilityBudget = maths.subtract(item.purchaseTotal, item.total);
    item.targetProfitabilityBudgetPercentage = maths.multiply(maths.divide(item.targetProfitabilityBudget, item.purchaseTotal), 100, 0);
  };

  //get duration in days between start and end dates (where dates are in epoch)
  const _getDaysDuration = (startDate: string, endDate: string) => {
    const start = moment(Number(startDate), "x").startOf("day");
    const end = moment(Number(endDate), "x").startOf("day");
    return end.diff(start, "days") + 1;
  };

  // get the sum of the specified property for the items
  const _getTotalFromItems = (
    items: IRecord[],
    property: string
  ) => {
    let total = 0;

    items.forEach((item) => {
      if (item[property] && !isNaN(Number(item[property])))
        total += Number(item[property]);
    });

    return maths.round(total);
  };

  // get the sum of the budgets
  const _getTotalFromBudgets = (
    items: IRecordPlannerBudget[]
  ) => {
    let total = 0;

    items.forEach((item) => {
      const qty = Number(item["qty"]);
      const unitprice = Number(item["unitprice"]);
      if (!isNaN(qty) && !isNaN(unitprice))
        total = maths.sum(total, maths.multiply(qty, unitprice));
    });

    return maths.round(total);
  };

  // update dates based on the dates of the children
  const _updateDates = (
    children: Record<string, any>[],
    item: Record<string, any>
  ) => {
    // Inititalize dates if they do not exist
    if (!item.startdate || !item.enddate) {
      item.startdate = Date.now().toString();
      item.enddate = Date.now().toString();
    }

    children.forEach((child) => {
      // if child start date is beforestart date, update start date
      if (child.startdate && item.startdate > child.startdate) {
        item.startdate = child.startdate;
      }

      // if child end date is afterend date, update end date
      if (child.enddate && item.enddate < child.enddate) {
        item.enddate = child.enddate;
      }
    });
  };

  // calculations for data that is not persisted 
  const notPersistedCalcs = (forageData: Record<string, IRecord[]>) => {
    const milestoneData = Object.values(upvise.entityData("TableSchedulerMilestones")) as unknown as IRecordPlannerMilestone[];
    _createBudgetsToShow(forageData);

    for (const task of Object.values(upvise.entityData("TableSchedulerTasks"))) {
      if (utils.IsActive(task))
        _updateTask(task as unknown as IRecordPlannerTask);
    }

    for (const milestone of milestoneData.sort((a, b) => levelOfMilestone(b, milestoneData) - levelOfMilestone(a, milestoneData))) {
      if (utils.IsActive(milestone as unknown as IRecord))
        _updateMilestone(milestone);
    }

    for (const project of Object.values(upvise.entityData("TableUnybizProjectsProjects"))) {
      if (utils.IsActive(project))
        _updateProject(project as unknown as IRecordPlannerMilestone);
    }
    console.log("finished not persisted calcs...");
  };

  const levelOfMilestone = (milestone: IRecordPlannerMilestone, milestoneData: IRecordPlannerMilestone[]): number => {
    if (!milestone.milestoneid) return 0;

    const parentMilestone = milestoneData.find((m) => m.id === milestone.milestoneid);

    if (parentMilestone) return 1 + levelOfMilestone(parentMilestone, milestoneData);
    else return 0;
  }

  const persistedCalcs = (payload: {
    TableSchedulerMilestones?: IRecordPlannerMilestone[];
    TableSchedulerTasks?: IRecordPlannerTask[];
    [useTableNames.PROJECT_PLANNER_BUDGETS]?: IRecordPlannerBudget[];
  }): Record<string, IRecord[]> => {
    const copyData = {} as IStore;
    copyData["TableUnybizProjectsProjects"] = JSON.parse(JSON.stringify(
      upvise.entityData("TableUnybizProjectsProjects"))) as IEntity;
    copyData["TableSchedulerMilestones"] = JSON.parse(JSON.stringify(
      upvise.entityData("TableSchedulerMilestones"))) as IEntity;
    copyData["TableSchedulerTasks"] = JSON.parse(JSON.stringify(
      upvise.entityData("TableSchedulerTasks"))) as IEntity;
    copyData[useTableNames.PROJECT_PLANNER_BUDGETS] = JSON.parse(JSON.stringify(
      upvise.entityData(useTableNames.PROJECT_PLANNER_BUDGETS))) as IEntity;

    // update copied data with data from payload
    Object.entries(payload).forEach(([entityName, records]) => {
      // @ts-ignore
      records.forEach(r => {
        if (!copyData[entityName][r.id])
          copyData[entityName][r.id] = JSON.parse(JSON.stringify(r)) as IRecord;
        else Object.assign(copyData[entityName][r.id], r);
      })
    });

    // data to save
    const updateData = JSON.parse(JSON.stringify(payload)) as Record<string, IRecord[]>
    updateData["TableUnybizProjectsProjects"] = [];
    if (!updateData["TableSchedulerMilestones"]) updateData["TableSchedulerMilestones"] = [];
    if (!updateData["TableSchedulerTasks"]) updateData["TableSchedulerTasks"] = [];
    if (!updateData[useTableNames.PROJECT_PLANNER_BUDGETS]) updateData[useTableNames.PROJECT_PLANNER_BUDGETS] = [];

    // update data linked to budgets in payload
    if (useTableNames.PROJECT_PLANNER_BUDGETS in payload) {
      payload[useTableNames.PROJECT_PLANNER_BUDGETS]?.forEach(b => {
        updateParentRecord(useTableNames.PROJECT_PLANNER_BUDGETS, b as unknown as IRecord, copyData, updateData);
      })
    }

    // update data linked to tasks in payload
    if (payload.TableSchedulerTasks) {
      payload.TableSchedulerTasks.forEach(t => {
        updateParentRecord("TableSchedulerTasks", t as unknown as IRecord, copyData, updateData);
      })
    }

    //update data linked to milestones in payload
    if (payload.TableSchedulerMilestones) {
      payload.TableSchedulerMilestones.forEach(m => {
        updateParentRecord("TableSchedulerMilestones", m as unknown as IRecord, copyData, updateData);
      })
    }

    return updateData;
  }

  // update parent record using copy data and add to data to update
  const updateParentRecord = (
    entityName: string,
    record: IRecord,
    copyData: IStore,
    updateData: Record<string, IRecord[]>
  ): void => {
    // if parent is a task
    if (entityName === useTableNames.PROJECT_PLANNER_BUDGETS) {
      // get parent record
      const task = Object.values(copyData["TableSchedulerTasks"])
        .find(m => m.id === record.taskid);

      if (task) {
        updateRecord("TableSchedulerTasks", task, copyData, updateData);

        // update task parent
        updateParentRecord("TableSchedulerTasks", task, copyData, updateData);
      }
    }

    // if parent is a milestone
    if (
      entityName === "TableSchedulerTasks" ||
      entityName === "TableSchedulerMilestones" &&
      record.milestoneid
    ) {
      // get parent record
      const milestone = Object.values(copyData["TableSchedulerMilestones"])
        .find(m => m.id === record.milestoneid);

      if (milestone) {
        updateRecord("TableSchedulerMilestones", milestone, copyData, updateData);

        // update milestone parent
        updateParentRecord("TableSchedulerMilestones", milestone, copyData, updateData);
      }
      // else if parent is a project
    } else if (
      entityName === "TableSchedulerMilestones" &&
      !record.milestoneid
    ) {
      // get parent record
      const project = Object.values(copyData["TableUnybizProjectsProjects"])
        .find(p => p.id === record.projectid);

      if (project) updateRecord("TableUnybizProjectsProjects", project, copyData, updateData);
    }
  }

  // update record using copy data and add to data to update
  const updateRecord = (
    entityName: string,
    record: IRecord,
    copyData: IStore,
    updateData: Record<string, IRecord[]>
  ): void => {
    const childData: IRecord[] = [];

    if (entityName === "TableSchedulerTasks") {
      const childBudgetData = getChildBudgetsForTask(
        record.id as string,
        Object.values(copyData[useTableNames.PROJECT_PLANNER_BUDGETS]) as unknown as IRecordPlannerBudget[]
      ) as unknown as IRecord[];

      childBudgetData.forEach((b) => childData.push(b));
    }
    else if (entityName === "TableSchedulerMilestones") {
      const childMilestoneData = getChildMilestonesForMilestone(
        record.id as string,
        Object.values(copyData["TableSchedulerMilestones"]) as unknown as IRecordPlannerMilestone[]
      ) as unknown as IRecord[];
      const childTaskData = getChildTasksForMilestone(
        record.id as string,
        Object.values(copyData["TableSchedulerTasks"]) as unknown as IRecordPlannerTask[]
      ) as unknown as IRecord[];

      childMilestoneData.forEach((m) => childData.push(m));
      childTaskData.forEach((t) => childData.push(t));
    }
    else if (entityName === "TableUnybizProjectsProjects") {
      const childMilestoneData = getChildMilestonesForProject(
        record.id as string,
        Object.values(copyData["TableSchedulerMilestones"]) as unknown as IRecordPlannerMilestone[]
      ) as unknown as IRecord[];

      childMilestoneData.forEach((m) => childData.push(m));
    }

    // update parent record
    _updateDates(childData, record);
    if (!record.budgettype || record.budgettype === 0)
      record.budget = entityName === "TableSchedulerTasks"
        ? _getTotalFromBudgets(childData as unknown as IRecordPlannerBudget[])
        : _getTotalFromItems(childData, "budget");

    // add parent record to updateData
    const existingRecord = updateData[entityName].find(e => e.id === record.id);
    if (existingRecord) Object.assign(existingRecord, record);
    else updateData[entityName].push(record);
  }

  const getNewMilestone = (milestoneId: string | null) =>
    reactive({
      id: utils.generateId(),
      name: "",
      description: "",
      projectid: projectid,
      milestoneid: milestoneId,
      startdate: Date.now().toString(),
      enddate: Date.now().toString(),
      budget: 0,
      budgettype: 0,
      rank: 0,
      wbscode: "",
      iscomplete: 0,
    } as IRecordPlannerMilestone);

  const doDeleteMilestone = (
    TableSchedulerMilestone: IRecordPlannerMilestone,
    upviseDataMessage: IUpviseDataMessage,
  ): Promise<void> => {
    const copyTableSchedulerMilestone = JSON.parse(JSON.stringify(
      TableSchedulerMilestone
    )) as IRecordPlannerMilestone;

    copyTableSchedulerMilestone._type = "DELETE";

    return upvise.update(persistedCalcs({
      TableSchedulerMilestones: [copyTableSchedulerMilestone],
    }),
      upviseDataMessage);
  };

  const doValidateMilestone = (editModel: IRecordPlannerMilestone) => {
    const startDate = _getDay(editModel.startdate);
    const endDate = _getDay(editModel.enddate);

    // if start date is after end date
    if (endDate.diff(startDate, "days") < 0) {
      alert("Start date cannot be after end date");
      return false;
    } else if (!editModel.name) {
      alert("Please input a name");
      return false;
    }

    // check that the milestone start date is not after any of its tasks' and milestones' start dates
    // and the milestone end date is not before any of its tasks' and milestones' end dates
    if (editModel.id) {
      const taskChildData = Object.values(upvise.entityData("TableSchedulerTasks")).filter(
        // @ts-ignore
        (row: IRecord) =>
          row.milestoneid === editModel.id && utils.IsActive(row)
      );

      const milestoneChildData = Object.values(upvise.entityData("TableSchedulerMilestones")).filter(
        // @ts-ignore
        (row: IRecord) =>
          row.milestoneid === editModel.id && utils.IsActive(row)
      );

      const childData = taskChildData.concat(milestoneChildData);
      let earliestChildStartDate = null;
      let latestChildEndDate = null;

      // get the earliest start date and latest end date from the children
      for (const child of childData) {
        const childStartDate = Number(child.startdate);
        const childEndDate = Number(child.enddate);
        if (earliestChildStartDate === null ||
          childStartDate < earliestChildStartDate) earliestChildStartDate = childStartDate;
        if (latestChildEndDate === null ||
          childEndDate > latestChildEndDate) latestChildEndDate = childEndDate;
      }

      // if the milestone start date is after the earliest start date of its children
      if (earliestChildStartDate !== null &&
        startDate.diff(_getDay(earliestChildStartDate.toString()), "days") > 0) {
        alert("Start date cannot be after any of its childrens' start dates\n" +
          "Start date must be on or before " + moment(earliestChildStartDate).format("YYYY-MM-DD") + "\n" +
          "End date must be on or after " + moment(latestChildEndDate).format("YYYY-MM-DD"));
        return false;
      }

      // if the milestone end date is before the latest end date of its children
      if (latestChildEndDate !== null &&
        endDate.diff(_getDay(latestChildEndDate.toString()), "days") < 0) {
        alert("End date cannot be before any of its childrens' end dates\n" +
          "Start date must be on or before " + moment(earliestChildStartDate).format("YYYY-MM-DD") + "\n" +
          "End date must be on or after " + moment(latestChildEndDate).format("YYYY-MM-DD"));
        return false;
      }
    }

    return true;
  };

  const getEditMilestone = (milestoneId: string): IRecordPlannerMilestone => {
    const editMilestone = upvise.recordData(
      "TableSchedulerMilestones",
      milestoneId
    ) as unknown as IRecordPlannerMilestone;

    return reactive(JSON.parse(JSON.stringify(editMilestone)));
  };

  const getNewTask = (milestoneId: string) => {
    return reactive({
      id: utils.generateId(),
      name: "",
      description: "",
      projectid: projectid,
      milestoneid: milestoneId,
      startdate: Date.now().toString(),
      enddate: Date.now().toString(),
      budget: 0,
      budgettype: 0,
      rank: 0,
      wbscode: "",
      status: 0,
      output: "",
      outputuom: "",
      outputamount: 0,
      forecast: 0,
      progress: 0,
      progresstype: 0,
      iscomplete: 0,
    } as IRecordPlannerTask);
  };

  const doSaveModelEntities = (payload: {
    TableSchedulerMilestones?: IRecordPlannerMilestone[];
    TableSchedulerTasks?: IRecordPlannerTask[];
    [useTableNames.PROJECT_PLANNER_BUDGETS]?: IRecordPlannerBudget[];
    TableSchedulerTasklogs?: ITaskLog[];
  }): Promise<void> => {
    const taskLogs = payload.TableSchedulerTasklogs
      ? utils.deepCopy(payload.TableSchedulerTasklogs)
      : null;
  
    if ("TableSchedulerTasklogs" in payload) delete payload.TableSchedulerTasklogs;

    const resultsPayload = persistedCalcs(payload);

    if (taskLogs) resultsPayload.TableSchedulerTasklogs = taskLogs as unknown as IRecord[];

    console.log(resultsPayload)

    return upvise.update(resultsPayload);
  };

  function doDeleteTask(
    TableSchedulerTask: IRecordPlannerTask,
    upviseDataMessage: IUpviseDataMessage,
  ): Promise<void> {
    const copyTableSchedulerTask = JSON.parse(JSON.stringify(
      TableSchedulerTask
    )) as IRecordPlannerTask;

    copyTableSchedulerTask._type = "DELETE";

    return upvise.update(persistedCalcs({
      TableSchedulerTasks: [copyTableSchedulerTask],
    }),
      upviseDataMessage);
  }

  const doValidateTask = (
    taskEditModel: IRecordPlannerTask,
    budgetEditModel: IRecordPlannerBudget[]
  ) => {
    const startDate = moment(Number(taskEditModel.startdate), "x").startOf(
      "day"
    );
    const endDate = moment(Number(taskEditModel.enddate), "x").startOf("day");

    // if start date is after end date
    if (endDate.diff(startDate, "days") < 0) {
      alert("Start date cannot be after end date");
      return false;
    } else if (!taskEditModel.name) {
      alert("Please input a name");
      return false;
    }

    for (const budget of budgetEditModel) {
      if (utils.IsActive(budget as unknown as IRecord)) {
        if (!budget.qty) {
          alert("Input an amount");
          return false;
        }
      }
    }

    return true;
  };

  const getEditTask = (
    taskId: string
  ): UnwrapNestedRefs<IRecordPlannerTask> => {
    const editTask = upvise.recordData(
      "TableSchedulerTasks",
      taskId
    ) as unknown as IRecordPlannerTask;

    return reactive(JSON.parse(JSON.stringify(editTask)));
  };

  const getEditTasksForMilestone = (
    milestoneId: string
  ): UnwrapNestedRefs<IRecordPlannerTask[]> => {
    const editTasks = upvise.entityFilter(
      "TableSchedulerTasks",
      "milestoneid",
      milestoneId
    ) as unknown as IRecordPlannerTask[];

    return reactive(JSON.parse(JSON.stringify(editTasks)));
  };

  const getEditMilestonesForMilestone = (
    milestoneId: string
  ): UnwrapNestedRefs<IRecordPlannerMilestone[]> => {
    const milestones = upvise.entityFilter(
      "TableSchedulerMilestones",
      "milestoneid",
      milestoneId
    ) as unknown as IRecordPlannerMilestone[];

    return reactive(JSON.parse(JSON.stringify(milestones)));
  };

  const createTaskLog = (
    oldValues: IRecordPlannerTask,
    newValues: IRecordPlannerTask,
    reasonString: string
  ): ITaskLog => {
    const newLog = newTaskLog();
    newLog.value = JSON.stringify(newValues);
    newLog.oldvalue = JSON.stringify(oldValues);
    newLog.reason = reasonString;
    newLog.taskid = oldValues.id;
    return newLog;
  }

  const newTaskLog = (): ITaskLog => {
    return {
      id: utils.generateId(),
      taskid: "",
      value: "{}",
      oldvalue: "{}",
      owner: upvise.upviseUser,
      datecreated: Date.now(),
      reason: "",
    };
  }

  const getProgressLogsForTask = (
    taskId: string
  ): UnwrapNestedRefs<ITaskLog[]> => {
    const progressLogs = upvise.entityFilter(
      "TableSchedulerAuditlogs",
      "linkedid",
      taskId
    )
    .filter(log => log.fieldname === "progress") as unknown as ITaskLog[];
      
    return reactive(JSON.parse(JSON.stringify(progressLogs)));
  };

  const getTaskLogs = (taskId: string):UnwrapNestedRefs<ITaskLog[]> => {
     const taskLogs = upvise.entityFilter(
      "TableSchedulerTasklogs",
      "taskid",
      taskId
    ) as unknown as ITaskLog[];
      
    return reactive(JSON.parse(JSON.stringify(taskLogs)));
  }

  const getNewBudget = (
    taskId: string,
    resourceType: string,
  ) => {
    return reactive({
      id: utils.generateId(),
      projectid: projectid,
      taskid: taskId,
      resourceid: "",
      resourcetype: resourceType,
      resourcecategory: {},
      qty: 0,
      unitprice: 0,
      description: "",
      uom: "",
      original: {},
      status: 1,
    } as IRecordPlannerBudget);
  };

  const getBudgetsForTask = (
    taskId: string
  ): UnwrapNestedRefs<IRecordPlannerBudget[]> => {
    const editBudgets = upvise.entityFilter(
      useTableNames.PROJECT_PLANNER_BUDGETS,
      "taskid",
      taskId
    ) as unknown as IRecordPlannerBudget[];

    return reactive(JSON.parse(JSON.stringify(filterBudgets(editBudgets))));
  };

  const getSlicingInformation = (): Record<string, IGridSlicing[]> => {
    const returnArray: Record<string, IGridSlicing[]> = { TableSchedulerMilestones: [], [useTableNames.PROJECT_PLANNER_BUDGETS]: [] };

    returnArray["TableSchedulerMilestones"].push({
      fieldNames: ["projectid"],
      displayName: "All",
      filtersToApply: {
        projectid: {
          operator: "and",
          constraints: [
            {
              value: projectid,
              matchMode: FilterMatchMode.EQUALS,
            },
          ],
        },
      },
    });

    returnArray[useTableNames.PROJECT_PLANNER_BUDGETS].push({
      fieldNames: ["_showInTable"],
      displayName: "All",
      filtersToApply: {
        _showInTable: {
          operator: "and",
          constraints: [
            {
              value: true,
              matchMode: FilterMatchMode.EQUALS,
            },
          ],
        },
      },
    });

    return returnArray;
  }

  // filter out budgets created from actuals
  const filterBudgets = (budgets: IRecordPlannerBudget[]): IRecordPlannerBudget[] => {
    return budgets.filter(b => b._showInTable !== true && b.status !== 2);
  }

  const getChildBudgetsForTask = (
    taskId: string,
    budgetData: IRecordPlannerBudget[]
  ): IRecordPlannerBudget[] => {
    return filterBudgets(budgetData.filter(
      (b) =>
        b.taskid === taskId &&
        utils.IsActive(b as unknown as IRecord)
    ));
  }

  const getChildTasksForMilestone = (
    milestoneId: string,
    taskData: IRecordPlannerTask[]
  ): IRecordPlannerTask[] => {
    return taskData.filter(
      (t) =>
        t.milestoneid === milestoneId &&
        utils.IsActive(t as unknown as IRecord)
    );
  }

  const getChildMilestonesForMilestone = (
    milestoneId: string,
    milestoneData: IRecordPlannerMilestone[]
  ): IRecordPlannerMilestone[] => {
    return milestoneData.filter(
      (m) =>
        m.milestoneid === milestoneId &&
        utils.IsActive(m as unknown as IRecord)
    );
  }

  const getChildMilestonesForProject = (
    projectId: string,
    milestoneData: IRecordPlannerMilestone[]
  ): IRecordPlannerMilestone[] => {
    return milestoneData.filter(
      (m) =>
        m.projectid === projectId &&
        m.milestoneid === "" &&
        utils.IsActive(m as unknown as IRecord)
    );
  }

  // this creates a budget from the actuals and budgets records (group actuals and budgets by taskid, resourcetype and resourceid to create one budget record)
  // and set showBudget to true to denote that it is a budget to be shown in the budgets table
  const _createBudgetsToShow = (forageData: Record<string, IRecord[]>): void => {
    const budgetsData = Object.values(upvise.entityData(useTableNames.PROJECT_PLANNER_BUDGETS)) as unknown as IRecordPlannerBudget[];
    const actualsData = Object.values(upvise.entityData(useTableNames.PROJECT_PLANNER_ACTUALS)) as unknown as IRecordPlannerActual[];
    const budgetsToDelete: string[] = budgetsData
      .filter(b => b._showInTable === true)
      .map(b => b.id);
    const budgetsToShow: IRecordPlannerBudget[] = _createBudgetsToShowFromBudgets(budgetsData);

    _createBudgetsToShowFromActuals(actualsData, budgetsToShow);

    budgetsData.forEach(b => {
      _updateBudget(b, forageData);
    });

    budgetsToShow.forEach(b => {
      _updateBudget(b, forageData);
    });

    // remove old budget records created from actuals
    budgetsToDelete.forEach(b => {
      upvise.removeRecordData(useTableNames.PROJECT_PLANNER_BUDGETS, b);
    });

    // add new budget records created from actuals
    upvise.updateStore({ [useTableNames.PROJECT_PLANNER_BUDGETS]: budgetsToShow as unknown as IRecord[] });
  }

  // Create budgets to show from budgets grouped by taskid, resourcetype and resourceid
  const _createBudgetsToShowFromBudgets = (
    budgetsData: IRecordPlannerBudget[]
  ): IRecordPlannerBudget[] => {
    const budgetsToShowFromBudgets: IRecordPlannerBudget[] = [];

    budgetsData
      .filter(b => b.status !== 2 && b._showInTable !== true && utils.IsActive(b as unknown as IRecord))
      .forEach(b => {
        const relatedBudget = budgetsToShowFromBudgets.find(
          createdBudget => createdBudget.taskid === b.taskid &&
            createdBudget.resourcetype === b.resourcetype &&
            createdBudget.resourceid === b.resourceid
        );

        // update qty for budget record
        if (relatedBudget) {
          _updateBudgetToShowFromBudget(relatedBudget, b);
          // create new budget record
        } else {
          const newBudget = _createBudgetToShowFromBudget(b);
          budgetsToShowFromBudgets.push(newBudget);
        }
      });

    return budgetsToShowFromBudgets;
  }

  // Add actuals data without a budgetid to a budget to show.
  // If there is no budget to show that has the same taskid, resourcetype and resourceid, create a new budget to show
  const _createBudgetsToShowFromActuals = (
    actualsData: IRecordPlannerActual[],
    budgetsToShow: IRecordPlannerBudget[]
  ): void => {
    actualsData
      .filter(a => a.status === 0 || a.status === 1)
      .forEach(a => {
        const relatedBudget = budgetsToShow.find(
          b => b.taskid === a.taskid &&
            b.resourcetype === a.resourcetype &&
            b.resourceid === a.resourceid
        );

        // update actuals for budget to show record
        if (relatedBudget) {
          _updateBudgetToShowFromActual(relatedBudget, a);
          // create new budget to show record
        } else {
          const newBudget = _createBudgetToShowFromActual(a);
          budgetsToShow.push(newBudget);
        }
      });
  }

  // Update information for budget to show using budget record 
  const _updateBudgetToShowFromBudget = (
    relatedBudget: IRecordPlannerBudget,
    budgetRecord: IRecordPlannerBudget
  ): void => {
    relatedBudget.qty = maths.sum(relatedBudget.qty, budgetRecord.qty);
    // if unit prices are different, don't show unit price
    if (relatedBudget.unitprice !== null && relatedBudget.unitprice !== budgetRecord.unitprice)
      relatedBudget.unitprice = null;
    relatedBudget.total = maths.sum(relatedBudget.total, maths.multiply(budgetRecord.qty, budgetRecord.unitprice));

    relatedBudget.originalQty = maths.sum(relatedBudget.originalQty, budgetRecord.originalQty);
    // if original unit prices are different, don't show original unit price
    if (relatedBudget.originalUnitPrice !== null && relatedBudget.originalUnitPrice !== budgetRecord.originalUnitPrice)
      relatedBudget.originalUnitPrice = null;
    relatedBudget.originalTotal = maths.sum(relatedBudget.originalTotal, maths.multiply(budgetRecord.originalQty, budgetRecord.originalUnitPrice));

    // if purchase unit prices are different, don't show purchase unit price
    if (relatedBudget.purchaseUnitPrice !== null && relatedBudget.purchaseUnitPrice !== budgetRecord.purchaseUnitPrice)
      relatedBudget.purchaseUnitPrice = null;
    relatedBudget.purchaseTotal = maths.sum(relatedBudget.purchaseTotal, maths.multiply(budgetRecord.originalQty, budgetRecord.purchaseUnitPrice));

    budgetRecord._showInTableId = relatedBudget.id;
  }

  // Create budget to show using budget record
  const _createBudgetToShowFromBudget = (
    budgetRecord: IRecordPlannerBudget
  ): IRecordPlannerBudget => {
    const newBudget = getNewBudget(budgetRecord.taskid, budgetRecord.resourcetype);

    newBudget.resourceid = budgetRecord.resourceid;
    newBudget.resourcecategory = "";
    newBudget.qty = budgetRecord.qty;
    newBudget.unitprice = budgetRecord.unitprice;
    newBudget.total = maths.multiply(budgetRecord.qty, budgetRecord.unitprice);
    newBudget.original = "";
    newBudget._showInTable = true;
    newBudget.approvedActualsTotal = 0;
    newBudget.approvedActualsQty = 0;
    newBudget.unapprovedActualsTotal = 0;
    newBudget.unapprovedActualsQty = 0;
    newBudget.originalQty = budgetRecord.originalQty;
    newBudget.originalUnitPrice = budgetRecord.originalUnitPrice;
    newBudget.originalTotal = maths.multiply(budgetRecord.originalQty, budgetRecord.originalUnitPrice);
    newBudget.purchaseUnitPrice = budgetRecord.purchaseUnitPrice;
    newBudget.purchaseTotal = maths.multiply(budgetRecord.originalQty, budgetRecord.purchaseUnitPrice);

    budgetRecord._showInTableId = newBudget.id;

    return newBudget;
  }

  // Update information for budget to show using actual record
  const _updateBudgetToShowFromActual = (
    relatedBudget: IRecordPlannerBudget,
    actualRecord: IRecordPlannerActual
  ): void => {
    if (actualRecord.status === 1) {
      if (typeof relatedBudget.approvedActualsQty === "number")
        relatedBudget.approvedActualsQty = maths.sum(relatedBudget.approvedActualsQty, actualRecord.qty);
      if (typeof relatedBudget.approvedActualsTotal === "number")
        relatedBudget.approvedActualsTotal = maths.sum(relatedBudget.approvedActualsTotal, actualRecord.qty * actualRecord.unitprice);
    }
    else if (actualRecord.status === 0) {
      if (typeof relatedBudget.unapprovedActualsQty === "number")
        relatedBudget.unapprovedActualsQty = maths.sum(relatedBudget.unapprovedActualsQty, actualRecord.qty);
      if (typeof relatedBudget.unapprovedActualsTotal === "number")
        relatedBudget.unapprovedActualsTotal = maths.sum(relatedBudget.unapprovedActualsTotal, actualRecord.qty * actualRecord.unitprice);
    }
    actualRecord._showInTableId = relatedBudget.id;
  }

  // Create budget to show using actual record
  const _createBudgetToShowFromActual = (
    actualRecord: IRecordPlannerActual
  ): IRecordPlannerBudget => {
    const newBudget = getNewBudget(actualRecord.taskid, actualRecord.resourcetype);

    newBudget.resourceid = actualRecord.resourceid;
    newBudget.resourcecategory = "";
    newBudget.original = "";
    newBudget._showInTable = true;
    if (actualRecord.status === 1) {
      newBudget.approvedActualsTotal = maths.multiply(actualRecord.qty, actualRecord.unitprice);
      newBudget.approvedActualsQty = actualRecord.qty;
      newBudget.unapprovedActualsTotal = 0;
      newBudget.unapprovedActualsQty = 0;
    }
    else if (actualRecord.status === 0) {
      newBudget.approvedActualsTotal = 0;
      newBudget.approvedActualsQty = 0;
      newBudget.unapprovedActualsTotal = maths.multiply(actualRecord.qty, actualRecord.unitprice);
      newBudget.unapprovedActualsQty = actualRecord.qty;
    }
    actualRecord._showInTableId = newBudget.id;

    return newBudget;
  }

  return {
    projectid,
    state,
    fetch,
    getMetadata,
    getForageData,
    getProject,
    getBudgetOptionsData,
    notPersistedCalcs,
    doSaveModelEntities,

    getNewMilestone,
    doDeleteMilestone,
    doValidateMilestone,
    getEditMilestone,

    getNewTask,
    doDeleteTask,
    doValidateTask,
    getEditTask,
    getEditTasksForMilestone,
    getEditMilestonesForMilestone,
    createTaskLog,
    getProgressLogsForTask,
    getTaskLogs,

    getNewBudget,
    getBudgetsForTask,

    getSlicingInformation,
  };
}
