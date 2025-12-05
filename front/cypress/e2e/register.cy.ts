describe('Register spec', () => {
  it('Register successfull', () => {
    cy.visit('/register')

    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: {},
    })

    cy.get('input[formControlName=firstName]').type("firstName")
    cy.get('input[formControlName=lastName]').type("lastName")
    cy.get('input[formControlName=email]').type("test@test.com")
    cy.get('input[formControlName=password]').type("test!1234")

    cy.get('button[type=submit]').click()

    cy.url().should('include', '/login')
  })

  it('Register failed', () => {
    cy.visit('/register')

    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: {},
    })

    cy.get('input[formControlName=firstName]').type("firstName")
    cy.get('input[formControlName=lastName]').type("lastName")
    cy.get('input[formControlName=email]').type("test@test.com")
    cy.get('input[formControlName=password]').type("test!1234")

    cy.get('button[type=submit]').click()

    cy.get('.error').should('be.visible')
  })

  it('Register button disabled when form invalid', () => {
    cy.visit('/register')

    cy.get('input[formControlName=firstName]').type("firstName")
    cy.get('input[formControlName=lastName]').type("lastName")
    // Missing email and password

    cy.get('button[type=submit]').should('be.disabled')
  })
});
