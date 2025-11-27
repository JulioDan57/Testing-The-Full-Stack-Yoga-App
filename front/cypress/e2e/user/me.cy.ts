describe('User Account (Mocked)', () => {

  beforeEach(() => {
    cy.viewport(1280, 720);

    // Mock session
    cy.setSession();

    // Intercepts AVANT cy.visit()
    cy.intercept('GET', '/api/user/1', {
      id: 1,
      firstName: 'Yoga',
      lastName: 'Studio',
      email: 'yoga@studio.com',
      admin: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-05'
    }).as('mockUser');

    cy.intercept('DELETE', '/api/user/1', { statusCode: 200 })
      .as('mockDelete');

    // Page protégée
    cy.visit('/me');
    cy.wait('@mockUser'); // garantit que l'UI est prête
  });

  it('should display user info', () => {
    cy.contains('h1', 'User information').should('be.visible');
    cy.contains('Yoga').should('exist');
    cy.contains('STUDIO').should('exist');
    cy.contains('yoga@studio.com').should('exist');
  });

  it('should delete user account', () => {
    cy.contains('Detail').click();

    cy.wait('@mockDelete')
      .its('response.statusCode')
      .should('eq', 200);

    // Vérifie que la navigation a bien eu lieu
    cy.url().should('eq', 'http://localhost:4200/');
  });

});
