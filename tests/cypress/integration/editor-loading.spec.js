// @ts-check
/// <reference types="cypress" />

const MONACO_PATH = '/';
const CODEMIRROR_PATH = '/?codemirror=true';
const PROD = 'https://limber.glimdown.com';

const ORIGIN = Cypress.env('DEPLOY_URL') || PROD;

describe('Loads Monaco', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      // Monaco is throwing an error about top level export
      // for some reason
      // if (err.message.includes('export')) {
      //   // returning false here prevents Cypress from
      //   // failing the test
      //   return false;
      // }

      return false;
    });
  });

  it('loads with no errors', () => {
    cy.visit(`${ORIGIN}${MONACO_PATH}`);

    cy.get('body').trigger('mousemove');
    cy.get('.monaco-editor', { timeout: 20000 }).should('be.visible');
    cy.get('.cm-editor').should('not.exist');
    cy.get('[data-test-loading-error]').should('not.exist');
  });
});

describe('Loads CodeMirror', () => {
  it('loads with no errors', () => {
    cy.visit(`${ORIGIN}${CODEMIRROR_PATH}`);

    cy.get('body').trigger('mousemove');
    cy.get('.cm-editor', { timeout: 20000 }).should('be.visible');
    cy.get('.monaco-editor').should('not.exist');
    cy.get('[data-test-loading-error]').should('not.exist');
  });
});
