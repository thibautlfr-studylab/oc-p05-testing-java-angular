import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { Session } from '../../interfaces/session.interface';
import { ListComponent } from './list.component';

describe('ListComponent Integration', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;

  const mockSessions: Session[] = [
    {
      id: 1,
      name: 'Yoga Session 1',
      description: 'A relaxing yoga session',
      date: new Date('2024-01-15'),
      teacher_id: 1,
      users: [1, 2]
    },
    {
      id: 2,
      name: 'Yoga Session 2',
      description: 'An advanced yoga session',
      date: new Date('2024-01-20'),
      teacher_id: 2,
      users: [3]
    }
  ];

  const setupTestBed = async (isAdmin: boolean) => {
    await TestBed.configureTestingModule({
      declarations: [ListComponent],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [SessionService]
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionService.logIn({
      token: 'jwt-token',
      type: 'Bearer',
      id: 1,
      username: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      admin: isAdmin
    });

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('as admin user', () => {
    beforeEach(async () => {
      await setupTestBed(true);
    });

    it('should fetch and display sessions list', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const sessionCards = compiled.querySelectorAll('.item');
      expect(sessionCards.length).toBe(2);
      expect(compiled.textContent).toContain('Yoga Session 1');
      expect(compiled.textContent).toContain('Yoga Session 2');
    });

    it('should display Create button for admin', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('api/session');
      req.flush(mockSessions);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const createButton = compiled.querySelector('button[routerLink="create"]');
      expect(createButton).toBeTruthy();
      expect(createButton?.textContent).toContain('Create');
    });

    it('should display Edit button for admin on each session', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('api/session');
      req.flush(mockSessions);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const editButtons = compiled.querySelectorAll('button[ng-reflect-router-link*="update"]');
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });

  describe('as regular user', () => {
    beforeEach(async () => {
      await setupTestBed(false);
    });

    it('should fetch and display sessions list', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const sessionCards = compiled.querySelectorAll('.item');
      expect(sessionCards.length).toBe(2);
    });

    it('should NOT display Create button for regular user', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('api/session');
      req.flush(mockSessions);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const createButton = compiled.querySelector('button[routerLink="create"]');
      expect(createButton).toBeFalsy();
    });

    it('should display Detail button for each session', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('api/session');
      req.flush(mockSessions);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const detailButtons = compiled.querySelectorAll('mat-card-actions button');
      expect(detailButtons.length).toBeGreaterThan(0);
      expect(detailButtons[0].textContent).toContain('Detail');
    });
  });
});
