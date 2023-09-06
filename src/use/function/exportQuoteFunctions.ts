// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import localforage from "localforage";
import {
  IRecordDealsProduct,
  IRecordDealsQuote,
  IRecordDealsQuoteProduct,
} from "../../use/controller/sales/deals.d";
import {
  IRecordPlannerBudget,
  IRecordPlannerTask,
} from "../../use/controller/project/planner.d";
import useControllerSalesDeal from "../controller/sales/deals";
import { IRecord, IUpvise } from "../../store/modules/upvise.d";
import utils from "../../use/function/useUtils";
import { useTableNames } from "../utils/useConstants";
//import useControllerProjectPlanner from "../controller/project/planner";

//Move this into a system.user.setting
const localForageInstance = localforage.createInstance({
  name: "upvise",
  storeName: "tables",
});
let genericProductId = "";
let genericSubcontractorId = "";
let genericMaterialId = "";
localForageInstance.getItem("system.user.settings").then((result: unknown) => {
  const typedResult = result as {
    name: string;
    items: { id: string; value: string }[];
  };
  typedResult.items.forEach((entry) => {
    switch (entry.id) {
      case "sales.generic_product_id":
        genericProductId = entry.value;
        break;
      case "sales.generic_subcontractor_id":
        genericSubcontractorId = entry.value;
        break;
      case "sales.generic_material_id":
        genericMaterialId = entry.value;
        break;
    }
  });
});

// const genericProductId = "86AD5612B7641B026559C22AC68AF2";
// const genericSubcontractorId = "63AB71AC5068FFD1C95DDCD3170A20";
// const genericMaterialId = "F05188D5F3362B15008B4EFE624906";

// function getLookupKey(type: string, grouping: IGrouping) {
//   const group = Object.values(grouping).find(g => g.Type === type);
//   return group
//     ? group.LookupKey
//     : "";
// }

export const exportPurchaseOrder = async (
  selectedItems: {
    TableSchedulerTasks: IRecordPlannerTask[];
    [useTableNames.PROJECT_PLANNER_BUDGETS]: Record<
      string,
      IRecordPlannerBudget[]
    >;
  },
  selectedCompany: string,
  forageData: Record<string, IRecord[]>,
  upvise: IUpvise
): Promise<string[]> => {
  console.log("starting export function...");
  await utils.forceSync();
  const salesDealController = useControllerSalesDeal(upvise);
  // const grouping = upviseDataMessage.definition.Grouping;
  // const projectPlannerController = useControllerProjectPlanner(upvise);
  // const localForageInstance = localforage.createInstance({
  //   name: "upvise",
  //   storeName: "tables",
  // });
  // let purchaseOrder = existingPurchaseOrderId
  //   ? await localForageInstance
  //       .getItem("unybiz.sales.quotes")
  //       .then((result: unknown) => {
  //         return (
  //           result as { name: string; items: Record<string, unknown>[] }
  //         ).items.find((quotes: Record<string, unknown>) => {
  //           return quotes.id === existingPurchaseOrderId;
  //         });
  //       })
  //   : {};

  const quoteProductModels: IRecordDealsQuoteProduct[] = [];
  const quoteModels: IRecordDealsQuote[] = [];
  const purchaseOrderIds: string[] = [];
  const projectId: string = upvise.upviseSelector[0];
  const budgetAndTaskIds: string = getBudgetAndTaskIds(selectedItems);
  let poTotal = 0;

  // Create Purchase order record
  const newPurchaseOrder = salesDealController.getNewQuote();

  populatePurchaseOrder(
    newPurchaseOrder,
    selectedCompany,
    forageData,
    projectId,
    budgetAndTaskIds
  );

  purchaseOrderIds.push(newPurchaseOrder.id);

  // Create line items for each task
  selectedItems["TableSchedulerTasks"].forEach((task) => {
    const budgets = upvise.entityFilter(useTableNames.PROJECT_PLANNER_BUDGETS, "taskid", task.id) as unknown as IRecordPlannerBudget[];

    budgets
      .filter((b) => (b.resourcetype === "Subcontractor" || b.resourcetype === "Materials") && !b._showInTable)
      .forEach((b) => {
        const newPoProduct = salesDealController.getNewQuoteProduct();

        populatePurchaseOrderProduct(
          newPoProduct,
          newPurchaseOrder,
          forageData,
          task,
          b
        );

        poTotal = Number(
          (
            poTotal +
            newPoProduct.price *
              newPoProduct.quantity *
              (1 + newPoProduct.vat / 100)
          ).toFixed(2)
        );

        quoteProductModels.push(newPoProduct);
      });
  });

  // Create Purchase order for all budgets and line items for each budget
  Object.entries(selectedItems[useTableNames.PROJECT_PLANNER_BUDGETS]).forEach(
    ([taskid, budgets]) => {
      const task = upvise.recordData(
        "TableSchedulerTasks",
        taskid
      ) as unknown as IRecordPlannerTask;

      budgets.forEach((b) => {
        const newPoProduct = salesDealController.getNewQuoteProduct();

        populatePurchaseOrderProduct(
          newPoProduct,
          newPurchaseOrder,
          forageData,
          task,
          b
        );

        poTotal = Number(
          (
            poTotal +
            newPoProduct.price *
              newPoProduct.quantity *
              (1 + newPoProduct.vat / 100)
          ).toFixed(2)
        );

        quoteProductModels.push(newPoProduct);
      });
    }
  );
  // for (const entry of selectedItems) {
  //   let currentBudgets: IRecord[] = [];
  //   let currentEntryData = JSON.parse(JSON.stringify(
  //     upvise.recordData(entry.type, entry.id)
  //   )) as IRecord;
  //   if (entry.type === "TableSchedulerTasks")
  //     currentBudgets = JSON.parse(JSON.stringify(
  //       upvise.entityFilter("TableUnybizProjectsBudgets", "taskid", entry.id) // TODO filter only editable budgets
  //     )) as IRecord[];
  //   if (!utils.IsActive(currentEntryData) || Object.keys(currentEntryData).length === 0) {
  //     console.log("Could not find currentEntryData");
  //     return;
  //   }
  //   console.log("currentEntryData", currentEntryData, currentBudgets);
  //   // if no existing purchase order id selected, create new purchase order for each selected item
  //   if (!existingPurchaseOrderId) {
  //     purchaseOrder = salesDealController.getNewQuote();
  //     purchaseOrder.id = uuidv4().toUpperCase().replace(/-/g, "");
  //     purchaseOrder.currency = "AUD";
  //     purchaseOrder.date = Date.now();
  //     purchaseOrder.status = 6;
  //     purchaseOrder.name = window.Sales.getNewQuoteName(6);
  //     purchaseOrder.projectid = currentEntryData.projectid;
  //     purchaseOrder.owner = window.User.getName();
  //   }
  //   if (purchaseOrder !== undefined) {
  //     if (currentBudgets.length == 0) {
  //       let newPurchaseOrderProduct = salesDealController.getNewQuoteProduct();
  //       newPurchaseOrderProduct.currency = "AUD";
  //       newPurchaseOrderProduct.id = uuidv4().toUpperCase().replace(/-/g, "");
  //       newPurchaseOrderProduct.date = Date.now();
  //       newPurchaseOrderProduct.quoteid = purchaseOrder.id as string;
  //       newPurchaseOrderProduct.productid = genericProductId;
  //       if (entry.type === "TableUnybizProjectsBudgets") {
  //         newPurchaseOrderProduct = await fillQuoteWithBudgetData(
  //           currentEntryData as unknown as IRecordPlannerBudget,
  //           newPurchaseOrderProduct
  //         );
  //         newPurchaseOrderProduct["Task_Activity"] =
  //           currentEntryData.taskid as string;
  //         newPurchaseOrderProduct["Project"] =
  //           currentEntryData.projectid as string;
  //         newPurchaseOrderProduct["LinkedId"] = entry.id;
  //         newPurchaseOrderProduct["LinkedIdType"] = getLookupKey(entry.type, grouping);
  //       } else {
  //         newPurchaseOrderProduct.price = currentEntryData.budget as number;
  //         newPurchaseOrderProduct.quantity = 1;
  //         newPurchaseOrderProduct.productname = currentEntryData.name as string;
  //         newPurchaseOrderProduct.type = 0;
  //         newPurchaseOrderProduct["Project"] =
  //           currentEntryData.projectid as string;
  //         newPurchaseOrderProduct["LinkedId"] = entry.id;
  //         newPurchaseOrderProduct["LinkedIdType"] = getLookupKey(entry.type, grouping);;
  //       }
  //       let totalValue = 0;
  //       let totalValueEx = 0;
  //       if (
  //         typeof newPurchaseOrderProduct.price === "number" &&
  //         typeof newPurchaseOrderProduct.quantity === "number"
  //       ) {
  //         totalValueEx =
  //           newPurchaseOrderProduct.price * newPurchaseOrderProduct.quantity;
  //         totalValue =
  //           newPurchaseOrderProduct.price * newPurchaseOrderProduct.quantity;
  //         if (typeof newPurchaseOrderProduct.vat === "number") {
  //           totalValue +=
  //             (newPurchaseOrderProduct.price *
  //               newPurchaseOrderProduct.quantity *
  //               newPurchaseOrderProduct.vat) /
  //             100;
  //         }
  //       }
  //       quoteProductModels.push(newPurchaseOrderProduct);
  //       if (
  //         typeof purchaseOrder.totalex === "number" &&
  //         typeof purchaseOrder.total === "number"
  //       ) {
  //         purchaseOrder.totalex = Number(
  //           (purchaseOrder.totalex + totalValueEx).toFixed(2)
  //         );
  //         purchaseOrder.total = Number(
  //           (purchaseOrder.total + totalValue).toFixed(2)
  //         );
  //       }
  //     } else {
  //       let totalValue = 0;
  //       let totalValueEx = 0;
  //       for (const currentBudget of currentBudgets) {
  //         let newPurchaseOrderProduct =
  //           salesDealController.getNewQuoteProduct();
  //         newPurchaseOrderProduct.currency = "AUD";
  //         newPurchaseOrderProduct.id = uuidv4().toUpperCase().replace(/-/g, "");
  //         newPurchaseOrderProduct.date = Date.now();
  //         newPurchaseOrderProduct.quoteid = purchaseOrder.id as string;
  //         newPurchaseOrderProduct["Task_Activity"] =
  //           currentBudget.taskid as string;
  //         newPurchaseOrderProduct["Project"] =
  //           currentEntryData.projectid as string;
  //         newPurchaseOrderProduct["LinkedId"] = currentBudget.id as string;
  //         newPurchaseOrderProduct["LinkedIdType"] = "budget";
  //         newPurchaseOrderProduct = await fillQuoteWithBudgetData(
  //           currentBudget as unknown as IRecordPlannerBudget,
  //           newPurchaseOrderProduct
  //         );
  //         quoteProductModels.push(newPurchaseOrderProduct);
  //         if (
  //           typeof newPurchaseOrderProduct.quantity === "number" &&
  //           typeof newPurchaseOrderProduct.price === "number"
  //         ) {
  //           totalValueEx +=
  //             newPurchaseOrderProduct.quantity * newPurchaseOrderProduct.price;
  //           totalValue +=
  //             newPurchaseOrderProduct.quantity * newPurchaseOrderProduct.price;
  //           if (typeof newPurchaseOrderProduct.vat === "number") {
  //             totalValue +=
  //               (newPurchaseOrderProduct.price *
  //                 newPurchaseOrderProduct.quantity *
  //                 newPurchaseOrderProduct.vat) /
  //               100;
  //           }
  //         }
  //       }
  //       if (
  //         typeof purchaseOrder.totalex === "number" &&
  //         typeof purchaseOrder.total === "number"
  //       ) {
  //         purchaseOrder.totalex = Number(
  //           (purchaseOrder.totalex + totalValueEx).toFixed(2)
  //         );
  //         purchaseOrder.total = Number(
  //           (purchaseOrder.total + totalValue).toFixed(2)
  //         );
  //       }
  //     }
  //   }
  //   if (!existingPurchaseOrderId) {
  //     quoteModels.push(purchaseOrder as unknown as IRecordDealsQuote);
  //   }
  // }
  // if (existingPurchaseOrderId) {
  //   quoteModels.push(purchaseOrder as unknown as IRecordDealsQuote);
  // }

  newPurchaseOrder.total = poTotal;
  quoteModels.push(newPurchaseOrder);

  await salesDealController.doSaveModelEntities({
    TableUnybizSalesQuotes: quoteModels,
    TableUnybizSalesQuoteproducts: quoteProductModels,
  });

  return purchaseOrderIds;
};

function populatePurchaseOrder(
  purchaseOrder: IRecordDealsQuote,
  companyId: string,
  forageData: Record<string, IRecord[]>,
  projectId: string,
  budgetAndTaskIds: string
) {
  const quotePlannerLinkIndexField: string =
    (forageData["system.user.settings"]?.find(
      (r) => r.id === "QUOTE_PLANNERLINK_INDEX"
    )?.value as string) ?? "";
  const customObject = {} as Record<string, unknown>;
  purchaseOrder.id = utils.generateId();
  purchaseOrder.currency = "AUD";
  purchaseOrder.date = Date.now();
  purchaseOrder.status = 6;
  purchaseOrder.name = window.Sales.getNewQuoteName(6);
  purchaseOrder.projectid = projectId;
  purchaseOrder.owner = window.User.getName();
  purchaseOrder.plannermilestoneid = budgetAndTaskIds;
  purchaseOrder.companyid = companyId;

  if (quotePlannerLinkIndexField) customObject[quotePlannerLinkIndexField] = 1;

  purchaseOrder.custom = JSON.stringify(customObject);
}

function populatePurchaseOrderProduct(
  purchaseOrderProduct: IRecordDealsQuoteProduct,
  purchaseOrder: IRecordDealsQuote,
  forageData: Record<string, IRecord[]>,
  task: IRecordPlannerTask,
  budget: IRecordPlannerBudget | null = null
) {
  const quoteProductProjectMilestoneField: string =
    (forageData["system.user.settings"]?.find(
      (r) => r.id === "QUOTE_PRODUCT_PROJECT_MILESTONE_CUSTOM_FIELD"
    )?.value as string) ?? "";
  const quoteProductTaskActivityField: string =
    (forageData["system.user.settings"]?.find(
      (r) => r.id === "QUOTE_PRODUCT_TASK_ACTIVITY_CUSTOM_FIELD"
    )?.value as string) ?? "";
  const customObject = {} as Record<string, unknown>;
  purchaseOrderProduct.id = utils.generateId();
  purchaseOrderProduct.budgetid = budget?.id ?? "";
  purchaseOrderProduct.currency = "AUD";
  purchaseOrderProduct.date = Date.now();
  purchaseOrderProduct.plannermilestoneid = task.milestoneid;
  purchaseOrderProduct.plannertaskid = task.id;
  purchaseOrderProduct.price = budget?.unitprice ?? 0;
  purchaseOrderProduct.productid = budget?.resourceid ?? "";
  purchaseOrderProduct.productname = budget?.resourceName || "";
  purchaseOrderProduct.projectid = task.projectid;
  purchaseOrderProduct.quantity = budget?.qty ?? 0;
  purchaseOrderProduct.quoteid = purchaseOrder.id;
  purchaseOrderProduct.type = budget?.resourcetype === "Labour" ? 1 : 0;
  purchaseOrderProduct.unitid = budget?.uom ?? "";
  purchaseOrderProduct.vat = 10;

  if (quoteProductProjectMilestoneField)
    customObject[quoteProductProjectMilestoneField] = task.milestoneid;
  if (quoteProductTaskActivityField)
    customObject[quoteProductTaskActivityField] = task.id;

  purchaseOrderProduct.custom = JSON.stringify(customObject);
}

function getBudgetAndTaskIds(selectedItems: {
  TableSchedulerTasks: IRecordPlannerTask[];
  [useTableNames.PROJECT_PLANNER_BUDGETS]: Record<string, IRecordPlannerBudget[]>;
}) {
  const IdsArray: string[] = [];

  selectedItems.TableSchedulerTasks.forEach((task) => {
    IdsArray.push(task.id);
  });

  Object.values(selectedItems[useTableNames.PROJECT_PLANNER_BUDGETS]).forEach(
    (budgetsArray) => {
      budgetsArray.forEach((budget) => {
        IdsArray.push(budget.id);
      });
    }
  );

  return IdsArray.join("|");
}

export const fillQuoteWithGenericData = async (
  budgetData: IRecordPlannerBudget,
  quoteProduct: IRecordDealsQuoteProduct
): Promise<IRecordDealsQuoteProduct> => {
  const localForageInstance = localforage.createInstance({
    name: "upvise",
    storeName: "tables",
  });
  if (budgetData.resourcetype == "Plant") {
    const genericData = await localForageInstance
      .getItem("unybiz.sales.products")
      .then((result: unknown) => {
        return (
          result as { name: string; items: Record<string, unknown>[] }
        ).items.find((product: Record<string, unknown>) => {
          return product.id === genericProductId;
        });
      });
    /*const genericData = Query.selectId(
      "sales.products",
      "86AD5612B7641B026559C22AC68AF2"
    ); */
    if (genericData != undefined) {
      const genericDataTyped = genericData as unknown as IRecordDealsProduct;
      quoteProduct.productname = genericDataTyped.name;
      quoteProduct.price = budgetData.unitprice || 0;
      quoteProduct.vat = genericDataTyped.vat;
      quoteProduct.discount = genericDataTyped.discount;
      quoteProduct.description = genericDataTyped.description;
      quoteProduct.unitid = genericDataTyped.unitid;
      quoteProduct.quantity = budgetData.qty;
      quoteProduct.type = genericDataTyped.type;
      quoteProduct.productid = genericDataTyped.id;
    }
  }
  return quoteProduct;
};

export const fillQuoteWithBudgetData = async (
  budgetData: IRecordPlannerBudget,
  quoteProduct: IRecordDealsQuoteProduct
): Promise<IRecordDealsQuoteProduct> => {
  if (
    budgetData.resourcetype == "Labour" ||
    budgetData.resourcetype == "Plant"
  ) {
    try {
      if (typeof budgetData.resourceid === "string") {
        const parsedJson = JSON.parse(budgetData.resourceid);
        quoteProduct.productname = parsedJson.type; //TODO need to get product name
        quoteProduct.description = parsedJson.subtype ? parsedJson.subtype : "";
        quoteProduct.price = budgetData.unitprice || 0;
        quoteProduct.quantity = budgetData.qty;
        if (budgetData.resourcetype == "Labour") quoteProduct.type = 1;
        else quoteProduct.type = 0;
      } else {
        fillQuoteWithGenericData(budgetData, quoteProduct);
      }
    } catch (e) {
      fillQuoteWithGenericData(budgetData, quoteProduct);
    }
  } else {
    let linkedProduct: Record<string, unknown> | undefined = undefined;
    if (budgetData.resourceid != null)
      linkedProduct = await localForageInstance
        .getItem("unybiz.sales.products")
        .then((result: unknown) => {
          return (
            result as { name: string; items: Record<string, unknown>[] }
          ).items.find((product: Record<string, unknown>) => {
            return product.id === budgetData.resourceid;
          });
        });
    if (linkedProduct != undefined) {
      const linkedProductTyped =
        linkedProduct as unknown as IRecordDealsProduct;
      quoteProduct.productname = linkedProductTyped.name;
      quoteProduct.price = budgetData.unitprice || 0;
      quoteProduct.purchaseprice = linkedProductTyped.purchaseprice;
      quoteProduct.vat = linkedProductTyped.vat;
      quoteProduct.discount = linkedProductTyped.discount;
      quoteProduct.description = linkedProductTyped.description;
      quoteProduct.unitid = linkedProductTyped.unitid;
      quoteProduct.quantity = budgetData.qty;
      quoteProduct.type = linkedProductTyped.type;
      quoteProduct.productid = linkedProductTyped.id;
    }
    if (linkedProduct == null) {
      let genericData: Record<string, unknown> | undefined = undefined;
      switch (budgetData.resourcetype) {
        case "Plant":
          genericData = await localForageInstance
            .getItem("unybiz.sales.products")
            .then((result: unknown) => {
              return (
                result as { name: string; items: Record<string, unknown>[] }
              ).items.find((product: Record<string, unknown>) => {
                return product.id === genericProductId;
              });
            });
          /*Query.selectId(
            "sales.products",
            "86AD5612B7641B026559C22AC68AF2"
          ); */
          break;
        case "Subcontractor":
          genericData = await localForageInstance
            .getItem("unybiz.sales.products")
            .then((result: unknown) => {
              return (
                result as { name: string; items: Record<string, unknown>[] }
              ).items.find((product: Record<string, unknown>) => {
                return product.id === genericSubcontractorId;
              });
            });
          /*genericData = Query.selectId(
            "sales.products",
            "63AB71AC5068FFD1C95DDCD3170A20"
          ); */
          break;
        case "Materials":
          genericData = await localForageInstance
            .getItem("unybiz.sales.products")
            .then((result: unknown) => {
              return (
                result as { name: string; items: Record<string, unknown>[] }
              ).items.find((product: Record<string, unknown>) => {
                return product.id === genericMaterialId;
              });
            });
          /*genericData = Query.selectId(
            "sales.products",
            "F05188D5F3362B15008B4EFE624906"
          ); */
          break;
      }
      if (genericData !== undefined) {
        const genericDataTyped = genericData as unknown as IRecordDealsProduct;
        quoteProduct.productname = genericDataTyped.name;
        quoteProduct.price = budgetData.unitprice || 0;
        quoteProduct.vat = genericDataTyped.vat;
        quoteProduct.discount = genericDataTyped.discount;
        quoteProduct.description = genericDataTyped.description;
        quoteProduct.unitid = genericDataTyped.unitid;
        quoteProduct.quantity = budgetData.qty;
        quoteProduct.type = genericDataTyped.type;
        quoteProduct.productid = genericDataTyped.id;
        if (budgetData.resourcetype == "Subcontractor") {
          const companyQuery = await localForageInstance
            .getItem("unybiz.contacts.companies")
            .then((result: unknown) => {
              return (
                result as { name: string; items: Record<string, unknown>[] }
              ).items.find((company: Record<string, unknown>) => {
                return company.id === budgetData.resourceid;
              });
            });
          /* Query.selectId(
            "contacts.companies",
            budgetData.resourceid
          ); */
          if (companyQuery != undefined) {
            quoteProduct.productname = companyQuery.name as string;
          }
        }
      }
    }
    if (
      budgetData.resourcetype == "Subcontractor" ||
      budgetData.resourcetype == "Materials"
    ) {
      quoteProduct.price = budgetData.unitprice || 0;
      quoteProduct.quantity = budgetData.qty;
    }
  }
  quoteProduct.projectid = budgetData.projectid;
  return quoteProduct;
};

export const getPurchaseOrders = async (
  projectid: string
): Promise<Record<string, unknown>[]> => {
  const localForageInstance = localforage.createInstance({
    name: "upvise",
    storeName: "tables",
  });
  return localForageInstance
    .getItem("unybiz.sales.quotes")
    .then((result: unknown) => {
      return (
        result as { name: string; items: Record<string, unknown>[] }
      ).items.filter((quote: Record<string, unknown>) => {
        return quote.status === 6 && quote.projectid === projectid;
      });
    });
};
