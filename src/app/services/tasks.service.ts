// src/app/services/tasks.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskQuery } from '../store/tasks/tasks.actions';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  category: string | null;
  categories: string[];
  tags: string[];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private http = inject(HttpClient);

  list(query: TaskQuery): Observable<any> {
    let params = new HttpParams();
    Object.entries(query || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<any>('/api/tasks', { params });
  }

  get(id: string): Observable<Task> {
    return this.http.get<Task>(`/api/tasks/${id}`);
  }

  create(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>('/api/tasks', task);
  }

  update(id: string, changes: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`/api/tasks/${id}`, changes);
  }

  delete(id: string): Observable<{ deleted: boolean; id: string }> {
    return this.http.delete<{ deleted: boolean; id: string }>(`/api/tasks/${id}`);
  }

  categories() {
    return this.http.get<{ categories: string[] }>('/api/meta/categories');
  }

  tags() {
    return this.http.get<{ tags: string[] }>('/api/meta/tags');
  }

  stats() {
    return this.http.get<any>('/api/stats');
  }
}
