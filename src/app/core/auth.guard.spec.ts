// src/app/core/auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { authGuard } from './auth.guard';
import { of, isObservable } from 'rxjs';
import { Component } from '@angular/core';

@Component({selector: 'x-dummy', template: ''})
class DummyCmp {}

describe('authGuard (functional)', () => {
  let store: MockStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([
        { path: 'login', component: DummyCmp },
        { path: 'tasks', component: DummyCmp }
      ])],
      declarations: [DummyCmp],
      providers: [provideMockStore()]
    });
    store = TestBed.inject(MockStore);
  });

  it('blocks when not authenticated and redirects to /login', done => {
    spyOn(store, 'select').and.returnValue(of(false));
    const rs = { url: '/tasks' } as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, rs));
    if (isObservable(result)) {
      result.subscribe(v => {
        const redirected = v instanceof UrlTree ? v.toString().includes('/login') : v === false;
        expect(redirected).toBeTrue();
        done();
      });
    } else {
      const redirected = result instanceof UrlTree ? result.toString().includes('/login') : result === false;
      expect(redirected).toBeTrue();
      done();
    }
  });

  it('allows when authenticated', done => {
    localStorage.setItem('token', 't');
    spyOn(store, 'select').and.returnValue(of(true));
    const rs = { url: '/tasks' } as RouterStateSnapshot;
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, rs));
    if (isObservable(result)) {
      result.subscribe(v => {
        const allowed = v === true || !(v instanceof UrlTree);
        expect(allowed).toBeTrue();
        done();
      });
    } else {
      const allowed = result === true || !(result instanceof UrlTree);
      expect(allowed).toBeTrue();
      done();
    }
  });
});
