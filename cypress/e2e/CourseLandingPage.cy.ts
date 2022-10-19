describe('visit the course landing page', () => {
  it('visit a valid course', () => {
    cy.visit('http://localhost:3000/courses/CSC108');

    cy.get('.title').should('be.visible');
  });

  it('visit an invalid course', () => {
    cy.visit('http://localhost:3000/courses/fakeCourse');

    cy.get('.error').should('be.visible');
  });
});
