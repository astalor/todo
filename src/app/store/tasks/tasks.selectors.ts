// src/app/store/tasks/tasks.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState } from './tasks.reducer';

export const selectTasksState = createFeatureSelector<TasksState>('tasks');

export const selectTasksLoading = createSelector(selectTasksState, s => s.loading);
export const selectTasksError = createSelector(selectTasksState, s => s.error ?? null);
export const selectTasksPage = createSelector(selectTasksState, s => s.page);
export const selectTasksPageSize = createSelector(selectTasksState, s => s.pageSize);
export const selectTasksTotal = createSelector(selectTasksState, s => s.total);
export const selectTasksTotalPages = createSelector(selectTasksState, s => s.totalPages);
export const selectLastQuery = createSelector(selectTasksState, s => s.lastQuery);
export const selectCategories = createSelector(selectTasksState, s => s.categories);
export const selectTags = createSelector(selectTasksState, s => s.tags);
export const selectStats = createSelector(selectTasksState, s => s.stats);

export const selectAllTasks = createSelector(selectTasksState, s => {
  const ids = s.ids as string[];
  return ids.map(id => s.entities[id]).filter(Boolean) as any[];
});

export const selectTasks = selectAllTasks;
export const selectTaskCategories = selectCategories;
export const selectTaskTags = selectTags;
export const selectTasksLastQuery = selectLastQuery;
