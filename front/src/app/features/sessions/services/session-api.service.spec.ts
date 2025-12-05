import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Session } from '../interfaces/session.interface';
import { SessionApiService } from './session-api.service';
import { expect } from '@jest/globals';

describe('SessionApiService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

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

  it('should retrieve all sessions', () => {
    const mockSessions: Session[] = [
      { id: 1, name: 'Yoga Session 1', description: 'Description 1', date: new Date(), teacher_id: 1, users: [], createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Yoga Session 2', description: 'Description 2', date: new Date(), teacher_id: 2, users: [], createdAt: new Date(), updatedAt: new Date() }
    ];

    service.all().subscribe(sessions => {
      expect(sessions.length).toBe(2);
      expect(sessions).toEqual(mockSessions);
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('GET');
    req.flush(mockSessions);
  });

  it('should retrieve session detail', () => {
    const mockSession: Session = { id: 1, name: 'Yoga Session 1', description: 'Description 1', date: new Date(), teacher_id: 1, users: [], createdAt: new Date(), updatedAt: new Date() };

    service.detail('1').subscribe(session => {
      expect(session).toEqual(mockSession);
    });

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockSession);
  });

  it('should delete a session', () => {
    service.delete('1').subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should create a session', () => {
    const newSession: Session = { name: 'New Session', description: 'New Description', date: new Date(), teacher_id: 1, users: [] };
    const createdSession: Session = { ...newSession, id: 1, createdAt: new Date(), updatedAt: new Date() };

    service.create(newSession).subscribe(session => {
      expect(session).toEqual(createdSession);
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newSession);
    req.flush(createdSession);
  });

  it('should update a session', () => {
    const updateSession: Session = { id: 1, name: 'Updated Session', description: 'Updated Description', date: new Date(), teacher_id: 1, users: [], createdAt: new Date(), updatedAt: new Date() };

    service.update('1', updateSession).subscribe(session => {
      expect(session).toEqual(updateSession);
    });

    const req = httpMock.expectOne('api/session/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateSession);
    req.flush(updateSession);
  });

  it('should participate in a session', () => {
    service.participate('1', 'user1').subscribe(() => {
      // success
    });

    const req = httpMock.expectOne('api/session/1/participate/user1');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(null);
  });

  it('should unParticipate from a session', () => {
    service.unParticipate('1', 'user1').subscribe(() => {
      // success
    });

    const req = httpMock.expectOne('api/session/1/participate/user1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
