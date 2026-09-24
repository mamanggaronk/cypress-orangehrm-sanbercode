class LoginPage {
  // Elements & Selectors
  elements = {
    usernameInput: () => cy.get('input[name="username"]'),
    passwordInput: () => cy.get('input[name="password"]'),
    loginButton: () => cy.get('button[type="submit"]'),
    forgotPasswordLink: () => cy.get('.orangehrm-login-forgot'),
    alertErrorMessage: () => cy.get('.oxd-alert-content-text'),
    fieldErrorMessage: () => cy.get('.oxd-input-field-error-message'),
    dashboardHeader: () => cy.get('.oxd-topbar-header-title'),
    resetPasswordHeader: () => cy.get('.orangehrm-forgot-password-title'),
    resetPasswordButton: () => cy.get('.orangehrm-forgot-password-button--reset')
  };

  // Actions
  visitLoginPage() {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  }

  inputUsername(username) {
    this.elements.usernameInput()
      .should('be.visible')
      .clear()
      .type(username);
  }

  inputPassword(password) {
    this.elements.passwordInput()
      .should('be.visible')
      .clear()
      .type(password);
  }

  clickLogin() {
    this.elements.loginButton().click();
  }

  clickForgotPassword() {
    cy.contains('p', 'Forgot your password?').should('be.visible').click();
  }

  clickResetPassword() {
    cy.get('button[type="submit"]').should('be.visible').click();
  }

  visitLoginPage() {
  cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', {
    timeout: 120000,
    failOnStatusCode: false
  });
  // Pastikan form username langsung dicek kehadirannya
  cy.get('input[name="username"]', { timeout: 30000 }).should('be.visible');
}
  }

export default new LoginPage();

