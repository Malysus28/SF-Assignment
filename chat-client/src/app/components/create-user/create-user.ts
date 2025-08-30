import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-user',
  imports: [CommonModule, FormsModule, RouterLink],
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
    roles: ['User'] as string[],
    groupNames: [] as string[],
  };

  constructor(private router: Router) {}

  toggleRole(role: string, on: boolean) {
    if (on && !this.arr2.roles.includes(role)) this.arr2.roles.push(role);
    if (!on) this.arr2.roles = this.arr2.roles.filter((r) => r !== role);
    // always keep 'User'
    if (!this.arr2.roles.includes('User')) this.arr2.roles.push('User');
  }

  // build the same shape your profile expects:
  // - it looks for groupNames first, then groups
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
      groupNames: [],
    };
  }
}
