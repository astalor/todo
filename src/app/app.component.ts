import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { selectAuthError } from './store/auth/auth.selectors';
import { selectTasksError } from './store/tasks/tasks.selectors';
import { routeSlide } from './shared/animations';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, HeaderComponent, MatSnackBarModule],
  animations: [routeSlide],
  template: `
    <div class="shell">
      <app-header></app-header>
      <main class="view" [@routeSlide]="prepare(o)">
        <router-outlet #o="outlet"></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .shell { min-height: 100vh; display: grid; grid-template-rows: auto 1fr; }
    .view { position: relative; padding: 12px; overflow: hidden; contain: paint; }
    .view > * { will-change: transform; backface-visibility: hidden; }
  `]
})
export class AppComponent {
  private snack = inject(MatSnackBar);
  private store = inject(Store);

  constructor() {
    this.store.select(selectAuthError).subscribe(err => { if (err) this.snack.open(err, 'Close', { duration: 3000 }); });
    this.store.select(selectTasksError).subscribe(err => { if (err) this.snack.open(err, 'Close', { duration: 3000 }); });
  }

  prepare(outlet: RouterOutlet) {
    return outlet && outlet.isActivated ? (outlet.activatedRoute.snapshot.data?.['depth'] ?? 0) : 0;
  }
}
