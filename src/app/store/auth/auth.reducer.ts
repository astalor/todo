// src/app/store/auth/auth.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: any | null;
  token: string | null;
  error: string | null;
}

const initialToken = localStorage.getItem('tm_token');

export const initialState: AuthState = {
  user: null,
  token: initialToken,
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, state => ({ ...state, error: null })),
  on(AuthActions.register, state => ({ ...state, error: null })),
  on(AuthActions.loginSuccess, (state, { user, token }) => ({ ...state, user, token, error: null })),
  on(AuthActions.registerSuccess, (state, { user, token }) => ({ ...state, user, token, error: null })),
  on(AuthActions.loginFailure, (state, { error }) => ({ ...state, error })),
  on(AuthActions.registerFailure, (state, { error }) => ({ ...state, error })),
  on(AuthActions.loadMeSuccess, (state, { user }) => ({ ...state, user })),
  on(AuthActions.loadMeFailure, (state, { error }) => ({ ...state, user: null, token: null, error })),
  on(AuthActions.logout, () => ({ user: null, token: null, error: null }))
);
