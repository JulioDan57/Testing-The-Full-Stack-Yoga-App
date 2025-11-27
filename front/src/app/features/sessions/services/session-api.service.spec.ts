import { expect } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { SessionService } from 'src/app/services/session.service';
import { FormComponent } from '../components/form/form.component';
import { SessionApiService } from './session-api.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

/* ----------------------------------------------------------------------
 * TESTS SessionService
 * ---------------------------------------------------------------------- */
describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SessionService);
  });

  it('should log in and emit true', (done) => {
    const sessionData = {
      id: 1, username: 'test', token: 'abc', admin: true,
      type: 'Bearer', firstName: 'Test', lastName: 'User'
    };
    service.$isLogged().subscribe(val => {
      expect(val).toBe(true);
      done();
    });
    service.logIn(sessionData);
  });

  it('should log out and emit false', (done) => {
    service.logOut();
    service.$isLogged().subscribe(val => {
      expect(val).toBe(false);
      done();
    });
  });
});

/* ----------------------------------------------------------------------
 * TESTS SessionApiService (augmentés)
 * ---------------------------------------------------------------------- */
describe('SessionApiService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionApiService]
    });
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  /* -------------------- GET ALL -------------------- */
  it('should fetch all sessions', () => {
    const dummySessions = [
      { id: 1, name: 'Yoga', description: 'desc', date: new Date(), teacher_id: 1, users: [] }
    ];

    service.all().subscribe(sessions => {
      expect(sessions.length).toBe(1);
      expect(sessions).toEqual(dummySessions);
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('GET');
    req.flush(dummySessions);
  });

  /* -------------------- GET DETAIL -------------------- */
  it('should fetch session detail', () => {
    const dummy = { id: 1, name: 'Yoga', description: 'desc' } as any;

    service.detail("1").subscribe(session => {
      expect(session).toEqual(dummy);
    });

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('GET');
    req.flush(dummy);
  });

  /* -------------------- CREATE -------------------- */
  it('should create a session', () => {
    const newSession = {
      name: 'Test', description: 'desc', date: new Date(), teacher_id: 1, users: []
    };

    const createdResponse = { ...newSession, id: 99 };

    service.create(newSession).subscribe(response => {
      expect(response).toEqual(createdResponse);
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newSession);
    req.flush(createdResponse);
  });

  /* -------------------- UPDATE -------------------- */
  it('should update a session', () => {
    const updatedSession = { id: 1, name: 'Updated', description: 'desc' } as any;

    service.update("1", updatedSession).subscribe(response => {
      expect(response).toEqual(updatedSession);
    });

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedSession);
    req.flush(updatedSession);
  });

  /* -------------------- DELETE -------------------- */
  it('should delete a session', () => {
    service.delete("1").subscribe(response => {
      expect(response).toEqual({});
    });

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  /* -------------------- PARTICIPATE -------------------- */
  it('should call participate endpoint', () => {
    service.participate("1", "10").subscribe(response => {
      expect(response).toBeUndefined(); // void endpoint
    });

    const req = httpMock.expectOne('api/session/1/participate/10');
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  /* -------------------- UNPARTICIPATE -------------------- */
  it('should call unParticipate endpoint', () => {
    service.unParticipate("1", "10").subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne('api/session/1/participate/10');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

});

/* ----------------------------------------------------------------------
 * TESTS FormComponent
 * ---------------------------------------------------------------------- */
describe('FormComponent', () => {
  let component: FormComponent;

  const mockSessionApiService = {
    create: jest.fn().mockReturnValue(of({})),
    update: jest.fn().mockReturnValue(of({})),
    detail: jest.fn().mockReturnValue(of({
      id: 1,
      name: 'Yoga',
      description: 'desc',
      date: new Date(),
      teacher_id: 1,
      users: []
    }))
  };

  const mockSessionService = { sessionInformation: { admin: true } };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormComponent],
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: SessionService, useValue: mockSessionService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // <-- ajoute ça
    }).compileComponents();

    const fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should submit new session', () => {
    component.sessionForm?.setValue({
      name: 'Test',
      date: new Date().toISOString().split('T')[0],
      teacher_id: 1,
      description: 'desc'
    });

    component.submit();
    expect(mockSessionApiService.create).toHaveBeenCalled();
  });
});
