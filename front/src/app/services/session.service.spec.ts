import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionService } from './session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

describe('SessionService', () => {
  let service: SessionService;

  const mockUser: SessionInformation = {
    token: 'abcd1234',
    type: 'Bearer',
    id: 1,
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    admin: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    // Vérifie que le service est instancié correctement
    expect(service).toBeTruthy();
  });

  it('should have initial isLogged value as false', (done) => {
    // Vérifie que $isLogged() retourne false au démarrage
    service.$isLogged().subscribe((value) => {
      expect(value).toBe(false);
      done();
    });
  });

  it('should log in a user and update isLogged to true', (done) => {
    // Teste logIn : mise à jour de sessionInformation et isLogged
    service.logIn(mockUser);

    service.$isLogged().subscribe((value) => {
      expect(value).toBe(true);
      expect(service.sessionInformation).toEqual(mockUser);
      done();
    });
  });

  it('should log out a user and update isLogged to false', (done) => {
    // Pré-condition : connexion
    service.logIn(mockUser);

    // Test logOut
    service.logOut();

    service.$isLogged().subscribe((value) => {
      expect(value).toBe(false);
      expect(service.sessionInformation).toBeUndefined();
      done();
    });
  });
});
