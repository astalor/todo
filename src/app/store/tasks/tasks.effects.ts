// src/app/store/tasks/tasks.effects.ts
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TasksActions } from './tasks.actions';
import { TasksService } from '../../services/tasks.service';
import { catchError, map, mergeMap, of, switchMap, tap, withLatestFrom } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectLastQuery } from './tasks.selectors';

@Injectable()
export class TasksEffects {
  private actions$ = inject(Actions);
  private api = inject(TasksService);
  private router = inject(Router);
  private store = inject(Store);

  loadList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadList),
      switchMap(({ query }) =>
        this.api.list(query).pipe(
          map(res => TasksActions.loadListSuccess({
            data: res.data, page: res.page, pageSize: res.pageSize, total: res.total, totalPages: res.totalPages, query
          })),
          catchError(err => of(TasksActions.loadListFailure({ error: err?.error?.message || 'Load failed' })))
        )
      )
    )
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.create),
      mergeMap(({ task }) =>
        this.api.create(task).pipe(
          withLatestFrom(this.store.select(selectLastQuery)),
          mergeMap(([t, last]) => [
            TasksActions.createSuccess({ task: t }),
            TasksActions.loadList({ query: last || {} })
          ]),
          catchError(err => of(TasksActions.createFailure({ error: err?.error?.message || 'Create failed' })))
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.update),
      mergeMap(({ id, changes }) =>
        this.api.update(id, changes).pipe(
          withLatestFrom(this.store.select(selectLastQuery)),
          mergeMap(([t, last]) => [
            TasksActions.updateSuccess({ task: t }),
            TasksActions.loadList({ query: last || {} })
          ]),
          catchError(err => of(TasksActions.updateFailure({ error: err?.error?.message || 'Update failed' })))
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.delete),
      mergeMap(({ id }) =>
        this.api.delete(id).pipe(
          withLatestFrom(this.store.select(selectLastQuery)),
          mergeMap(([_, last]) => [
            TasksActions.deleteSuccess({ id }),
            TasksActions.loadList({ query: last || {} })
          ]),
          catchError(err => of(TasksActions.deleteFailure({ error: err?.error?.message || 'Delete failed' })))
        )
      )
    )
  );

  loadMeta$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadCategories, TasksActions.loadTags),
      mergeMap(action => {
        if (action.type.endsWith('Load Categories')) {
          return this.api.categories().pipe(
            map(r => TasksActions.loadCategoriesSuccess({ categories: r.categories })),
            catchError(err => of(TasksActions.loadCategoriesFailure({ error: err?.error?.message || 'Categories failed' })))
          );
        }
        return this.api.tags().pipe(
          map(r => TasksActions.loadTagsSuccess({ tags: r.tags })),
          catchError(err => of(TasksActions.loadTagsFailure({ error: err?.error?.message || 'Tags failed' })))
        );
      })
    )
  );

  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadStats),
      switchMap(() =>
        this.api.stats().pipe(
          map(stats => TasksActions.loadStatsSuccess({ stats })),
          catchError(err => of(TasksActions.loadStatsFailure({ error: err?.error?.message || 'Stats failed' })))
        )
      )
    )
  );

  redirectAfterSave$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.createSuccess, TasksActions.updateSuccess),
      withLatestFrom(this.store.select(selectLastQuery)),
      tap(([_, last]) => {
        const url = this.router.url.split('?')[0];
        const onForm = url === '/tasks/new' || (/^\/tasks\/[^/]+$/.test(url) && url !== '/tasks');
        if (onForm) this.router.navigate(['/tasks'], { queryParams: last || {} });
      })
    ), { dispatch: false }
  );
}
