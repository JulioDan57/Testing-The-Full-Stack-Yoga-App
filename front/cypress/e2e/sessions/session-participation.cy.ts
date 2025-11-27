describe('Session participation (Mocked)', () => { 
  const userId = 1;

  let session = {
    id: 1,
    name: 'Yoga',
    description: 'Test desc',
    date: '2025-01-01',
    teacher_id: 1,
    users: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-05'
  };

  const teacher = {
    id: 1,
    firstName: 'John',
    lastName: 'DOE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-05'
  };

  beforeEach(() => {
    cy.viewport(1280, 720);

    // Mock sessionStorage pour sessionService
    cy.window().then(win => {
      win.sessionStorage.setItem('sessionInformation', JSON.stringify({
        token: 'abc',
        type: 'Bearer',
        id: userId,
        username: 'yoga@studio.com',
        firstName: 'Yoga',
        lastName: 'Studio',
        admin: false
      }));
    });

    // Mock GET session en renvoyant le session courant
    cy.intercept('GET', '/api/session/1', (req) => {
      req.reply(session);
    }).as('mockDetail');

    // Mock GET teacher
    cy.intercept('GET', '/api/teacher/1', teacher).as('mockTeacher');

    // Mock POST participate
    cy.intercept('POST', `/api/session/1/participate/${userId}`, (req) => {
      session.users.push(userId);  // Ajouter l'utilisateur
      req.reply({ statusCode: 200 });
    }).as('mockParticipate');

    // Mock DELETE unParticipate
    cy.intercept('DELETE', `/api/session/1/participate/${userId}`, (req) => {
      session.users = session.users.filter(u => u !== userId); // Retirer l'utilisateur
      req.reply({ statusCode: 200 });
    }).as('mockUnparticipate');

    cy.visit('/sessions/detail/1');
  });

  it('should participate and unparticipate', () => {
    cy.wait('@mockDetail');
    cy.wait('@mockTeacher');

    // Participer
    cy.contains('Participate').should('exist').click();
    cy.wait('@mockParticipate');
    cy.wait('@mockDetail'); // refresh après participation

    // Vérifier que le bouton "Do not participate" apparaît
    cy.contains('Do not participate').should('exist').click();
    cy.wait('@mockUnparticipate');
    cy.wait('@mockDetail'); // refresh après désinscription

    // Vérifier que le bouton revient à "Participate"
    cy.contains('Participate').should('exist');
  });

  it('should hide participate button for admin', () => {
    // Simuler un utilisateur admin
    cy.window().then(win => {
      win.sessionStorage.setItem('sessionInformation', JSON.stringify({
        token: 'abc',
        type: 'Bearer',
        id: userId,
        username: 'admin@studio.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      }));
    });

    // Recharger la page pour que le composant prenne en compte le nouvel utilisateur
    cy.visit('/sessions/detail/1');

    cy.wait('@mockDetail');
    cy.wait('@mockTeacher');

    // Vérifier que le bouton "Participate" n'existe pas pour un admin
    cy.contains('Participate').should('not.exist');
    cy.contains('Do not participate').should('not.exist');
  });

  it('should participate and update attendee count', () => {
    cy.wait('@mockDetail');
    cy.wait('@mockTeacher');

    // Vérifier initialement le compteur d'attendees
    cy.contains('0 attendees').should('exist');

    // Participer
    cy.contains('Participate').should('exist').click();
    cy.wait('@mockParticipate');
    cy.wait('@mockDetail'); // refresh après participation

    // Vérifier que le compteur d'attendees est mis à jour
    cy.contains('1 attendee').should('exist'); // "attendee" au singulier pour 1

    // Vérifier que le bouton "Do not participate" apparaît
    cy.contains('Do not participate').should('exist').click();
    cy.wait('@mockUnparticipate');
    cy.wait('@mockDetail'); // refresh après désinscription

    // Vérifier que le compteur revient à zéro et que le bouton "Participate" réapparaît
    cy.contains('0 attendees').should('exist');
    cy.contains('Participate').should('exist');
  });

});
