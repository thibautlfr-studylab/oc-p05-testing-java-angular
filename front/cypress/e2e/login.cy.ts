describe('Login spec', () => {
  it('Login successfull', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      body: {
        id: 1,
        username: 'userName',
        firstName: 'firstName',
        lastName: 'lastName',
        admin: true
      },
    })

    cy.intercept(
      {
        method: 'GET',
        url: '/api/session',
      },
      []).as('session')

    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type=submit]').click()

    cy.url().should('include', '/sessions')
  })

  it('Login failed', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {},
    })

    cy.get('input[formControlName=email]').type("yoga@studio.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type=submit]').click()

    cy.get('.error').should('be.visible')
  })

  it('Login button disabled when form invalid', () => {
    cy.visit('/login')

    cy.get('input[formControlName=email]').type("yoga@studio.com")
    // Missing password

    cy.get('button[type=submit]').should('be.disabled')
  })
});