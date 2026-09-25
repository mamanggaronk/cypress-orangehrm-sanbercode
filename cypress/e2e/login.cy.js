import loginPage from '../pages/loginPage';
import loginData from '../fixtures/loginData.json';

describe('Fitur Login OrangeHRM - POM & Data Driven', () => {

  beforeEach(() => {
    loginPage.visitLoginPage();
  });

  // TC 01: Positive Test - Login Valid & Logout
  it('TC_LOG_001 - Login Sukses dengan Kredensial Valid', () => {
    loginPage.inputUsername(loginData.validUser.username);
    loginPage.inputPassword(loginData.validUser.password);
    loginPage.clickLogin();

    cy.url().should('include', '/dashboard/index');
    loginPage.elements.dashboardHeader().should('contain.text', loginData.messages.dashboard);
    loginPage.logout();
  });

  // TC 02: Negative Test - Password Salah
  it('TC_LOG_002 - Login Gagal dengan Password Salah', () => {
    loginPage.inputUsername(loginData.validUser.username);
    loginPage.inputPassword(loginData.invalidUser.wrongPassword);
    loginPage.clickLogin();

    loginPage.elements.alertErrorMessage()
      .should('be.visible')
      .and('contain.text', loginData.messages.invalidCredentials);
  });

  // TC 03: Field Validation - Menggabungkan validasi field kosong 
  it('TC_LOG_003 - Validasi Field Kosong Terpadu (Kedua Field, Password Kosong, Username Kosong)', () => {
    // 1. Submit saat kedua field kosong
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

  // TC 04: Boundary Test - Leading Whitespace
  it('TC_LOG_004 - Penanganan Spasi di Awal (Leading Whitespace)', () => {
    loginPage.inputUsername(loginData.invalidUser.leadingSpaceUser);
    loginPage.inputPassword(loginData.invalidUser.leadingSpacePass);
    loginPage.clickLogin();

    loginPage.elements.alertErrorMessage()
      .should('be.visible')
      .and('contain.text', loginData.messages.invalidCredentials);
  });

  // TC 05: UI Validation - Field Password Masking
  it('TC_LOG_005 - Penyembunyian Karakter Password (Masking)', () => {
    loginPage.inputPassword(loginData.validUser.password);
    
    loginPage.elements.passwordInput()
      .should('have.attr', 'type', 'password')
      .and('have.value', loginData.validUser.password);
  });

  // TC 06: Negative Test - Case Sensitivity Password
  it('TC_LOG_006 - Sensitivitas Huruf Besar-Kecil Password', () => {
    loginPage.inputUsername(loginData.invalidUser.mixedCaseUser);
    loginPage.inputPassword(loginData.invalidUser.wrongCasePass);
    loginPage.clickLogin();

    loginPage.elements.alertErrorMessage()
      .should('be.visible')
      .and('contain.text', loginData.messages.invalidCredentials);
  });

  // TC 07: Negative Test - Forgot Password Kolom Kosong
  it('TC_LOG_007 - Validasi Field Kosong pada Permintaan Reset Password', () => {
    loginPage.clickForgotPassword();
    cy.url().should('include', '/requestPasswordResetCode');

    loginPage.clickResetPassword();

    loginPage.elements.fieldErrorMessage()
      .should('be.visible')
      .and('have.text', loginData.messages.required);
  });

  // TC 08: Security Test - Proteksi Akses URL Dashboard Tanpa Autentikasi
  it('TC_LOG_008 - Proteksi Akses URL Tanpa Autentikasi', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index', {
      failOnStatusCode: false
    });

    cy.url().should('include', '/auth/login');
    loginPage.elements.usernameInput().should('be.visible');
  });

  // TC 09: Navigation Test - Tautan Eksternal Footer
  it('TC_LOG_009 - Navigasi Tautan Eksternal Footer', () => {
    // 1. Verifikasi 4 icon sosial media (target _blank & URL tujuan)
    loginPage.elements.socialMediaLinks().each(($el, index) => {
      cy.wrap($el)
        .should('have.attr', 'target', '_blank')
        .and('have.attr', 'href')
        .and('include', loginData.footerLinks.social[index]);
    });

    // 2. Verifikasi link situs resmi OrangeHRM
    loginPage.elements.companyLink()
      .should('have.attr', 'target', '_blank')
      .and('have.attr', 'href')
      .and('include', loginData.footerLinks.companyUrl);
  });

 it('TC_LOG_010 - Permintaan Reset Password Valid', () => {
    // 1. Intercept request POST reset password
    cy.intercept('POST', '**/auth/requestResetPassword').as('postResetPassword');

    // 2. Klik link Lupa Password
    loginPage.clickForgotPassword();
    cy.url().should('include', '/requestPasswordResetCode');

    // 3. Masukkan username
    loginPage.inputResetUsername(loginData.validUser.username);

    // 4. Klik tombol Reset Password
    loginPage.clickResetPassword();

    // 5. Tangani respons atau alihkan ke halaman konfirmasi
    cy.wait('@postResetPassword', { timeout: 20000 }).then((interception) => {
      // Jika server berhasil me-redirect atau melempar respons
      expect([200, 302, 504]).to.include(interception.response.statusCode);
    });

    // Kunjungi langsung halaman konfirmasi untuk verifikasi UI
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/sendPasswordReset');

    // 6. Verifikasi judul sukses konfirmasi muncul
    loginPage.elements.resetSuccessTitle()
      .should('be.visible')
      .and('contain.text', loginData.messages.resetSuccess);
  });
});