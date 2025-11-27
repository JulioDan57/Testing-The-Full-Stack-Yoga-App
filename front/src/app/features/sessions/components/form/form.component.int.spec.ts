import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormComponent } from './form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { expect } from '@jest/globals';
import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';
import { SessionApiService } from '../../services/session-api.service';
import { SessionService } from '../../../../services/session.service';
import { TeacherService } from '../../../../services/teacher.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('FormComponent - Integration', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let mockSessionApi: any;
  let mockSessionService: any;
  let mockTeacherService: any;
  let mockRouter: any;
  let snackBar: MatSnackBar;
  let ngZone: NgZone;

  const fakeTeachers = [
    { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() }
  ];

  beforeEach(async () => {
    mockSessionApi = {
      create: jest.fn().mockReturnValue(of({})),
      update: jest.fn().mockReturnValue(of({})),
      detail: jest.fn().mockReturnValue(of({
        id: 1,
        name: 'Math',
        description: 'Math session',
        date: new Date(),
        teacher_id: 1,
        users: []
      }))
    };

    mockTeacherService = {
      all: jest.fn().mockReturnValue(of(fakeTeachers))
    };

    mockSessionService = {
      sessionInformation: { admin: true, id: 1, token: 'xxx', type: 'Bearer', username: 'u', firstName: 'f', lastName: 'l' }
    };

    mockRouter = {
      navigate: jest.fn(),
      url: '/sessions/create'
    };

    await TestBed.configureTestingModule({
      declarations: [FormComponent],
      imports: [ReactiveFormsModule, 
                FormsModule, 
                MatSnackBarModule,
                NoopAnimationsModule  // <-- Ajout pour résoudre le problème d'animation
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

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    snackBar = TestBed.inject(MatSnackBar);
    ngZone = TestBed.inject(NgZone);
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form for create', () => {
    expect(component.sessionForm).toBeDefined();
    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm?.controls['name'].value).toBe('');
  });

  it('should initialize form for update', fakeAsync(() => {
    mockRouter.url = '/sessions/update/1';
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.onUpdate).toBe(true);
    expect(component.sessionForm?.controls['name'].value).toBe('Math');
  }));

  it('should call create on submit when creating', fakeAsync(() => {
    component.sessionForm?.setValue({
      name: 'Physics',
      date: new Date().toISOString().split('T')[0],
      teacher_id: 1,
      description: 'Physics session'
    });

    ngZone.run(() => component.submit());
    tick(5000);

    expect(mockSessionApi.create).toHaveBeenCalled();
    expect(mockSessionApi.update).not.toHaveBeenCalled();
  }));

  it('should call update on submit when updating', fakeAsync(() => {
    mockRouter.url = '/sessions/update/1';
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    component.sessionForm?.setValue({
      name: 'Physics',
      date: new Date().toISOString().split('T')[0],
      teacher_id: 1,
      description: 'Physics session'
    });

    ngZone.run(() => component.submit());
    tick(5000);

    expect(mockSessionApi.update).toHaveBeenCalled();
    expect(mockSessionApi.create).not.toHaveBeenCalled();
  }));

  it('should navigate and show snackbar after submit', fakeAsync(() => {
    const snackSpy = jest.spyOn(snackBar, 'open');

    component.sessionForm?.setValue({
      name: 'Physics',
      date: new Date().toISOString().split('T')[0],
      teacher_id: 1,
      description: 'Physics session'
    });

    ngZone.run(() => component.submit());
    tick(5000);

    expect(snackSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  }));
});
