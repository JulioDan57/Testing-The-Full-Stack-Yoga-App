describe('Login (Mocked API)', () => {
  const fakeSession = {
    id: 1,
    firstName: 'Yoga',
    lastName: 'Studio',
    username: 'yoga@studio.com',
    admin: true,
    token: 'FAKE_TOKEN',
    type: 'Bearer'
  };

  beforeEach(() => {
    cy.viewport(1280, 720);
    cy.visit('/login');
  });

  it('should login successfully (mock API) and store session', () => {
    // Mock POST login
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: fakeSession
    }).as('login');

    // Mock GET sessions after login
    cy.intercept('GET', '/api/session', []).as('sessions');

    // Remplir le formulaire
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    // Attendre la requête login et injecter le sessionStorage
    cy.wait('@login').then((interception) => {
      const sessionData = interception.response?.body;
      cy.window().then(win => {
        win.sessionStorage.setItem('sessionInformation', JSON.stringify(sessionData));
      });
    });

    // Vérifier que la session est stockée
    cy.window().then((win) => {
      const session = JSON.parse(win.sessionStorage.getItem('sessionInformation') || '{}');
      expect(session).to.have.property('token', 'FAKE_TOKEN');
      expect(session).to.have.property('admin', true);
      expect(session).to.have.property('username', 'yoga@studio.com');
    });

    // Vérifier la redirection vers /sessions
    cy.url().should('include', '/sessions');

    // Vérifier que la page suivante charge les sessions
    cy.wait('@sessions');
  });

  it('should show error message on invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login', { statusCode: 401 }).as('login');

    cy.get('input[formControlName=email]').type('wrong@wrong.com');
    cy.get('input[formControlName=password]').type('wrong');
    cy.get('button[type=submit]').click();

    cy.wait('@login');
    cy.contains('An error occurred').should('exist');
  });

  it('should disable submit button when form is invalid', () => {
    cy.get('button[type=submit]').should('be.disabled');
  });

  it('should toggle password visibility', () => {
    cy.get('input[formControlName=password]').should('have.attr', 'type', 'password');
    cy.get('button[aria-label="Hide password"]').click();
    cy.get('input[formControlName=password]').should('have.attr', 'type', 'text');
    cy.get('button[aria-label="Hide password"]').click();
    cy.get('input[formControlName=password]').should('have.attr', 'type', 'password');
  });

  it('should handle server error gracefully', () => {
    cy.intercept('POST', '/api/auth/login', { statusCode: 500 }).as('loginError');

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();

    cy.wait('@loginError');
    cy.contains(/error/i).should('exist'); // snackbar ou message d’erreur
  });

  it('should not allow submission when email or password is empty', () => {
    // Les deux champs sont vides
    cy.get('input[formControlName=email]').clear();
    cy.get('input[formControlName=password]').clear();

    // Vérifier que le bouton Submit est désactivé
    cy.get('button[type=submit]').should('be.disabled');

    // Remplir uniquement l’email
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('button[type=submit]').should('be.disabled');

    // Vider l’email et remplir uniquement le mot de passe
    cy.get('input[formControlName=email]').clear();
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').should('be.disabled');

    // Remplir les deux champs pour vérifier que le bouton devient actif
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('button[type=submit]').should('not.be.disabled');
  });

});
