import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { expect } from '@jest/globals';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoginRequest } from '../interfaces/loginRequest.interface';
import { RegisterRequest } from '../interfaces/registerRequest.interface';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // vérifie qu’aucune requête HTTP n’est en attente
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call register endpoint', () => {
    const registerData: RegisterRequest = {
      email: 'john@doe.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    };

    service.register(registerData).subscribe((response) => {
      expect(response).toBeUndefined(); // la méthode retourne void
    });

    const req = httpMock.expectOne('api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerData);

    req.flush(null); // simule une réponse vide
  });

  it('should call login endpoint', () => {
    const loginData: LoginRequest = { email: 'test@test.com', password: '1234' };
    
    const sessionInfo: SessionInformation = {
      token: 'fake-token',
      type: 'Bearer',
      id: 1,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      admin: false
    };

    service.login(loginData).subscribe((response) => {
      expect(response).toEqual(sessionInfo);
    });

    const req = httpMock.expectOne('api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginData);

    req.flush(sessionInfo); // simule la réponse du serveur
  });
});
