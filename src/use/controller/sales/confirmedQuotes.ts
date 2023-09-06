import {
  IUpvise,
  //IUpviseDataMessage,
  IGridSlicing,
  IRecord,
} from "../../../store/modules/upvise.d";
import localforage from "localforage";
import dateConfirmedQuotesController from "./dateConfirmedQuotesController";
import { FilterMatchMode } from "primevue/api";

export default function useControllerSalesQuotesConfirmed(
  upvise: IUpvise,
  moduleName: string
) {
  //Quote form field
  const onSiteHoursField = "F7";
  const draftingHoursField = "F8";
  const subFormField = "F1";
  const associatedCostField = "F61";

  //Sub form field
  const memberfabHoursField = "F10";
  const memberlengthField = "F3";
  const membercountField = "F4";

  //Associated cost fields
  const associatedCostProductField = "F1";
  const associatedCostQuantityField = "F3";
  const transportType = "transport";

  //Product custom fields
  const typeField = "F35";

  const productTypeMap: Record<string, string> = {};

  //Manually added fields will need to be system.settings
  const state = upvise.state();
  const fetch = () => upvise.fetch(moduleName);
  const getMetadata = () => upvise.metadata(moduleName);

  function setStatus() {
    const quoteData = Object.values(
      upvise.entityData("TableUnybizSalesQuotes")
    );
    let quoteStatusData: IRecord[] = [];
    quoteStatusData = Object.values(
      upvise.entityData("_salesQuotesStatus")
    ) as unknown as IRecord[];

    quoteData.forEach((deal) => {
      const statusValue = deal.status as number;
      const quoteStatus = quoteStatusData.find(
        (d) => Number(d.key) === statusValue
      );
      if (quoteStatus) deal.statusName = quoteStatus.value;
    });
  }
  async function getProductTypeMap() {
    const localForageInstance = localforage.createInstance({
      name: "upvise",
      storeName: "tables",
    });
    const products = await localForageInstance
      .getItem("unybiz.sales.products")
      .then((results: unknown) => {
        return (results as { name: string; items: Record<string, any>[] })
          .items;
      });
    products.forEach((product) => {
      const custom =
        product.custom != "" && product.custom != undefined
          ? JSON.parse(product.custom)
          : {};
      if (typeField in custom) productTypeMap[product.id] = custom[typeField];
    });
  }

  async function getSubForm() {
    const formData = Object.values(upvise.entityData("TableUnybizFormsForms"));

    const quoteData = Object.values(
      upvise.entityData("TableUnybizSalesQuotes")
    );
    quoteData.forEach((deal) => {
      const form = formData.find((form: Record<string, unknown>) => {
        const value: Record<string, unknown> = JSON.parse(form.value as string);
        if (
          form.linkedid === deal.opportunityid &&
          form.status === 2 &&
          (value.F58 as string)?.includes(deal.companyid as string)
        )
          return true;
      });
      if (form) {
        deal.formid = form.id;
        deal.formValue = form.value;
      }
    });
  }

  async function getMemberInformation() {
    const quoteData = Object.values(
      upvise.entityData("TableUnybizSalesQuotes")
    ) as Record<string, unknown>[];

    const localForageInstance = localforage.createInstance({
      name: "upvise",
      storeName: "tables",
    });
    const forms = await localForageInstance
      .getItem("unybiz.forms.forms")
      .then((results: unknown) => {
        return (results as { name: string; items: Record<string, any>[] })
          .items;
      });

    for (const deal of quoteData) {
      const dealFormValue =
        deal.formValue != "" && deal.formValue != undefined
          ? JSON.parse(deal.formValue as string)
          : {};
      if (dealFormValue != {}) {
        const subforms = forms.filter(
          (x) => x.linkedid === deal.formid + ":" + subFormField
        );
        if (subforms.length > 0) {
          const subformValues = await getMemberSubFormValues(subforms);
          if ("fabHours" in subformValues)
            deal.workshopAmount = subformValues["fabHours"];

          if ("weight" in subformValues) deal.tonnes = subformValues["weight"];
        }
        if (onSiteHoursField in dealFormValue)
          deal.siteAmount = parseFloat(dealFormValue[onSiteHoursField]);

        if (draftingHoursField in dealFormValue)
          deal.draftingAmount = parseFloat(dealFormValue[draftingHoursField]);
      }
    }
  }

  async function getAdditionalCostInformation() {
    const quoteData = Object.values(
      upvise.entityData("TableUnybizSalesQuotes")
    ) as Record<string, unknown>[];

    const localForageInstance = localforage.createInstance({
      name: "upvise",
      storeName: "tables",
    });
    const forms = await localForageInstance
      .getItem("unybiz.forms.forms")
      .then((results: unknown) => {
        return (results as { name: string; items: Record<string, any>[] })
          .items;
      });

    for (const deal of quoteData) {
      const dealFormValue =
        deal.formValue != "" && deal.formValue != undefined
          ? JSON.parse(deal.formValue as string)
          : {};
      if (dealFormValue != {}) {
        const costforms = forms.filter(
          (x) => x.linkedid === deal.formid + ":" + associatedCostField
        );
        if (costforms.length > 0) {
          const transportValue = await getAdditionalCostFormValues(costforms);
          deal.transportAmount = transportValue;
        }
      }
    }
  }

  async function getMemberSubFormValues(
    subforms: Record<string, any>[]
  ): Promise<Record<string, any>> {
    const subFormValuesObject: Record<string, any> = {};
    let fabHours = 0;
    let weight = 0;
    subforms.forEach((x) => {
      const value = x.value != "" ? JSON.parse(x.value) : {};
      if (memberfabHoursField in value)
        fabHours += parseFloat(value[memberfabHoursField]);
      if (memberlengthField in value && membercountField in value)
        weight +=
          (parseFloat(value[memberlengthField]) *
            parseFloat(value[membercountField])) /
          1000;
    });
    subFormValuesObject["fabHours"] = fabHours.toFixed(2);
    subFormValuesObject["weight"] = weight.toFixed(2);
    return subFormValuesObject;
  }

  async function getAdditionalCostFormValues(
    additionalCostForms: Record<string, any>[]
  ): Promise<number> {
    let transportHours = 0;
    additionalCostForms.forEach((x) => {
      const value = x.value != "" ? JSON.parse(x.value) : {};
      let currentProduct = null;
      if (associatedCostProductField in value)
        currentProduct = value[associatedCostField];
      if (
        currentProduct in productTypeMap &&
        productTypeMap[currentProduct].toLowerCase() == transportType
      )
        transportHours += value[associatedCostQuantityField];
    });
    return transportHours;
  }

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

    const quoteData = Object.values(
      upvise.entityData("TableUnybizSalesQuotes")
    );
    quoteData.forEach((deal) => {
      const company = companies.find(
        (company: Record<string, unknown>) => company.id === deal.companyid
      );
      if (company) deal.companyName = company.name;
    });
    //console.log("client Name");
  }

  function getSlicingInformation(
    startOfWeek = 0,
    endOfWeek = 0
  ): Record<string, IGridSlicing[]> {
    //upviseData: IUpviseDataMessage
    //JSON Object, for each tab send filter that needs to be applied!
    //{[fieldNames], displayName, filterToApply}
    if (startOfWeek == 0 && endOfWeek == 0) {
      const returnArray: Record<string, IGridSlicing[]> = {
        TableUnybizSalesQuotes: [],
      };
      //const tableName = upviseData.definition?.Grouping[0]?.Type;
      returnArray["TableUnybizSalesQuotes"].push({
        fieldNames: ["status"],
        displayName: "All",
        filtersToApply: {
          status: {
            operator: "and",
            constraints: [
              {
                value: 4,
                matchMode: FilterMatchMode.EQUALS,
              },
            ],
          },
        },
      });
      return returnArray;
    } else {
      const returnArray: Record<string, IGridSlicing[]> = {
        TableUnybizSalesQuotes: [],
        _Datequoteconfirmed: [],
      };
      //const tableName = upviseData.definition?.Grouping[0]?.Type;
      returnArray["TableUnybizSalesQuotes"].push({
        fieldNames: ["status"],
        displayName: "All",
        filtersToApply: {
          status: {
            operator: "and",
            constraints: [
              {
                value: 4,
                matchMode: FilterMatchMode.EQUALS,
              },
            ],
          },
        },
      });
      returnArray["_Datequoteconfirmed"].push({
        fieldNames: ["epochDate"],
        displayName: "All",
        filtersToApply: {
          epochDate: {
            operator: "and",
            constraints: [
              {
                value: startOfWeek,
                matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
              },
              {
                value: endOfWeek,
                matchMode: FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
              },
            ],
          },
        },
      });
      return returnArray;
    }
  }

  const chooseTheProperQuotes = (
    selectedRow: Record<string, any>[]
  ): string => {
    console.log(selectedRow);
    const recordsToShow: string[] = [];
    let dateRows = selectedRow.filter(
      (row) => row.group === "_Datequoteconfirmed"
    );
    const quoteRows = selectedRow.filter(
      (row) => row.group !== "_Datequoteconfirmed"
    );
    const datesNotToUse: string[] = quoteRows.map((row) => {
      return row.row.dateQuoteConfirmedid;
    });
    quoteRows.forEach((quoterow) => {
      recordsToShow.push(quoterow.row.id);
    });

    dateRows = dateRows
      .filter((dateRow) => !datesNotToUse.includes(dateRow.row.id))
      .map((dateRow) => dateRow.row.id);
    const quoteData = Object.values(
      upvise.entityData("TableUnybizSalesQuotes")
    ).filter((quote: Record<string, any>) =>
      dateRows.includes(quote.dateQuoteConfirmedid)
    );
    quoteData.forEach((quote) => {
      recordsToShow.push(quote.id as string);
    });

    return recordsToShow.join("|");
  };

  const _createDatesToShow = async (): Promise<void> => {
    const quoteData = Object.values(
      upvise.entityData("TableUnybizSalesQuotes")
    ) as Record<string, unknown>[];
    const datesToShow: IRecord[] | undefined =
      await dateConfirmedQuotesController().mapDateConfirmedQuote(
        quoteData as IRecord[]
      );
    upvise.updateStore({
      _Datequoteconfirmed: datesToShow as unknown as IRecord[],
    });
  };

  async function initialiseStore() {
    setStatus();
    await getProductTypeMap();
    await getClientNames();
    await getSubForm();
    await getMemberInformation();
    await getAdditionalCostInformation();
    await _createDatesToShow();
  }

  return {
    state,
    fetch,
    getMetadata,
    initialiseStore,
    getSlicingInformation,
    chooseTheProperQuotes,
  };
}
