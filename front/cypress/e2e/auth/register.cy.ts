describe('Register spec', () => {
  describe('Successful registration', () => {
    it('should register successfully and redirect to login', () => {
      // Setup intercept BEFORE visiting the page
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 200,
        body: {},
      }).as('register');

      cy.visit('/register');

      cy.get('input[formControlName=firstName]').type('John');
      cy.get('input[formControlName=lastName]').type('Doe');
      cy.get('input[formControlName=email]').type('john.doe@test.com');
      cy.get('input[formControlName=password]').type('test!1234');

      cy.get('button[type=submit]').click();
      cy.wait('@register');

      cy.url().should('include', '/login');
    });
  });

  describe('Failed registration', () => {
    it('should display error message on registration failure', () => {
      // Setup intercept BEFORE visiting the page
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 400,
        body: { message: 'Email already exists' },
      }).as('registerFailed');

      cy.visit('/register');

      cy.get('input[formControlName=firstName]').type('John');
      cy.get('input[formControlName=lastName]').type('Doe');
      cy.get('input[formControlName=email]').type('existing@test.com');
      cy.get('input[formControlName=password]').type('test!1234');

      cy.get('button[type=submit]').click();
      cy.wait('@registerFailed');

      cy.get('.error').should('be.visible');
    });
  });

  describe('Form validation', () => {
    beforeEach(() => {
      cy.visit('/register');
    });

    it('should have disabled submit button when form is empty', () => {
      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should have disabled submit button when firstName is missing', () => {
      cy.get('input[formControlName=lastName]').type('Doe');
      cy.get('input[formControlName=email]').type('john.doe@test.com');
      cy.get('input[formControlName=password]').type('test!1234');

      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should have disabled submit button when lastName is missing', () => {
      cy.get('input[formControlName=firstName]').type('John');
      cy.get('input[formControlName=email]').type('john.doe@test.com');
      cy.get('input[formControlName=password]').type('test!1234');

      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should have disabled submit button when email is missing', () => {
      cy.get('input[formControlName=firstName]').type('John');
      cy.get('input[formControlName=lastName]').type('Doe');
      cy.get('input[formControlName=password]').type('test!1234');

      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should have disabled submit button when password is missing', () => {
      cy.get('input[formControlName=firstName]').type('John');
      cy.get('input[formControlName=lastName]').type('Doe');
      cy.get('input[formControlName=email]').type('john.doe@test.com');

      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should have disabled submit button with invalid email format', () => {
      cy.get('input[formControlName=firstName]').type('John');
      cy.get('input[formControlName=lastName]').type('Doe');
      cy.get('input[formControlName=email]').type('invalid-email');
      cy.get('input[formControlName=password]').type('test!1234');

      cy.get('button[type=submit]').should('be.disabled');
    });

    it('should enable submit button when all fields are valid', () => {
      cy.get('input[formControlName=firstName]').type('John');
      cy.get('input[formControlName=lastName]').type('Doe');
      cy.get('input[formControlName=email]').type('john.doe@test.com');
      cy.get('input[formControlName=password]').type('test!1234');

      cy.get('button[type=submit]').should('not.be.disabled');
    });
  });

  describe('Form display', () => {
    it('should display all form fields', () => {
      cy.visit('/register');

      cy.get('input[formControlName=firstName]').should('be.visible');
      cy.get('input[formControlName=lastName]').should('be.visible');
      cy.get('input[formControlName=email]').should('be.visible');
      cy.get('input[formControlName=password]').should('be.visible');
      cy.get('button[type=submit]').should('be.visible');
    });
  });
});
