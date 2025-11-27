import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { expect } from '@jest/globals';

import { UnauthGuard } from './unauth.guard';
import { SessionService } from '../services/session.service';

describe('UnauthGuard', () => {
  let guard: UnauthGuard;
  let sessionService: SessionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UnauthGuard,
        SessionService,
        {
          provide: Router,
          useValue: {
            navigate: jest.fn()
          }
        }
      ]
    });
    guard = TestBed.inject(UnauthGuard);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true when user is not logged in', () => {
      sessionService.isLogged = false;

      const result = guard.canActivate();

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should return false when user is logged in', () => {
      sessionService.isLogged = true;

      const result = guard.canActivate();

      expect(result).toBe(false);
    });

    it('should navigate to rentals page when user is logged in', () => {
      sessionService.isLogged = true;

      guard.canActivate();

      expect(router.navigate).toHaveBeenCalledWith(['rentals']);
    });

    it('should not navigate when user is not logged in', () => {
      sessionService.isLogged = false;

      guard.canActivate();

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});