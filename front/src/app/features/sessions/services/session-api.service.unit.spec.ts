import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionApiService } from './session-api.service';
import { Session } from '../interfaces/session.interface';

describe('SessionsService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  const mockSession: Session = {
    id: 1,
    name: 'Yoga Session',
    description: 'A relaxing yoga session',
    date: new Date('2024-01-15'),
    teacher_id: 1,
    users: [1, 2],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockSessions: Session[] = [
    mockSession,
    {
      id: 2,
      name: 'Advanced Yoga',
      description: 'For experienced practitioners',
      date: new Date('2024-01-16'),
      teacher_id: 2,
      users: [3],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionApiService]
    });
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('all', () => {
    it('should return all sessions', () => {
      service.all().subscribe(sessions => {
        expect(sessions).toEqual(mockSessions);
        expect(sessions.length).toBe(2);
      });

      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('GET');
      req.flush(mockSessions);
    });

    it('should return empty array when no sessions exist', () => {
      service.all().subscribe(sessions => {
        expect(sessions).toEqual([]);
        expect(sessions.length).toBe(0);
      });

      const req = httpMock.expectOne('api/session');
      req.flush([]);
    });
  });

  describe('detail', () => {
    it('should return a session by id', () => {
      const sessionId = '1';

      service.detail(sessionId).subscribe(session => {
        expect(session).toEqual(mockSession);
        expect(session.id).toBe(1);
        expect(session.name).toBe('Yoga Session');
      });

      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSession);
    });

    it('should handle different session ids', () => {
      const sessionId = '42';

      service.detail(sessionId).subscribe();

      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSession);
    });
  });

  describe('delete', () => {
    it('should delete a session by id', () => {
      const sessionId = '1';

      service.delete(sessionId).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should handle deletion of different session ids', () => {
      const sessionId = '99';

      service.delete(sessionId).subscribe();

      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('create', () => {
    it('should create a new session', () => {
      const newSession: Session = {
        name: 'Morning Yoga',
        description: 'Start your day with yoga',
        date: new Date('2024-02-01'),
        teacher_id: 3,
        users: []
      };

      service.create(newSession).subscribe(session => {
        expect(session).toBeTruthy();
        expect(session.name).toBe('Morning Yoga');
      });

      const req = httpMock.expectOne('api/session');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newSession);
      req.flush({ ...newSession, id: 3 });
    });

    it('should send complete session data on creation', () => {
      service.create(mockSession).subscribe();

      const req = httpMock.expectOne('api/session');
      expect(req.request.body.name).toBe('Yoga Session');
      expect(req.request.body.teacher_id).toBe(1);
      req.flush(mockSession);
    });
  });

  describe('update', () => {
    it('should update an existing session', () => {
      const sessionId = '1';
      const updatedSession: Session = {
        ...mockSession,
        name: 'Updated Yoga Session',
        description: 'Updated description'
      };

      service.update(sessionId, updatedSession).subscribe(session => {
        expect(session.name).toBe('Updated Yoga Session');
        expect(session.description).toBe('Updated description');
      });

      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedSession);
      req.flush(updatedSession);
    });

    it('should handle update with different session id', () => {
      const sessionId = '5';

      service.update(sessionId, mockSession).subscribe();

      const req = httpMock.expectOne(`api/session/${sessionId}`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockSession);
    });
  });

  describe('participate', () => {
    it('should add user to session participants', () => {
      const sessionId = '1';
      const userId = '5';

      service.participate(sessionId, userId).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeNull();
      req.flush(null);
    });

    it('should handle participation with different ids', () => {
      const sessionId = '10';
      const userId = '20';

      service.participate(sessionId, userId).subscribe();

      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('unParticipate', () => {
    it('should remove user from session participants', () => {
      const sessionId = '1';
      const userId = '5';

      service.unParticipate(sessionId, userId).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle unparticipation with different ids', () => {
      const sessionId = '15';
      const userId = '25';

      service.unParticipate(sessionId, userId).subscribe();

      const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
