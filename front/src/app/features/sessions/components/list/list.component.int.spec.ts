import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ListComponent } from './list.component';
import { SessionService } from '../../../../services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { of } from 'rxjs';
import { expect } from '@jest/globals';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ListComponent - Integration', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let mockSessionService: any;
  let mockSessionApi: any;

  const fakeSessions = [
    { id: 1, name: 'Math', description: 'Math session', date: new Date(), teacher_id: 1, users: [] },
    { id: 2, name: 'Physics', description: 'Physics session', date: new Date(), teacher_id: 1, users: [] }
  ];

  beforeEach(async () => {
    mockSessionApi = {
      all: jest.fn().mockReturnValue(of(fakeSessions))
    };

    mockSessionService = {
      sessionInformation: { admin: true, id: 1, token: 'xxx', type: 'Bearer', username: 'u', firstName: 'f', lastName: 'l' }
    };

    await TestBed.configureTestingModule({
      declarations: [ListComponent],
      imports: [
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        RouterTestingModule
      ],
      providers: [
        { provide: SessionApiService, useValue: mockSessionApi },
        { provide: SessionService, useValue: mockSessionService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch sessions on init', fakeAsync(() => {
    let sessions: any;
    component.sessions$.subscribe(s => sessions = s);
    tick();
    expect(mockSessionApi.all).toHaveBeenCalled();
    expect(sessions.length).toBe(2);
    expect(sessions[0].name).toBe('Math');
  }));

  it('should show create button if user is admin', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const createButton = compiled.querySelector('button');
    expect(createButton?.textContent).toContain('Create');
  });

  it('should display sessions in cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sessionCards = compiled.querySelectorAll('mat-card.item');
    expect(sessionCards.length).toBe(2);
    expect(sessionCards[0].textContent).toContain('Math');
    expect(sessionCards[1].textContent).toContain('Physics');
  });
});
