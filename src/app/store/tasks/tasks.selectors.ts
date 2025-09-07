import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState, selectAllTasks, selectTaskEntities } from './tasks.reducer';

export const selectTasksState = createFeatureSelector<TasksState>('tasks');

export const selectTasks = createSelector(selectTasksState, selectAllTasks);
export const selectTaskMap = createSelector(selectTasksState, selectTaskEntities);
export const selectTasksLoading = createSelector(selectTasksState, s => s.loading);
export const selectTasksError = createSelector(selectTasksState, s => s.error);
export const selectPagination = createSelector(selectTasksState, s => ({ page: s.page, pageSize: s.pageSize, total: s.total, totalPages: s.totalPages }));
export const selectLastQuery = createSelector(selectTasksState, s => s.lastQuery);
export const selectCategories = createSelector(selectTasksState, s => s.categories);
export const selectTags = createSelector(selectTasksState, s => s.tags);
export const selectStats = createSelector(selectTasksState, s => s.stats);
