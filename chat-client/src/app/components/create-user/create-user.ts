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
  optionforroles = ['User', 'Group-Admin', 'Super-Admin'];
  groupNameOptions = [
    'Peer Mentors',
    'Griffith Coding Club',
    'PASS Study Group',
  ];

  arr2 = {
    username: '',
    birthdate: '',
    email: '',
    password: '',
    roles: ['User'],
    groupNames: [],
  };

  constructor(private router: Router) {}

  create() {
    const newUser = {
      id: 'u-' + Math.random().toString(36).slice(2, 8),
      username: this.arr2.username,
      birthdate: this.arr2.birthdate,
      email: this.arr2.email,
      valid: true,
      roles: this.arr2.roles,
      groupNames: [...this.arr2.groupNames],
      groups: [],
    };

    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('token', 'dev');
    this.router.navigate(['/profile']);
  }

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
