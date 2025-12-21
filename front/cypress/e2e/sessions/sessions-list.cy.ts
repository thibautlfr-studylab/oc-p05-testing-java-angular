/// <reference types="cypress" />

describe('Sessions List spec', () => {
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
    },
    {
      id: 2,
      name: 'Evening Flow',
      description: 'Wind down with evening yoga',
      date: '2024-01-16T18:00:00',
      teacher_id: 2,
      users: [],
      createdAt: '2024-01-02T00:00:00',
      updatedAt: '2024-01-11T00:00:00'
    }
  ];

  function loginAndNavigateToSessions(user: any) {
    // Setup intercepts before any navigation
    cy.intercept('POST', '/api/auth/login', { body: user });
    cy.intercept('GET', '/api/session', { body: sessions }).as('sessions');

    // Login
    cy.visit('/login');
    cy.get('input[formControlName=email]').type(user.username);
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/sessions');
    cy.wait('@sessions');
  }

  it('should display list of sessions', () => {
    loginAndNavigateToSessions(adminUser);

    cy.get('mat-card.item').should('have.length', 2);
    cy.contains('Morning Yoga').should('be.visible');
    cy.contains('Evening Flow').should('be.visible');
    cy.contains('A relaxing morning session').should('be.visible');
    cy.contains('Wind down with evening yoga').should('be.visible');
  });

  it('should show Create button for admin user', () => {
    loginAndNavigateToSessions(adminUser);

    cy.get('button[routerLink="create"]').should('be.visible');
    cy.get('button').contains('Create').should('be.visible');
  });

  it('should NOT show Create button for regular user', () => {
    loginAndNavigateToSessions(regularUser);

    cy.get('button[routerLink="create"]').should('not.exist');
  });

  it('should show Edit button for admin user', () => {
    loginAndNavigateToSessions(adminUser);

    cy.get('button').contains('Edit').should('be.visible');
  });

  it('should NOT show Edit button for regular user', () => {
    loginAndNavigateToSessions(regularUser);

    cy.get('button').contains('Edit').should('not.exist');
  });

  it('should navigate to detail page when clicking Detail button', () => {
    // Setup intercepts
    cy.intercept('POST', '/api/auth/login', { body: adminUser });
    cy.intercept('GET', '/api/session', { body: sessions }).as('sessions');
    cy.intercept('GET', `/api/session/${sessions[0].id}`, { body: sessions[0] });

    // Login
    cy.visit('/login');
    cy.get('input[formControlName=email]').type(adminUser.username);
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/sessions');
    cy.wait('@sessions');

    // Click on Detail button
    cy.get('mat-card.item').first().within(() => {
      cy.get('button').contains('Detail').click();
    });

    cy.url().should('include', `/sessions/detail/${sessions[0].id}`);
  });
});
