import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn()
    };

    routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --------------------------------------------------------
  // BASIC CREATION
  // --------------------------------------------------------

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // --------------------------------------------------------
  // FORM VALIDATIONS
  // --------------------------------------------------------

  it('should have an invalid form initially', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should validate email correctly', () => {
    const email = component.form.controls['email'];

    email.setValue('invalid-email');
    expect(email.invalid).toBe(true);

    email.setValue('valid@email.com');
    expect(email.valid).toBe(true);
  });

  it('should validate firstName min and max length', () => {
    const firstName = component.form.controls['firstName'];

    firstName.setValue('ab'); // too short
    expect(firstName.invalid).toBe(true);

    firstName.setValue('John');
    expect(firstName.valid).toBe(true);

    firstName.setValue('A'.repeat(25)); // too long
    expect(firstName.invalid).toBe(true);
  });

  it('should validate lastName min and max length', () => {
    const lastName = component.form.controls['lastName'];

    lastName.setValue('xy');
    expect(lastName.invalid).toBe(true);

    lastName.setValue('Doe');
    expect(lastName.valid).toBe(true);

    lastName.setValue('A'.repeat(25));
    expect(lastName.invalid).toBe(true);
  });

  it('should validate password min length', () => {
    const password = component.form.controls['password'];

    password.setValue('12');
    expect(password.invalid).toBe(true);

    password.setValue('123456');
    expect(password.valid).toBe(true);
  });

  // --------------------------------------------------------
  // BUTTON STATE
  // --------------------------------------------------------

  it('should keep submit button disabled when form is invalid', () => {
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[type="submit"]');

    expect(button.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    component.form.setValue({
      email: 'john@doe.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });

    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[type="submit"]');

    expect(button.disabled).toBe(false);
  });

  // --------------------------------------------------------
  // SUBMIT SUCCESS / ERROR
  // --------------------------------------------------------

  it('should call authService.register() with form values when submitting', () => {
    authServiceMock.register.mockReturnValue(of({}));

    const formData = {
      email: 'john@doe.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    };

    component.form.setValue(formData);

    component.submit();

    expect(authServiceMock.register).toHaveBeenCalledWith(formData);
  });

  it('should navigate to /login on successful registration', () => {
    authServiceMock.register.mockReturnValue(of({}));

    component.form.setValue({
      email: 'john@doe.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });

    component.submit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should set onError to true when registration fails', () => {
    authServiceMock.register.mockReturnValue(throwError(() => new Error('fail')));

    component.form.setValue({
      email: 'john@doe.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });

    component.submit();

    expect(component.onError).toBe(true);
  });

  it('should display the error message when onError = true', () => {
    component.onError = true;

    fixture.detectChanges();

    const errorMsg = fixture.nativeElement.querySelector('.error');

    expect(errorMsg).not.toBeNull();
    expect(errorMsg.textContent).toContain('An error occurred');
  });
});
