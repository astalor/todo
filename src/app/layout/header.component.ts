// src/app/layout/header.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../store/auth/auth.actions';
import { selectAuthUser, selectAuthToken } from '../store/auth/auth.selectors';
import { combineLatest, map, startWith } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterModule, MatSelectModule, MatOptionModule, TranslateModule],
  template: `
    <header class="bar">
      <nav class="left">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
        <a routerLink="/tasks" routerLinkActive="active">Tasks</a>
      </nav>
      <div class="right">
        <span class="spacer"></span>
        <mat-select class="lang" [(value)]="lang" (selectionChange)="setLang($event.value)">
          <mat-option value="en">EN</mat-option>
          <mat-option value="bg">BG</mat-option>
        </mat-select>

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
    .lang { width: 80px; margin-right: 8px; color: #fff; }
    :host ::ng-deep .mat-mdc-select-value { color: #000; }
  `]
})
export class HeaderComponent implements OnInit {
  private store = inject(Store);
  private i18n = inject(TranslateService);

  user$ = this.store.select(selectAuthUser);
  private token$ = this.store.select(selectAuthToken).pipe(startWith(localStorage.getItem('tm_token')));
  isAuth$ = combineLatest([this.token$, this.user$]).pipe(map(([t, u]) => !!t || !!u));

  lang = 'en';

  ngOnInit() {
    this.i18n.addLangs(['en','bg']);
    const saved = localStorage.getItem('lang') || this.i18n.getDefaultLang() || 'en';
    this.i18n.setDefaultLang('en');
    this.setLang(saved);
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }

  setLang(l: string) {
    this.lang = l;
    localStorage.setItem('lang', l);
    this.i18n.use(l);
  }
}
