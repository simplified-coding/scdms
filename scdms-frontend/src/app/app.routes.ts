import { Routes } from '@angular/router';
import { AuthLoginComponent } from './auth-login/auth-login.component';
import { HomeComponent } from './home/home.component';
import { CertsComponent } from './certs/certs.component';
import { CertsIdComponent } from './certs/certs-id/certs-id.component';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { AdminComponent } from './admin/admin.component';

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
  {
    title: 'SCDMS - Certificates',
    path: 'certs',
    component: CertsComponent,
  },
  {
    title: 'SCDMS - Certificate',
    path: 'certs/:id',
    component: CertsIdComponent,
  },

  {
    title: 'SCDMS - Admin',
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard],
  },
];
