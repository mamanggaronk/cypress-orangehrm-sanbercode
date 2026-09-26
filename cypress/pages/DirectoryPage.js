import BasePage from './BasePage';

class DirectoryPage extends BasePage {
  get elements() {
    return {
      ...super.elements,
      pageTitle: () => cy.get('.oxd-topbar-header-title'),
      nameInput: () => cy.get('input[placeholder="Type for hints..."]'),
      autocompleteMenu: () => cy.get('.oxd-autocomplete-dropdown'),
      jobDropdown: () => cy.get('.oxd-select-text').eq(0),
      locationDropdown: () => cy.get('.oxd-select-text').eq(1),
      dropdownOptions: () => cy.get('.oxd-select-dropdown'),
      searchBtn: () => cy.get('button[type="submit"]'),
      resetBtn: () => cy.get('button[type="reset"]'),
      cards: () => cy.get('.orangehrm-directory-card'),
      cardTitle: () => cy.get('.orangehrm-directory-card-header'),
      cardSubtitle: () => cy.get('.orangehrm-directory-card-subtitle'),
      toggleFilterBtn: () => cy.get('.oxd-table-filter-header button'),
      filterBody: () => cy.get('.oxd-table-filter-area'),
      errorText: () => cy.get('.oxd-input-field-error-message'),
      emptyText: () => cy.get('.oxd-text--span')
    };
  }

  searchByName(name) {
    this.elements.nameInput().clear().type(name);
    this.elements.autocompleteMenu().should('be.visible');
    cy.contains('.oxd-autocomplete-option', name).first().click();
  }

  filterByJob(jobTitle) {
    this.elements.jobDropdown().click();
    this.elements.dropdownOptions().contains(jobTitle).click();
  }

  filterByLocation(location) {
    this.elements.locationDropdown().click();
    this.elements.dropdownOptions().contains(location).click();
  }

  submitSearch() {
    this.elements.searchBtn().click();
  }

  resetForm() {
    this.elements.resetBtn().click();
  }

  toggleFilter() {
    this.elements.toggleFilterBtn().click();
  }
}

export default new DirectoryPage();