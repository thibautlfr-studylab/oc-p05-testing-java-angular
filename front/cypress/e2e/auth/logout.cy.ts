/// <reference types="cypress" />

describe('Logout spec', () => {
  const user = {
    id: 1,
    username: 'user',
    firstName: 'User',
    lastName: 'User',
    admin: false
  };

  it('Logout successfull', () => {
    cy.visit('/login')

    cy.intercept('POST', '/api/auth/login', {
      body: user
    })

    cy.intercept('GET', '/api/session', []);

    cy.get('input[formControlName=email]').type("user@studio.com")
    cy.get('input[formControlName=password]').type("test!1234")
    cy.get('button[type=submit]').click()

    cy.url().should('include', '/sessions')
    
    cy.get('span').contains('Logout').click()
    
    cy.url().should('include', '/')
    
    cy.get('span').contains('Login').should('be.visible')
    cy.get('span').contains('Register').should('be.visible')
    cy.get('span').contains('Logout').should('not.exist')
  })
});
