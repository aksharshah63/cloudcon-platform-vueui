import {
  IColumnMetadata,
  ITableRecord,
} from "../../../store/modules/tableData/tableDataModule";
import DatatableBody from "../datatableBody.vue";
import "../../../assets/styles/global.scss";
import { MenuItem } from "primevue/menuitem";
import { cypressMount } from "../../../cypress/cypressCommands";

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
    name: "equip1",
    _rowColour: "ffd4b3",
  },
  {
    id: "id2",
    name: "equip2",
  },
  {
    id: "id3",
    name: "equip3",
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

describe("Datatable Body", () => {
  before(() => {
    cypressMount();
  });

  beforeEach(() => {
    const rowClickSpy = cy.spy().as("onRowClick");
    cy.mount(DatatableBody, {
      props: {
        columns: columnsProp,
        data: dataProp,
        contextMenuOptions: contextMenuOptionsProp,
        onRowClick: rowClickSpy,
      },
    });
  });

  it("Mounts", () => {
    return;
  });

  it("Has correct number of rows", () => {
    cy.get("tr").should("have.length", 4);
  });

  it("Emits on cell click", () => {
    cy.get("td").each((e) => {
      e.trigger("click");
      cy.get("@onRowClick").should("have.been.called");
    });
  });

  it("Emits on row click", () => {
    cy.get("tr").each((e, index) => {
      e.trigger("click");
      cy.get("@onRowClick").should("have.been.calledWith", dataProp[index].id);
    });
  });

  it("Has applied custom row colour", () => {
    cy.get("tr")
      .first()
      .should("have.css", "background-color", "rgb(255, 212, 179)"); // Computed style is in rgb notation not hex
  });
});
