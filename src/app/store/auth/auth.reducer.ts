import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: typeof localStorage !== 'undefined' ? localStorage.getItem('tm_token') : null,
  loading: false,
  error: null,
  isAuthenticated: !!(typeof localStorage !== 'undefined' && localStorage.getItem('tm_token'))
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, AuthActions.register, AuthActions.loadMe, state => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, AuthActions.registerSuccess, (state, { user, token }) => ({
    ...state, loading: false, user, token, isAuthenticated: true
  })),
  on(AuthActions.loadMeSuccess, (state, { user }) => ({ ...state, loading: false, user, isAuthenticated: true })),
  on(AuthActions.loginFailure, AuthActions.registerFailure, AuthActions.loadMeFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),
  on(AuthActions.clearError, state => ({ ...state, error: null })),
  on(AuthActions.logout, state => ({ user: null, token: null, loading: false, error: null, isAuthenticated: false }))
);
