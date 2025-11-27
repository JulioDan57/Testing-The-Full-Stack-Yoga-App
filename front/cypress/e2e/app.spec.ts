/// <reference types="cypress" />

describe('Yoga App E2E', () => {
  const user = {
    email: 'testuser@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'Test1234'
  };

  const login = () => {
    cy.visit('/login');
    cy.get('input[name=email]').type(user.email);
    cy.get('input[name=password]').type(user.password);
    cy.get('button[type=submit]').click();
  };

  beforeEach(() => {
    cy.viewport(1280, 720);
  });

  it('should register a new user', () => {
    cy.visit('/register');
    cy.get('input[name=email]').type(user.email);
    cy.get('input[name=firstName]').type(user.firstName);
    cy.get('input[name=lastName]').type(user.lastName);
    cy.get('input[name=password]').type(user.password);
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/login');
  });

  it('should login and access sessions', () => {
    login();
    cy.url().should('include', '/sessions');
    cy.get('app-list').should('exist');
  });

  it('should create a new session', () => {
    login();
    cy.visit('/sessions/create');
    cy.get('input[formControlName=name]').type('Yoga Advanced');
    cy.get('input[formControlName=date]').type('2025-12-01');
    cy.get('mat-select[formControlName=teacher_id]').click();
    cy.get('mat-option').first().click();
    cy.get('textarea[formControlName=description]').type('Advanced yoga session');
    cy.get('button[type=submit]').click();
    cy.contains('Session created!').should('exist');
  });

  it('should participate and unparticipate in a session', () => {
    login();
    cy.visit('/sessions');
    cy.get('app-list mat-card').first().click();
    cy.get('button').contains('Participate').click();
    cy.get('button').contains('Unparticipate').click();
  });

  it('should prevent access to protected routes when not logged in', () => {
    cy.visit('/sessions', { failOnStatusCode: false });
    cy.url().should('include', '/login');
  });

  it('should delete user account', () => {
    login();
    cy.visit('/me');
    cy.get('button').contains('Delete').click();
    cy.contains('Your account has been deleted!').should('exist');
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });
});
