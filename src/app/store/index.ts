import { ActionReducerMap } from '@ngrx/store';
import { authReducer, AuthState } from './auth/auth.reducer';
import { tasksReducer, TasksState } from './tasks/tasks.reducer';

export interface AppState {
  auth: AuthState;
  tasks: TasksState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  tasks: tasksReducer
};
