import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { expect } from '@jest/globals';
import { TeacherService } from './teacher.service';
import { Teacher } from '../interfaces/teacher.interface';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherService],
    });

    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Vérifie qu'aucune requête HTTP non testée ne reste ouverte
    httpMock.verify();
  });

  it('should be created', () => {
    // Vérifie que le service est bien instancié
    expect(service).toBeTruthy();
  });

  describe('all', () => {
    it('should fetch the list of all teachers', () => {
      // Description : Teste la méthode all() pour récupérer tous les enseignants
      const mockTeachers: Teacher[] = [
        { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
        { id: 2, firstName: 'Jane', lastName: 'Smith', createdAt: new Date(), updatedAt: new Date() },
      ];

      service.all().subscribe((teachers) => {
        expect(teachers).toEqual(mockTeachers);
      });

      const req = httpMock.expectOne('api/teacher');
      expect(req.request.method).toBe('GET');

      req.flush(mockTeachers);
    });
  });

  describe('detail', () => {
    it('should fetch a teacher by ID and return the correct Teacher object', () => {
      // Description : Teste la méthode detail(id) pour récupérer un enseignant spécifique
      const mockTeacher: Teacher = { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() };

      service.detail('1').subscribe((teacher) => {
        expect(teacher).toEqual(mockTeacher);
      });

      const req = httpMock.expectOne('api/teacher/1');
      expect(req.request.method).toBe('GET');

      req.flush(mockTeacher);
    });
  });
});
