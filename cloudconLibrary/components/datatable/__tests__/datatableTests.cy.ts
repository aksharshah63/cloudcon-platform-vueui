import {
  IColumnMetadata,
  ITableRecord,
} from "../../../store/modules/tableData/tableDataModule";
import Datatable from "../datatable.vue";
import "../../../assets/styles/global.scss";
import { MenuItem } from "primevue/menuitem";
import {
  DataFilterStringOperator,
  DataFilterType,
  IDataFilterRule,
  IDataFilters,
} from "../../../dataFilter/dataFilterInterfaces";
import { cypressMount } from "../../../cypress/cypressCommands";
import { IDatatableSortObject } from "cloudconLibrary/api/databaseWebApi";

const columnsProp: IColumnMetadata[] = [
  {
    InternalName: "id",
    Label: "Id",
  },
  {
    InternalName: "name",
    Label: "Name",
  },
  {
    InternalName: "startdate",
    Label: "Start Date Start Date Start Date Start Date Start Date Start Date",
  },
  {
    InternalName: "enddate",
    Label: "End Date",
  },
  {
    InternalName: "owner",
    Label: "Owner",
  },
  {
    InternalName: "project",
    Label: "Project",
  },
  {
    InternalName: "contact",
    Label: "Contact",
  },
  {
    InternalName: "approvedActuals",
    Label: "Approved Actuals",
  },
  {
    InternalName: "unapprovedActuals",
    Label: "Unapproved Actuals",
  },
];

const dataProp: ITableRecord[] = [
  {
    id: "id1",
    name: "equipment1",
    _rowColour: "ffd4b3",
  },
  {
    id: "id2",
    name: "equipment2",
  },
  {
    id: "id3",
    name: "equipment3",
  },
  {
    id: "id4",
    name: "equip4",
  },
];

const contextMenuFunction = (record: ITableRecord) => {
  console.log("Edit Equip", record);
};

const contextMenuOption = {
  label: "Edit",
  icon: "pi pi-pencil",
  onClick: contextMenuFunction,
};

const contextMenuOptionsProp: MenuItem[] = [contextMenuOption];

const expandedRows: Set<string> = new Set();
const selectedRows: Set<string> = new Set();
const sort: IDatatableSortObject[] = [];
const defaultSort: IDatatableSortObject[] = [];
const filter: IDataFilters = {
  field: "name",
  type: DataFilterType.STRING,
  operator: DataFilterStringOperator.CONTAINS,
  value: "equipment",
};

describe("Datatable", () => {
  before(() => {
    cypressMount();
  });

  beforeEach(() => {
    const updateExpandRowsSpy = cy.spy().as("onUpdateExpandRowsSpy");
    const updateSelectRowsSpy = cy.spy().as("onUpdateSelectRowsSpy");

    cy.mount(Datatable, {
      props: {
        data: dataProp,
        columns: columnsProp,
        contextMenuOptions: contextMenuOptionsProp,
        enableRowExpansion: true,
        expandedRows: expandedRows,
        enableHeader: true,
        enableRowSelection: true,
        selectedRows: selectedRows,
        sort: sort,
        defaultSort: defaultSort,
        filter: filter,
        "onUpdate:expandedRows": updateExpandRowsSpy,
        "onUpdate:selectedRows": updateSelectRowsSpy,
      },
    });
  });

  it("Mounts", () => {
    return;
  });

  it("Has correct number of rows (including header as a row)", () => {
    cy.get("tr").should("have.length", 5);
  });

  it("Expands row on chevron click", () => {
    cy.get(".datatable-body-row-expansion-expander-container").first().click();
    cy.get("@onUpdateExpandRowsSpy").should("have.been.called");
  });

  it("Expands all rows on expand rows icon click", () => {
    cy.get(".datatable-header-row-expansion-cell-button-container")
      .first()
      .click();
    cy.get("@onUpdateExpandRowsSpy").should("have.been.called");
  });

  it("Collapses all rows on collapse rows icon click", () => {
    cy.get(".datatable-header-row-expansion-cell-button-container")
      .eq(1)
      .click();
    cy.get("@onUpdateExpandRowsSpy").should("have.been.called");
  });

  it("Selects row on checkbox click", () => {
    cy.get(".datatable-body-row-selection-cell-content .p-checkbox-box")
      .first()
      .click();
    cy.get("@onUpdateSelectRowsSpy").should("have.been.called");
  });
});
