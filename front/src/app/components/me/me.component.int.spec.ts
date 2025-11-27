import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeComponent } from './me.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SessionService } from '../../services/session.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';

describe('MeComponent - Integration', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  let sessionService: SessionService;
  let ngZone: NgZone;

  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.com',
    admin: false,
    password: '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Mock MatSnackBar to avoid animations
  const snackBarMock = {
    open: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeComponent],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        NoopAnimationsModule
      ],
      providers: [
        UserService,
        SessionService,
        { provide: MatSnackBar, useValue: snackBarMock }
      ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA] // <-- ajoute ça
    }).compileComponents();
  });

  beforeEach(() => {
    sessionService = TestBed.inject(SessionService);
    sessionService.logIn({
      id: 1,
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      admin: false,
      token: 'xxx',
      type: 'Bearer'
    });

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
    ngZone = TestBed.inject(NgZone);

    fixture.detectChanges();

    // Handle GET /api/user/1
    const req = httpMock.expectOne('api/user/1');
    req.flush(mockUser);

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.user).toEqual(mockUser);
  });

    it('should delete the user, show snackbar, logout and navigate home', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    const logoutSpy = jest.spyOn(sessionService, 'logOut');

    // On exécute le delete() qui fait un subscribe()
    component.delete();

    // On "flush" la requête DELETE à l'intérieur de ngZone.run()
    const req = httpMock.expectOne('api/user/1');
    ngZone.run(() => {
        req.flush({});
    });

    fixture.detectChanges();

    expect(snackBarMock.open).toHaveBeenCalled();
    expect(logoutSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
});
