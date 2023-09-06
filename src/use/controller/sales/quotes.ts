import {
  IUpvise,
  IUpviseDataMessage,
  IGridSlicing,
  IRecord,
} from "../../../store/modules/upvise.d";

export default function useControllerSalesQuotes(
  upvise: IUpvise,
  moduleName: string
) {
  const state = upvise.state();
  const fetch = () => upvise.fetch(moduleName);
  const getMetadata = () => upvise.metadata(moduleName);

  function setStatus() {
    const quoteData = Object.values(
      upvise.entityData("TableUnybizSalesQuotes")
    );
    let quoteStatusData: IRecord[] = [];
    let quoteSentData: IRecord[] = [];

    switch (moduleName) {
      case "salesQuotes":
        quoteStatusData = Object.values(
          upvise.entityData("_salesQuotesStatus")
        ) as unknown as IRecord[];
        break;
      case "salesInvoices":
        quoteStatusData = Object.values(
          upvise.entityData("_salesInvoiceStatus")
        ) as unknown as IRecord[];
        quoteSentData = Object.values(
          upvise.entityData("_salesInvoiceSent")
        ) as unknown as IRecord[];
        break;
      case "salesPurchaseOrders":
        quoteStatusData = Object.values(
          upvise.entityData("_salesPurchaseOrdersStatus")
        ) as unknown as IRecord[];
        quoteSentData = Object.values(
          upvise.entityData("_salesPurchaseOrdersSent")
        ) as unknown as IRecord[];
        break;
    }

    quoteData.forEach((deal) => {
      const statusValue = deal.status as number;
      const sentValue = deal.sent as number;
      if (statusValue === 6 || statusValue === 1) {
        const quoteSent = quoteSentData.find(
          (d) => Number(d.key) === sentValue
        );
        if (quoteSent) deal.statusName = quoteSent.value;
      } else {
        const quoteStatus = quoteStatusData.find(
          (d) => Number(d.key) === statusValue
        );
        if (quoteStatus) deal.statusName = quoteStatus.value;
      }
    });
  }

  // async function getClientNames() {
  //   const localForageInstance = localforage.createInstance({
  //     name: "upvise",
  //     storeName: "tables",
  //   });
  //   const companies = await localForageInstance
  //     .getItem("unybiz.contacts.companies")
  //     .then((results: unknown) => {
  //       return (results as { name: string; items: Record<string, any>[] })
  //         .items;
  //     });
  //
  //   const quoteData = Object.values(
  //     upvise.entityData("TableUnybizSalesQuotes")
  //   );
  //   quoteData.forEach((deal) => {
  //     const company = companies.find(
  //       (company: Record<string, unknown>) => company.id === deal.companyid
  //     );
  //     if (company) deal.companyName = company.name;
  //   });
  //   //console.log("client Name");
  // }

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
  }
  async function initialiseStore() {
    setStatus();
  }

  return {
    state,
    fetch,
    getMetadata,
    initialiseStore,
    getSlicingInformation,
  };
}
