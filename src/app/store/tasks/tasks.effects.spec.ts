// src/app/store/tasks/tasks.effects.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { ReplaySubject, filter, take } from 'rxjs';
import { TasksEffects } from './tasks.effects';
import { TasksActions } from './tasks.actions';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { initialState as tasksInitial } from './tasks.reducer';

describe('TasksEffects', () => {
  let actions$: ReplaySubject<any>;
  let http: HttpTestingController;
  let effects: TasksEffects;

  beforeEach(() => {
    actions$ = new ReplaySubject<any>(1);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideMockStore({ initialState: { tasks: tasksInitial } }),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockActions(() => actions$.asObservable()),
        TasksEffects
      ]
    });
    http = TestBed.inject(HttpTestingController);
    effects = TestBed.inject(TasksEffects);
  });

  afterEach(() => http.verify());

  it('loadList$ maps to success', (done) => {
    effects.loadList$.pipe(take(1)).subscribe(a => {
      expect(a.type).toContain('Load List Success');
      done();
    });
    actions$.next(TasksActions.loadList({ query: { page: 1 } }));
    http.expectOne(r => r.url === '/api/tasks' && r.method === 'GET')
        .flush({ data: [], page: 1, pageSize: 20, total: 0, totalPages: 0 });
  });

  it('create$ emits success (or refresh) without double-calling done', (done) => {
    effects.create$
      .pipe(
        filter(a => a.type.includes('Create Success') || a.type.includes('Load List')),
        take(1)
      )
      .subscribe(a => {
        expect(a.type.includes('Create Success') || a.type.includes('Load List')).toBeTrue();
        done();
      });
    actions$.next(TasksActions.create({ task: { title: 'A' } }));
    http.expectOne('/api/tasks').flush({ id: '1', title: 'A' });
  });
});
