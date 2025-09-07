import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated, selectUser } from '../store/auth/auth.selectors';
import { AuthActions } from '../store/auth/auth.actions';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <a routerLink="/" style="color: inherit; text-decoration: none; font-weight: 600;">Task Manager</a>
      <span style="flex: 1 1 auto"></span>
      <a mat-button routerLink="/">Dashboard</a>
      <a mat-button routerLink="/tasks">Tasks</a>
      <span *ngIf="user$ | async as user" style="margin-right:8px">{{ user.name }}</span>
      <button mat-raised-button color="accent" *ngIf="isAuth$ | async; else authLinks" (click)="logout()">Logout</button>
      <ng-template #authLinks>
        <a mat-button routerLink="/login">Login</a>
        <a mat-button routerLink="/register">Register</a>
      </ng-template>
    </mat-toolbar>
  `
})
export class HeaderComponent {
  private store = inject(Store);
  private router = inject(Router);
  isAuth$ = this.store.select(selectIsAuthenticated);
  user$ = this.store.select(selectUser);
  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
