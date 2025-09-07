import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: any | null;
  token: string | null;
  error: string | null;
  loading: boolean;
}

const initialToken = localStorage.getItem('tm_token');

export const initialState: AuthState = {
  user: null,
  token: initialToken,
  error: null,
  loading: false
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, state => ({ ...state, error: null, loading: true })),
  on(AuthActions.register, state => ({ ...state, error: null, loading: true })),
  on(AuthActions.loadMe, state => ({ ...state, loading: true })),
  on(AuthActions.loginSuccess, (state, { user, token }) => ({ ...state, user, token, error: null, loading: false })),
  on(AuthActions.registerSuccess, (state, { user, token }) => ({ ...state, user, token, error: null, loading: false })),
  on(AuthActions.loadMeSuccess, (state, { user }) => ({ ...state, user, loading: false })),
  on(AuthActions.loginFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(AuthActions.registerFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(AuthActions.loadMeFailure, (state, { error }) => ({ ...state, user: null, token: null, error, loading: false })),
  on(AuthActions.logout, () => ({ user: null, token: null, error: null, loading: false }))
);
