import BasePage from './BasePage';

class RecruitmentPage extends BasePage {
  get elements() {
    return {
      ...super.elements,
      pageTitle: () => cy.get('.oxd-topbar-header-title'),
      topNavTabs: () => cy.get('.oxd-topbar-body-nav-tab-item'),
      
      // Filter Elements (Candidates List)
      candidateNameInput: () => cy.get('.oxd-autocomplete-text-input input'),
      autocompleteDropdown: () => cy.get('.oxd-autocomplete-dropdown'),
      keywordsInput: () => cy.get('input[placeholder="Enter comma seperated words..."]'),
      statusDropdown: () => cy.get('.oxd-select-text').eq(3),
      dropdownOptions: () => cy.get('.oxd-select-dropdown'),
      searchBtn: () => cy.get('button[type="submit"]'),
      resetBtn: () => cy.get('button[type="reset"]'),
      
      // Table Elements
      tableRows: () => cy.get('.oxd-table-card'),
      emptyRecordText: () => cy.get('.oxd-text--span'),
      rowCheckboxes: () => cy.get('.oxd-table-card input[type="checkbox"]'),
      tableHeaderCheckbox: () => cy.get('.oxd-table-header label'),
      firstRowCheckbox: () => cy.get('.oxd-table-card label').first(),
      deleteSelectedBtn: () => cy.contains('button', /Delete Selected/i),

      // Add Candidate Elements
      addCandidateBtn: () => cy.contains('.oxd-button', 'Add'),
      firstNameInput: () => cy.get('input[name="firstName"]'),
      middleNameInput: () => cy.get('input[name="middleName"]'),
      lastNameInput: () => cy.get('input[name="lastName"]'),
      emailInput: () => cy.get('.oxd-form-row').eq(2).find('input').first(),
      contactInput: () => cy.get('.oxd-form-row').eq(2).find('input').last(),
      saveCandidateBtn: () => cy.get('button[type="submit"]'),
      cancelBtn: () => cy.contains('button', 'Cancel'),
      
      // Feedback & Validations
      fieldErrorMessages: () => cy.get('.oxd-input-field-error-message'),
      successToast: () => cy.get('.oxd-toast-content--success')
    };
  }

  switchTab(tabName) {
    this.elements.topNavTabs().contains(tabName).click();
  }

  filterByName(name) {
    this.elements.candidateNameInput().clear().type(name);
    this.elements.autocompleteDropdown().should('be.visible');
    cy.contains('.oxd-autocomplete-option', name).first().click();
  }

  filterByStatus(statusText) {
    this.elements.statusDropdown().click();
    this.elements.dropdownOptions().contains(statusText).click();
  }

  fillAddCandidateForm(candidateData) {
    this.elements.firstNameInput().clear().type(candidateData.firstName);
    if (candidateData.middleName) {
      this.elements.middleNameInput().clear().type(candidateData.middleName);
    }
    if (candidateData.lastName) {
      this.elements.lastNameInput().clear().type(candidateData.lastName);
    }
    if (candidateData.email) {
      this.elements.emailInput().clear().type(candidateData.email);
    }
    if (candidateData.contactNumber) {
      this.elements.contactInput().clear().type(candidateData.contactNumber);
    }
  }

  submitSearch() {
    this.elements.searchBtn().click();
  }

  resetFilter() {
    this.elements.resetBtn().click();
  }

}

export default new RecruitmentPage();