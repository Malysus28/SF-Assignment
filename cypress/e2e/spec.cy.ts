describe('ChatAway End-to-End Tests', () => {
  //HOMEPAGE TEST
  it('loads the Home page and shows the main elements', () => {
    cy.visit('/'); // open root

    // To check if the main page has title
    cy.contains('Welcome to ChatAway');

    // check if navbar has this stuff
    cy.get('nav').within(() => {
      cy.contains('Home');
      cy.contains('Channels');
      cy.contains('Login');
    });

    // check this btn is there
    cy.contains('Create an Account');
  });

  //Navigation Test
  it('navigates to the Login page from the navbar', () => {
    cy.visit('/'); // start from homepage

    // when clicking on login in navbar
    cy.get('[routerlink="/login"]').first().click();

    //url should have /login
    cy.location('pathname').should('eq', '/login');

    // see if the content is there
    cy.contains(/^Login$/);
  });

  //Login test

  //invalid login attempt
  it('blocks login with wrong credentials', () => {
    cy.visit('/login'); // open the login page

    // fill in invalid credentials
    cy.get('input').eq(0).clear().type('whateveruser');
    cy.get('input').eq(1).clear().type('whateveruserpassword1234');

    //click the login btn
    cy.contains('button', /^Login$/).click();

    // needs to be in the login page still.
    cy.location('pathname').should('eq', '/login');
  });

  //correct login attempt
  it('logs in successfully as superadmin (password 123)', () => {
    cy.visit('/login'); // go to the login page

    //correct login credentials
    cy.get('input').eq(0).clear().type('superadmin');
    cy.get('input').eq(1).clear().type('123');
    //click the button
    cy.contains('button', /^Login$/).click();

    //redirect should happen to profile page
    cy.location('pathname', { timeout: 10000 }).should('eq', '/profile');

    //make sure the profile page is visible
    cy.contains(/^Profile$/).should('be.visible');

    //user data should be in the local storage.
    cy.window().then((win) => {
      const user = win.localStorage.getItem('currentUser') || '';
      expect(user).to.contain('superadmin');
    });
  });

  //GROUP PAGE TEST

  it('shows Groups page after successful login', () => {
    cy.visit('/login'); // open login page again

    //login in with correct credntials
    cy.get('input').eq(0).type('superadmin');
    cy.get('input').eq(1).type('123');
    cy.contains('button', /^Login$/).click();

    //wait for redirect to profile page.n
    cy.location('pathname').should('include', '/profile');

    // click on groups in navbar
    cy.get('nav').contains('Groups').click();

    // checking to see if it takes to group page.
    cy.location('pathname').should('include', '/groups');

    //check to see if atleast one group is there
    cy.get('li, .card, .group-item').should('exist');
  });

  //CHAT PAGE

  it('opens the Chat page and allows typing a message', () => {
    cy.visit('/login'); // open login page

    //l first
    cy.get('input').eq(0).type('superadmin');
    cy.get('input').eq(1).type('123');
    cy.contains('button', /^Login$/).click();

    //go directly to a chat channel
    cy.visit('/chat/general');

    //check if the message input box exists and works
    cy.get('input, textarea').filter(':visible').first().type('Hello world');

    //]check if send button is enabled
    cy.contains('button', /send/i).should('not.be.disabled');
  });

  //to veify consisten nav bar on pages.
  ['/', '/profile', '/groups', '/chat/general'].forEach((path) => {
    it(`shows the navbar correctly on ${path}`, () => {
      cy.visit(path);
      cy.get('nav').should('exist');
      cy.get('nav').within(() => {
        cy.contains('Home');
        cy.contains('Groups');
        cy.contains('Channels');
      });
    });
  });
});
