import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectAuthLoading, selectAuthError } from '../../store/auth/auth.selectors';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="auth-wrap">
      <h1>Login</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" required />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Password</mat-label>
          <input matInput formControlName="password" type="password" required />
        </mat-form-field>
        <button mat-raised-button color="primary" [disabled]="form.invalid || (loading$ | async)">Login</button>
        <div class="error" *ngIf="error$ | async as e">{{ e }}</div>
      </form>
    </div>
  `,
  styles: [`
    .auth-wrap { max-width: 420px; margin: 32px auto; padding: 16px; }
    .full { width: 100%; }
    .error { color: #c62828; margin-top: 8px; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required]] });
  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);
  submit() {
    if (this.form.valid) {
      const { email, password } = this.form.value as any;
      this.store.dispatch(AuthActions.login({ email, password }));
    }
  }
}
