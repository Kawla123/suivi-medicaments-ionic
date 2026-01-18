import { Routes } from '@angular/router';

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
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'patient-dashboard',
    loadComponent: () => import('./pages/patient-dashboard/patient-dashboard.page').then((m) => m.PatientDashboardPage),
  },
  {
    path: 'aidant-dashboard',
    loadComponent: () => import('./pages/aidant-dashboard/aidant-dashboard.page').then((m) => m.AidantDashboardPage),
  },
  {
    path: 'patient-details',
    loadComponent: () => import('./pages/patient-details/patient-details.page').then( m => m.PatientDetailsPage)
  },

  {
  path: 'patient-details/:uid',
  loadComponent: () => import('./pages/patient-details/patient-details.page').then(m => m.PatientDetailsPage)
},

];
