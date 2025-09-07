import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './layout/header.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { selectAuthError } from './store/auth/auth.selectors';
import { routeTransition } from './shared/animations';
import { filter } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, MatSnackBarModule],
  animations: [routeTransition],
  template: `
    <div class="shell">
      <app-header></app-header>
      <main class="view" [@routeTransition]="animKey">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shell { min-height: 100vh; display: grid; grid-template-rows: auto 1fr; }
    .view { position: relative; padding: 12px; overflow: hidden; }
  `]
})
export class AppComponent {
  private snack = inject(MatSnackBar);
  private store = inject(Store);
  private router = inject(Router);
  animKey = '';

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => this.animKey = e.urlAfterRedirects || e.url);
    this.store.select(selectAuthError).subscribe(err => { if (err) this.snack.open(err, 'Close', { duration: 3000 }); });
    this.store.select((s: any) => s.tasks?.error).subscribe(err => { if (err) this.snack.open(err, 'Close', { duration: 3000 }); });
  }
}
