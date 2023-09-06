import Paginator from "../paginator.vue";
import "../../../assets/styles/global.scss";
import { cypressMount } from "../../../cypress/cypressCommands";

function checkFirstPageButton(enabled: boolean): void {
  if (enabled) {
    cy.get(".paginator-navigation-first.pointer")
      .should("exist")
      .should("not.be.disabled");
  } else {
    cy.get(".paginator-navigation-first")
      .not(".pointer")
      .should("exist")
      .should("be.disabled");
  }
}

function checkPreviousPageButton(enabled: boolean): void {
  if (enabled) {
    cy.get(".paginator-navigation-previous.pointer")
      .should("exist")
      .should("not.be.disabled");
  } else {
    cy.get(".paginator-navigation-previous")
      .not(".pointer")
      .should("exist")
      .should("be.disabled");
  }
}

function checkNextPageButton(enabled: boolean): void {
  if (enabled) {
    cy.get(".paginator-navigation-next.pointer")
      .should("exist")
      .should("not.be.disabled");
  } else {
    cy.get(".paginator-navigation-next")
      .not(".pointer")
      .should("exist")
      .should("be.disabled");
  }
}

function checkLastPageButton(enabled: boolean): void {
  if (enabled) {
    cy.get(".paginator-navigation-last.pointer")
      .should("exist")
      .should("not.be.disabled");
  } else {
    cy.get(".paginator-navigation-last")
      .not(".pointer")
      .should("exist")
      .should("be.disabled");
  }
}

function checkItemsPerPageLabel(label: string): void {
  cy.get(".paginator-current-items-label")
    .contains(label);
}

function checkItemPerPageDropdown(itemsPerPage: number): void {
  cy.get(".paginator-items-per-page .p-dropdown-label")
    .contains(itemsPerPage);
}

function checkPageIsSelected(pageNumber: number): void {
  cy.get(".paginator-navigation-page.selected-page")
    .should('have.length', 1)
    .should("be.disabled")
    .find(".paginator-navigation-page-label")
    .contains(pageNumber);
}

describe("Paginator", () => {
  before (() => {
    cypressMount();
  });

  beforeEach(() => {
    const updateItemsPerPageSpy = cy.spy().as("onUpdateItemsPerPageSpy");
    
    cy.mount(Paginator, { props:
      {
        numberOfItems: 200,
        itemsPerPage: 10,
        'onUpdate:itemsPerPage': updateItemsPerPageSpy,
      }
    });
  });

  it("Mounts", () => {});

  it("Shows items per page label", () => {   
    cy.contains("Items per page");
  });
  
  it("Shows correct items per page in dropdown", () => {   
    checkItemPerPageDropdown(10);
  });

  it("Shows correct current items", () => {
    checkItemsPerPageLabel("1-10 of 200");
  });

  it("Previous and first page are disabled when first page is selected", () => {
    checkFirstPageButton(false);
    checkPreviousPageButton(false);
  });

  it("First page is selected and disabled", () => {
    checkPageIsSelected(1);
  });

  it("Click on page 3", () => {
    cy.get(".paginator-navigation-page")
      .eq(2)
      .click();
    
    // Check page 3 is selected and no other page is selected
    checkPageIsSelected(3)

    // Check first, previous, next and last buttons are enabled
    checkFirstPageButton(true);
    checkPreviousPageButton(true);
    checkNextPageButton(true);
    checkLastPageButton(true);

    // Check current items label is correct
    checkItemsPerPageLabel("21-30 of 200");
  });

  it("Click on next page (navigates to page 2)", () => {
    cy.get(".paginator-navigation-next")
      .click();
    
    // Check page 2 is selected and no other page is selected
    checkPageIsSelected(2);

    // Check first, previous, next and last buttons are enabled
    checkFirstPageButton(true);
    checkPreviousPageButton(true);
    checkNextPageButton(true);
    checkLastPageButton(true);

    // Check current items label is correct
    checkItemsPerPageLabel("11-20 of 200");
  });

  it("Click on last page (navigates to page 20)", () => {
    cy.get(".paginator-navigation-last")
      .click();
    
    // Check page 20 is selected and no other page is selected
    checkPageIsSelected(20);
    
    // Check first and previous buttons are enabled and next and last buttons are disabled
    checkFirstPageButton(true);
    checkPreviousPageButton(true);
    checkNextPageButton(false);
    checkLastPageButton(false);

    // Check current items label is correct
    checkItemsPerPageLabel("191-200 of 200");
  });

  it("Click on next page twice and then previous page (navigates to page 2)", () => {
    cy.get(".paginator-navigation-next")
      .click()
      .click();
    
    cy.get(".paginator-navigation-previous")
      .click();
    
    // Check page 2 is selected and no other page is selected
    checkPageIsSelected(2);

    // Check first, previous, next and last buttons are enabled
    checkFirstPageButton(true);
    checkPreviousPageButton(true);
    checkNextPageButton(true);
    checkLastPageButton(true);

    // Check current items label is correct
    checkItemsPerPageLabel("11-20 of 200");
  });

  it("Click on last page and then first page (navigates back to page 1)", () => {
    cy.get(".paginator-navigation-last")
      .click();
    
    cy.get(".paginator-navigation-first")
      .click();
    
    // Check page 1 is selected and no other page is selected
    checkPageIsSelected(1);

    // Check first and previous buttons are disabled and next and last buttons are enabled
    checkFirstPageButton(false);
    checkPreviousPageButton(false);
    checkNextPageButton(true);
    checkLastPageButton(true);

    // Check current items label is correct
    checkItemsPerPageLabel("1-10 of 200");
  });

  it("Change items per page to 50", () => {
    cy.get(".paginator-items-per-page")
      .click();
    
    cy.get('.p-dropdown-item[aria-label="50"]')
      .click();

    cy.get("@onUpdateItemsPerPageSpy").should("have.been.calledWith", 50);
  });
});