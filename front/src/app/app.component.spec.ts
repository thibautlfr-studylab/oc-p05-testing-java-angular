import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { expect } from '@jest/globals';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { SessionService } from './services/session.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let router: Router;
  let sessionService: SessionService;

  const mockSessionService = {
    $isLogged: jest.fn(),
    logOut: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientModule, MatToolbarModule],
      declarations: [AppComponent],
      providers: [{ provide: SessionService, useValue: mockSessionService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    sessionService = TestBed.inject(SessionService);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should return observable of login status from session service', (done) => {
    const isLogged = true;
    (sessionService.$isLogged as jest.Mock).mockReturnValue(of(isLogged));

    component.$isLogged().subscribe((logged) => {
      expect(logged).toBe(isLogged);
      done();
    });

    expect(sessionService.$isLogged).toHaveBeenCalled();
  });

  it('should log out and navigate to home', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    component.logout();
    expect(sessionService.logOut).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['']);
  });
});
