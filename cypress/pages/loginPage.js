class LoginPage {
  elements = {
    usernameInput: () => cy.get('input[name="username"]'),
    passwordInput: () => cy.get('input[name="password"]'),
    loginButton: () => cy.get('button[type="submit"]'),
    forgotPasswordLink: () => cy.get('.orangehrm-login-forgot'),
    alertErrorMessage: () => cy.get('.oxd-alert-content-text'),
    fieldErrorMessage: () => cy.get('.oxd-input-field-error-message'),
    dashboardHeader: () => cy.get('.oxd-topbar-header-title'),
    
    
    resetPasswordInput: () => cy.get('input[name="username"]'),
    resetPasswordButton: () => cy.get('button.orangehrm-forgot-password-button--reset'),
    resetSuccessTitle: () => cy.get('.orangehrm-forgot-password-title'),
    userDropdown: () => cy.get('.oxd-userdropdown-tab'),
    logoutOption: () => cy.contains('.oxd-userdropdown-link', 'Logout'),
    socialMediaLinks: () => cy.get('.orangehrm-login-footer-sm a'),
    companyLink: () => cy.contains('a', 'OrangeHRM, Inc')
  };

  visitLoginPage() {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', {
      timeout: 120000,
      failOnStatusCode: false
    });
    this.elements.usernameInput().should('be.visible');
  }

  inputUsername(username) {
    this.elements.usernameInput().should('be.visible').clear().type(username);
  }

  inputPassword(password) {
    this.elements.passwordInput().should('be.visible').clear().type(password);
  }

  clickLogin() {
    this.elements.loginButton().should('be.visible').click();
  }

  clickForgotPassword() {
    this.elements.forgotPasswordLink().should('be.visible').click();
  }

  inputResetUsername(username) {
    this.elements.resetPasswordInput().should('be.visible').clear().type(username);
  }

  clickResetPassword() {
    this.elements.resetPasswordButton().should('be.visible').click();
  }

  logout() {
    this.elements.userDropdown().should('be.visible').click();
    this.elements.logoutOption().should('be.visible').click();
  }
}

export default new LoginPage();