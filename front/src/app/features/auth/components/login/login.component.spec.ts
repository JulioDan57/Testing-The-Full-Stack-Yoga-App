import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { expect } from '@jest/globals';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { SessionService } from 'src/app/services/session.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;
  let mockSessionService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      login: jest.fn()
    };

    mockSessionService = {
      logIn: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // -------------------------------------------------------
  // Création du composant
  // -------------------------------------------------------
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // -------------------------------------------------------
  // Formulaire invalide au démarrage
  // -------------------------------------------------------
  it('form should be invalid initially', () => {
    expect(component.form.invalid).toBe(true);
  });

  // -------------------------------------------------------
  // Le bouton submit doit être désactivé
  // -------------------------------------------------------
  it('submit button should be disabled when form is invalid', () => {
    const button = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(button.disabled).toBe(true);
  });

  // -------------------------------------------------------
  // Email invalide
  // -------------------------------------------------------
  it('email control should detect invalid email', () => {
    const email = component.form.controls['email'];
    email.setValue('wrongEmail');
    expect(email.invalid).toBe(true);
  });

  // -------------------------------------------------------
  // Toggle de visibilité du password
  // -------------------------------------------------------
  it('should toggle password visibility', () => {
    expect(component.hide).toBe(true);
    component.hide = !component.hide;
    expect(component.hide).toBe(false);
  });

  // -------------------------------------------------------
  // Submit doit appeler authService.login()
  // -------------------------------------------------------
  it('should call authService.login on valid submit', () => {
    mockAuthService.login.mockReturnValue(of({ token: 'abc' }));

    component.form.setValue({ email: 'test@test.com', password: '1234' });
    component.submit();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: '1234'
    });
  });

  // -------------------------------------------------------
  // Succès : logIn + navigate
  // -------------------------------------------------------
  it('should navigate and login on successful submit', () => {
    mockAuthService.login.mockReturnValue(of({ token: 'abc' }));

    component.form.setValue({ email: 'test@test.com', password: '1234' });
    component.submit();

    expect(mockSessionService.logIn).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  // -------------------------------------------------------
  // Échec du login → onError = true
  // -------------------------------------------------------
  it('should set onError to true on login failure', () => {
    mockAuthService.login.mockReturnValue(
      throwError(() => new Error('Login failed'))
    );

    component.form.setValue({ email: 'test@test.com', password: '1234' });
    component.submit();

    expect(component.onError).toBe(true);
  });

  // -------------------------------------------------------
  // DOM : affichage du message d’erreur
  // -------------------------------------------------------
  it('should display error message when onError is true', () => {
    component.onError = true;
    fixture.detectChanges();

    const errorMsg = fixture.nativeElement.querySelector('.error');
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.textContent).toContain('An error occurred');
  });

  // -------------------------------------------------------
  // Le bouton doit être désactivé si le formulaire est invalide
  // -------------------------------------------------------
  it('should disable submit button when form is invalid', () => {
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');

    expect(button.disabled).toBe(true); // formulaire vide => invalide
  });
  

  
});
