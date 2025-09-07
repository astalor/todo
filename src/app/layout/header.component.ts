// src/app/layout/header.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../store/auth/auth.actions';
import { selectAuthUser, selectAuthToken } from '../store/auth/auth.selectors';
import { combineLatest, map, startWith } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bar">
      <nav class="left">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
        <a routerLink="/tasks" routerLinkActive="active">Tasks</a>
      </nav>
      <div class="right">
        <ng-container *ngIf="isAuth$ | async; else guest">
          <span class="user">{{ (user$ | async)?.name || (user$ | async)?.email }}</span>
          <button class="link" (click)="logout()">Logout</button>
        </ng-container>
        <ng-template #guest>
          <a class="link" routerLink="/login" routerLinkActive="active">Login</a>
          <a class="link" routerLink="/register" routerLinkActive="active">Register</a>
        </ng-template>
      </div>
    </header>
  `,
  styles: [`
    .bar{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:#f6f6fb;border-bottom:1px solid #eee}
    .left a{margin-right:16px;text-decoration:none;color:#222;font-weight:600}
    .left a.active{color:#3f51b5}
    .right{display:flex;align-items:center;gap:12px}
    .user{color:#333;font-weight:600}
    .link{background:transparent;border:0;color:#3f51b5;cursor:pointer;font-weight:600;padding:4px 8px}
  `]
})
export class HeaderComponent {
  private store = inject(Store);
  user$ = this.store.select(selectAuthUser);
  private token$ = this.store.select(selectAuthToken).pipe(startWith(localStorage.getItem('tm_token')));
  isAuth$ = combineLatest([this.token$, this.user$]).pipe(map(([t, u]) => !!t || !!u));

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
