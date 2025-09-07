// src/app/features/auth/register.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../store/auth/auth.actions';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

function matchPasswords(group: AbstractControl): ValidationErrors | null {
  const p = group.get('password')?.value || '';
  const c = group.get('confirmPassword')?.value || '';
  return p && c && p !== c ? { mismatch: true } : null;
}

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink, TranslateModule],
  template: `
    <div class="wrap">
      <h1>{{ 'auth.registerTitle' | translate }}</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ 'auth.name' | translate }}</mat-label>
          <input matInput formControlName="name" autocomplete="name">
          <mat-error *ngIf="form.get('name')?.hasError('required')">{{ 'auth.err.required' | translate }}</mat-error>
          <mat-error *ngIf="form.get('name')?.hasError('minlength')">{{ 'auth.err.min' | translate:{n:2} }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ 'auth.email' | translate }}</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email">
          <mat-error *ngIf="form.get('email')?.hasError('required')">{{ 'auth.err.required' | translate }}</mat-error>
          <mat-error *ngIf="form.get('email')?.hasError('email')">{{ 'auth.err.email' | translate }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ 'auth.password' | translate }}</mat-label>
          <input matInput type="password" formControlName="password" autocomplete="new-password">
          <mat-error *ngIf="form.get('password')?.hasError('required')">{{ 'auth.err.required' | translate }}</mat-error>
          <mat-error *ngIf="form.get('password')?.hasError('minlength')">{{ 'auth.err.min' | translate:{n:6} }}</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ 'auth.confirmPassword' | translate }}</mat-label>
          <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password">
          <mat-error *ngIf="form.hasError('mismatch')">{{ 'auth.err.mismatch' | translate }}</mat-error>
          <mat-error *ngIf="form.get('confirmPassword')?.hasError('required')">{{ 'auth.err.required' | translate }}</mat-error>
        </mat-form-field>

        <div class="actions">
          <button mat-flat-button color="primary" [disabled]="form.invalid">{{ 'auth.register' | translate }}</button>
          <a mat-stroked-button routerLink="/login">{{ 'auth.haveAccount' | translate }}</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .wrap { max-width: 480px; margin: 24px auto; padding: 0 16px; display: grid; gap: 12px; }
    .full { width: 100%; }
    form { display: grid; gap: 12px; }
    .actions { display: flex; gap: 10px; align-items: center; }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: matchPasswords });

  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.store.dispatch(AuthActions.register({
      name: v.name || '',
      email: v.email || '',
      password: v.password || ''
    }));
  }
}
