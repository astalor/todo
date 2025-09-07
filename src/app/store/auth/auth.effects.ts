import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthActions } from './auth.actions';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private auth = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ email, password }) =>
        this.auth.login(email, password).pipe(
          map((res: any) => AuthActions.loginSuccess({ user: res.user, token: res.token })),
          catchError(err => of(AuthActions.loginFailure({ error: err?.error?.message || 'Login failed' })))
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(({ name, email, password }) =>
        this.auth.register(name, email, password).pipe(
          map((res: any) => AuthActions.registerSuccess({ user: res.user, token: res.token })),
          catchError(err => of(AuthActions.registerFailure({ error: err?.error?.message || 'Register failed' })))
        )
      )
    )
  );

  loginSuccessNavigate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
      tap(({ token }) => {
        localStorage.setItem('tm_token', token);
        this.router.navigateByUrl('/');
      })
    ), { dispatch: false }
  );

  loadMe$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadMe),
      switchMap(() =>
        this.auth.me().pipe(
          map(user => AuthActions.loadMeSuccess({ user })),
          catchError(err => of(AuthActions.loadMeFailure({ error: err?.error?.message || 'Load me failed' })))
        )
      )
    )
  );

  loadMeFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadMeFailure),
      tap(() => {
        localStorage.removeItem('tm_token');
      }),
      map(() => AuthActions.logout())
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        localStorage.removeItem('tm_token');
        this.auth.logout();
        this.router.navigateByUrl('/login');
      })
    ), { dispatch: false }
  );
}