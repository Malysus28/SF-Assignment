import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-user',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-user.html',
  styleUrl: './create-user.css',
})
export class CreateUser {
  // for drop down box which is not working very well. Need to fix this
  optionforroles = ['User', 'Group-Admin', 'Super-Admin'];
  groupNameOptions = [
    'Peer Mentors',
    'Griffith Coding Club',
    'PASS Study Group',
  ];
  // my object that holds the form data, this is connected to ngModel in the html file
  arr2 = {
    username: '',
    birthdate: '',
    email: '',
    password: '',
    roles: ['User'],
    groupNames: [],
  };

  constructor(private router: Router) {}
  // copy the values from arr2 to newUser object and store it in local storage
  create() {
    const newUser = {
      username: this.arr2.username,
      birthdate: this.arr2.birthdate,
      email: this.arr2.email,
      valid: true,
      roles: this.arr2.roles,
      groupNames: [...this.arr2.groupNames],
      groups: [],
    };

    localStorage.setItem('currentUser', JSON.stringify(newUser));
    // mimic authenticsaation by setting a dummy token
    localStorage.setItem('token', 'dev');
    this.router.navigate(['/profile']);
  }
  // reset button for the form values to get reset
  reset() {
    this.arr2 = {
      username: '',
      birthdate: '',
      email: '',
      password: '',
      roles: ['User'],
      groupNames: [...this.arr2.groupNames],
    };
  }
}
