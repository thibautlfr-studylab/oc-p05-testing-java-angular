import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { RegisterComponent } from './register.component';

describe('RegisterComponent Integration', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and display register form', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.register-form')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="firstName"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="lastName"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[formControlName="password"]')).toBeTruthy();
  });

  it('should validate form fields', () => {
    const firstNameInput = component.form.controls['firstName'];
    const lastNameInput = component.form.controls['lastName'];
    const emailInput = component.form.controls['email'];
    const passwordInput = component.form.controls['password'];

    expect(component.form.valid).toBeFalsy();

    emailInput.setValue('invalid-email');
    expect(emailInput.valid).toBeFalsy();

    emailInput.setValue('test@test.com');
    firstNameInput.setValue('Jo'); // Too short
    expect(firstNameInput.valid).toBeFalsy();

    firstNameInput.setValue('John');
    lastNameInput.setValue('Do'); // Too short
    expect(lastNameInput.valid).toBeFalsy();

    lastNameInput.setValue('Doe');
    passwordInput.setValue('12'); // Too short
    expect(passwordInput.valid).toBeFalsy();

    passwordInput.setValue('123'); // Valid length
    expect(component.form.valid).toBeTruthy();
  });

  it('should call register API and navigate to login on success', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.form.controls['email'].setValue('test@test.com');
    component.form.controls['firstName'].setValue('John');
    component.form.controls['lastName'].setValue('Doe');
    component.form.controls['password'].setValue('password');

    component.submit();

    const req = httpMock.expectOne('api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush({});

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should display error message on register failure', () => {
    component.form.controls['email'].setValue('test@test.com');
    component.form.controls['firstName'].setValue('John');
    component.form.controls['lastName'].setValue('Doe');
    component.form.controls['password'].setValue('password');

    component.submit();

    const req = httpMock.expectOne('api/auth/register');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(component.onError).toBeTruthy();
    expect(compiled.querySelector('.error')).toBeTruthy();
  });

  it('should disable submit button when form is invalid', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(submitButton.disabled).toBeTruthy();

    component.form.controls['email'].setValue('test@test.com');
    component.form.controls['firstName'].setValue('John');
    component.form.controls['lastName'].setValue('Doe');
    component.form.controls['password'].setValue('password');
    fixture.detectChanges();

    expect(submitButton.disabled).toBeFalsy();
  });
});
