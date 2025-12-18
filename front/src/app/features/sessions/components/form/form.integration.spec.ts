import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { Teacher } from 'src/app/interfaces/teacher.interface';
import { Session } from '../../interfaces/session.interface';
import { FormComponent } from './form.component';

describe('FormComponent Integration - Create', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;

  const mockTeachers: Teacher[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, firstName: 'Jane', lastName: 'Smith', createdAt: new Date(), updatedAt: new Date() }
  ];

  const mockSession: Session = {
    id: 1,
    name: 'Yoga Session',
    description: 'A relaxing yoga session',
    date: new Date('2024-01-15'),
    teacher_id: 1,
    users: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormComponent],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule
      ],
      providers: [
        SessionService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionService.logIn({
      token: 'jwt-token',
      type: 'Bearer',
      id: 1,
      username: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      admin: true
    });

    router = TestBed.inject(Router);
    jest.spyOn(router, 'url', 'get').mockReturnValue('/sessions/create');

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should display create form with empty fields', () => {
    fixture.detectChanges();

    const teachersReq = httpMock.expectOne('api/teacher');
    teachersReq.flush(mockTeachers);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Create session');
    expect(component.onUpdate).toBeFalsy();
  });

  it('should load teachers list from API', () => {
    fixture.detectChanges();

    const teachersReq = httpMock.expectOne('api/teacher');
    expect(teachersReq.request.method).toBe('GET');
    teachersReq.flush(mockTeachers);

    fixture.detectChanges();
  });

  it('should create session on form submit', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    fixture.detectChanges();

    const teachersReq = httpMock.expectOne('api/teacher');
    teachersReq.flush(mockTeachers);

    fixture.detectChanges();

    component.sessionForm!.controls['name'].setValue('New Session');
    component.sessionForm!.controls['date'].setValue('2024-01-20');
    component.sessionForm!.controls['teacher_id'].setValue(1);
    component.sessionForm!.controls['description'].setValue('A new yoga session');

    component.submit();

    const createReq = httpMock.expectOne('api/session');
    expect(createReq.request.method).toBe('POST');
    expect(createReq.request.body.name).toBe('New Session');
    createReq.flush(mockSession);

    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });

  it('should disable submit button when form is invalid', () => {
    fixture.detectChanges();

    const teachersReq = httpMock.expectOne('api/teacher');
    teachersReq.flush(mockTeachers);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(submitButton.disabled).toBeTruthy();
    expect(component.sessionForm!.valid).toBeFalsy();
  });
});

describe('FormComponent Integration - Update', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let httpMock: HttpTestingController;
  let sessionService: SessionService;
  let router: Router;

  const mockTeachers: Teacher[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, firstName: 'Jane', lastName: 'Smith', createdAt: new Date(), updatedAt: new Date() }
  ];

  const mockSession: Session = {
    id: 1,
    name: 'Yoga Session',
    description: 'A relaxing yoga session',
    date: new Date('2024-01-15'),
    teacher_id: 1,
    users: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormComponent],
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule
      ],
      providers: [
        SessionService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    sessionService = TestBed.inject(SessionService);
    sessionService.logIn({
      token: 'jwt-token',
      type: 'Bearer',
      id: 1,
      username: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      admin: true
    });

    router = TestBed.inject(Router);
    jest.spyOn(router, 'url', 'get').mockReturnValue('/sessions/update/1');

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should display update form with pre-filled data', () => {
    fixture.detectChanges();

    // In update mode, session detail is fetched first (from ngOnInit)
    const sessionReq = httpMock.expectOne('api/session/1');
    expect(sessionReq.request.method).toBe('GET');
    sessionReq.flush(mockSession);

    // After session is loaded, sessionForm is created, then template renders the form with async pipe
    fixture.detectChanges();

    const teachersReq = httpMock.expectOne('api/teacher');
    teachersReq.flush(mockTeachers);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Update session');
    expect(component.onUpdate).toBeTruthy();
    expect(component.sessionForm!.controls['name'].value).toBe('Yoga Session');
  });

  it('should update session on form submit', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    fixture.detectChanges();

    // In update mode, session detail is fetched first
    const sessionReq = httpMock.expectOne('api/session/1');
    sessionReq.flush(mockSession);

    // After session is loaded, template renders and async pipe subscribes
    fixture.detectChanges();

    const teachersReq = httpMock.expectOne('api/teacher');
    teachersReq.flush(mockTeachers);

    fixture.detectChanges();

    component.sessionForm!.controls['name'].setValue('Updated Session');
    component.submit();

    const updateReq = httpMock.expectOne('api/session/1');
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body.name).toBe('Updated Session');
    updateReq.flush({ ...mockSession, name: 'Updated Session' });

    expect(navigateSpy).toHaveBeenCalledWith(['sessions']);
  });
});
