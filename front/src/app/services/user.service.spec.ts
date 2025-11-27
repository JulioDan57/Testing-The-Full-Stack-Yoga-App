import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { expect } from '@jest/globals';
import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Vérifie qu’aucune requête HTTP non testée ne reste ouverte
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getById', () => {
    it('should fetch a user by ID and return the correct User object', () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        lastName: 'Doe',
        firstName: 'John',
        admin: false,
        password: 'password123',
        createdAt: new Date(),
      };

      service.getById('1').subscribe((user) => {
        // Vérifie que la réponse correspond au mock
        expect(user).toEqual(mockUser);
      });

      // Vérifie que la requête HTTP est correcte
      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('GET');

      // Renvoie la réponse mock
      req.flush(mockUser);
    });
  });

  describe('delete', () => {
    it('should send a DELETE request to remove a user by ID', () => {
      service.delete('1').subscribe((res) => {
        expect(res).toEqual({ success: true });
      });

      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });
});
