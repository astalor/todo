import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TaskListComponent } from './features/tasks/task-list.component';
import { TaskEditComponent } from './features/tasks/task-edit.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', canActivate: [authGuard], children: [
      { path: '', component: DashboardComponent },
      { path: 'tasks', component: TaskListComponent },
      { path: 'tasks/:id', component: TaskEditComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
