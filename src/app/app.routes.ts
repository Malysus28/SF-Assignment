import { Routes } from '@angular/router';
import { RouterLink } from '@angular/router';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { ChannelsPage } from './components/channels-page/channels-page';
import { Chat } from './components/chat/chat';
import { Profile } from './components/profile/profile';
import { Navbar } from './components/navbar/navbar';
import { CreateUser } from './components/create-user/create-user';
import { UserSettings } from './components/user-settings/user-settings';
import { authGuard } from './services/auth/auth-guard';
import { GroupPage } from './components/group-page/group-page';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'login',
    component: Login,
    title: 'Login',
  },
  { path: 'groups', component: GroupPage },
  {
    path: 'home',
    component: Home,
    title: 'Home',
  },
  {
    path: 'chat/:name',
    component: Chat,
    title: 'Chat',
    canActivate: [authGuard],
  },
  {
    path: 'channels',
    component: ChannelsPage,
    title: 'Channels',
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    component: Profile,
    title: 'Profile',
    canActivate: [authGuard],
  },
  { path: 'chat', component: Chat, title: 'Chat' },
  { path: 'navbar', component: Navbar, title: 'Navbar' },
  { path: 'create-user', component: CreateUser, title: 'Create User' },
  {
    path: 'user-settings',
    component: UserSettings,
    title: 'User Settings',
    canActivate: [authGuard],
  },
];
