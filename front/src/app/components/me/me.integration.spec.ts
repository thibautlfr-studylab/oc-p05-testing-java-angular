import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { User } from '../../interfaces/user.interface';
import { MeComponent } from './me.component';

describe('MeComponent Integration', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;
  let snackBar: MatSnackBar;

  const mockUser: User = {
    id: 1,
    email: 'test@test.com',
    lastName: 'Doe',
    firstName: 'John',
    admin: false,
    password: 'password',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  };

  const mockAdminUser: User = {
    ...mockUser,
    admin: true
  };

  const setupTestBed = async (isAdmin: boolean) => {
    await TestBed.configureTestingModule({
      declarations: [MeComponent],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule
      ],
      providers: [SessionService]
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionService.logIn({
      token: 'jwt-token',
      type: 'Bearer',
      id: 1,
      username: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      admin: isAdmin
    });

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    snackBar = TestBed.inject(MatSnackBar);
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('as regular user', () => {
    beforeEach(async () => {
      await setupTestBed(false);
    });

    it('should fetch and display user information', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('api/user/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('John');
      expect(compiled.textContent).toContain('DOE');
      expect(compiled.textContent).toContain('test@test.com');
    });

    it('should display delete button for non-admin user', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('api/user/1');
      req.flush(mockUser);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const deleteButton = compiled.querySelector('button[color="warn"]');
      expect(deleteButton).toBeTruthy();
    });

    it('should delete account and navigate to home on delete', () => {
      const navigateSpy = jest.spyOn(router, 'navigate');
      const logOutSpy = jest.spyOn(sessionService, 'logOut');

      fixture.detectChanges();

      const getUserReq = httpMock.expectOne('api/user/1');
      getUserReq.flush(mockUser);

      fixture.detectChanges();

      component.delete();

      const deleteReq = httpMock.expectOne('api/user/1');
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});

      expect(logOutSpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });

  describe('as admin user', () => {
    beforeEach(async () => {
      await setupTestBed(true);
    });

    it('should display admin status message', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('api/user/1');
      req.flush(mockAdminUser);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('You are admin');
    });

    it('should NOT display delete button for admin user', () => {
      fixture.detectChanges();

      const req = httpMock.expectOne('api/user/1');
      req.flush(mockAdminUser);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const deleteButton = compiled.querySelector('button[color="warn"]');
      expect(deleteButton).toBeFalsy();
    });
  });
});
