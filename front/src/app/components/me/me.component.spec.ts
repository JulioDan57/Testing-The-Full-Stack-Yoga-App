import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from 'src/app/services/user.service';
import { MeComponent } from './me.component';
import { expect } from '@jest/globals';
import { MatIconModule } from '@angular/material/icon';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MeComponent', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let mockUserService: any;
  let mockRouter: any;
  let mockSessionService: any;

  beforeEach(async () => {
    mockUserService = {
      getById: jest.fn(),
      delete: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn()
    };

    mockSessionService = {
      sessionInformation: { admin: false, id: 1 },
      logOut: jest.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [MeComponent],
      imports: [HttpClientTestingModule, MatSnackBarModule, MatCardModule, MatIconModule, NoopAnimationsModule ],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: SessionService, useValue: mockSessionService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] // <-- Ajouté ici
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display delete button for normal user', () => {
    const mockUser = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      admin: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUserService.getById.mockReturnValue(of(mockUser));

    fixture.detectChanges(); // appelle ngOnInit et le subscribe

    const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
    expect(deleteButton).toBeTruthy();
  });

  it('should NOT display delete button for admin user', () => {
    const mockUser = {
      id: 2,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      admin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUserService.getById.mockReturnValue(of(mockUser));

    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(By.css('button[color="warn"]'));
    expect(deleteButton).toBeNull();
  });

  it('should display user info correctly', () => {
    const mockUser = {
      id: 3,
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@test.com',
      admin: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02')
    };
    mockUserService.getById.mockReturnValue(of(mockUser));

    fixture.detectChanges();

    const nameText = fixture.debugElement.query(By.css('p')).nativeElement.textContent;
    expect(nameText).toContain('Alice');
    expect(nameText).toContain('SMITH');
  });

  it('should call delete user and navigate to / after deletion', fakeAsync(() => {
  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    admin: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Mock du service User
  mockUserService.getById.mockReturnValue(of(mockUser));
  mockUserService.delete.mockReturnValue(of({}));

  fixture.detectChanges();

  // Appel de la méthode delete()
  component.delete();

  // On avance le cycle des observables
  tick(5000);

  // Vérifications
  expect(mockUserService.delete).toHaveBeenCalledWith('1');
  expect(mockSessionService.logOut).toHaveBeenCalled();
  expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  }));

  // Test pour vérifier le comportement quand le bouton "back" est cliqué
  it('should call window.history.back() when back() is called', () => {
    // On mock window.history.back
    const spyBack = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    
    component.back();

    expect(spyBack).toHaveBeenCalled();

    // On restaure le spy pour ne pas impacter d'autres tests
    spyBack.mockRestore();
  });


  it('should call back() when clicking back button', () => {
    jest.spyOn(component, 'back');

    const backButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));
    backButton.triggerEventHandler('click', null);

    expect(component.back).toHaveBeenCalled();
  });


  it('should display created and updated dates', () => {
    const mockUser = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      admin: false,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-02-01')
    };
    mockUserService.getById.mockReturnValue(of(mockUser));

    fixture.detectChanges();

    const cardContent = fixture.debugElement.nativeElement;
    expect(cardContent.textContent).toContain('January 1, 2023');
    expect(cardContent.textContent).toContain('February 1, 2023');
  });


  it('should display admin message for admin user', () => {
    const mockUser = {
      id: 2,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      admin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockUserService.getById.mockReturnValue(of(mockUser));

    fixture.detectChanges();

    const adminText = fixture.debugElement.query(By.css('p.my2'));
    expect(adminText.nativeElement.textContent).toContain('You are admin');
  });


});
