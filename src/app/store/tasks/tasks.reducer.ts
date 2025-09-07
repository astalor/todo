// src/app/store/tasks/tasks.reducer.ts
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { TasksActions } from './tasks.actions';

export interface TaskEntity {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  priority?: string | null;
  categories?: string[] | null;
  tags?: string[] | null;
  dueDate?: string | null;
  dueTime?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface TasksState extends EntityState<TaskEntity> {
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  lastQuery: any;
  categories: string[];
  tags: string[];
  stats: any | null;
}

export const adapter = createEntityAdapter<TaskEntity>();
export const initialState: TasksState = adapter.getInitialState({
  loading: false,
  error: null,
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
  lastQuery: {},
  categories: [],
  tags: [],
  stats: null
});

export const tasksReducer = createReducer(
  initialState,
  on(TasksActions.loadList, (state, { query }) => ({ ...state, loading: true, error: null, lastQuery: query })),
  on(TasksActions.loadListSuccess, (state, { data, page, pageSize, total, totalPages }) =>
    adapter.setAll(data as TaskEntity[], { ...state, loading: false, page, pageSize, total, totalPages })
  ),
  on(TasksActions.loadListFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(TasksActions.createSuccess, (state, { task }) => adapter.addOne(task as TaskEntity, state)),
  on(TasksActions.updateSuccess, (state, { task }) => adapter.upsertOne(task as TaskEntity, state)),
  on(TasksActions.deleteSuccess, (state, { id }) => adapter.removeOne(id, state)),
  on(TasksActions.loadCategoriesSuccess, (state, { categories }) => ({ ...state, categories })),
  on(TasksActions.loadTagsSuccess, (state, { tags }) => ({ ...state, tags })),
  on(TasksActions.loadStatsSuccess, (state, { stats }) => ({ ...state, stats })),
  on(TasksActions.clearError, state => ({ ...state, error: null }))
);

export const { selectAll: selectAllTasks, selectEntities: selectTaskEntities } = adapter.getSelectors();
