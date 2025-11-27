describe('Sessions list (Mocked)', () => {

  beforeEach(() => {
    cy.viewport(1280, 720);

    // Mock sessionStorage pour simuler un admin loggé
    const adminUser = {
      token: 'abc',
      type: 'Bearer',
      id: 1,
      username: 'admin',
      firstName: 'John',
      lastName: 'Doe',
      admin: true
    };

    cy.window().then(win => {
      win.sessionStorage.setItem('sessionInformation', JSON.stringify(adminUser));
    });

    // Mock API /api/session
    cy.intercept('GET', '/api/session', [
      {
        id: 1,
        name: 'Yoga morning',
        description: 'Morning session',
        date: '2025-01-01',
        users: []
      }
    ]).as('mockList');

    cy.visit('/sessions');
  });

  it('should display sessions from API mock', () => {
    cy.wait('@mockList');

    // Vérifie que la card s'affiche
    cy.contains('Yoga morning').should('exist');
    cy.contains('Session on').should('exist');

    // Vérifie le bouton Detail
    cy.contains('Detail').should('exist');
  });

  it('admin should see create button', () => {
    cy.contains('Create').should('exist');
  });
});
