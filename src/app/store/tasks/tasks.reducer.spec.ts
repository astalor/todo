// src/app/store/tasks/tasks.reducer.spec.ts
import { tasksReducer, initialState } from './tasks.reducer';
import { TasksActions } from './tasks.actions';

describe('tasksReducer', () => {
  it('loadList sets loading and query', () => {
    const q = { page: 2 } as any;
    const s = tasksReducer(initialState, TasksActions.loadList({ query: q }));
    expect(s.loading).toBeTrue();
    expect(s.lastQuery).toEqual(q);
  });
  it('loadListSuccess updates entities and paging', () => {
    const s = tasksReducer(initialState, TasksActions.loadListSuccess({
      data: [{ id: '1', title: 'A' } as any], page: 1, pageSize: 10, total: 1, totalPages: 1, query: { page: 1 } as any
    }));
    expect(s.ids.length).toBe(1);
    expect(s.page).toBe(1);
    expect(s.total).toBe(1);
  });
  it('updateSuccess replaces entity', () => {
    const loaded = tasksReducer(initialState, TasksActions.loadListSuccess({
      data: [{ id: '1', title: 'A' } as any], page: 1, pageSize: 10, total: 1, totalPages: 1, query: {} as any
    }));
    const s = tasksReducer(loaded, TasksActions.updateSuccess({ task: { id: '1', title: 'B' } as any }));
    expect((s.entities['1'] as any).title).toBe('B');
  });
});
