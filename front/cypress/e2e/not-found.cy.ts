/// <reference types="cypress" />

describe('Not Found spec', () => {
  it('should display 404 page when navigating to /404', () => {
    cy.visit('/404');

    cy.get('h1').should('contain', 'Page not found !');
  });

  it('should redirect unknown routes to 404 page', () => {
    cy.visit('/unknown-route-that-does-not-exist');

    cy.url().should('include', '/404');
    cy.get('h1').should('contain', 'Page not found !');
  });
});
