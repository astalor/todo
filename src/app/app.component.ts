// src/app/app.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './layout/header.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { AuthActions } from './store/auth/auth.actions';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, MatSnackBarModule, TranslateModule],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  private snack = inject(MatSnackBar);
  private store = inject(Store);
  private i18n = inject(TranslateService);

  ngOnInit() {
    const lang = localStorage.getItem('lang') || 'en';
    this.i18n.setDefaultLang('en');
    this.i18n.use(lang);
    this.store.dispatch(AuthActions.loadMe());
    window.addEventListener('unhandledrejection', e => {
      const msg = (e.reason && (e.reason.error?.message || e.reason.message)) || 'Error';
      this.snack.open(msg, this.i18n.instant('common.close'), { duration: 3000 });
    });
  }
}
