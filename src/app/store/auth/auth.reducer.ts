// src/app/store/auth/auth.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { AuthActions, User } from './auth.actions';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, AuthActions.register, AuthActions.loadMe, state => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { token, user }) => ({ ...state, token, user, loading: false, error: null })),
  on(AuthActions.registerSuccess, (state, { token, user }) => ({ ...state, token, user, loading: false, error: null })),
  on(AuthActions.loadMeSuccess, (state, { user }) => ({ ...state, user, loading: false })),
  on(AuthActions.loginFailure, AuthActions.registerFailure, AuthActions.loadMeFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(AuthActions.clearError, state => ({ ...state, error: null })),
  on(AuthActions.logout, state => ({ ...state, user: null, token: null, error: null }))
);
