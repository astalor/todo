import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Task } from '../../services/tasks.service';

export interface TaskQuery {
  page?: number;
  pageSize?: number;
  status?: string;
  priority?: string;
  category?: string;
  q?: string;
  dueFrom?: string;
  dueTo?: string;
  sortBy?: string;
  sortDir?: 'asc'|'desc';
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
    'Load Stats': emptyProps(),
    'Load Stats Success': props<{ stats: any }>(),
    'Load Stats Failure': props<{ error: string }>(),
    'Load Categories': emptyProps(),
    'Load Categories Success': props<{ categories: string[] }>(),
    'Load Categories Failure': props<{ error: string }>(),
    'Load Tags': emptyProps(),
    'Load Tags Success': props<{ tags: string[] }>(),
    'Load Tags Failure': props<{ error: string }>()
  }
});
