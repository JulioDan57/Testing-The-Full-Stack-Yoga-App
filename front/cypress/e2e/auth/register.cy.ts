describe('Register (Mocked)', () => {

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/register');
  });

  it('should register a new user (mock)', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: { id: 99 }
    }).as('mockRegister');

    cy.get('input[formControlName=firstName]').type('Toto');
    cy.get('input[formControlName=lastName]').type('Tutu');
    cy.get('input[formControlName=email]').type('toto@tutu.com');
    cy.get('input[formControlName=password]').type('Test!1234');

    cy.get('button[type=submit]').should('not.be.disabled').click();

    cy.wait('@mockRegister');
    cy.url().should('include', '/login');
  });

  it('should display error when register fails (mock)', () => {
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: { message: 'Error creating user' }
    }).as('mockRegister');

    cy.get('input[formControlName=firstName]').type('Fail');
    cy.get('input[formControlName=lastName]').type('User');
    cy.get('input[formControlName=email]').type('fail@user.com');
    cy.get('input[formControlName=password]').type('fail123');

    cy.get('button[type=submit]').should('not.be.disabled').click();

    cy.wait('@mockRegister');
    cy.contains('An error occurred').should('exist');
  });

  it('should disable submit button when form is invalid', () => {
    // Champs vides
    cy.get('button[type=submit]').should('be.disabled');

    // Remplir uniquement un champ
    cy.get('input[formControlName=firstName]').type('Toto');
    cy.get('button[type=submit]').should('be.disabled');

    // Remplir tous les champs
    cy.get('input[formControlName=lastName]').type('Tutu');
    cy.get('input[formControlName=email]').type('toto@tutu.com');
    cy.get('input[formControlName=password]').type('Test!1234');
    cy.get('button[type=submit]').should('not.be.disabled');
  });

  it('should enforce minLength and maxLength validation', () => {
    // First name trop court
    cy.get('input[formControlName=firstName]').type('A');
    cy.get('button[type=submit]').should('be.disabled');

    // Last name trop long
    cy.get('input[formControlName=firstName]').clear().type('Toto');
    cy.get('input[formControlName=lastName]').type('L'.repeat(25));
    cy.get('button[type=submit]').should('be.disabled');

    // Password trop court
    cy.get('input[formControlName=lastName]').clear().type('Tutu');
    cy.get('input[formControlName=password]').type('12');
    cy.get('button[type=submit]').should('be.disabled');

    // Champs valides
    cy.get('input[formControlName=password]').clear().type('Test!1234');
    cy.get('input[formControlName=email]').type('toto@tutu.com'); // <--- ajouté
    cy.get('button[type=submit]').should('not.be.disabled');
  });


  it('should handle server error gracefully', () => {
    cy.intercept('POST', '/api/auth/register', { statusCode: 500 }).as('mockRegisterError');

    cy.get('input[formControlName=firstName]').type('Toto');
    cy.get('input[formControlName=lastName]').type('Tutu');
    cy.get('input[formControlName=email]').type('toto@tutu.com');
    cy.get('input[formControlName=password]').type('Test!1234');

    cy.get('button[type=submit]').click();
    cy.wait('@mockRegisterError');

    cy.contains(/error/i).should('exist');
  });
});
