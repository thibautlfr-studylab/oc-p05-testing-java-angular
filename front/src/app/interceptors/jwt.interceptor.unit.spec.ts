import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { JwtInterceptor } from './jwt.interceptor';
import { SessionService } from '../services/session.service';

describe('JwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let sessionService: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SessionService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true
        }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    sessionService = TestBed.inject(SessionService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    const interceptor = TestBed.inject(JwtInterceptor);
    expect(interceptor).toBeTruthy();
  });

  describe('intercept', () => {
    it('should add Authorization header when user is logged in', () => {
      const mockToken = 'test-jwt-token-123';
      sessionService.isLogged = true;
      sessionService.sessionInformation = {
        token: mockToken,
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      httpClient.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });

    it('should not add Authorization header when user is not logged in', () => {
      sessionService.isLogged = false;
      sessionService.sessionInformation = undefined;

      httpClient.get('/api/test').subscribe();

      const req = httpMock.expectOne('/api/test');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('should handle POST requests with JWT token', () => {
      const mockToken = 'post-request-token';
      sessionService.isLogged = true;
      sessionService.sessionInformation = {
        token: mockToken,
        type: 'Bearer',
        id: 2,
        username: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      };

      const postData = { name: 'Test Data' };
      httpClient.post('/api/sessions', postData).subscribe();

      const req = httpMock.expectOne('/api/sessions');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.body).toEqual(postData);
      req.flush({});
    });

    it('should handle PUT requests with JWT token', () => {
      sessionService.isLogged = true;
      sessionService.sessionInformation = {
        token: 'put-token',
        type: 'Bearer',
        id: 3,
        username: 'user@test.com',
        firstName: 'Test',
        lastName: 'User',
        admin: false
      };

      httpClient.put('/api/sessions/1', { name: 'Updated' }).subscribe();

      const req = httpMock.expectOne('/api/sessions/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.has('Authorization')).toBe(true);
      req.flush({});
    });

    it('should handle DELETE requests with JWT token', () => {
      sessionService.isLogged = true;
      sessionService.sessionInformation = {
        token: 'delete-token',
        type: 'Bearer',
        id: 4,
        username: 'user@example.com',
        firstName: 'User',
        lastName: 'Name',
        admin: true
      };

      httpClient.delete('/api/sessions/1').subscribe();

      const req = httpMock.expectOne('/api/sessions/1');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe('Bearer delete-token');
      req.flush({});
    });

    it('should not modify requests when user is not logged in', () => {
      sessionService.isLogged = false;

      httpClient.post('/api/register', { email: 'test@test.com' }).subscribe();

      const req = httpMock.expectOne('/api/register');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('should handle multiple requests with same token', () => {
      const sharedToken = 'shared-token-abc';
      sessionService.isLogged = true;
      sessionService.sessionInformation = {
        token: sharedToken,
        type: 'Bearer',
        id: 5,
        username: 'multi@test.com',
        firstName: 'Multi',
        lastName: 'Request',
        admin: false
      };

      httpClient.get('/api/endpoint1').subscribe();
      httpClient.get('/api/endpoint2').subscribe();

      const req1 = httpMock.expectOne('/api/endpoint1');
      const req2 = httpMock.expectOne('/api/endpoint2');

      expect(req1.request.headers.get('Authorization')).toBe(`Bearer ${sharedToken}`);
      expect(req2.request.headers.get('Authorization')).toBe(`Bearer ${sharedToken}`);

      req1.flush({});
      req2.flush({});
    });
  });
});