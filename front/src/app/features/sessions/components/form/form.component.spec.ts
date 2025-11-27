import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { throwError } from 'rxjs'; 
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from '@jest/globals';
import { FormComponent } from './form.component';
import { SessionService } from '../../../../services/session.service';
import { TeacherService } from '../../../../services/teacher.service';
import { SessionApiService } from '../../services/session-api.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  // ----------------------------
  // MOCK SERVICES
  // ----------------------------
  const mockRouter = {
    navigate: jest.fn(),
    url: '/sessions/create'
  };

  const mockSessionService = {
    sessionInformation: { admin: true }
  };

  const mockTeacherService = {
    all: jest.fn(() => of([{ id: 1, firstName: 'John', lastName: 'Doe' }]))
  };

  const mockSessionApiService = {
    detail: jest.fn(() =>
      of({
        id: '1',
        name: 'Existing session',
        date: '2024-01-10',
        teacher_id: 1,
        description: 'Test desc'
      })
    ),
    create: jest.fn(() => of({})),
    update: jest.fn(() => of({}))
  };

  const mockActivatedRoute = {
    snapshot: { paramMap: { get: () => '1' } }
  };

  // ----------------------------
  // SETUP
  // ----------------------------
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormComponent],
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SessionService, useValue: mockSessionService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ----------------------------
  // BASIC TESTS
  // ----------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the form with all controls', () => {
    expect(component.sessionForm).toBeDefined();
    expect(component.sessionForm!.contains('name')).toBe(true);
    expect(component.sessionForm!.contains('date')).toBe(true);
    expect(component.sessionForm!.contains('teacher_id')).toBe(true);
    expect(component.sessionForm!.contains('description')).toBe(true);
  });

  // ----------------------------
  // CREATE MODE
  // ----------------------------
  it('should start in create mode', () => {
    mockRouter.url = '/sessions/create';
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.onUpdate).toBe(false);
  });

  // ----------------------------
  // UPDATE MODE
  // ----------------------------
  it('should enter update mode and load session details', () => {
    mockRouter.url = '/sessions/update/1';
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.onUpdate).toBe(true);
    expect(mockSessionApiService.detail).toHaveBeenCalledWith('1');
  });

  // ----------------------------
  // VALIDATION
  // ----------------------------
  it('should validate required fields and max length', () => {
    const form = component.sessionForm!;
    form.setValue({ name: '', date: '', teacher_id: '', description: '' });
    expect(form.valid).toBe(false);
    expect(form.get('name')!.hasError('required')).toBe(true);
    expect(form.get('date')!.hasError('required')).toBe(true);
    expect(form.get('teacher_id')!.hasError('required')).toBe(true);
    expect(form.get('description')!.hasError('required')).toBe(true);

    form.patchValue({ description: 'a'.repeat(2001) });
    expect(form.get('description')!.hasError('maxlength')).toBe(true);
  });

  // ----------------------------
  // SUBMIT (CREATE)
  // ----------------------------
  it('should call create() on submit in create mode', () => {
    mockRouter.url = '/sessions/create';
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.sessionForm!.setValue({
      name: 'Test',
      date: '2024-01-01',
      teacher_id: 1,
      description: 'desc'
    });

    component.submit();
    expect(mockSessionApiService.create).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

  // ----------------------------
  // SUBMIT (UPDATE)
  // ----------------------------
  it('should call update() on submit in update mode', () => {
    mockRouter.url = '/sessions/update/1';
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.sessionForm!.setValue({
      name: 'Updated',
      date: '2024-01-01',
      teacher_id: 1,
      description: 'updated description'
    });

    component.submit();
    expect(mockSessionApiService.update).toHaveBeenCalledWith('1', component.sessionForm!.value);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

  // ----------------------------
  // NON-ADMIN REDIRECTION
  // ----------------------------
  it('should redirect non-admin users', () => {
    mockSessionService.sessionInformation = { admin: false };
    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  // ----------------------------
  // TEACHERS LIST
  // ----------------------------
  it('should fetch teachers list', (done) => {
    component.teachers$.subscribe((teachers) => {
      expect(teachers.length).toBe(1);
      expect(teachers[0].firstName).toBe('John');
      done();
    });
  });

  // ----------------------------
  // exitPage behavior
  // ----------------------------
  it('exitPage should show message and navigate', () => {
    const snackSpy = jest.spyOn(component['matSnackBar'], 'open');
    component['exitPage']('Test message');
    expect(snackSpy).toHaveBeenCalledWith('Test message', 'Close', { duration: 3000 });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

  // ----------------------------
  // initForm date transformation
  // ----------------------------
  it('initForm should transform session date to ISO string', () => {
    const session = { name: 'Yoga', date: '2025-01-01', teacher_id: 1, description: 'desc' };
    component['initForm'](session as any);
    const dateValue = component.sessionForm!.get('date')!.value;
    expect(dateValue).toBe(new Date(session.date).toISOString().split('T')[0]);
  });

  // ----------------------------
  // API FAILURE SCENARIOS
  // ----------------------------
  it('should handle create API error gracefully', () => {
    (mockSessionApiService.create as jest.Mock).mockReturnValueOnce(
      throwError(() => new Error('fail'))
    );
    component.onUpdate = false;
    component.sessionForm!.setValue({ name: 'Test', date: '2024-01-01', teacher_id: 1, description: 'desc' });
    component.submit();
    expect(mockSessionApiService.create).toHaveBeenCalled();
  });

  it('should handle update API error gracefully', () => {
    (mockSessionApiService.update as jest.Mock).mockReturnValueOnce(
      throwError(() => new Error('fail'))
    );
    component.onUpdate = true;
    component['id'] = '1';
    component.sessionForm!.setValue({ name: 'Updated', date: '2024-01-01', teacher_id: 1, description: 'desc' });
    component.submit();
    expect(mockSessionApiService.update).toHaveBeenCalledWith('1', component.sessionForm!.value);
  });
});
