import { Component, effect, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './layout/header.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectAuthError } from './store/auth/auth.selectors';
import { AuthActions } from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, MatSnackBarModule],
  template: `
    <app-header></app-header>
    <router-outlet />
  `
})
export class AppComponent {
  private store = inject(Store);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  constructor() {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('tm_token') : null;
    if (token) this.store.dispatch(AuthActions.loadMe());
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) window.scrollTo(0, 0);
    });
    effect(() => {
      this.store.select(selectAuthError).subscribe((err: string | null) => {
        if (err) this.snack.open(err, 'Close', { duration: 3000 });
      });
    });
  }
}
