describe('Account spec', () => {
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

  const adminUserFull = {
    id: 1,
    email: 'admin@studio.com',
    firstName: 'Admin',
    lastName: 'User',
    admin: true,
    createdAt: '2023-06-01T00:00:00',
    updatedAt: '2024-01-10T00:00:00'
  };

  const regularUserFull = {
    id: 2,
    email: 'user@studio.com',
    firstName: 'Regular',
    lastName: 'User',
    admin: false,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-15T00:00:00'
  };

  function loginAndNavigateToAccount(loginUser: any, userDetail: any) {
    // Setup intercepts before any navigation
    cy.intercept('POST', '/api/auth/login', { body: loginUser }).as('login');
    cy.intercept('GET', '/api/session', { body: [] }).as('sessions');
    cy.intercept('GET', `/api/user/${loginUser.id}`, { body: userDetail }).as('userDetail');

    // Login
    cy.visit('/login');
    cy.get('input[formControlName=email]').type(loginUser.username);
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/sessions');

    // Navigate to account
    cy.get('span[routerLink=me]').click();
    cy.wait('@userDetail');
  }

  it('should display user information', () => {
    loginAndNavigateToAccount(regularUser, regularUserFull);

    cy.contains('User information').should('be.visible');
    cy.contains('Name: Regular USER').should('be.visible');
    cy.contains('Email: user@studio.com').should('be.visible');
  });

  it('should display admin status for admin user', () => {
    loginAndNavigateToAccount(adminUser, adminUserFull);

    cy.contains('You are admin').should('be.visible');
  });

  it('should NOT display admin status for regular user', () => {
    loginAndNavigateToAccount(regularUser, regularUserFull);

    cy.contains('You are admin').should('not.exist');
  });

  it('should show Delete my account button for regular user', () => {
    loginAndNavigateToAccount(regularUser, regularUserFull);

    cy.contains('Delete my account').should('be.visible');
    cy.get('button[color=warn]').should('be.visible');
  });

  it('should NOT show Delete my account button for admin user', () => {
    loginAndNavigateToAccount(adminUser, adminUserFull);

    cy.contains('Delete my account').should('not.exist');
    cy.get('button[color=warn]').should('not.exist');
  });

  it('should delete account successfully', () => {
    // Setup intercepts
    cy.intercept('POST', '/api/auth/login', { body: regularUser }).as('login');
    cy.intercept('GET', '/api/session', { body: [] }).as('sessions');
    cy.intercept('GET', `/api/user/${regularUser.id}`, { body: regularUserFull }).as('userDetail');

    // Login
    cy.visit('/login');
    cy.get('input[formControlName=email]').type(regularUser.username);
    cy.get('input[formControlName=password]').type('test!1234');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/sessions');

    // Navigate to account
    cy.get('span[routerLink=me]').click();
    cy.wait('@userDetail');

    // Setup delete intercept
    cy.intercept('DELETE', `/api/user/${regularUser.id}`, {
      statusCode: 200,
      body: {}
    }).as('deleteUser');

    // Delete account
    cy.get('button[color=warn]').click();
    cy.wait('@deleteUser');

    cy.contains('Your account has been deleted !').should('be.visible');
    cy.url().should('include', '/');
  });
});
