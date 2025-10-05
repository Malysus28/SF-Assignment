import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  // for input field in the form
  email: string = '';
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  // inject router for page navigation and Auth
  constructor(
    private router: Router,

    private auth: Auth
  ) {}

  ngOnInit() {
    // If already logged in
    if (this.auth.isLoggedIn()) {
      // redirect to profile page
      this.router.navigate(['/profile']);
    }
  }

  login() {
    // console.log('test');
    // fetch is communicating with the back end, using the post method,

    fetch('http://localhost:3000/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.username,
        password: this.password,
      }),
    })
      .then((response) => {
        // if response is not working then err msg
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.status);
        }
        return response.json();
      })
      .then((data) => {
        if (data.ok) {
          const token = data.token || 'dummy-token';
          // save token and user info to backend
          this.auth.setSession(token, data.user);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
          this.router.navigate(['/profile']);
        } else {
          // if login fail then err msg
          this.errorMessage = data.message || 'Invalid User';
        }
      })
      .catch((err) => {
        console.error(err);
        this.errorMessage = 'Invalid Credential, Try Again';
      });
  }
}
