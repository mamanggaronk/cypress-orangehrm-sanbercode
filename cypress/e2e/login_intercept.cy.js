import loginPage from '../pages/loginPage';
import loginData from '../fixtures/loginData.json';

describe('OrangeHRM Login & Dashboard Validation with API Intercepts', () => {

  beforeEach(() => {
    loginPage.visitLoginPage();
  });

  // TC 01: Login Valid & Verifikasi Endpoint Action Summary
  it('TC_INT_001 - Login Valid & Verifikasi Action-Summary API', () => {
    cy.intercept('GET', '**/dashboard/employees/action-summary').as('getActionSummary');

    loginPage.inputUsername(loginData.validUser.username);
    loginPage.inputPassword(loginData.validUser.password);
    loginPage.clickLogin();

    cy.wait('@getActionSummary').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    loginPage.elements.dashboardHeader().should('contain.text', 'Dashboard');
    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();
  });

  it('TC_INT_002 - Login Gagal (Password Salah) & Verifikasi Pesan i18n', () => {
    // Pasang intercept SEBELUM refresh/visit agar menangkap request bahasa dari awal
    cy.intercept('GET', '**/core/i18n/messages*').as('getI18nMessages');
    loginPage.visitLoginPage();

    cy.wait('@getI18nMessages', { timeout: 15000 }).then((interception) => {
      expect([200, 304]).to.include(interception.response.statusCode);
    });

    loginPage.inputUsername(loginData.validUser.username);
    loginPage.inputPassword(loginData.invalidUser.wrongPassword);
    loginPage.clickLogin();

    loginPage.elements.alertErrorMessage()
      .should('be.visible')
      .and('contain.text', loginData.messages.invalidCredentials);
  });

  it('TC_INT_003 - Validasi Field Kosong Terpadu & Intercept Event', () => {
    cy.intercept('POST', '**/events/push').as('pushEvents');

    // 1. Submit saat kedua kolom kosong
    loginPage.clickLogin();
    loginPage.elements.fieldErrorMessage().should('have.length', 2).each(($el) => {
      cy.wrap($el).should('be.visible').and('have.text', loginData.messages.required);
    });

    // 2. Submit saat password kosong
    loginPage.inputUsername(loginData.validUser.username);
    loginPage.clickLogin();
    loginPage.elements.fieldErrorMessage().should('have.length', 1).and('have.text', loginData.messages.required);

    // 3. Submit saat username kosong
    loginPage.elements.usernameInput().clear();
    loginPage.inputPassword(loginData.validUser.password);
    loginPage.clickLogin();
    loginPage.elements.fieldErrorMessage().should('have.length', 1).and('have.text', loginData.messages.required);
  });

  // TC 04: Navigasi Lupa Password & Verifikasi Endpoint Request Reset
  it('TC_INT_004 - Intercept Endpoint Request Reset Password', () => {
    cy.intercept('GET', '**/core/i18n/messages').as('getResetMessages');

    loginPage.clickForgotPassword();
    cy.url().should('include', '/auth/requestPasswordResetCode');

    cy.wait('@getResetMessages').then((interception) => {
      expect([200, 304]).to.include(interception.response.statusCode);
    });

    cy.get('.orangehrm-forgot-password-title').should('contain.text', 'Reset Password');
  });

  // TC 05: Login Valid & Verifikasi Endpoint Time-At-Work
  it('TC_INT_005 - Login Valid & Verifikasi Time-At-Work API', () => {
    cy.intercept('GET', '**/dashboard/employees/time-at-work*').as('getTimeAtWork');

    loginPage.inputUsername(loginData.validUser.username);
    loginPage.inputPassword(loginData.validUser.password);
    loginPage.clickLogin();

    cy.wait('@getTimeAtWork').then((interception) => {
      expect([200, 304]).to.include(interception.response.statusCode);
    });

    loginPage.elements.dashboardHeader().should('contain.text', 'Dashboard');
    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();
  });

  // TC 06: Login Valid & Verifikasi Endpoint Shortcuts
  it('TC_INT_006 - Login Valid & Verifikasi Shortcuts API', () => {
    cy.intercept('GET', '**/dashboard/shortcuts').as('getShortcuts');

    loginPage.inputUsername(loginData.validUser.username);
    loginPage.inputPassword(loginData.validUser.password);
    loginPage.clickLogin();

    cy.wait('@getShortcuts').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.url().should('include', '/dashboard/index');
    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();
  });

  // TC 07: Login Valid & Verifikasi Endpoint Leaves
  it('TC_INT_007 - Login Valid & Verifikasi Leaves API', () => {
    cy.intercept('GET', '**/leaves*').as('getLeaves');

    loginPage.inputUsername(loginData.validUser.username);
    loginPage.inputPassword(loginData.validUser.password);
    loginPage.clickLogin();

    cy.wait('@getLeaves', { timeout: 15000 }).then((interception) => {
      expect([200, 304]).to.include(interception.response.statusCode);
    });

    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();
  });

  // TC 08: Login Valid & Verifikasi Endpoint Subunit Organisasi
  it('TC_INT_008 - Login Valid & Verifikasi Subunit API', () => {
    cy.intercept('GET', '**/dashboard/employees/subunit').as('getSubunit');

    loginPage.inputUsername(loginData.validUser.username);
    loginPage.inputPassword(loginData.validUser.password);
    loginPage.clickLogin();

    cy.wait('@getSubunit').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();
  });

  // TC 09: Login Valid & Verifikasi Endpoint Locations
  it('TC_INT_009 - Login Valid & Verifikasi Locations API', () => {
    cy.intercept('GET', '**/dashboard/employees/locations').as('getLocations');

    loginPage.inputUsername(loginData.validUser.username);
    loginPage.inputPassword(loginData.validUser.password);
    loginPage.clickLogin();

    cy.wait('@getLocations').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();
  });

  // TC 10: Validasi Logout & Intercept Request Session Logout
  it('TC_INT_010 - Intercept Endpoint Logout Sesi', () => {
    cy.intercept('GET', '**/auth/logout').as('getLogout');

    loginPage.inputUsername(loginData.validUser.username);
    loginPage.inputPassword(loginData.validUser.password);
    loginPage.clickLogin();

    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();

    cy.wait('@getLogout').then((interception) => {
      expect(interception.response.statusCode).to.eq(302);
    });

    cy.url().should('include', '/auth/login');
  });

  // TC 11: Validasi Reset Password Saat Kolom Username Kosong (Negative Test)
  it('TC_INT_011 - Reset Password Gagal (Username Kosong) & Validasi Field Required', () => {
    // Intercept pemanggilan data halaman reset password
    cy.intercept('GET', '**/core/i18n/messages*').as('getResetPageMessages');

    // 1. Masuk ke halaman Forgot Password
    loginPage.clickForgotPassword();
    cy.url().should('include', '/auth/requestPasswordResetCode');

    // 2. Verifikasi API pesan UI berhasil dimuat
    cy.wait('@getResetPageMessages', { timeout: 15000 }).then((interception) => {
      expect([200, 304]).to.include(interception.response.statusCode);
    });

    // 3. Langsung klik tombol Reset Password tanpa mengisi username
    cy.get('button.orangehrm-forgot-password-button--reset').click();

    // 4. Verifikasi validasi client-side: muncul pesan "Required"
    cy.get('.oxd-input-field-error-message')
      .should('be.visible')
      .and('have.text', loginData.messages.required);

    // 5. Pastikan URL tetap di halaman reset (tidak diproses ke endpoint reset)
    cy.url().should('include', '/auth/requestPasswordResetCode');
  });

});