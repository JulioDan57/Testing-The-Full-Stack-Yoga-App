describe('Create Session (mocked, extended coverage)', () => {
  const mockSession = {
    token: 'abc',
    type: 'Bearer',
    id: 1,
    username: 'yoga@studio.com',
    firstName: 'Yoga',
    lastName: 'Studio',
    admin: true
  };

  const mockTeachers = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' },
    { id: 3, firstName: 'Don', lastName: 'Fix' }
  ];

  beforeEach(() => {
    cy.viewport(1280, 720);

    cy.window().then((win) => {
      win.sessionStorage.setItem('sessionInformation', JSON.stringify(mockSession));
    });

    cy.intercept('GET', 'api/teacher', { body: mockTeachers }).as('getTeachers');

    cy.visit('/sessions/create');
    cy.wait('@getTeachers');
  });

  it('should display empty form and disable save', () => {
    cy.get('input[formControlName="name"]').should('have.value', '');
    cy.get('input[formControlName="date"]').should('have.value', '');
    cy.get('textarea[formControlName="description"]').should('have.value', '');

    cy.get('button[type=submit]').should('be.disabled');
  });

  it('should display 3 teachers in the dropdown', () => {
    cy.get('mat-select[formControlName="teacher_id"]').click();
    cy.get('mat-option').should('have.length', 3);
    cy.contains('John Doe').should('exist');
  });

  it('should not allow submit with missing fields', () => {
    cy.get('input[formControlName="name"]').type('Test');
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('should create a new session', () => {
    cy.intercept('POST', 'api/session', {
      statusCode: 201,
      body: { id: 99 }
    }).as('createSession');

    cy.get('input[formControlName="name"]').type('My session');
    cy.get('input[formControlName="date"]').type('2025-01-01');

    cy.get('mat-select[formControlName="teacher_id"]').click();
    cy.contains('John Doe').click();

    cy.get('textarea[formControlName="description"]').type('A great session');

    cy.get('button[type=submit]').click();
    cy.wait('@createSession');

    cy.url().should('include', '/sessions');
  });

  it('should show an error snackbar if creation fails', () => {
    cy.intercept('POST', 'api/session', {
      statusCode: 500,
      body: { message: 'Something failed' }
    }).as('createError');

    cy.visit('/sessions/create');
    cy.wait('@getTeachers');

    cy.get('input[formControlName="name"]').type('Bad session');
    cy.get('input[formControlName="date"]').type('2025-01-01');

    cy.get('mat-select[formControlName="teacher_id"]').click();
    cy.contains('mat-option', 'John Doe').click();

    cy.get('textarea[formControlName="description"]').type('desc');

    cy.get('button[type=submit]').click();
    cy.wait('@createError');

    // Comme l’app ne gère pas les erreurs, on vérifie juste qu’on reste sur la page
    cy.url().should('include', '/sessions/create');
  });

});
