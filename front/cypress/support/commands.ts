// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
// declare namespace Cypress {
//   interface Chainable<Subject = any> {
//     customCommand(param: any): typeof customCommand;
//   }
// }
//
// function customCommand(param: any): void {
//   console.warn(param);
// }
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// cypress/support/commands.ts

// Simule un utilisateur connecté (non-admin)
/*
Cypress.Commands.add('loginAsUser', () => {
  cy.visit('/', {
    onBeforeLoad(win) {
      win.sessionStorage.setItem('sessionInformation', JSON.stringify({
        token: 'fake-token',
        type: 'Bearer',
        id: 1,
        username: 'julio',
        firstName: 'Julio',
        lastName: 'Tester',
        admin: false
      }));
    }
  });
});
*/



Cypress.Commands.add('setSession', () => {
  cy.visit('/', {
    onBeforeLoad(win) {
      win.sessionStorage.setItem(
        'sessionInformation',
        JSON.stringify({
          token: 'fake-token',
          type: 'Bearer',
          id: 1,
          username: 'julio',
          firstName: 'Julio',
          lastName: 'Tester',
          admin: false
        })
      );
    }
  });
});


// cypress/support/commands.ts
Cypress.Commands.add('loginAsUser', () => {
  cy.visit('/', {
    onBeforeLoad(win) {
      win.sessionStorage.setItem(
        'sessionInformation',
        JSON.stringify({
          token: 'fake-token',
          type: 'Bearer',
          id: 1,
          username: 'julio',
          firstName: 'Julio',
          lastName: 'Tester',
          admin: false
        })
      );
    }
  });
});


Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/', {
    onBeforeLoad(win) {
      win.sessionStorage.setItem('sessionInformation', JSON.stringify({
        token: 'fake-token',
        type: 'Bearer',
        id: 99,
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      }));
    }
  });
});



