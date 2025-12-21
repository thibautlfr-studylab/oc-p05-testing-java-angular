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
import { AuthService } from '../../services/auth.service';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
    };

    const mockRouter = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('submit', () => {
    beforeEach(() => {
      component.form.setValue({
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
      });
    });

    it('should call authService.register and navigate to /login on successful registration', () => {
      (authService.register as jest.Mock).mockReturnValue(of(undefined));

      component.submit();

      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
      });
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.onError).toBe(false);
    });

    it('should set onError to true on failed registration', () => {
      (authService.register as jest.Mock).mockReturnValue(
        throwError(() => new Error('Registration failed'))
      );

      component.submit();

      expect(authService.register).toHaveBeenCalledWith({
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
      });
      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.onError).toBe(true);
    });
  });

  it('should have an invalid form when empty', () => {
    component.form.setValue({
      email: '',
      firstName: '',
      lastName: '',
      password: '',
    });
    expect(component.form.valid).toBeFalsy();
  });

  it('should have an invalid email if email is not a valid email', () => {
    component.form.get('email')?.setValue('not-an-email');
    expect(component.form.get('email')?.valid).toBeFalsy();
  });

  it('should have an invalid firstName if it has less than 3 characters', () => {
    component.form.get('firstName')?.setValue('ab');
    expect(component.form.get('firstName')?.valid).toBeFalsy();
  });

  it('should have an invalid lastName if it has less than 3 characters', () => {
    component.form.get('lastName')?.setValue('ab');
    expect(component.form.get('lastName')?.valid).toBeFalsy();
  });

  it('should have an invalid password if it has less than 3 characters', () => {
    component.form.get('password')?.setValue('ab');
    expect(component.form.get('password')?.valid).toBeFalsy();
  });
});
