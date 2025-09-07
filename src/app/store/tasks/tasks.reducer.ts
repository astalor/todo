import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { Task } from '../../services/tasks.service';
import { TasksActions, TaskQuery } from './tasks.actions';

export interface TasksState extends EntityState<Task> {
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  lastQuery: TaskQuery;
  categories: string[];
  tags: string[];
  stats: any | null;
}

const adapter = createEntityAdapter<Task>({
  selectId: t => t.id,
  sortComparer: false
});

const initialState: TasksState = adapter.getInitialState({
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
  on(TasksActions.loadList, (state) => ({ ...state, loading: true, error: null })),
  on(TasksActions.loadListSuccess, (state, { data, page, pageSize, total, totalPages, query }) =>
    adapter.setAll(data, { ...state, loading: false, page, pageSize, total, totalPages, lastQuery: query })
  ),
  on(TasksActions.loadListFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(TasksActions.createSuccess, (state, { task }) => adapter.addOne(task, { ...state })),
  on(TasksActions.updateSuccess, (state, { task }) => adapter.upsertOne(task, { ...state })),
  on(TasksActions.deleteSuccess, (state, { id }) => adapter.removeOne(id, { ...state })),
  on(TasksActions.loadCategoriesSuccess, (state, { categories }) => ({ ...state, categories })),
  on(TasksActions.loadTagsSuccess, (state, { tags }) => ({ ...state, tags })),
  on(TasksActions.loadStatsSuccess, (state, { stats }) => ({ ...state, stats })),
  on(
    TasksActions.createFailure,
    TasksActions.updateFailure,
    TasksActions.deleteFailure,
    TasksActions.loadCategoriesFailure,
    TasksActions.loadTagsFailure,
    TasksActions.loadStatsFailure,
    (state, { error }) => ({ ...state, error })
  )
);

export const { selectAll: selectAllTasks, selectEntities: selectTaskEntities } = adapter.getSelectors();
