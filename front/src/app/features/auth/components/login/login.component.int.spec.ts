import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SessionService } from 'src/app/services/session.service';
import { AuthService } from '../../services/auth.service';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';


import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent (Integration)', () => {

  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let httpMock: HttpTestingController;
  let router: Router;
  let sessionService: SessionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          // 👇 Route factice pour éviter NG04002
          { path: 'sessions', component: LoginComponent }
        ]),
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule
      ],
      providers: [SessionService, AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    httpMock = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);

    // 👇 Mock router.navigate pour supprimer le warning
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ---------------------------------------------------------
  // TEST 1 : rendu initial
  // ---------------------------------------------------------
  it('should render the login form', () => {
    const html = fixture.nativeElement as HTMLElement;

    expect(html.querySelector('input[formControlName="email"]')).toBeTruthy();
    expect(html.querySelector('input[formControlName="password"]')).toBeTruthy();
    expect(html.querySelector('button[type="submit"]')).toBeTruthy();
  });

  // ---------------------------------------------------------
  // TEST 2 : submit disabled si form invalide
  // ---------------------------------------------------------
  it('should disable submit button when form is invalid', () => {
    component.form.setValue({ email: '', password: '' });
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(button.disabled).toBe(true);
  });

  // ---------------------------------------------------------
  // TEST 3 : login OK → logIn + navigate()
  // ---------------------------------------------------------
  it('should call API login and navigate on success', () => {
    const sessionSpy = jest.spyOn(sessionService, 'logIn');

    component.form.setValue({
      email: 'test@test.com',
      password: 'abc123'
    });

    fixture.detectChanges();

    component.submit();

    const req = httpMock.expectOne('api/auth/login');
    expect(req.request.method).toBe('POST');

    req.flush({
      token: 'xxx',
      type: 'Bearer',
      id: 1,
      username: 'test',
      firstName: 'John',
      lastName: 'Doe',
      admin: false
    });

    expect(sessionSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
  });

  // ---------------------------------------------------------
  // TEST 4 : login FAIL → onError = true + message affiché
  // ---------------------------------------------------------
  it('should show error message on failed login', () => {
    component.form.setValue({
      email: 'fail@test.com',
      password: 'wrong'
    });

    component.submit();

    const req = httpMock.expectOne('api/auth/login');
    req.flush({ message: 'Bad credentials' }, { status: 401, statusText: 'Unauthorized' });

    fixture.detectChanges();

    expect(component.onError).toBe(true);

    const errorMessage = fixture.nativeElement.querySelector('.error');
    expect(errorMessage).toBeTruthy();
  });

});
