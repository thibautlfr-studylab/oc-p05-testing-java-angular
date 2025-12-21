/// <reference types="cypress" />

describe('Session Detail spec', () => {
  const adminUser = {
    id: 1,
    username: 'admin@studio.com',
    firstName: 'Admin',
    lastName: 'User',
    admin: true,
    token: 'fake-jwt-token'
  };

  const regularUser = {
    id: 2,
    username: 'user@studio.com',
    firstName: 'Regular',
    lastName: 'User',
    admin: false,
    token: 'fake-jwt-token'
  };

  const teacher = {
    id: 1,
    lastName: 'DELAHAYE',
    firstName: 'Margot',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00'
  };

  const sessions = [
    {
      id: 1,
      name: 'Morning Yoga',
      description: 'A relaxing morning session',
      date: '2024-01-15T09:00:00',
      teacher_id: 1,
      users: [2],
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-10T00:00:00'
    }
  ];

  // Session without regular user participating
  const sessionWithoutUser = {
    ...sessions[0],
    users: []
  };

  // Session with regular user participating
  const sessionWithUser = {
    ...sessions[0],
    users: [2]
  };

  function loginAndNavigateToDetail(user: any, session: any) {
    cy.intercept('POST', '/api/auth/login', { body: user });
    cy.intercept('GET', '/api/session', { body: [session] }).as('sessions');
    cy.intercept('GET', `/api/session/${session.id}`, { body: session }).as('sessionDetail');
    cy.intercept('GET', `/api/teacher/${teacher.id}`, { body: teacher }).as('teacher');

    cy.visit('/login');
    cy.get('input[formControlName=email]').type(user.username);
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/sessions');
    cy.wait('@sessions');

    // Navigate via UI button (Detail button on the session card) instead of cy.visit
    cy.get('mat-card.item').first().within(() => {
      cy.get('button').contains('Detail').click();
    });
    cy.wait('@sessionDetail');
    cy.wait('@teacher');
  }

  describe('Session information display', () => {
    it('should display session name', () => {
      loginAndNavigateToDetail(adminUser, sessionWithUser);

      cy.get('h1').should('contain', 'Morning Yoga');
    });

    it('should display session description', () => {
      loginAndNavigateToDetail(adminUser, sessionWithUser);

      cy.get('.description').should('contain', 'A relaxing morning session');
    });

    it('should display teacher information', () => {
      loginAndNavigateToDetail(adminUser, sessionWithUser);

      cy.contains('Margot DELAHAYE').should('be.visible');
    });

    it('should display number of attendees', () => {
      loginAndNavigateToDetail(adminUser, sessionWithUser);

      cy.contains('1 attendees').should('be.visible');
    });

    it('should display session date', () => {
      loginAndNavigateToDetail(adminUser, sessionWithUser);

      cy.contains('January 15, 2024').should('be.visible');
    });

    it('should display creation and update dates', () => {
      loginAndNavigateToDetail(adminUser, sessionWithUser);

      cy.get('.created').should('contain', 'January 1, 2024');
      cy.get('.updated').should('contain', 'January 10, 2024');
    });
  });

  describe('Admin user actions', () => {
    it('should show Delete button for admin user', () => {
      loginAndNavigateToDetail(adminUser, sessionWithUser);

      cy.get('button').contains('Delete').should('be.visible');
    });

    it('should NOT show Participate button for admin user', () => {
      loginAndNavigateToDetail(adminUser, sessionWithUser);

      cy.get('button').contains('Participate').should('not.exist');
    });

    it('should delete session and redirect to sessions list', () => {
      cy.intercept('POST', '/api/auth/login', { body: adminUser });
      cy.intercept('GET', '/api/session', { body: [sessionWithUser] }).as('sessions');
      cy.intercept('GET', `/api/session/${sessionWithUser.id}`, { body: sessionWithUser }).as('sessionDetail');
      cy.intercept('GET', `/api/teacher/${teacher.id}`, { body: teacher }).as('teacher');
      cy.intercept('DELETE', `/api/session/${sessionWithUser.id}`, { statusCode: 200 }).as('deleteSession');

      cy.visit('/login');
      cy.get('input[formControlName=email]').type(adminUser.username);
      cy.get('input[formControlName=password]').type('test!1234');
      cy.get('button[type=submit]').click();
      cy.url().should('include', '/sessions');
      cy.wait('@sessions');

      // Navigate via UI button
      cy.get('mat-card.item').first().within(() => {
        cy.get('button').contains('Detail').click();
      });
      cy.wait('@sessionDetail');
      cy.wait('@teacher');

      cy.get('button').contains('Delete').click();
      cy.wait('@deleteSession');

      cy.url().should('include', '/sessions');
      cy.contains('Session deleted !').should('be.visible');
    });
  });

  describe('Regular user actions', () => {
    it('should NOT show Delete button for regular user', () => {
      loginAndNavigateToDetail(regularUser, sessionWithoutUser);

      cy.get('button').contains('Delete').should('not.exist');
    });

    it('should show Participate button when user is not participating', () => {
      loginAndNavigateToDetail(regularUser, sessionWithoutUser);

      cy.get('button').contains('Participate').should('be.visible');
    });

    it('should show "Do not participate" button when user is participating', () => {
      loginAndNavigateToDetail(regularUser, sessionWithUser);

      cy.get('button').contains('Do not participate').should('be.visible');
    });

    it('should participate in session', () => {
      const sessionAfterParticipate = { ...sessionWithoutUser, users: [2] };

      cy.intercept('POST', '/api/auth/login', { body: regularUser });
      cy.intercept('GET', '/api/session', { body: [sessionWithoutUser] }).as('sessions');
      cy.intercept('GET', `/api/session/${sessionWithoutUser.id}`, { body: sessionWithoutUser }).as('sessionDetail');
      cy.intercept('GET', `/api/teacher/${teacher.id}`, { body: teacher }).as('teacher');
      cy.intercept('POST', `/api/session/${sessionWithoutUser.id}/participate/${regularUser.id}`, { statusCode: 200 }).as('participate');

      cy.visit('/login');
      cy.get('input[formControlName=email]').type(regularUser.username);
      cy.get('input[formControlName=password]').type('test!1234');
      cy.get('button[type=submit]').click();
      cy.url().should('include', '/sessions');
      cy.wait('@sessions');

      // Navigate via UI button
      cy.get('mat-card.item').first().within(() => {
        cy.get('button').contains('Detail').click();
      });
      cy.wait('@sessionDetail');
      cy.wait('@teacher');

      // Update intercept for the refresh after participate
      cy.intercept('GET', `/api/session/${sessionWithoutUser.id}`, { body: sessionAfterParticipate }).as('sessionDetailRefresh');

      cy.get('button').contains('Participate').click();
      cy.wait('@participate');
      cy.wait('@sessionDetailRefresh');

      cy.get('button').contains('Do not participate').should('be.visible');
    });

    it('should unparticipate from session', () => {
      const sessionAfterUnparticipate = { ...sessionWithUser, users: [] };

      cy.intercept('POST', '/api/auth/login', { body: regularUser });
      cy.intercept('GET', '/api/session', { body: [sessionWithUser] }).as('sessions');
      cy.intercept('GET', `/api/session/${sessionWithUser.id}`, { body: sessionWithUser }).as('sessionDetail');
      cy.intercept('GET', `/api/teacher/${teacher.id}`, { body: teacher }).as('teacher');
      cy.intercept('DELETE', `/api/session/${sessionWithUser.id}/participate/${regularUser.id}`, { statusCode: 200 }).as('unparticipate');

      cy.visit('/login');
      cy.get('input[formControlName=email]').type(regularUser.username);
      cy.get('input[formControlName=password]').type('test!1234');
      cy.get('button[type=submit]').click();
      cy.url().should('include', '/sessions');
      cy.wait('@sessions');

      // Navigate via UI button
      cy.get('mat-card.item').first().within(() => {
        cy.get('button').contains('Detail').click();
      });
      cy.wait('@sessionDetail');
      cy.wait('@teacher');

      // Update intercept for the refresh after unparticipate
      cy.intercept('GET', `/api/session/${sessionWithUser.id}`, { body: sessionAfterUnparticipate }).as('sessionDetailRefresh');

      cy.get('button').contains('Do not participate').click();
      cy.wait('@unparticipate');
      cy.wait('@sessionDetailRefresh');

      cy.get('button').contains('Participate').should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate back when clicking back button', () => {
      loginAndNavigateToDetail(adminUser, sessionWithUser);

      cy.get('button mat-icon').contains('arrow_back').click();
      cy.url().should('include', '/sessions');
    });
  });
});
