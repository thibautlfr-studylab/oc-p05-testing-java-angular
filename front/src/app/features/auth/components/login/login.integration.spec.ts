import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { LoginComponent } from './login.component';

describe('LoginComponent Integration', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
      ],
      providers: [SessionService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and display login form', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.login-form')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="password"]')).toBeTruthy();
  });

  it('should validate form fields', () => {
    const emailInput = component.form.controls['email'];
    const passwordInput = component.form.controls['password'];

    expect(component.form.valid).toBeFalsy();

    emailInput.setValue('invalid-email');
    expect(emailInput.valid).toBeFalsy();

    emailInput.setValue('test@test.com');
    passwordInput.setValue('12'); // Too short
    expect(passwordInput.valid).toBeFalsy();

    passwordInput.setValue('123'); // Valid length
    expect(component.form.valid).toBeTruthy();
  });

  it('should call login API and navigate on success', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.form.controls['email'].setValue('yoga@studio.com');
    component.form.controls['password'].setValue('test!1234');

    component.submit();

    const req = httpMock.expectOne('api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({
      token: 'jwt-token',
      type: 'Bearer',
      id: 1,
      username: 'yoga@studio.com',
      firstName: 'Admin',
      lastName: 'Admin',
      admin: true
    });

    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
  });

  it('should display error message on login failure', () => {
    component.form.controls['email'].setValue('yoga@studio.com');
    component.form.controls['password'].setValue('wrong-password');

    component.submit();

    const req = httpMock.expectOne('api/auth/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(component.onError).toBeTruthy();
    expect(compiled.querySelector('.error')).toBeTruthy();
  });

  it('should hide password by default and toggle visibility', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const passwordInput = compiled.querySelector('input[formControlName="password"]') as HTMLInputElement;
    const toggleButton = compiled.querySelector('button[matSuffix]') as HTMLButtonElement;

    expect(passwordInput.type).toBe('password');
    expect(component.hide).toBeTruthy();

    toggleButton.click();
    fixture.detectChanges();

    expect(passwordInput.type).toBe('text');
    expect(component.hide).toBeFalsy();
  });
});
