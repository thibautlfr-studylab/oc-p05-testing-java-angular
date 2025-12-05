import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { expect } from '@jest/globals';
import { of } from 'rxjs';
import { SessionService } from 'src/app/services/session.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { Session } from '../../interfaces/session.interface';
import { SessionApiService } from '../../services/session-api.service';

import { FormComponent } from './form.component';
import { Teacher } from 'src/app/interfaces/teacher.interface';

describe('FormComponent', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let sessionApiService: SessionApiService;
  let router: Router;
  let matSnackBar: MatSnackBar;

  const mockTeachers: Teacher[] = [
    { id: 1, lastName: 'Doe', firstName: 'John', createdAt: new Date(), updatedAt: new Date() },
  ];

  const mockSession: Session = {
    id: 1,
    name: 'Test Session',
    description: 'Test Description',
    date: new Date(),
    teacher_id: 1,
    users: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSessionService = {
    sessionInformation: {
      admin: true,
    },
  };

  beforeEach(async () => {
    const mockSessionApiService = {
      create: jest.fn().mockReturnValue(of(mockSession)),
      update: jest.fn().mockReturnValue(of(mockSession)),
      detail: jest.fn().mockReturnValue(of(mockSession)),
    };

    const mockTeacherService = {
      all: jest.fn().mockReturnValue(of(mockTeachers)),
    };

    const mockRouter = {
      navigate: jest.fn(),
      url: '',
    };

    const mockMatSnackBar = {
      open: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule,
      ],
      declarations: [FormComponent],
      providers: [
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockMatSnackBar },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (id: string) => '1',
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    sessionApiService = TestBed.inject(SessionApiService);
    router = TestBed.inject(Router);
    matSnackBar = TestBed.inject(MatSnackBar);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form for creation', () => {
    (router as any).url = 'create';
    component.ngOnInit();
    expect(component.onUpdate).toBe(false);
    expect(component.sessionForm).toBeDefined();
  });

  it('should initialize form for update', () => {
    (router as any).url = 'update/1';
    component.ngOnInit();
    expect(component.onUpdate).toBe(true);
    expect(sessionApiService.detail).toHaveBeenCalledWith('1');
    expect(component.sessionForm).toBeDefined();
  });

  it('should create a session', () => {
    component.onUpdate = false;
    component.sessionForm?.setValue({
      name: 'New Session',
      date: '2024-01-01',
      teacher_id: 1,
      description: 'New Description',
    });
    component.submit();
    expect(sessionApiService.create).toHaveBeenCalled();
    expect(matSnackBar.open).toHaveBeenCalledWith('Session created !', 'Close', {
      duration: 3000,
    });
    expect(router.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should update a session', () => {
    component.onUpdate = true;
    (component as any).id = '1';
    component.sessionForm?.setValue({
      name: 'Updated Session',
      date: '2024-01-01',
      teacher_id: 1,
      description: 'Updated Description',
    });
    component.submit();
    expect(sessionApiService.update).toHaveBeenCalled();
    expect(matSnackBar.open).toHaveBeenCalledWith('Session updated !', 'Close', {
      duration: 3000,
    });
    expect(router.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should redirect if not admin', () => {
    mockSessionService.sessionInformation.admin = false;
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
  });
});
