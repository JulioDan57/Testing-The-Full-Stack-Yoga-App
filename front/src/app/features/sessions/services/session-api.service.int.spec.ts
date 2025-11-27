import { TestBed } from '@angular/core/testing';
import { SessionApiService } from './session-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { expect } from '@jest/globals';
import { Session } from '../interfaces/session.interface';

describe('SessionApiService - Integration', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  const mockSessions: Session[] = [
    { id: 1, name: 'Yoga', description: 'Yoga session', date: new Date(), teacher_id: 1, users: [] },
    { id: 2, name: 'Pilates', description: 'Pilates session', date: new Date(), teacher_id: 2, users: [] }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionApiService]
    });

    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all sessions', () => {
    service.all().subscribe(sessions => {
      expect(sessions.length).toBe(2);
      expect(sessions).toEqual(mockSessions);
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('GET');
    req.flush(mockSessions);
  });

  it('should fetch session by id', () => {
    const session = mockSessions[0];
    service.detail('1').subscribe(res => {
      expect(res).toEqual(session);
    });

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('GET');
    req.flush(session);
  });

  it('should create a session', () => {
    const newSession: Session = { name: 'New', description: 'desc', date: new Date(), teacher_id: 3, users: [] };
    
    service.create(newSession).subscribe(res => {
      expect(res).toEqual(newSession);
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newSession);
    req.flush(newSession);
  });

  it('should update a session', () => {
    const updatedSession: Session = { id: 1, name: 'Updated', description: 'desc', date: new Date(), teacher_id: 1, users: [] };

    service.update('1', updatedSession).subscribe(res => {
      expect(res).toEqual(updatedSession);
    });

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedSession);
    req.flush(updatedSession);
  });

  it('should delete a session', () => {
    service.delete('1').subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('should participate in a session', () => {
    service.participate('1', '2').subscribe(res => {
      expect(res).toBeUndefined();
    });

    const req = httpMock.expectOne('api/session/1/participate/2');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(null);
  });

  it('should unParticipate in a session', () => {
    service.unParticipate('1', '2').subscribe(res => {
      expect(res).toBeUndefined();
    });

    const req = httpMock.expectOne('api/session/1/participate/2');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

 it('should handle 404 error on detail', () => {
    service.detail('999').subscribe({
      next: () => fail('expected an error, not session'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
        expect(error.error).toBe('Session not found');
      }
    });

    const req = httpMock.expectOne('api/session/999');
    expect(req.request.method).toBe('GET');
    req.flush('Session not found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle 500 error on create', () => {
    const newSession: Session = { name: 'ErrorTest', description: 'desc', date: new Date(), teacher_id: 1, users: [] };

    service.create(newSession).subscribe({
      next: () => fail('expected an error, not a session'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Internal Server Error');
      }
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle network error on all', () => {
    const emsg = 'simulated network error';

    service.all().subscribe({
      next: () => fail('expected an error'),
      error: (error: HttpErrorResponse) => {
        expect(error.error.message).toBe(emsg);
      }
    });

    const req = httpMock.expectOne('api/session');
    const mockError = new ErrorEvent('Network error', { message: emsg });
    req.error(mockError);
  });

  it('should handle 403 error on delete', () => {
    service.delete('1').subscribe({
      next: () => fail('expected an error'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(403);
        expect(error.statusText).toBe('Forbidden');
      }
    });

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('DELETE');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
  });

});
