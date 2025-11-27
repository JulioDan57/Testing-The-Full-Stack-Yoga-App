describe('Session detail (Mocked)', () => {
  const userId = 1;

  let session = {
    id: 1,
    name: 'Yoga Class',
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

    // Mock sessionStorage utilisateur
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

    // Mock API GET session
    cy.intercept('GET', '/api/session/1', (req) => req.reply(session)).as('mockDetail');

    // Mock API GET teacher
    cy.intercept('GET', '/api/teacher/1', teacher).as('mockTeacher');

    // Mock POST participation
    cy.intercept('POST', `/api/session/1/participate/${userId}`, (req) => {
      session.users.push(userId);
      req.reply({ statusCode: 200 });
    }).as('mockParticipate');

    // Mock DELETE unparticipate
    cy.intercept('DELETE', `/api/session/1/participate/${userId}`, (req) => {
      session.users = session.users.filter(u => u !== userId);
      req.reply({ statusCode: 200 });
    }).as('mockUnparticipate');

    cy.visit('/sessions/detail/1');
  });

  it('should display session info and teacher', () => {
    cy.wait('@mockDetail');
    cy.wait('@mockTeacher');

    cy.contains('Yoga Class').should('exist');
    cy.contains('Test desc').should('exist');
    cy.contains('John DOE').should('exist');

    cy.contains(`${session.users.length} attendees`).should('exist');
    cy.contains(new Date(session.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })).should('exist');

    cy.contains(new Date(session.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })).should('exist');
    cy.contains(new Date(session.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })).should('exist');
  });

  it('should participate and update attendee count', () => {
    cy.wait('@mockDetail');
    cy.wait('@mockTeacher');

    // Participer
    cy.contains('Participate').click();
    cy.wait('@mockParticipate');
    cy.wait('@mockDetail');

    cy.contains('Do not participate').should('exist');
    cy.contains('1 attendees').should('exist');

    // Se désinscrire
    cy.contains('Do not participate').click();
    cy.wait('@mockUnparticipate');
    cy.wait('@mockDetail');

    cy.contains('Participate').should('exist');
    cy.contains('0 attendees').should('exist');
  });

  it('should hide participate button for admin', () => {
    // Simuler un admin
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

    cy.visit('/sessions/detail/1');
    cy.wait('@mockDetail');
    cy.wait('@mockTeacher');

    cy.contains('Participate').should('not.exist');
    cy.contains('Do not participate').should('not.exist');
    cy.contains('Delete').should('exist');
  });

  it('should delete session when admin clicks delete', () => {
    // Simuler un admin
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

    cy.intercept('DELETE', '/api/session/1', { statusCode: 200 }).as('mockDelete');

    cy.visit('/sessions/detail/1');
    cy.wait('@mockDetail');
    cy.wait('@mockTeacher');

    cy.contains('Delete').click();
    cy.wait('@mockDelete');

    // Vérifier la redirection vers la liste
    cy.url().should('include', '/sessions');
  });
});
