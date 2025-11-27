import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';
import { expect } from '@jest/globals';
import { RouterTestingModule } from '@angular/router/testing';

import { ListComponent } from './list.component';
import { SessionService } from 'src/app/services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { Session } from '../../interfaces/session.interface';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;

  // ---- MOCK DATA ----
  const mockSessions: Session[] = [
    { id: 1, name: 'Yoga', description: 'Relax session', date: new Date(), teacher_id: 1, users: [] },
    { id: 2, name: 'Pilates', description: 'Strength session', date: new Date(), teacher_id: 1, users: [] },
  ];

  // ---- MOCK SessionService ----
  const mockSessionService = {
    sessionInformation: {
      id: 1,
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      token: 'abc',
      type: 'Bearer',
      admin: true
    }
  };

  // ---- MOCK SessionApiService ----
  const mockSessionApiService = {
    all: jest.fn().mockReturnValue(of(mockSessions))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListComponent],
      imports: [
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        RouterTestingModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ---------------------------------------------------------
  it('should create the component', () => {
    // Vérifie que le composant est instancié correctement
    expect(component).toBeTruthy();
  });

  // ---------------------------------------------------------
  it('should load sessions from SessionApiService', (done) => {
    // Vérifie que sessions$ émet bien les valeurs mockées
    component.sessions$.subscribe(sessions => {
      expect(sessions.length).toBe(2);
      expect(sessions).toEqual(mockSessions);
      done();
    });
  });

  // ---------------------------------------------------------
  it('should display all sessions in the view', () => {
    // Force Angular à mettre à jour le template
    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('mat-card.item'));
    expect(cards.length).toBe(2); // 2 sessions affichées
  });

  // ---------------------------------------------------------
  it('should show the Create button if user is admin', () => {
    fixture.detectChanges();

    const button = fixture.debugElement.query(
      By.css('button[routerLink="create"], button[ng-reflect-router-link="create"]')
    );

    expect(button).toBeTruthy();
  });

  // ---------------------------------------------------------
  it('should show Edit button for each session if user is admin', () => {
    fixture.detectChanges();

    const editButtons = fixture.debugElement.queryAll(
      By.css('button[ng-reflect-router-link^="update"]')
    );

    expect(editButtons.length).toBe(2);
  });

  // ---------------------------------------------------------
  it('should hide admin buttons when user is not admin', () => {
    // On modifie le mock pour simuler un user non admin
    mockSessionService.sessionInformation.admin = false;

    // On doit recréer le composant pour réinjecter le mock modifié
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const createButton = fixture.debugElement.query(
      By.css('button[routerLink="create"], button[ng-reflect-router-link="create"]')
    );

    const editButtons = fixture.debugElement.queryAll(
      By.css('button[ng-reflect-router-link^="update"]')
    );

    expect(createButton).toBeNull();
    expect(editButtons.length).toBe(0);
  });
});
