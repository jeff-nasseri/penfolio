import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'tracker' },
      {
        path: 'tracker',
        loadComponent: () => import('./features/tracker/tracker').then((m) => m.Tracker),
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/analytics').then((m) => m.Analytics),
      },
      {
        path: 'resumes',
        loadComponent: () => import('./features/resumes/resume-list').then((m) => m.ResumeList),
      },
      {
        path: 'resumes/:id',
        loadComponent: () => import('./features/resumes/resume-editor').then((m) => m.ResumeEditor),
      },
      {
        path: 'cover-letters',
        loadComponent: () => import('./features/cover-letters/cover-list').then((m) => m.CoverList),
      },
      {
        path: 'cover-letters/:id',
        loadComponent: () =>
          import('./features/cover-letters/cover-editor').then((m) => m.CoverEditor),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
