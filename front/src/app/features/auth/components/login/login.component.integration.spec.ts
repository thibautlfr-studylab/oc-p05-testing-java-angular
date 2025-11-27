import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';
import { AuthService } from '../../services/auth.service';
import { LoginComponent } from './login.component';

@Component({ template: '' })
class DummyComponent { }

describe('LoginComponent Integration Tests', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpTestingController: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent, DummyComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
      ],
      providers: [
        AuthService,
        SessionService,
        {
          provide: Router,
          useValue: { navigate: jest.fn() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  afterEach(() => {
    // Vérifie qu'il n'y a pas de requêtes HTTP en attente
    httpTestingController.verify();
  });

  it('should complete full login flow successfully', () => {
    // ARRANGE : Prépare les données de test
    const mockLoginResponse: SessionInformation = {
      token: 'jwt-token-12345',
      type: 'Bearer',
      id: 1,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      admin: false
    };

    const navigateSpy = jest.spyOn(router, 'navigate');

    // ACT : Simule l'action utilisateur
    component.form.setValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.submit();

    // ASSERT : Vérifie la requête HTTP
    const req = httpTestingController.expectOne('api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@example.com',
      password: 'password123'
    });

    // Simule la réponse du serveur
    req.flush(mockLoginResponse);

    // ASSERT : Vérifie que le SessionService a été mis à jour
    expect(sessionService.isLogged).toBe(true);
    expect(sessionService.sessionInformation).toEqual(mockLoginResponse);

    // ASSERT : Vérifie la navigation
    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
  });

  it('should handle failed login flow correctly', () => {
    // ARRANGE
    const navigateSpy = jest.spyOn(router, 'navigate');

    // ACT
    component.form.setValue({
      email: 'wrong@example.com',
      password: 'wrongpassword'
    });

    component.submit();

    // Simule une erreur HTTP 401
    const req = httpTestingController.expectOne('api/auth/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // ASSERT : Vérifie que l'erreur est gérée
    expect(component.onError).toBe(true);

    // ASSERT : Vérifie que le SessionService n'a PAS été modifié
    expect(sessionService.isLogged).toBe(false);
    expect(sessionService.sessionInformation).toBeUndefined();

    // ASSERT : Vérifie qu'il n'y a PAS de navigation
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should update SessionService observable when login succeeds', (done) => {
    // ARRANGE
    const mockLoginResponse: SessionInformation = {
      token: 'jwt-token-12345',
      type: 'Bearer',
      id: 1,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      admin: true
    };

    let isLoggedEmissions: boolean[] = [];

    // Subscribe to the observable to track emissions
    const subscription = sessionService.$isLogged().subscribe(isLogged => {
      isLoggedEmissions.push(isLogged);
    });

    // ACT
    component.form.setValue({
      email: 'admin@test.com',
      password: 'admin123'
    });

    component.submit();

    const req = httpTestingController.expectOne('api/auth/login');
    req.flush(mockLoginResponse);

    // ASSERT : Vérifie les émissions de l'Observable
    // [false] (valeur initiale) → [false, true] (après login)
    setTimeout(() => {
      expect(isLoggedEmissions).toEqual([false, true]);
      subscription.unsubscribe();
      done();
    }, 100);
  });

  it('should have invalid form when email is incorrect', () => {
    // ARRANGE : Formulaire invalide (email incorrect)
    component.form.setValue({
      email: 'not-an-email',
      password: 'password123'
    });

    // ASSERT : Le formulaire doit être invalide
    expect(component.form.valid).toBe(false);
    expect(component.form.get('email')?.errors).toBeTruthy();
    expect(component.form.get('email')?.errors?.['email']).toBe(true);
  });

  it('should correctly handle admin user login', () => {
    // ARRANGE
    const mockAdminResponse: SessionInformation = {
      token: 'admin-token',
      type: 'Bearer',
      id: 1,
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      admin: true  // ⚠️ Utilisateur administrateur
    };

    // ACT
    component.form.setValue({
      email: 'admin@studio.com',
      password: 'admin123'
    });

    component.submit();

    const req = httpTestingController.expectOne('api/auth/login');
    req.flush(mockAdminResponse);

    // ASSERT : Vérifie que le rôle admin est correctement stocké
    expect(sessionService.sessionInformation?.admin).toBe(true);
  });
});
