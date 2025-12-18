import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { Teacher } from 'src/app/interfaces/teacher.interface';
import { Session } from '../../interfaces/session.interface';
import { DetailComponent } from './detail.component';

describe('DetailComponent Integration', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;

  const mockTeacher: Teacher = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockSession: Session = {
    id: 1,
    name: 'Yoga Session',
    description: 'A relaxing yoga session',
    date: new Date('2024-01-15'),
    teacher_id: 1,
    users: [2, 3],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  };

  const setupTestBed = async (isAdmin: boolean, userId: number = 1) => {
    await TestBed.configureTestingModule({
      declarations: [DetailComponent],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule
      ],
      providers: [
        SessionService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionService.logIn({
      token: 'jwt-token',
      type: 'Bearer',
      id: userId,
      username: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      admin: isAdmin
    });

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('as admin user', () => {
    beforeEach(async () => {
      await setupTestBed(true);
    });

    it('should fetch and display session details with teacher', () => {
      fixture.detectChanges();

      const sessionReq = httpMock.expectOne('api/session/1');
      expect(sessionReq.request.method).toBe('GET');
      sessionReq.flush(mockSession);

      const teacherReq = httpMock.expectOne('api/teacher/1');
      expect(teacherReq.request.method).toBe('GET');
      teacherReq.flush(mockTeacher);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Yoga Session');
      expect(compiled.textContent).toContain('John');
      expect(compiled.textContent).toContain('DOE');
      expect(compiled.textContent).toContain('2 attendees');
    });

    it('should display Delete button for admin', () => {
      fixture.detectChanges();

      const sessionReq = httpMock.expectOne('api/session/1');
      sessionReq.flush(mockSession);

      const teacherReq = httpMock.expectOne('api/teacher/1');
      teacherReq.flush(mockTeacher);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const deleteButton = compiled.querySelector('button[color="warn"]');
      expect(deleteButton).toBeTruthy();
      expect(deleteButton?.textContent).toContain('Delete');
    });

    it('should delete session and navigate to sessions list', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      fixture.detectChanges();

      const sessionReq = httpMock.expectOne('api/session/1');
      sessionReq.flush(mockSession);

      const teacherReq = httpMock.expectOne('api/teacher/1');
      teacherReq.flush(mockTeacher);

      fixture.detectChanges();

      component.delete();

      const deleteReq = httpMock.expectOne('api/session/1');
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});

      expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
    });
  });

  describe('as regular user (not participating)', () => {
    beforeEach(async () => {
      await setupTestBed(false, 10);
    });

    it('should display Participate button when not participating', () => {
      fixture.detectChanges();

      const sessionReq = httpMock.expectOne('api/session/1');
      sessionReq.flush(mockSession);

      const teacherReq = httpMock.expectOne('api/teacher/1');
      teacherReq.flush(mockTeacher);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const participateButton = compiled.querySelector('button[color="primary"]');
      expect(participateButton).toBeTruthy();
      expect(participateButton?.textContent).toContain('Participate');
    });

    it('should call participate API and refresh session', () => {
      fixture.detectChanges();

      const sessionReq = httpMock.expectOne('api/session/1');
      sessionReq.flush(mockSession);

      const teacherReq = httpMock.expectOne('api/teacher/1');
      teacherReq.flush(mockTeacher);

      fixture.detectChanges();

      component.participate();

      const participateReq = httpMock.expectOne('api/session/1/participate/10');
      expect(participateReq.request.method).toBe('POST');
      participateReq.flush({});

      const refreshSessionReq = httpMock.expectOne('api/session/1');
      refreshSessionReq.flush({ ...mockSession, users: [2, 3, 10] });

      const refreshTeacherReq = httpMock.expectOne('api/teacher/1');
      refreshTeacherReq.flush(mockTeacher);
    });
  });

  describe('as regular user (already participating)', () => {
    beforeEach(async () => {
      await setupTestBed(false, 2);
    });

    it('should display Do not participate button when already participating', () => {
      fixture.detectChanges();

      const sessionReq = httpMock.expectOne('api/session/1');
      sessionReq.flush(mockSession);

      const teacherReq = httpMock.expectOne('api/teacher/1');
      teacherReq.flush(mockTeacher);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const unparticipateButton = compiled.querySelector('button[color="warn"]');
      expect(unparticipateButton).toBeTruthy();
      expect(unparticipateButton?.textContent).toContain('Do not participate');
    });

    it('should call unparticipate API and refresh session', () => {
      fixture.detectChanges();

      const sessionReq = httpMock.expectOne('api/session/1');
      sessionReq.flush(mockSession);

      const teacherReq = httpMock.expectOne('api/teacher/1');
      teacherReq.flush(mockTeacher);

      fixture.detectChanges();

      component.unParticipate();

      const unparticipateReq = httpMock.expectOne('api/session/1/participate/2');
      expect(unparticipateReq.request.method).toBe('DELETE');
      unparticipateReq.flush({});

      const refreshSessionReq = httpMock.expectOne('api/session/1');
      refreshSessionReq.flush({ ...mockSession, users: [3] });

      const refreshTeacherReq = httpMock.expectOne('api/teacher/1');
      refreshTeacherReq.flush(mockTeacher);
    });
  });
});
