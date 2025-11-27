import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';

import { AuthGuard } from './auth.guard';
import { SessionService } from '../services/session.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        SessionService,
        {
          provide: Router,
          useValue: {
            navigate: jest.fn()
          }
        }
      ]
    });
    guard = TestBed.inject(AuthGuard);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when user is logged in', () => {
      sessionService.isLogged = true;

      const result = guard.canActivate();

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should return false when user is not logged in', () => {
      sessionService.isLogged = false;

      const result = guard.canActivate();

      expect(result).toBe(false);
    });

    it('should navigate to login page when user is not logged in', () => {
      sessionService.isLogged = false;

      guard.canActivate();

      expect(router.navigate).toHaveBeenCalledWith(['login']);
    });

    it('should not navigate when user is logged in', () => {
      sessionService.isLogged = true;

      guard.canActivate();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});