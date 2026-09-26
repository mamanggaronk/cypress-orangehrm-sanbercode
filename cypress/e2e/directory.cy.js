import directoryPage from '../pages/DirectoryPage';
import loginPage from '../pages/loginPage';

describe('Directory Feature - End to End Tests', () => {
  let dirData;
  let loginData;

  before(() => {
    cy.fixture('directoryData').then((d) => (dirData = d));
    cy.fixture('loginData').then((l) => (loginData = l));
  });

  beforeEach(() => {
    cy.intercept('GET', '**/api/v2/directory/employees*').as('loadDirectory');

    loginPage.visitLoginPage();
    loginPage.inputUsername(loginData.validUser.username);
    loginPage.inputPassword(loginData.validUser.password);
    loginPage.clickLogin();

    directoryPage.navigateToMenu('Directory');
    cy.wait('@loadDirectory').its('response.statusCode').should('eq', 200);
  });

  // TC 1: Initial Load
  it('TC_DIR_001 - memuat daftar direktori secara default', () => {
    cy.url().should('include', dirData.routes.directoryUrl);
    directoryPage.elements.pageTitle().should('contain.text', dirData.messages.headerTitle);
    directoryPage.elements.cards().should('have.length.at.least', 1);
  });

  // TC 2: Autocomplete
  it('TC_DIR_002 - pencarian nama karyawan lewat saran autocomplete', () => {
    cy.intercept('GET', '**/api/v2/directory/employees*').as('filterName');

    directoryPage.searchByName(dirData.search.employeeName);
    directoryPage.submitSearch();

    cy.wait('@filterName').its('response.statusCode').should('eq', 200);
    directoryPage.elements.cardTitle().first().should('contain.text', dirData.search.employeeName);
  });

  // TC 3: Dropdown Job & Location
  it('TC_DIR_003 - pencarian via filter dropdown job title dan lokasi', () => {
    cy.intercept('GET', '**/api/v2/directory/employees*').as('filterJob');
    directoryPage.filterByJob(dirData.search.jobTitle);
    directoryPage.submitSearch();
    cy.wait('@filterJob');
    directoryPage.elements.cardSubtitle().first().should('contain.text', dirData.search.jobTitle);

    cy.intercept('GET', '**/api/v2/directory/employees*').as('filterLoc');
    directoryPage.filterByLocation(dirData.search.location);
    directoryPage.submitSearch();
    cy.wait('@filterLoc');
    directoryPage.elements.cards().should('be.visible');
  });

  // TC 4: Multi Filter
  it('TC_DIR_004 - filter kombinasi nama, jabatan, dan lokasi', () => {
    cy.intercept('GET', '**/api/v2/directory/employees*').as('multiSearch');

    directoryPage.searchByName(dirData.search.employeeName);
    directoryPage.filterByJob(dirData.search.jobTitle);
    directoryPage.submitSearch();

    cy.wait('@multiSearch').its('response.statusCode').should('eq', 200);
    directoryPage.elements.cards().should('exist');
  });

  // TC 5: Empty State via Stub
  it('TC_DIR_005 - respons kosong menampilkan No Records Found', () => {
    cy.intercept('GET', '**/api/v2/directory/employees*', { fixture: 'directoryEmployeesStub.json' }).as('getEmpty');

    directoryPage.submitSearch();
    cy.wait('@getEmpty');

    directoryPage.elements.emptyText().should('contain.text', dirData.messages.noRecords);
    directoryPage.elements.cards().should('not.exist');
  });

  // TC 6: Validasi Input Invalid
  it('TC_DIR_006 - input nama acak menampilkan pesan validasi error', () => {
    directoryPage.elements.nameInput().clear().type(dirData.search.invalidName);
    directoryPage.submitSearch();

    directoryPage.elements.errorText().should('be.visible').and('contain.text', dirData.messages.invalid);
  });


  // TC 7: Reset Filter
  it('TC_DIR_007 - tombol reset mengembalikan form dan list karyawan', () => {
    cy.intercept('GET', '**/api/v2/directory/employees*').as('reloadEmployees');

    // 1. Ketik nilai pencarian
    directoryPage.elements.nameInput().clear().type(dirData.search.invalidName);
    
    // 2. Klik tombol Reset
    directoryPage.resetForm();

    // 3. Tunggu API reload data default terpanggil
    cy.wait('@reloadEmployees', { timeout: 15000 }).its('response.statusCode').should('eq', 200);

    // 4. Assertion: Verifikasi input dikosongkan menggunakan invoke('val')
    directoryPage.elements.nameInput().invoke('val').should('be.empty');

    // 5. Pastikan kartu karyawan kembali muncul utuh
    directoryPage.elements.cards().should('have.length.at.least', 1);
  });
 // TC 8: UI Interaction & Collapse
  it('TC_DIR_008 - interaksi toggle collapse panel filter direktori', () => {
    // 1. Klik toggle untuk menyembunyikan form filter
    directoryPage.toggleFilter();
    directoryPage.elements.filterBody().should('not.be.visible');

    // 2. Klik toggle kembali untuk menampilkan form filter
    directoryPage.toggleFilter();
    directoryPage.elements.filterBody().should('be.visible');
  });
});