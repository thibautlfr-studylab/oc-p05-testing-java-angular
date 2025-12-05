import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be logged out by default', () => {
    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
  });

  it('should log in a user', () => {
    const user: SessionInformation = {
      token: 'token',
      type: 'type',
      id: 1,
      username: 'username',
      firstName: 'firstName',
      lastName: 'lastName',
      admin: false,
    };

    service.logIn(user);

    expect(service.isLogged).toBe(true);
    expect(service.sessionInformation).toEqual(user);
  });

  it('should log out a user', () => {
    const user: SessionInformation = {
      token: 'token',
      type: 'type',
      id: 1,
      username: 'username',
      firstName: 'firstName',
      lastName: 'lastName',
      admin: false,
    };

    service.logIn(user);
    service.logOut();

    expect(service.isLogged).toBe(false);
    expect(service.sessionInformation).toBeUndefined();
  });

  it('should emit the login status', (done) => {
    service.$isLogged().subscribe((isLogged) => {
      expect(isLogged).toBe(true);
      done();
    });

    const user: SessionInformation = {
      token: 'token',
      type: 'type',
      id: 1,
      username: 'username',
      firstName: 'firstName',
      lastName: 'lastName',
      admin: false,
    };

    service.logIn(user);
  });
});
