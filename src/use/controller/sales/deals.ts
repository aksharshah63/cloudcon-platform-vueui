// import { reactive } from "vue";
// import { UnwrapNestedRefs } from "@vue/reactivity";
import localforage from "localforage";
import {
  IUpvise,
  IUpviseDataMessage,
  IGridSlicing,
  IRecord,
} from "../../../store/modules/upvise.d";
import { reactive } from "vue";
import { IRecordDealsQuote, IRecordDealsQuoteProduct } from "./deals.d";

export default function useControllerSalesDeal(upvise: IUpvise) {
  const state = upvise.state();
  const fetch = () => upvise.fetch("salesOpportunities");
  const getMetadata = () => upvise.metadata("salesOpportunities");

  function setStatus() {
    const dealsData = Object.values(
      upvise.entityData("TableUnybizSalesOpportunities")
    );
    const dealStageData = upvise.entityData("_salesOpportunityDealStage");
    const dealStatusData = upvise.entityData("_salesOpportunityDealStatus");

    dealsData.forEach((deal) => {
      const status = deal.status as number;
      const stage = deal.stage2 as string;
      const dealStatus = dealStatusData[status];
      if (dealStatus) {
        deal.statusName = dealStatus.value;
        if (status === 0) {
          const dealStage = dealStageData[Number(stage)];
          if (dealStage) deal.stageName = dealStage.value;
        } else {
          deal.stageName = deal.statusName;
        }
      }
    });
  }
  function getSlicingInformation(
    upviseData: IUpviseDataMessage
  ): Record<string, IGridSlicing[]> {
    //JSON Object, for each tab send filter that needs to be applied!
    //{[fieldNames], displayName, filterToApply}
    const returnArray: Record<string, IGridSlicing[]> = {};
    const tableName = upviseData.definition?.Grouping[0]?.Type;
    if (tableName) {
      returnArray[tableName] = [];
      for (const name in upviseData.definition.Slicing) {
        const parsedJson = JSON.parse(upviseData.definition.Slicing[name]);
        parsedJson.displayName = name;
        returnArray[tableName].push(parsedJson);
      }
    }
    return returnArray;
    // let parsedData = JSON.parse();
    // return [
    //   {
    //     fieldNames: [""],
    //     displayName: "All",
    //     filtersToApply: {
    //       none: {
    //         operator: FilterOperator.AND,
    //         constraints: [
    //           {
    //             value: null,
    //             matchMode: FilterMatchMode.EQUALS,
    //           },
    //         ],
    //       },
    //     },
    //   },
    //   {
    //     fieldNames: ["status", "stage2"],
    //     count: 0,
    //     displayName: "Incoming",
    //     filtersToApply: {
    //       status: {
    //         operator: "and",
    //         constraints: [
    //           {
    //             value: 0,
    //             matchMode: "equals",
    //           },
    //         ],
    //       },
    //       stage2: {
    //         operator: "and",
    //         constraints: [
    //           {
    //             value: 0,
    //             matchMode: "equals",
    //           },
    //         ],
    //       },
    //     },
    //   },
    //   {
    //     fieldNames: ["status", "stage2"],
    //     displayName: "Qualified",
    //     count: 0,
    //     filtersToApply: {
    //       status: {
    //         operator: "and",
    //         constraints: [
    //           {
    //             value: 0,
    //             matchMode:"equals",
    //           },
    //         ],
    //       },
    //       stage2: {
    //         operator: "and",
    //         constraints: [
    //           {
    //             value: 1,
    //             matchMode: "equals",
    //           },
    //         ],
    //       },
    //     },
    //   },
    //   {
    //     fieldNames: ["status", "stage2"],
    //     displayName: "Quotation",
    //     count: 0,
    //     filtersToApply: {
    //       status: {
    //         operator: "and",
    //         constraints: [
    //           {
    //             value: 0,
    //             matchMode: "equals",
    //           },
    //         ],
    //       },
    //       stage2: {
    //         operator: "and",
    //         constraints: [
    //           {
    //             value: 2,
    //             matchMode: "equals",
    //           },
    //         ],
    //       },
    //     },
    //   },
    //   {
    //     fieldNames: ["status", "stage2"],
    //     displayName: "Closure",
    //     count: 0,
    //     filtersToApply: {
    //       status: {
    //         operator: "and",
    //         constraints: [
    //           {
    //             value: 0,
    //             matchMode: "equals",
    //           },
    //         ],
    //       },
    //       stage2: {
    //         operator: "and",
    //         constraints: [
    //           {
    //             value: 3,
    //             matchMode: "equals",
    //           },
    //         ],
    //       },
    //     },
    //   },
    //   {
    //     fieldNames: ["status"],
    //     displayName: "Closed Won",
    //     count: 0,
    //     filtersToApply: {
    //       status: {
    //         operator: "and",
    //         constraints: [
    //           {
    //             value: 1,
    //             matchMode:"equals",
    //           },
    //         ],
    //       },
    //     },
    //   },
    //   {
    //     fieldNames: ["status"],
    //     displayName: "Closed Lost",
    //     count: 0,
    //     filtersToApply: {
    //       status: {
    //         operator: "and",
    //         constraints: [
    //           {
    //             value: 2,
    //             matchMode: "equals",
    //           },
    //         ],
    //       },
    //     },
    //   },
    // ];
  }

  function returnTabCounts(
    message: IUpviseDataMessage
  ): { name: string; value: number }[] {
    // const countData = {
    //   all: 0,
    //   incoming: 0,
    //   qualified: 0,
    //   quotation: 0,
    //   closure: 0,
    //   closedWon: 0,
    //   closedLost: 0,
    // };
    if (message) {
      return [
        { name: "All", value: 0 },
        { name: "Incoming", value: 0 },
        { name: "Qualified", value: 0 },
        { name: "Quotation", value: 0 },
        { name: "Closure", value: 0 },
        { name: "Closed Won", value: 0 },
        { name: "Closed Lost", value: 0 },
      ];
    }
    return [
      { name: "All", value: 0 },
      { name: "Incoming", value: 0 },
      { name: "Qualified", value: 0 },
      { name: "Quotation", value: 0 },
      { name: "Closure", value: 0 },
      { name: "Closed Won", value: 0 },
      { name: "Closed Lost", value: 0 },
    ]; /*
    message.persistence?.model["opportunity"].data.forEach(
      (row: Record<string, unknown>) => {
        countData.all++;
        if (row["status"] == 1) countData.closedWon++;
        else if (row["status"] == 2) countData.closedLost++;
        else if (row["status"] == 0) {
          if (row["stage2"] == 0) countData.incoming++;
          else if (row["stage2"] == 1) countData.qualified++;
          else if (row["stage2"] == 2) countData.quotation++;
          else if (row["stage2"] == 3) countData.closure++;
        }
      }
    );
    return [
      { name: "All", value: countData.all },
      { name: "Incoming", value: countData.incoming },
      { name: "Qualified", value: countData.qualified },
      { name: "Quotation", value: countData.quotation },
      { name: "Closure", value: countData.closure },
      { name: "Closed Won", value: countData.closedWon },
      { name: "Closed Lost", value: countData.closedLost },
    ];*/
  }
  const getNewQuoteProduct = () => {
    return reactive({
      id: "",
      activity: "",
      budgetid: "",
      commission: 0,
      currency: "",
      custom: "",
      date: 0,
      description: "",
      discount: 0,
      plannermilestoneid: "",
      plannertaskid: "",
      prevshipqty: 0,
      price: 0,
      productid: "",
      productname: "",
      projectid: "",
      purchaseprice: 0,
      quantity: 0,
      quoteid: "",
      shipquantity: 0,
      type: 0,
      unitid: "",
      user: "",
      vat: 0,
    } as IRecordDealsQuoteProduct);
  };

  const getNewQuote = () => {
    return reactive({
      id: "",
      accountid: "",
      address: "",
      assetid: "",
      commission: 0,
      companyid: "",
      confirmationdate: 0,
      contactid: "",
      currency: "",
      custom: "",
      date: 0,
      deliverydate: 0,
      description: "",
      discount: 0,
      duedate: 0,
      hideitemprice: 0,
      invoiceid: "",
      jobid: "",
      name: "",
      opportunityid: "",
      owner: "",
      paidamount: 0,
      paiddate: 0,
      plannermilestoneid: "",
      projectid: "",
      sent: 0,
      signature: "",
      status: 0,
      termfileid: "",
      terms: "",
      toolid: "",
      total: 0,
      totalex: 0,
      transactionfee: 0,
      vat: 0,
      vatincluded: 0,
      wholesale: 0,
    } as IRecordDealsQuote);
  };

  // function copyModelEntities(payload: {
  //   quoteModels?: IRecordDealsQuote[];
  //   quoteProductModels?: IRecordDealsQuoteProduct[];
  // }): IUpviseDataMessage {
  //   const result = new UpviseDataMessage(
  //     state.client,
  //     state.module,
  //     state.selection,
  //     state.configuration,
  //     state.definition
  //   );

  //   if (payload.quoteModels)
  //     result.persistence.model.quote = new TableResponse(
  //       state.persistence.model.quote.title,
  //       state.persistence.model.quote.schema,
  //       payload.quoteModels as unknown as ITable
  //     );

  //   if (payload.quoteProductModels)
  //     result.persistence.model.quoteProduct = new TableResponse(
  //       state.persistence.model.quoteProduct.title,
  //       state.persistence.model.quoteProduct.schema,
  //       payload.quoteProductModels as unknown as ITable
  //     );

  //   console.log("copyModelEntities", result);
  //   return result;
  // }

  const doSaveModelEntities = (payload: {
    TableUnybizSalesQuotes?: IRecordDealsQuote[];
    TableUnybizSalesQuoteproducts?: IRecordDealsQuoteProduct[];
  }): Promise<void> => {
    return upvise.update(payload as Record<string, IRecord[]>);
  };

  async function getClientNames() {
    const localForageInstance = localforage.createInstance({
      name: "upvise",
      storeName: "tables",
    });

    const companies = await localForageInstance
      .getItem("unybiz.contacts.companies")
      .then((results: unknown) => {
        return (results as { name: string; items: Record<string, any>[] })
          .items;
      });

    const dealsData = Object.values(
      upvise.entityData("TableUnybizSalesOpportunities")
    );
    dealsData.forEach((deal) => {
      const company = companies.find(
        (company: Record<string, unknown>) => company.id === deal.companyid
      );
      if (company) deal.companyName = company.name;
    });
    //console.log("client Name");
  }

  async function initialiseStore() {
    setStatus();
    await getClientNames();
  }

  return {
    state,
    fetch,
    getMetadata,
    initialiseStore,
    getNewQuoteProduct,
    getNewQuote,
    doSaveModelEntities,
    getSlicingInformation,
    returnTabCounts,
  };
}
