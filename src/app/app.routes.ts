import { Routes } from '@angular/router';
import { guestGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'patient-dashboard',
    canActivate: [roleGuard('patient')],
    loadComponent: () => import('./pages/patient-dashboard/patient-dashboard.page').then((m) => m.PatientDashboardPage),
  },
  {
    path: 'aidant-dashboard',
    canActivate: [roleGuard('aidant')],
    loadComponent: () => import('./pages/aidant-dashboard/aidant-dashboard.page').then((m) => m.AidantDashboardPage),
  },
  {
    path: 'patient-details/:uid',
    canActivate: [roleGuard('aidant')],
    loadComponent: () => import('./pages/patient-details/patient-details.page').then(m => m.PatientDetailsPage)
  },

];
