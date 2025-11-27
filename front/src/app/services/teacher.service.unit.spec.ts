import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { TeacherService } from './teacher.service';
import { Teacher } from '../interfaces/teacher.interface';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  const mockTeacher: Teacher = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockTeachers: Teacher[] = [
    mockTeacher,
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherService]
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('all', () => {
    it('should return all teachers', () => {
      service.all().subscribe(teachers => {
        expect(teachers).toEqual(mockTeachers);
        expect(teachers.length).toBe(2);
      });

      const req = httpMock.expectOne('api/teacher');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers);
    });

    it('should return empty array when no teachers exist', () => {
      service.all().subscribe(teachers => {
        expect(teachers).toEqual([]);
      });

      const req = httpMock.expectOne('api/teacher');
      req.flush([]);
    });
  });

  describe('detail', () => {
    it('should return a teacher by id', () => {
      const teacherId = '1';

      service.detail(teacherId).subscribe(teacher => {
        expect(teacher).toEqual(mockTeacher);
        expect(teacher.id).toBe(1);
        expect(teacher.firstName).toBe('John');
      });

      const req = httpMock.expectOne(`api/teacher/${teacherId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTeacher);
    });

    it('should handle different teacher ids', () => {
      const teacherId = '5';

      service.detail(teacherId).subscribe();

      const req = httpMock.expectOne(`api/teacher/${teacherId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTeacher);
    });
  });
});
