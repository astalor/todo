// src/app/services/tasks.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task as StoreTask, TaskQuery } from '../store/tasks/tasks.actions';

export interface Task extends StoreTask {}

export interface Paged<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private http = inject(HttpClient);

  list(query: TaskQuery): Observable<Paged<Task>> {
    let params = new HttpParams();
    Object.entries(query || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<Paged<Task>>('/api/tasks', { params });
  }

  get(id: string): Observable<Task> {
    return this.http.get<Task>(`/api/tasks/${id}`);
  }

  create(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>('/api/tasks', task);
  }

  update(id: string, changes: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`/api/tasks/${id}`, changes);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/tasks/${id}`);
  }

  stats(): Observable<any> {
    return this.http.get<any>('/api/stats');
  }

  categories(): Observable<{ categories: string[] }> {
    return this.http.get<{ categories: string[] }>('/api/meta/categories');
  }

  tags(): Observable<{ tags: string[] }> {
    return this.http.get<{ tags: string[] }>('/api/meta/tags');
  }
}
