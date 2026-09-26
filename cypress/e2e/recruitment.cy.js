import recruitmentPage from '../pages/RecruitmentPage';
import loginPage from '../pages/loginPage';

describe('Recruitment Feature - End to End Tests (POM & Intercept)', () => {
  let recData;
  let loginData;

  before(() => {
    // Load fixtures data
    cy.fixture('recruitmentData').then((data) => {
      recData = data;
    });
    cy.fixture('loginData').then((data) => {
      loginData = data;
    });
  });

  beforeEach(() => {
    // Intercept default kandidat saat buka halaman Recruitment
    cy.intercept('GET', '**/api/v2/recruitment/candidates*').as('loadCandidates');

    // Login ke sistem
    loginPage.visitLoginPage();
    loginPage.inputUsername(loginData.validUser.username);
    loginPage.inputPassword(loginData.validUser.password);
    loginPage.clickLogin();

    // Navigasi ke menu Recruitment via BasePage
    recruitmentPage.navigateToMenu('Recruitment');
    cy.wait('@loadCandidates', { timeout: 15000 }).its('response.statusCode').should('eq', 200);
  });


  // TC 1: Akses Menu & Load Data Awal
  it('TC_REC_001 - memuat halaman utama recruitment dan daftar kandidat default', () => {
    cy.url().should('include', recData.routes.recruitmentUrl);
    recruitmentPage.elements.pageTitle().should('contain.text', recData.messages.headerTitle);
    recruitmentPage.elements.tableRows().should('have.length.at.least', 1);
  });

  // TC 2: Navigasi Tab
  it('TC_REC_002 - navigasi antar tab Candidates dan Vacancies', () => {
    cy.intercept('GET', '**/api/v2/recruitment/vacancies*').as('loadVacancies');

    // Beralih ke tab Vacancies
    recruitmentPage.switchTab('Vacancies');
    cy.wait('@loadVacancies').its('response.statusCode').should('eq', 200);
    cy.url().should('include', recData.routes.vacanciesUrl);

    // Kembali ke tab Candidates
    cy.intercept('GET', '**/api/v2/recruitment/candidates*').as('reloadCandidatesTab');
    recruitmentPage.switchTab('Candidates');
    cy.wait('@reloadCandidatesTab').its('response.statusCode').should('eq', 200);
    cy.url().should('include', recData.routes.recruitmentUrl);
  });

  // TC 3: Filter Autocomplete & Keywords
  it('TC_REC_003 - pencarian kandidat via autocomplete nama dan filter keywords', () => {
    cy.intercept('GET', '**/api/v2/recruitment/candidates*').as('filterCandidates');

    // Action: Input keywords dan cari nama kandidat
    recruitmentPage.elements.keywordsInput().clear().type(recData.search.keywords);
    recruitmentPage.submitSearch();

    cy.wait('@filterCandidates').its('response.statusCode').should('eq', 200);
    recruitmentPage.elements.tableRows().should('exist');
  });

  // TC 4: Tambah Kandidat Baru Valid
  it('TC_REC_004 - menambah kandidat baru dengan data valid', () => {
    cy.intercept('POST', '**/api/v2/recruitment/candidates').as('createCandidate');

    // Buka form Add Candidate
    recruitmentPage.elements.addCandidateBtn().click();
    cy.url().should('include', recData.routes.addCandidateUrl);

    // Bikin email unik agar tidak duplikat saat run berulang
    const uniqueEmail = `qa.${Date.now()}@example.com`;
    const candidatePayload = {
      ...recData.newCandidate,
      email: uniqueEmail
    };

    recruitmentPage.fillAddCandidateForm(candidatePayload);
    recruitmentPage.elements.saveCandidateBtn().click();

    // Assertion respon intercept dan notifikasi sukses
    cy.wait('@createCandidate').its('response.statusCode').should('eq', 200);
    recruitmentPage.elements.successToast()
      .should('be.visible')
      .and('contain.text', recData.messages.successSave);
  });



  // TC 5: Filter Empty State
  it('TC_REC_005 - filter kombinasi tanpa hasil menampilkan No Records Found', () => {
    cy.intercept('GET', '**/api/v2/recruitment/candidates*').as('emptySearch');

    // Action: Filter nama dan status yang tidak cocok
    recruitmentPage.filterByStatus(recData.search.mismatchedStatus);
    recruitmentPage.elements.keywordsInput().clear().type('NonExistentKeywordXYZ999');
    recruitmentPage.submitSearch();

    cy.wait('@emptySearch').its('response.statusCode').should('eq', 200);
    recruitmentPage.elements.emptyRecordText().should('contain.text', recData.messages.noRecords);
    recruitmentPage.elements.tableRows().should('not.exist');
  });

  // TC 6: Validasi Input Form (Required & Format Error)
  it('TC_REC_006 - validasi form tambah kandidat saat field mandatory kosong dan format invalid', () => {
    recruitmentPage.elements.addCandidateBtn().click();

    // Action: Masukkan First Name saja (kosongkan Last Name) dan format email salah
    recruitmentPage.elements.firstNameInput().clear().type(recData.invalidCandidate.firstName);
    recruitmentPage.elements.emailInput().clear().type(recData.invalidCandidate.invalidEmail);
    recruitmentPage.elements.contactInput().clear().type(recData.invalidCandidate.alphaContactNumber);

    recruitmentPage.elements.saveCandidateBtn().click();

    // Assertion: Validasi pesan error di bawah field masing-masing
    recruitmentPage.elements.fieldErrorMessages()
      .should('be.visible')
      .and('contain.text', recData.messages.required);

    recruitmentPage.elements.fieldErrorMessages()
      .should('contain.text', recData.messages.invalidEmail);

    recruitmentPage.elements.fieldErrorMessages()
      .should('contain.text', recData.messages.invalidContact);
  });


  // TC 7: Reset Filter Pencarian
  it('TC_REC_007 - fungsionalitas tombol reset mengembalikan filter dan data tabel', () => {
    cy.intercept('GET', '**/api/v2/recruitment/candidates*').as('resetCandidates');

    // Isi filter
    recruitmentPage.elements.keywordsInput().clear().type(recData.search.keywords);
    recruitmentPage.resetFilter();

    cy.wait('@resetCandidates').its('response.statusCode').should('eq', 200);

    // Assertion: Input kembali kosong dan baris tabel ter-reload
    recruitmentPage.elements.keywordsInput().invoke('val').should('be.empty');
    recruitmentPage.elements.tableRows().should('have.length.at.least', 1);
  });

  it('TC_REC_008 - interaksi seleksi baris tabel dan pembatalan form tambah', () => {
    // Klik checkbox baris pertama
    recruitmentPage.elements.firstRowCheckbox().click();
    cy.contains('button', /Delete/i).should('be.visible');

    // Masuk form Add lalu Cancel
    recruitmentPage.elements.addCandidateBtn().click();
    cy.url().should('include', recData.routes.addCandidateUrl);
    recruitmentPage.elements.cancelBtn().click();

    // Assertion kembali ke halaman tabel
    cy.url().should('include', recData.routes.recruitmentUrl);
    recruitmentPage.elements.tableRows().should('be.visible');
  });
});