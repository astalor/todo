import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard], data: { depth: 0 } },
  { path: 'tasks', loadComponent: () => import('./features/tasks/task-list.component').then(m => m.TaskListComponent), canActivate: [authGuard], data: { depth: 1 } },
  { path: 'tasks/:id', loadComponent: () => import('./features/tasks/task-edit.component').then(m => m.TaskEditComponent), canActivate: [authGuard], data: { depth: 2 } },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent), data: { depth: -1 } },
  { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent), data: { depth: -1 } },
  { path: '**', redirectTo: '' }
];
