import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { AuthService } from './auth.service';
import { LoginRequest } from '../interfaces/loginRequest.interface';
import { RegisterRequest } from '../interfaces/registerRequest.interface';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should send a POST request to register a new user', () => {
      const registerRequest: RegisterRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      service.register(registerRequest).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      req.flush(null);
    });

    it('should handle register with complete user data', () => {
      const registerRequest: RegisterRequest = {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'securePass456!'
      };

      service.register(registerRequest).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne('api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.email).toBe('jane.smith@example.com');
      expect(req.request.body.firstName).toBe('Jane');
      expect(req.request.body.lastName).toBe('Smith');
      req.flush(null);
    });
  });

  describe('login', () => {
    it('should send a POST request to login a user', () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockSessionInfo: SessionInformation = {
        token: 'jwt-token-123',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      service.login(loginRequest).subscribe(response => {
        expect(response).toEqual(mockSessionInfo);
        expect(response.token).toBe('jwt-token-123');
        expect(response.admin).toBe(false);
      });

      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockSessionInfo);
    });

    it('should return session information for admin user', () => {
      const loginRequest: LoginRequest = {
        email: 'admin@example.com',
        password: 'adminPass'
      };

      const mockAdminSessionInfo: SessionInformation = {
        token: 'admin-jwt-token',
        type: 'Bearer',
        id: 2,
        username: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      };

      service.login(loginRequest).subscribe(response => {
        expect(response.admin).toBe(true);
        expect(response.username).toBe('admin@example.com');
      });

      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockAdminSessionInfo);
    });

    it('should handle different login credentials', () => {
      const loginRequest: LoginRequest = {
        email: 'another.user@test.com',
        password: 'anotherPassword'
      };

      service.login(loginRequest).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne('api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.email).toBe('another.user@test.com');
      expect(req.request.body.password).toBe('anotherPassword');
      req.flush({} as SessionInformation);
    });
  });
});