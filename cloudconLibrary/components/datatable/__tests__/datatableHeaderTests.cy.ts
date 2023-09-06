import { IColumnMetadata } from "../../../store/modules/tableData/tableDataModule";
import DatatableHeader from "../datatableHeader.vue";
import "../../../assets/styles/global.scss";
import { cypressMount } from "../../../cypress/cypressCommands";
import {
  IDatatableSortObject,
  SortOrderOption,
} from "cloudconLibrary/api/databaseWebApi";

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

const sortProp: IDatatableSortObject[] = [
  {
    field: "name",
    order: SortOrderOption.ASCENDING,
  },
  {
    field: "enddate",
    order: SortOrderOption.DESCENDING,
  },
];

describe("Datatable Header", () => {
  function mountDatatableHeader(
    enableRowExpansion = true,
    enableRowSelection = true,
    allRowsSelected = false
  ) {
    cy.mount(DatatableHeader, {
      props: {
        columns: columnsProp,
        enableRowExpansion: enableRowExpansion,
        enableRowSelection: enableRowSelection,
        allRowsSelected: allRowsSelected,
        sort: sortProp,
      },
    });
  }

  before(() => {
    cypressMount();
  });

  it("Mounts", () => {
    mountDatatableHeader();
  });

  it("Shows table header labels", () => {
    mountDatatableHeader();

    cy.get(".datatable-header-cell-content-label").each((e, index) => {
      expect(e).to.contain(columnsProp[index]?.Label);
    });
  });
});
