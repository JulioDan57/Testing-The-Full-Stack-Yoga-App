import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DetailComponent } from './detail.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { expect } from '@jest/globals';
import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { SessionService } from '../../../../services/session.service';
import { TeacherService } from '../../../../services/teacher.service';
import { SessionApiService } from '../../services/session-api.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

describe('DetailComponent - Integration', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let mockSessionApi: any;
  let mockSessionService: any;
  let mockTeacherService: any;
  let mockRouter: any;
  let snackBar: MatSnackBar;
  let ngZone: NgZone;

  const fakeSession = {
    id: 1,
    name: 'Yoga',
    description: 'Yoga session',
    date: new Date(),
    teacher_id: 1,
    users: [1],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const fakeTeacher = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    mockSessionApi = {
      detail: jest.fn().mockReturnValue(of(fakeSession)),
      delete: jest.fn().mockReturnValue(of({})),
      participate: jest.fn().mockReturnValue(of({})),
      unParticipate: jest.fn().mockReturnValue(of({}))
    };

    mockTeacherService = {
      detail: jest.fn().mockReturnValue(of(fakeTeacher))
    };

    mockSessionService = {
      sessionInformation: { admin: true, id: 1, token: 'xxx', type: 'Bearer', username: 'u', firstName: 'f', lastName: 'l' }
    };

    mockRouter = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [DetailComponent],
      imports: [
        MatSnackBarModule, 
        NoopAnimationsModule,
        ReactiveFormsModule  // <-- Ajout pour fournir FormBuilder
        ],
      providers: [
        { provide: SessionApiService, useValue: mockSessionApi },
        { provide: SessionService, useValue: mockSessionService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    snackBar = TestBed.inject(MatSnackBar);
    ngZone = TestBed.inject(NgZone);
    fixture.detectChanges();
  });

  it('should create component and fetch session', () => {
    expect(component).toBeTruthy();
    expect(mockSessionApi.detail).toHaveBeenCalledWith('1');
    expect(mockTeacherService.detail).toHaveBeenCalledWith('1');
    expect(component.session).toEqual(fakeSession);
    expect(component.teacher).toEqual(fakeTeacher);
    expect(component.isParticipate).toBe(true);
    expect(component.isAdmin).toBe(true);
  });

  it('should call back()', () => {
    const spy = jest.spyOn(window.history, 'back');
    component.back();
    expect(spy).toHaveBeenCalled();
  });

  it('should call delete() and navigate after snackbar', fakeAsync(() => {
    const snackSpy = jest.spyOn(snackBar, 'open');
    ngZone.run(() => component.delete());
    tick(3000); // duration du snackbar
    expect(mockSessionApi.delete).toHaveBeenCalledWith('1');
    expect(snackSpy).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  }));

  it('should call participate() and refetch session', () => {
    const fetchSpy = jest.spyOn(component as any, 'fetchSession');
    component.participate();
    expect(mockSessionApi.participate).toHaveBeenCalledWith('1', '1');
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('should call unParticipate() and refetch session', () => {
    const fetchSpy = jest.spyOn(component as any, 'fetchSession');
    component.unParticipate();
    expect(mockSessionApi.unParticipate).toHaveBeenCalledWith('1', '1');
    expect(fetchSpy).toHaveBeenCalled();
  });
});
