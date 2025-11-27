import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { expect } from '@jest/globals';
import { SessionService } from './services/session.service';

// Fake components for routing
import { Component } from '@angular/core';

@Component({ template: '<p>Login</p>' })
class LoginPage {}

@Component({ template: '<p>Register</p>' })
class RegisterPage {}

@Component({ template: '<p>Sessions</p>' })
class SessionsPage {}

@Component({ template: '<p>Account</p>' })
class AccountPage {}

describe('AppComponent (Integration Tests)', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let sessionServiceMock: any;
  let router: Router;

  beforeEach(async () => {

    sessionServiceMock = {
      _logged$: new BehaviorSubject<boolean>(false),
      $isLogged: function () {
        return this._logged$.asObservable();
      },
      logOut: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        LoginPage,
        RegisterPage,
        SessionsPage,
        AccountPage
      ],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'login', component: LoginPage },
          { path: 'register', component: RegisterPage },
          { path: 'sessions', component: SessionsPage },
          { path: 'me', component: AccountPage }
        ]),
        HttpClientTestingModule,
        MatToolbarModule
      ],
      providers: [
        { provide: SessionService, useValue: sessionServiceMock }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  // -------------------------------------------------------
  it('should display Login/Register when not logged', () => {
    sessionServiceMock._logged$.next(false);

    fixture.detectChanges();
    const html = fixture.nativeElement;

    expect(html.querySelector('span[routerLink="login"]')).toBeTruthy();
    expect(html.querySelector('span[routerLink="register"]')).toBeTruthy();
  });

  // -------------------------------------------------------
  it('should display Sessions/Account/Logout when logged', () => {
    sessionServiceMock._logged$.next(true);

    fixture.detectChanges();
    const html = fixture.nativeElement;

    expect(html.querySelector('span[routerLink="sessions"]')).toBeTruthy();
    expect(html.querySelector('span[routerLink="me"]')).toBeTruthy();
    expect(html.querySelector('span.link:last-child').textContent.trim()).toBe('Logout');
  });

  // -------------------------------------------------------
  it('should navigate to Sessions page when Sessions is clicked', async () => {
    sessionServiceMock._logged$.next(true);
    fixture.detectChanges();

    const html = fixture.nativeElement;
    const link = html.querySelector('span[routerLink="sessions"]');

    await router.navigate(['/']);
    link.click();
    fixture.detectChanges();

    await fixture.whenStable();
    expect(router.url).toBe('/sessions');
  });

  // -------------------------------------------------------
  it('should call logout() and navigate to home', async () => {
    sessionServiceMock._logged$.next(true);
    fixture.detectChanges();

    const spyLogout = jest.spyOn(component, 'logout');

    const html = fixture.nativeElement;
    html.querySelector('span.link:last-child').click();

    expect(spyLogout).toHaveBeenCalled();
    expect(sessionServiceMock.logOut).toHaveBeenCalled();
  });

  // -------------------------------------------------------
  it('$isLogged() should emit the correct value', (done) => {
    sessionServiceMock._logged$.next(true);

    component.$isLogged().subscribe(value => {
      expect(value).toBe(true);
      done();
    });
  });
});
