describe('Session update (Mocked)', () => {

  beforeEach(() => {
    cy.viewport(1280, 720);

    // Mock sessionStorage pour simuler un utilisateur connecté
    cy.window().then(win => {
      win.sessionStorage.setItem('sessionInformation', JSON.stringify({
        token: 'abc',
        type: 'Bearer',
        id: 1,
        username: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: true
      }));
    });

    // Mock GET session (chargement des valeurs du formulaire)
    cy.intercept('GET', '/api/session/1', {
      id: 1,
      name: 'Old name',
      date: '2025-01-01',
      teacher_id: 1,
      description: 'Old desc',
      users: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-10'
    }).as('mockSession');

    // Mock liste des professeurs
    cy.intercept('GET', '/api/teacher', [
      {
        id: 1,
        firstName: 'Anna',
        lastName: 'Smith',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-10'
      }
    ]).as('mockTeachers');

    // Mock PUT update session
    cy.intercept('PUT', '/api/session/1', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Updated name',
        description: 'Updated desc',
        teacher_id: 1,
        date: '2025-01-01',
        users: []
      }
    }).as('mockUpdate');

    cy.visit('/sessions/update/1');
  });

  it('should update session', () => {
    // Le composant appelle GET session + GET teachers
    cy.wait('@mockSession');
    cy.wait('@mockTeachers');

    // Mise à jour du nom
    cy.get('input[formControlName=name]')
      .clear()
      .type('Updated name');

    // Mise à jour description
    cy.get('textarea[formControlName=description]')
      .clear()
      .type('Updated desc');

    // Soumettre
    cy.get('button[type=submit]').click();

    // Vérifier que l'API PUT a été appelée
    cy.wait('@mockUpdate').its('request.body').should((body) => {
      expect(body.name).to.equal('Updated name');
      expect(body.description).to.equal('Updated desc');
    });
  });

});
