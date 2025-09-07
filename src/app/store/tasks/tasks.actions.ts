// src/app/store/tasks/tasks.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export type Status = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status?: Status | null;
  priority?: Priority | null;
  categories?: string[] | null;
  tags?: string[] | null;
  dueDate?: string | null;
  dueTime?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface TaskQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: Status | '';
  priority?: Priority | '';
  categories?: string;
  tags?: string;
  dueFrom?: string;
  dueTo?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'updatedAt';
  sortDir?: 'asc' | 'desc';
  excludeDone?: boolean;
}

export const TasksActions = createActionGroup({
  source: 'Tasks',
  events: {
    'Load List': props<{ query: TaskQuery }>(),
    'Load List Success': props<{ data: Task[]; page: number; pageSize: number; total: number; totalPages: number; query: TaskQuery }>(),
    'Load List Failure': props<{ error: string }>(),
    'Create': props<{ task: Partial<Task> }>(),
    'Create Success': props<{ task: Task }>(),
    'Create Failure': props<{ error: string }>(),
    'Update': props<{ id: string; changes: Partial<Task> }>(),
    'Update Success': props<{ task: Task }>(),
    'Update Failure': props<{ error: string }>(),
    'Delete': props<{ id: string }>(),
    'Delete Success': props<{ id: string }>(),
    'Delete Failure': props<{ error: string }>(),
    'Load Categories': emptyProps(),
    'Load Categories Success': props<{ categories: string[] }>(),
    'Load Categories Failure': props<{ error: string }>(),
    'Load Tags': emptyProps(),
    'Load Tags Success': props<{ tags: string[] }>(),
    'Load Tags Failure': props<{ error: string }>(),
    'Load Stats': emptyProps(),
    'Load Stats Success': props<{ stats: any }>(),
    'Load Stats Failure': props<{ error: string }>(),
    'Clear Error': emptyProps()
  }
});
