/// <reference types="cypress" />

describe('Session Update spec', () => {
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

  const teachers = [
    {
      id: 1,
      lastName: 'DELAHAYE',
      firstName: 'Margot',
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00'
    },
    {
      id: 2,
      lastName: 'THIERCELIN',
      firstName: 'Helene',
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00'
    }
  ];

  const existingSession = {
    id: 1,
    name: 'Morning Yoga',
    description: 'A relaxing morning session',
    date: '2024-01-15T09:00:00',
    teacher_id: 1,
    users: [2],
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-10T00:00:00'
  };

  const sessions = [existingSession];

  function loginAndNavigateToUpdate(user: any) {
    cy.intercept('POST', '/api/auth/login', { body: user });
    cy.intercept('GET', '/api/session', { body: sessions }).as('sessions');
    cy.intercept('GET', '/api/teacher', { body: teachers }).as('teachers');
    cy.intercept('GET', `/api/session/${existingSession.id}`, { body: existingSession }).as('sessionDetail');

    cy.visit('/login');
    cy.get('input[formControlName=email]').type(user.username);
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/sessions');
    cy.wait('@sessions');

    // Navigate via UI button (Edit button on the session card) instead of cy.visit
    cy.get('mat-card.item').first().within(() => {
      cy.get('button').contains('Edit').click();
    });
    cy.wait('@sessionDetail');
    cy.wait('@teachers');
  }

  describe('Access control', () => {
    it('should NOT show Edit button for non-admin user', () => {
      cy.intercept('POST', '/api/auth/login', { body: regularUser });
      cy.intercept('GET', '/api/session', { body: sessions }).as('sessions');

      cy.visit('/login');
      cy.get('input[formControlName=email]').type(regularUser.username);
      cy.get('input[formControlName=password]').type('test!1234');
      cy.get('button[type=submit]').click();
      cy.url().should('include', '/sessions');
      cy.wait('@sessions');

      // Non-admin user should not see the Edit button
      cy.get('button').contains('Edit').should('not.exist');
    });

    it('should allow admin user to access update page via Edit button', () => {
      loginAndNavigateToUpdate(adminUser);

      cy.url().should('include', `/sessions/update/${existingSession.id}`);
      cy.get('h1').should('contain', 'Update session');
    });
  });

  describe('Form pre-population', () => {
    beforeEach(() => {
      loginAndNavigateToUpdate(adminUser);
    });

    it('should pre-fill the form with existing session data', () => {
      cy.get('input[formControlName=name]').should('have.value', 'Morning Yoga');
      cy.get('input[formControlName=date]').should('have.value', '2024-01-15');
      cy.get('textarea[formControlName=description]').should('have.value', 'A relaxing morning session');
    });

    it('should display "Update session" as title', () => {
      cy.get('h1').should('contain', 'Update session');
    });

    it('should have Save button enabled with valid data', () => {
      cy.get('button[type=submit]').should('not.be.disabled');
    });
  });

  describe('Form validation', () => {
    beforeEach(() => {
      loginAndNavigateToUpdate(adminUser);
    });

    it('should disable Save button when name is cleared', () => {
      cy.get('input[formControlName=name]').clear();
      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should disable Save button when date is cleared', () => {
      cy.get('input[formControlName=date]').clear();
      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should disable Save button when description is cleared', () => {
      cy.get('textarea[formControlName=description]').clear();
      cy.get('button[type=submit]').should('be.disabled');
    });
  });

  describe('Session update', () => {
    it('should update session and redirect to sessions list', () => {
      const updatedSession = {
        ...existingSession,
        name: 'Updated Morning Yoga',
        description: 'An updated relaxing morning session',
        updatedAt: '2024-01-20T00:00:00'
      };

      cy.intercept('POST', '/api/auth/login', { body: adminUser });
      cy.intercept('GET', '/api/session', { body: sessions }).as('sessions');
      cy.intercept('GET', '/api/teacher', { body: teachers }).as('teachers');
      cy.intercept('GET', `/api/session/${existingSession.id}`, { body: existingSession }).as('sessionDetail');
      cy.intercept('PUT', `/api/session/${existingSession.id}`, { body: updatedSession }).as('updateSession');

      cy.visit('/login');
      cy.get('input[formControlName=email]').type(adminUser.username);
      cy.get('input[formControlName=password]').type('test!1234');
      cy.get('button[type=submit]').click();
      cy.url().should('include', '/sessions');
      cy.wait('@sessions');

      // Navigate via UI button
      cy.get('mat-card.item').first().within(() => {
        cy.get('button').contains('Edit').click();
      });
      cy.wait('@sessionDetail');
      cy.wait('@teachers');

      cy.get('input[formControlName=name]').clear();
      cy.get('input[formControlName=name]').type('Updated Morning Yoga');
      cy.get('textarea[formControlName=description]').clear();
      cy.get('textarea[formControlName=description]').type('An updated relaxing morning session');

      cy.get('button[type=submit]').click();
      cy.wait('@updateSession');

      cy.url().should('include', '/sessions');
      cy.contains('Session updated !').should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate back to sessions list when clicking back button', () => {
      loginAndNavigateToUpdate(adminUser);

      cy.get('button mat-icon').contains('arrow_back').click();
      cy.url().should('include', '/sessions');
      cy.url().should('not.include', '/update');
    });
  });
});
