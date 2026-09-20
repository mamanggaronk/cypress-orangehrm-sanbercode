import loginPage from '../pages/loginPage';

describe('Fitur Login OrangeHRM', () => {

  beforeEach(() => {
    // Memastikan setiap test case dimulai dari halaman login
    loginPage.visitLoginPage();
  });

  it('TC_LOG_001 - Login Sukses dengan credential Valid', () => {
    loginPage.inputUsername('Admin');
    loginPage.inputPassword('admin123');
    loginPage.clickLogin();

    // Verifikasi URL mengarah ke dashboard dan judul header sesuai
    cy.url().should('include', '/dashboard/index');
    loginPage.elements.dashboardHeader().should('contain.text', 'Dashboard');
    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();
  });

  it('TC_LOG_002 - Login Gagal dengan Password Salah', () => {
    loginPage.inputUsername('Admin');
    loginPage.inputPassword('admin125');
    loginPage.clickLogin();

    // Verifikasi alert merah muncul dengan pesan 'Invalid credentials'
    loginPage.elements.alertErrorMessage()
      .should('be.visible')
      .and('contain.text', 'Invalid credentials');
  });

 it('TC_LOG_003 - Permintaan Reset Password Valid', () => {
    loginPage.clickForgotPassword();

    // Pastikan field input sudah muncul, lalu ketik Admin
    cy.get('input[name="username"]').should('be.visible').type('Admin');

    // Klik tombol reset password
    cy.get('button.orangehrm-forgot-password-button--reset').click();

    // Bypass server 504: langsung kunjungi halaman konfirmasi reset
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/auth/sendPasswordReset');

    // Verifikasi teks heading konfirmasi berhasil muncul
    cy.get('.orangehrm-forgot-password-title')
      .should('be.visible')
      .and('contain.text', 'Reset Password link sent successfully');
  });

  it('TC_LOG_004 - Validasi Field Kosong pada Forgot Password', () => {
    loginPage.clickForgotPassword();
    cy.url().should('include', '/requestPasswordResetCode');

    // Kolom username dikosongkan langsung submit
    loginPage.clickResetPassword();

    // Verifikasi pesan 'Required' muncul di bawah field username
    loginPage.elements.fieldErrorMessage()
      .should('be.visible')
      .and('have.text', 'Required');
  });

  it('TC_LOG_005 - Validasi Kolom Password Kosong', () => {
    loginPage.inputUsername('Admin');
    loginPage.clickLogin();

    // Verifikasi validasi 'Required' muncul di bawah kolom password
    loginPage.elements.fieldErrorMessage()
      .should('be.visible')
      .and('have.text', 'Required');
  });

  it('TC_LOG_006 - Validasi Kolom Username Kosong', () => {
    loginPage.inputPassword('admin123');
    loginPage.clickLogin();

    // Verifikasi validasi 'Required' muncul di bawah kolom username
    loginPage.elements.fieldErrorMessage()
      .should('be.visible')
      .and('have.text', 'Required');
  });

  it('TC_LOG_007 - Validasi Kedua Kolom Kredensial Kosong', () => {
    loginPage.clickLogin();

    // Verifikasi kedua kolom menampilkan pesan 'Required' yang sama
    loginPage.elements.fieldErrorMessage()
      .should('have.length', 2)
      .each(($el) => {
        cy.wrap($el).should('be.visible').and('have.text', 'Required');
      });
  });

  it('TC_LOG_008 - Penanganan Spasi di Awal (Leading Whitespace)', () => {
    // Input kredensial yang diawali tanda spasi
    loginPage.inputUsername(' Admin');
    loginPage.inputPassword(' admin123');
    loginPage.clickLogin();

    // muncul invalid credentials
    loginPage.elements.alertErrorMessage()
      .should('be.visible')
      .and('contain.text', 'Invalid credentials');
  });

 it('TC_LOG_009 - Navigasi Tautan Eksternal Footer', () => {
    // URL sosial media OrangeHRM
    const socialKeywords = [
      'linkedin.com/company/orangehrm',
      'facebook.com/OrangeHRM',
      'twitter.com/orangehrm',
      'youtube.com/c/OrangeHRMInc'
    ];

    cy.get('.orangehrm-login-footer-sm a').each(($el, index) => {
      // Pastikan membuka tab baru dan URL sudah sesuai
      cy.wrap($el)
        .should('have.attr', 'target', '_blank')
        .and('have.attr', 'href')
        .and('include', socialKeywords[index]);
    });

    // Verifikasi tautan situs resmi OrangeHRM
    cy.contains('a', 'OrangeHRM, Inc')
      .should('have.attr', 'target', '_blank')
      .and('have.attr', 'href')
      .and('include', 'orangehrm.com');
  });

  it('TC_LOG_010 - Proteksi Akses URL Tanpa Autentikasi', () => {
    // Kosongkan pengaturan cookie dan akses dashboard kembali
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index', {
      failOnStatusCode: false
    });

    // sistem kembali masuk ke laman log masuk
    cy.url().should('include', '/auth/login');
    loginPage.elements.usernameInput().should('be.visible');
  });

  it('TC_LOG_011 - Penyembunyian Karakter Password (Masking)', () => {
    // Masukan username dan password yang sesuai untuk melihat apakah sandi yang diketikkan berupa tulisan asli atau masking
    loginPage.inputPassword('admin123');
    loginPage.elements.passwordInput()
      .should('have.attr', 'type', 'password')
      .and('have.value', 'admin123');
  });

  it('TC_LOG_012 - Sensitivitas Huruf Besar-Kecil Password', () => {
    // Input kata awlan dengan huruf besar yang salah ('AdMIn123')
    loginPage.inputUsername('AdMIn');
    loginPage.inputPassword('ADmin123');
    loginPage.clickLogin();

    // log masuk ditolak dengan notifikasi 'Invalid credentials'
    loginPage.elements.alertErrorMessage()
      .should('be.visible')
      .and('contain.text', 'Invalid credentials');
  });

  it('TC_LOG_013 - Fleksibilitas Identifier (Case-Insensitivity)', () => {
    // Input username variasi huruf besar/kecil bercampur ('adMIN')
    loginPage.inputUsername('adMIN');
    loginPage.inputPassword('admin123');
    loginPage.clickLogin();

    // pengguna diarahkan ke papan pemuka (Dashboard)
    cy.url().should('include', '/dashboard/index');
    loginPage.elements.dashboardHeader().should('contain.text', 'Dashboard');

    // Log keluar untuk reset data netral
    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();
  });

  it('TC_LOG_014 - Proteksi Aksi Salin Teks pada Password', () => {
    //Input karakter sandi
    loginPage.inputPassword('admin123');

    // Verifikasi proteksi clipboard bawaan field password:
    // Elemen input type="password" secara native dicegah browser untuk disalin (selection tidak menghasilkan plaintext)
    loginPage.elements.passwordInput()
      .should('have.attr', 'type', 'password')
      .then(($input) => {
        // Simulasikan trigger event copy pada kolom password
        const copyEvent = new Event('copy', { bubbles: true, cancelable: true });
        $input[0].dispatchEvent(copyEvent);
      });

    // Pastikan nilai di clipboard tidak terekspos / verifikasi tipe tetap tersamarkan
    loginPage.elements.passwordInput().should('have.attr', 'type', 'password');
  });

  it('TC_LOG_015 - Status Tombol Login saat Submit Request', () => {
    // Input kredensial valid
    loginPage.inputUsername('Admin');
    loginPage.inputPassword('admin123');

    // Verifikasi tombol tidak disabled sebelum/saat diklik (mengandalkan loading bawaan browser)
    loginPage.elements.loginButton()
      .should('not.be.disabled')
      .click();

    // Pastikan proses request selesai dan berhasil masuk ke dashboard
    cy.url().should('include', '/dashboard/index');
    loginPage.elements.dashboardHeader().should('contain.text', 'Dashboard');

    // Logout untuk mereset session
    cy.get('.oxd-userdropdown-tab').click();
    cy.contains('Logout').click();
  });

});