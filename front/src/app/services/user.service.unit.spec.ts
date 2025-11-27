import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    admin: false,
    password: 'password',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getById', () => {
    it('should return a user by id', () => {
      const userId = '1';

      service.getById(userId).subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(user.id).toBe(1);
        expect(user.email).toBe('test@example.com');
      });

      const req = httpMock.expectOne(`api/user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('delete', () => {
    it('should delete a user by id', () => {
      const userId = '1';

      service.delete(userId).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`api/user/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
