import { Routes } from '@angular/router';
import { AuthLoginComponent } from './auth-login/auth-login.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  {
    title: 'SCDMS - Home',
    path: '',
    component: HomeComponent,
  },
  {
    title: 'SCDMS - Login',
    path: 'auth/login',
    component: AuthLoginComponent,
  },
  {
    title: 'SCDMS - Finalize Login',
    path: 'auth/login/finalize',
    component: AuthLoginComponent,
  },
];
