import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionService } from './session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with isLogged as false', () => {
    expect(service.isLogged).toBe(false);
  });

  it('should initialize with undefined sessionInformation', () => {
    expect(service.sessionInformation).toBeUndefined();
  });

  describe('$isLogged', () => {
    it('should return an Observable of isLogged state', (done) => {
      service.$isLogged().subscribe(isLogged => {
        expect(isLogged).toBe(false);
        done();
      });
    });

    it('should emit true when user logs in', (done) => {
      const mockUser: SessionInformation = {
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      service.$isLogged().subscribe(isLogged => {
        if (isLogged) {
          expect(isLogged).toBe(true);
          done();
        }
      });

      service.logIn(mockUser);
    });

    it('should emit false when user logs out', (done) => {
      const mockUser: SessionInformation = {
        token: 'test-token',
        type: 'Bearer',
        id: 1,
        username: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        admin: false
      };

      let emissionCount = 0;
      service.$isLogged().subscribe(isLogged => {
        emissionCount++;
        if (emissionCount === 3) {
          expect(isLogged).toBe(false);
          done();
        }
      });

      service.logIn(mockUser);
      service.logOut();
    });
  });

  describe('logIn', () => {
    it('should set sessionInformation', () => {
      const mockUser: SessionInformation = {
        token: 'jwt-token-123',
        type: 'Bearer',
        id: 1,
        username: 'user@test.com',
        firstName: 'Jane',
        lastName: 'Smith',
        admin: false
      };

      service.logIn(mockUser);

      expect(service.sessionInformation).toEqual(mockUser);
    });

    it('should set isLogged to true', () => {
      const mockUser: SessionInformation = {
        token: 'token',
        type: 'Bearer',
        id: 2,
        username: 'admin@test.com',
        firstName: 'Admin',
        lastName: 'User',
        admin: true
      };

      service.logIn(mockUser);

      expect(service.isLogged).toBe(true);
    });

    it('should store admin user correctly', () => {
      const adminUser: SessionInformation = {
        token: 'admin-token',
        type: 'Bearer',
        id: 3,
        username: 'admin@example.com',
        firstName: 'Super',
        lastName: 'Admin',
        admin: true
      };

      service.logIn(adminUser);

      expect(service.sessionInformation?.admin).toBe(true);
      expect(service.isLogged).toBe(true);
    });

    it('should update observable on login', (done) => {
      const mockUser: SessionInformation = {
        token: 'test-token',
        type: 'Bearer',
        id: 4,
        username: 'observable@test.com',
        firstName: 'Observable',
        lastName: 'Test',
        admin: false
      };

      let emitted = false;
      service.$isLogged().subscribe(isLogged => {
        if (isLogged && !emitted) {
          emitted = true;
          expect(isLogged).toBe(true);
          done();
        }
      });

      service.logIn(mockUser);
    });
  });

  describe('logOut', () => {
    it('should clear sessionInformation', () => {
      const mockUser: SessionInformation = {
        token: 'token-to-clear',
        type: 'Bearer',
        id: 5,
        username: 'logout@test.com',
        firstName: 'Logout',
        lastName: 'User',
        admin: false
      };

      service.logIn(mockUser);
      expect(service.sessionInformation).toBeDefined();

      service.logOut();
      expect(service.sessionInformation).toBeUndefined();
    });

    it('should set isLogged to false', () => {
      const mockUser: SessionInformation = {
        token: 'temp-token',
        type: 'Bearer',
        id: 6,
        username: 'temp@test.com',
        firstName: 'Temp',
        lastName: 'User',
        admin: false
      };

      service.logIn(mockUser);
      expect(service.isLogged).toBe(true);

      service.logOut();
      expect(service.isLogged).toBe(false);
    });

    it('should update observable on logout', (done) => {
      const mockUser: SessionInformation = {
        token: 'observable-logout-token',
        type: 'Bearer',
        id: 7,
        username: 'obs-logout@test.com',
        firstName: 'ObsLogout',
        lastName: 'Test',
        admin: true
      };

      let emissionCount = 0;
      service.$isLogged().subscribe(isLogged => {
        emissionCount++;
        if (emissionCount === 3 && !isLogged) {
          expect(isLogged).toBe(false);
          done();
        }
      });

      service.logIn(mockUser);
      service.logOut();
    });

    it('should handle logout when already logged out', () => {
      expect(service.isLogged).toBe(false);

      service.logOut();

      expect(service.isLogged).toBe(false);
      expect(service.sessionInformation).toBeUndefined();
    });
  });
});
