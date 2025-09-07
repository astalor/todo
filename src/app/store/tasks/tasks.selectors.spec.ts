// src/app/store/tasks/tasks.selectors.spec.ts
import * as S from './tasks.selectors';
import { TasksState } from './tasks.reducer';

describe('tasks selectors', () => {
  function state(slice: Partial<TasksState>): TasksState {
    return {
      ids: [],
      entities: {},
      loading: false,
      error: null,
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
      lastQuery: { page: 1, pageSize: 20 },
      categories: ['work', 'home'],
      tags: ['urgent', 'test'],
      ...slice
    } as any;
  }

  it('selectLastQuery', () => {
    const s = state({ lastQuery: { page: 2, pageSize: 10, q: 'x', tags: 'urgent' as any } });
    const res = S.selectLastQuery.projector(s);
    expect(res.page).toBe(2);
    expect(res.q).toBe('x');
  });

  it('selectCategories', () => {
    const s = state({ categories: ['a', 'b', 'c'] });
    const res = S.selectCategories.projector(s);
    expect(res.length).toBe(3);
  });

  it('selectTaskTags', () => {
    const s = state({ tags: ['x', 'y'] });
    const res = S.selectTaskTags.projector(s);
    expect(res).toContain('x');
    expect(res).toContain('y');
  });

  it('selectAllTasks returns array', () => {
    const s = state({ ids: ['1', '2'], entities: { '1': { id: '1', title: 'A' } as any, '2': { id: '2', title: 'B' } as any } });
    const res = S.selectAllTasks.projector(s);
    expect(res.length).toBe(2);
  });
});
