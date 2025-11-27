describe('404 page (Mocked)', () => {
  it('should display 404', () => {
    cy.visit('/unknown-page', { failOnStatusCode: false });
    cy.contains('Page not found !').should('exist');
  });
});
