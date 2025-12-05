import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { SessionService } from 'src/app/services/session.service';
import { AuthService } from '../../services/auth.service';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;
  let sessionService: SessionService;

  const mockSessionInformation: SessionInformation = {
    token: 'jwt.token.string',
    type: 'Bearer',
    id: 1,
    username: 'test@test.com',
    firstName: 'Test',
    lastName: 'User',
    admin: false,
  };

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
    };

    const mockSessionService = {
      logIn: jest.fn(),
    };

    const mockRouter = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: Router, useValue: mockRouter },
      ],
      imports: [
        NoopAnimationsModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    sessionService = TestBed.inject(SessionService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('submit', () => {
    beforeEach(() => {
      component.form.setValue({
        email: 'test@test.com',
        password: 'password123',
      });
    });

    it('should call authService.login and navigate to /sessions on successful login', () => {
      (authService.login as jest.Mock).mockReturnValue(of(mockSessionInformation));

      component.submit();

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
      expect(sessionService.logIn).toHaveBeenCalledWith(mockSessionInformation);
      expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
      expect(component.onError).toBe(false);
    });

    it('should set onError to true on failed login', () => {
      (authService.login as jest.Mock).mockReturnValue(
        throwError(() => new Error('Login failed'))
      );

      component.submit();

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
      expect(sessionService.logIn).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.onError).toBe(true);
    });
  });

  it('should have an invalid form when empty', () => {
    component.form.setValue({
      email: '',
      password: '',
    });
    expect(component.form.valid).toBeFalsy();
  });

  it('should have an invalid email if email is not a valid email', () => {
    component.form.get('email')?.setValue('not-an-email');
    expect(component.form.get('email')?.valid).toBeFalsy();
  });

  it('should have an invalid password if password has less than 3 characters', () => {
    component.form.get('password')?.setValue('12');
    expect(component.form.get('password')?.valid).toBeFalsy();
  });
});
