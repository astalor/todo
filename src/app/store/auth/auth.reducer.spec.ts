// src/app/store/auth/auth.reducer.spec.ts
import { authReducer, initialState } from './auth.reducer';
import { AuthActions } from './auth.actions';

describe('authReducer', () => {
  it('login sets loading', () => {
    const s = authReducer(initialState, AuthActions.login({ email: 'a', password: 'b' }));
    expect(s.loading).toBeTrue();
  });
  it('loginSuccess sets user and token', () => {
    const s = authReducer(initialState, AuthActions.loginSuccess({ token: 't', user: { id: '1', email: 'a', name: 'n' } }));
    expect(s.user?.id).toBe('1');
    expect(s.token).toBe('t');
  });
  it('failure stores error', () => {
    const s = authReducer(initialState, AuthActions.loginFailure({ error: 'e' }));
    expect(s.error).toBe('e');
    expect(s.loading).toBeFalse();
  });
  it('logout clears', () => {
    const st = { ...initialState, token: 't', user: { id: '1', email: 'a', name: 'n' } };
    const s = authReducer(st, AuthActions.logout());
    expect(s.user).toBeNull();
    expect(s.token).toBeNull();
  });
});
