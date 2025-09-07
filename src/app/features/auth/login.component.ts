// src/app/features/auth/login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink, TranslateModule],
  template: `
    <div class="wrap">
      <h1>{{ 'auth.loginTitle' | translate }}</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ 'auth.email' | translate }}</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email">
          <mat-error *ngIf="form.get('email')?.hasError('required')">{{ 'auth.err.required' | translate }}</mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">{{ 'auth.err.email' | translate }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ 'auth.password' | translate }}</mat-label>
          <input matInput type="password" formControlName="password" autocomplete="current-password">
          <mat-error *ngIf="form.get('password')?.hasError('required')">{{ 'auth.err.required' | translate }}</mat-error>
          <mat-error *ngIf="form.get('password')?.hasError('minlength')">{{ 'auth.err.min' | translate:{n:6} }}</mat-error>
        </mat-form-field>

        <div class="actions">
          <button mat-flat-button color="primary" [disabled]="form.invalid">{{ 'auth.login' | translate }}</button>
          <a mat-stroked-button routerLink="/register">{{ 'auth.noAccount' | translate }}</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .wrap { max-width: 420px; margin: 24px auto; padding: 0 16px; display: grid; gap: 12px; }
    .full { width: 100%; }
    form { display: grid; gap: 12px; }
    .actions { display: flex; gap: 10px; align-items: center; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  submit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    this.store.dispatch(AuthActions.login({ email: email || '', password: password || '' }));
  }
}
