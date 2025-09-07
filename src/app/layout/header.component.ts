import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { selectAuth } from '../store/auth/auth.selectors';
import { AuthActions } from '../store/auth/auth.actions';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatSelectModule, TranslateModule],
  template: `
    <mat-toolbar color="primary" class="bar">
      <a class="brand" routerLink="/">Task Manager</a>
      <nav class="nav">
        <a mat-button routerLink="/dashboard" routerLinkActive="active">{{ 'nav.dashboard' | translate }}</a>
        <a mat-button routerLink="/tasks" routerLinkActive="active">{{ 'nav.tasks' | translate }}</a>
      </nav>
      <span class="spacer"></span>
      <mat-select class="lang" [value]="curLang()" (valueChange)="setLang($event)">
        <mat-option value="en">EN</mat-option>
        <mat-option value="bg">BG</mat-option>
      </mat-select>
      <ng-container *ngIf="user$ | async as u; else guest">
        <span class="user">{{ u?.name }}</span>
        <button mat-button (click)="logout()">{{ 'auth.logout' | translate }}</button>
      </ng-container>
      <ng-template #guest>
        <a mat-button routerLink="/login">{{ 'auth.login' | translate }}</a>
        <a mat-button routerLink="/register">{{ 'auth.register' | translate }}</a>
      </ng-template>
    </mat-toolbar>
  `,
  styles: [`
    .bar { position: sticky; top: 0; z-index: 10; gap: 8px }
    .brand { color: #fff; text-decoration: none; font-weight: 700; margin-right: 6px }
    .nav { display: flex; gap: 4px }
    .nav .active { background: rgba(255,255,255,.12) }
    .spacer { flex: 1 }
    .user { margin: 0 8px }
    .lang { width: 90px; margin-right: 8px; color: #fff }
    :host ::ng-deep .mat-mdc-select-value, 
    :host ::ng-deep .mat-mdc-select-arrow { color: #000 }
  `]
})
export class HeaderComponent {
  private store = inject(Store);
  private i18n = inject(TranslateService);
  user$ = this.store.select(selectAuth).pipe(map(a => a.user));
  logout() { this.store.dispatch(AuthActions.logout()); }
  curLang() { return this.i18n.currentLang || localStorage.getItem('lang') || 'en'; }
  setLang(l: string) { localStorage.setItem('lang', l); this.i18n.use(l); }
}
