import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { expect } from '@jest/globals';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

import { DetailComponent } from './detail.component';
import { SessionService } from '../../../../services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from '../../../../services/teacher.service';

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;

  let mockSessionApiService: any;
  let mockTeacherService: any;
  let mockSessionService: any;
  let mockRouter: any;
  let mockSnackBar: any;

  const mockSession = {
    id: 1,
    name: 'Yoga',
    date: new Date(),
    description: 'Relax.',
    teacher_id: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    users: [1, 5]
  };

  const mockTeacher = {
    id: 2,
    firstName: 'John',
    lastName: 'Doe'
  };

  beforeEach(async () => {
    mockSessionApiService = {
      detail: jest.fn().mockReturnValue(of(mockSession)),
      delete: jest.fn().mockReturnValue(of({})),
      participate: jest.fn().mockReturnValue(of({})),
      unParticipate: jest.fn().mockReturnValue(of({}))
    };

    mockTeacherService = {
      detail: jest.fn().mockReturnValue(of(mockTeacher))
    };

    mockSessionService = {
      sessionInformation: {
        admin: true,
        id: 1
      }
    };

    mockRouter = {
      navigate: jest.fn()
    };

    mockSnackBar = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [DetailComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', '1']]) } }
        },
        FormBuilder   // ✅ Correctif important
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
  });

  // ---------------------------------------------------
  // BASIC
  // ---------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ---------------------------------------------------
  // FETCH SESSION
  // ---------------------------------------------------
  it('should fetch session and teacher on init', () => {
    component.ngOnInit();

    expect(mockSessionApiService.detail).toHaveBeenCalledWith('1');
    expect(mockTeacherService.detail).toHaveBeenCalledWith('2');

    expect(component.session).toEqual(mockSession);
    expect(component.teacher).toEqual(mockTeacher);
    expect(component.isParticipate).toBe(true);
  });

  // ---------------------------------------------------
  // PARTICIPATE
  // ---------------------------------------------------
  it('should call participate and reload session', () => {
    component.ngOnInit();
    jest.spyOn(component as any, 'fetchSession');

    component.participate();

    expect(mockSessionApiService.participate).toHaveBeenCalledWith('1', '1');
    expect((component as any).fetchSession).toHaveBeenCalled();
  });

  // ---------------------------------------------------
  // UNPARTICIPATE
  // ---------------------------------------------------
  it('should call unParticipate and reload session', () => {
    component.ngOnInit();
    jest.spyOn(component as any, 'fetchSession');

    component.unParticipate();

    expect(mockSessionApiService.unParticipate).toHaveBeenCalledWith('1', '1');
    expect((component as any).fetchSession).toHaveBeenCalled();
  });

  // ---------------------------------------------------
  // DELETE
  // ---------------------------------------------------
  it('should delete session and navigate', () => {
    component.delete();

    expect(mockSessionApiService.delete).toHaveBeenCalledWith('1');
    expect(mockSnackBar.open).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

  // ---------------------------------------------------
  // BACK()
  // ---------------------------------------------------
  it('should call window.history.back()', () => {
    const spy = jest.spyOn(window.history, 'back');
    component.back();
    expect(spy).toHaveBeenCalled();
  });

  // ---------------------------------------------------
  // ADMIN FLAG
  // ---------------------------------------------------
  it('should initialize isAdmin from sessionService', () => {
    expect(component.isAdmin).toBe(true);
  });
});
