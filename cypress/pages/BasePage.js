class BasePage {
  get elements() {
    return {
      mainMenu: () => cy.get('.oxd-main-menu'),
      menuItem: (menuName) => cy.contains('.oxd-main-menu-item', menuName),
      topbarHeaderTitle: () => cy.get('.oxd-topbar-header-title'),
      userDropdown: () => cy.get('.oxd-userdropdown-tab'),
      logoutOption: () => cy.contains('.oxd-userdropdown-link', 'Logout')
    };
  }

  navigateToMenu(menuName) {
    this.elements.menuItem(menuName).should('be.visible').click();
  }

  logout() {
    this.elements.userDropdown().should('be.visible').click();
    this.elements.logoutOption().should('be.visible').click();
  }
}

export default BasePage;