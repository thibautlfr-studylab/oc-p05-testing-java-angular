describe('Account spec', () => {
  const user = {
    id: 1,
    email: 'test@test.com',
    lastName: 'LastName',
    firstName: 'FirstName',
    admin: false,
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-01T00:00:00.000+00:00',
  };

  const admin = {
    id: 1,
    email: 'admin@test.com',
    lastName: 'Admin',
    firstName: 'Admin',
    admin: true,
    createdAt: '2023-01-01T00:00:00.000+00:00',
    updatedAt: '2023-01-01T00:00:00.000+00:00',
  };

  it('Check user account information', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      body: user
    })

    cy.intercept('GET', '/api/session', []).as('sessions')
    cy.intercept('GET', '/api/user/1', user).as('user')

    cy.get('input[formControlName=email]').type("test@test.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type=submit]').click()

    cy.get('span[routerLink=me]').click()

    cy.url().should('include', '/me')
    
    cy.get('p').contains('Name: FirstName LASTNAME').should('be.visible')
    cy.get('p').contains('Email: test@test.com').should('be.visible')
    cy.get('p').contains('You are admin').should('not.exist')
    cy.get('button[color=warn]').should('be.visible')
  })

  it('Check admin account information', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      body: admin
    })

    cy.intercept('GET', '/api/session', []).as('sessions')
    cy.intercept('GET', '/api/user/1', admin).as('user')

    cy.get('input[formControlName=email]').type("admin@test.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type=submit]').click()

    cy.get('span[routerLink=me]').click()

    cy.url().should('include', '/me')
    
    cy.get('p').contains('Name: Admin ADMIN').should('be.visible')
    cy.get('p').contains('Email: admin@test.com').should('be.visible')
    cy.get('p').contains('You are admin').should('be.visible')
    cy.get('button[color=warn]').should('not.exist')
  })

  it('Delete user account', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      body: user
    })

    cy.intercept('GET', '/api/session', []).as('sessions')
    cy.intercept('GET', '/api/user/1', user).as('user')
    cy.intercept('DELETE', '/api/user/1', {}).as('deleteUser')

    cy.get('input[formControlName=email]').type("test@test.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type=submit]').click()

    cy.get('span[routerLink=me]').click()
    
    cy.get('button[color=warn]').click()
    
    cy.url().should('include', '/')
  })
});
