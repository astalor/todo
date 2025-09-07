// src/app/store/auth/auth.effects.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ReplaySubject, take } from 'rxjs';
import { AuthEffects } from './auth.effects';
import { AuthActions } from './auth.actions';
import { authInterceptor } from '../../core/auth.interceptor';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { provideMockStore } from '@ngrx/store/testing';

describe('AuthEffects', () => {
  let actions$: ReplaySubject<any>;
  let http: HttpTestingController;
  let effects: AuthEffects;

  beforeEach(() => {
    actions$ = new ReplaySubject<any>(1);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatSnackBarModule, TranslateModule.forRoot()],
      providers: [
        provideMockStore(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideMockActions(() => actions$.asObservable()),
        AuthEffects
      ]
    });
    http = TestBed.inject(HttpTestingController);
    effects = TestBed.inject(AuthEffects);
    localStorage.clear();
  });

  afterEach(() => http.verify());

  it('login$ success', (done) => {
    effects.login$.pipe(take(1)).subscribe(a => {
      expect(a.type).toContain('Login Success');
      expect((a as any).token).toBe('tok');
      done();
    });
    actions$.next(AuthActions.login({ email: 'a', password: 'b' }));
    http.expectOne('/api/auth/login').flush({ token: 'tok', user: { id: '1', email: 'a', name: 'n' } });
  });

  it('register$ success', (done) => {
    effects.register$.pipe(take(1)).subscribe(a => {
      expect(a.type).toContain('Register Success');
      expect((a as any).token).toBe('tok');
      done();
    });
    actions$.next(AuthActions.register({ name: 'n', email: 'a', password: 'p' }));
    http.expectOne('/api/auth/register').flush({ token: 'tok', user: { id: '1', email: 'a', name: 'n' } });
  });
});
