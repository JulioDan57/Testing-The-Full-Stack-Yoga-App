import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from '@jest/globals';

describe('RegisterComponent - Integration', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]), // Pas besoin de vraies routes pour le test
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // 🔹 Correctif NG04002 : mock router.navigate pour éviter l’erreur et le warning de zone
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ----------------------------------------------------------------------
  // TEST 1 : Le composant se crée
  // ----------------------------------------------------------------------
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // ----------------------------------------------------------------------
  // TEST 2 : Validation du formulaire
  // ----------------------------------------------------------------------
  it('should mark the form invalid when fields are empty', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('should validate the form when fields are correctly filled', () => {
    component.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@doe.com',
      password: 'abcd1234'
    });

    expect(component.form.valid).toBeTruthy();
  });

  // ----------------------------------------------------------------------
  // TEST 3 : Appel HTTP + navigation
  // ----------------------------------------------------------------------
  it('should call AuthService.register and navigate to /login on success', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@doe.com',
      password: 'abcd1234'
    });

    component.submit();

    const req = httpMock.expectOne('api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@doe.com',
      password: 'abcd1234'
    });

    req.flush(null); // Mock succès

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  // ----------------------------------------------------------------------
  // TEST 4 : Affichage du message d’erreur en cas d’échec
  // ----------------------------------------------------------------------
  it('should show error message when the API returns an error', () => {
    component.form.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@doe.com',
      password: 'abcd1234'
    });

    component.submit();

    const req = httpMock.expectOne('api/auth/register');
    req.flush({ message: 'error' }, { status: 500, statusText: 'Error' });

    fixture.detectChanges();

    expect(component.onError).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error')).toBeTruthy();
  });
});
