import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Directive, Input } from '@angular/core';
import { of } from 'rxjs';
import { expect } from '@jest/globals';
import { SessionService } from './services/session.service';

// Stub pour routerLink
@Directive({ selector: '[routerLink]' })
class RouterLinkStubDirective {
  @Input('routerLink') linkParams: any;
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let sessionServiceMock: any;

  beforeEach(async () => {
    sessionServiceMock = {
      $isLogged: jest.fn(),
      logOut: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [AppComponent, RouterLinkStubDirective],
      imports: [RouterTestingModule, HttpClientTestingModule, MatToolbarModule],
      providers: [
        { provide: SessionService, useValue: sessionServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    sessionServiceMock.$isLogged.mockReturnValue(of(false));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show login/register links when not logged in', () => {
    sessionServiceMock.$isLogged.mockReturnValue(of(false));
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('span[routerLink="login"]')).toBeTruthy();
    expect(compiled.querySelector('span[routerLink="register"]')).toBeTruthy();
  });

  it('should show sessions/account/logout links when logged in', () => {
    sessionServiceMock.$isLogged.mockReturnValue(of(true));
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('span[routerLink="sessions"]')).toBeTruthy();
    expect(compiled.querySelector('span[routerLink="me"]')).toBeTruthy();
    expect(compiled.querySelector('span.link:nth-child(3)')?.textContent).toContain('Logout');
  });

  it('clicking the logout link should call logout() method', () => {
    sessionServiceMock.$isLogged.mockReturnValue(of(true));
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component, 'logout');

    const compiled = fixture.nativeElement as HTMLElement;
    const logoutLink = compiled.querySelector('span.link:nth-child(3)');
    if (logoutLink) {
      (logoutLink as HTMLElement).click();
    }

    expect(spy).toHaveBeenCalled();
  });

  // --------------------------------------------------------
  // Test $isLogged()
  // --------------------------------------------------------
  it('should return true from $isLogged()', (done) => {
    sessionServiceMock.$isLogged.mockReturnValue(of(true));

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    component.$isLogged().subscribe((logged) => {
      expect(logged).toBe(true);
      done();
    });
  });

  it('should return false from $isLogged()', (done) => {
    sessionServiceMock.$isLogged.mockReturnValue(of(false));

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    component.$isLogged().subscribe((logged) => {
      expect(logged).toBe(false);
      done();
    });
  });
});
