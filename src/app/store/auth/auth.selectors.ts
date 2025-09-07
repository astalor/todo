// src/app/store/auth/auth.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthUser = createSelector(selectAuthState, s => s.user);
export const selectAuthToken = createSelector(selectAuthState, s => s.token);
export const selectAuthError = createSelector(selectAuthState, s => s.error);
export const selectIsAuthenticated = createSelector(
  selectAuthToken,
  selectAuthUser,
  (t, u) => !!t || !!u
);
