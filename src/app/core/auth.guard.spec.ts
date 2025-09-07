import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { authGuard } from './auth.guard';

function runGuard(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  return TestBed.runInInjectionContext(() => authGuard(route, state));
}

describe('authGuard (functional)', () => {
  let store: MockStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', loadComponent: () => Promise.resolve(class {}) }]),
        provideMockStore({ initialState: { auth: { token: null, user: null } } })
      ]
    });
    store = TestBed.inject(MockStore);
  });

  it('allows when authenticated', (done) => {
    store.setState({ auth: { token: 'T', user: { id: '1', email: 'e' } } });
    localStorage.setItem('tm_token', 'T');
    const rs = { url: '/' } as RouterStateSnapshot;
    const res = runGuard({} as ActivatedRouteSnapshot, rs) as any;
    if (typeof res?.subscribe === 'function') {
      res.subscribe((v: boolean | UrlTree) => { expect(v === true).toBeTrue(); done(); });
    } else { expect(res === true).toBeTrue(); done(); }
  });

  it('redirects to login when unauthenticated', (done) => {
    store.setState({ auth: { token: null, user: null } });
    const rs = { url: '/private' } as RouterStateSnapshot;
    const res = runGuard({} as ActivatedRouteSnapshot, rs) as any;
    if (typeof res?.subscribe === 'function') {
      res.subscribe((v: boolean | UrlTree) => { expect(v instanceof UrlTree || v === false).toBeTrue(); done(); });
    } else { expect(res instanceof UrlTree || res === false).toBeTrue(); done(); }
  });
});
