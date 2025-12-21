/// <reference types="cypress" />

describe('Session Create spec', () => {
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

  const sessions = [
    {
      id: 1,
      name: 'Morning Yoga',
      description: 'A relaxing morning session',
      date: '2024-01-15T09:00:00',
      teacher_id: 1,
      users: [],
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-10T00:00:00'
    }
  ];

  function loginAndNavigateToCreate(user: any) {
    cy.intercept('POST', '/api/auth/login', { body: user });
    cy.intercept('GET', '/api/session', { body: sessions }).as('sessions');
    cy.intercept('GET', '/api/teacher', { body: teachers }).as('teachers');

    cy.visit('/login');
    cy.get('input[formControlName=email]').type(user.username);
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/sessions');
    cy.wait('@sessions');

    // Navigate via UI button instead of cy.visit to preserve session state
    cy.get('button[routerLink="create"]').click();
    cy.wait('@teachers');
  }

  describe('Access control', () => {
    it('should NOT show Create button for non-admin user', () => {
      cy.intercept('POST', '/api/auth/login', { body: regularUser });
      cy.intercept('GET', '/api/session', { body: sessions }).as('sessions');

      cy.visit('/login');
      cy.get('input[formControlName=email]').type(regularUser.username);
      cy.get('input[formControlName=password]').type('test!1234');
      cy.get('button[type=submit]').click();
      cy.url().should('include', '/sessions');
      cy.wait('@sessions');

      // Non-admin user should not see the Create button
      cy.get('button[routerLink="create"]').should('not.exist');
    });

    it('should allow admin user to access create page via Create button', () => {
      loginAndNavigateToCreate(adminUser);

      cy.url().should('include', '/sessions/create');
      cy.get('h1').should('contain', 'Create session');
    });
  });

  describe('Form display', () => {
    beforeEach(() => {
      loginAndNavigateToCreate(adminUser);
    });

    it('should display the create session form', () => {
      cy.get('h1').should('contain', 'Create session');
      cy.get('input[formControlName=name]').should('be.visible');
      cy.get('input[formControlName=date]').should('be.visible');
      cy.get('mat-select[formControlName=teacher_id]').should('be.visible');
      cy.get('textarea[formControlName=description]').should('be.visible');
      cy.get('button[type=submit]').should('contain', 'Save');
    });

    it('should display teachers in dropdown', () => {
      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').should('have.length', 2);
      cy.contains('Margot DELAHAYE').should('be.visible');
      cy.contains('Helene THIERCELIN').should('be.visible');
    });
  });

  describe('Form validation', () => {
    beforeEach(() => {
      loginAndNavigateToCreate(adminUser);
    });

    it('should have disabled Save button when form is empty', () => {
      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should have disabled Save button when name is missing', () => {
      cy.get('input[formControlName=date]').type('2024-02-01');
      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').first().click();
      cy.get('textarea[formControlName=description]').type('Test description');

      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should have disabled Save button when date is missing', () => {
      cy.get('input[formControlName=name]').type('Test Session');
      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').first().click();
      cy.get('textarea[formControlName=description]').type('Test description');

      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should have disabled Save button when teacher is missing', () => {
      cy.get('input[formControlName=name]').type('Test Session');
      cy.get('input[formControlName=date]').type('2024-02-01');
      cy.get('textarea[formControlName=description]').type('Test description');

      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should have disabled Save button when description is missing', () => {
      cy.get('input[formControlName=name]').type('Test Session');
      cy.get('input[formControlName=date]').type('2024-02-01');
      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').first().click();

      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should enable Save button when all fields are filled', () => {
      cy.get('input[formControlName=name]').type('Test Session');
      cy.get('input[formControlName=date]').type('2024-02-01');
      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').first().click();
      cy.get('textarea[formControlName=description]').type('Test description');

      cy.get('button[type=submit]').should('not.be.disabled');
    });
  });

  describe('Session creation', () => {
    it('should create session and redirect to sessions list', () => {
      const newSession = {
        id: 2,
        name: 'New Yoga Session',
        description: 'A brand new session',
        date: '2024-02-01T00:00:00',
        teacher_id: 1,
        users: [],
        createdAt: '2024-01-15T00:00:00',
        updatedAt: '2024-01-15T00:00:00'
      };

      cy.intercept('POST', '/api/auth/login', { body: adminUser });
      cy.intercept('GET', '/api/session', { body: sessions }).as('sessions');
      cy.intercept('GET', '/api/teacher', { body: teachers }).as('teachers');
      cy.intercept('POST', '/api/session', { body: newSession }).as('createSession');

      cy.visit('/login');
      cy.get('input[formControlName=email]').type(adminUser.username);
      cy.get('input[formControlName=password]').type('test!1234');
      cy.get('button[type=submit]').click();
      cy.url().should('include', '/sessions');
      cy.wait('@sessions');

      // Navigate via UI button
      cy.get('button[routerLink="create"]').click();
      cy.wait('@teachers');

      cy.get('input[formControlName=name]').type('New Yoga Session');
      cy.get('input[formControlName=date]').type('2024-02-01');
      cy.get('mat-select[formControlName=teacher_id]').click();
      cy.get('mat-option').first().click();
      cy.get('textarea[formControlName=description]').type('A brand new session');

      cy.get('button[type=submit]').click();
      cy.wait('@createSession');

      cy.url().should('include', '/sessions');
      cy.contains('Session created !').should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate back to sessions list when clicking back button', () => {
      loginAndNavigateToCreate(adminUser);

      cy.get('button mat-icon').contains('arrow_back').click();
      cy.url().should('include', '/sessions');
      cy.url().should('not.include', '/create');
    });
  });
});
