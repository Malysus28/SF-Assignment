describe('Channels Page (logged-in)', () => {
  it('shows channel cards after login', () => {
    //gotta be loged in to go to channel
    cy.visit('/login');

    //Log in
    cy.get('input').eq(0).type('superadmin');
    cy.get('input').eq(1).type('123');
    cy.contains('button', /^Login$/).click();

    // redirect and go to /channels
    cy.location('pathname', { timeout: 10000 }).should('include', '/profile');
    cy.visit('/channels');

    // checking heading
    cy.contains('Welcome to ChatAway Channels').should('be.visible');
    cy.get('.card').should('exist');
    cy.get('.card')
      .first()
      .within(() => {
        cy.get('.card-title').should('be.visible');
        cy.contains('Enter Chat').should('be.visible');
      });
  });

  it('enters a channel successfully', () => {
    //  Login again
    cy.visit('/login');
    cy.get('input').eq(0).type('superadmin');
    cy.get('input').eq(1).type('123');
    cy.contains('button', /^Login$/).click();
    cy.location('pathname', { timeout: 10000 }).should('include', '/profile');

    //go to channels and enter first chat
    cy.visit('/channels');
    cy.get('.card')
      .first()
      .within(() => {
        cy.contains('Enter Chat').click();
      });

    // redirected to chat route
    cy.location('pathname').should('include', '/chat');
  });
});
