declare namespace Cypress {
  interface Chainable {
    setSession(): Chainable<void>;    
    loginAsUser(): Chainable<void>;
    loginAsAdmin(): Chainable<void>;
  }
}