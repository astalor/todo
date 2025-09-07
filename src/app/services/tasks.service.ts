import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo'|'in-progress'|'done';
  priority: 'low'|'medium'|'high';
  category: string|null;
  tags: string[];
  dueDate: string|null;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private http = inject(HttpClient);

  list(params: { page?: number; pageSize?: number; status?: string; priority?: string; category?: string; q?: string; dueFrom?: string; dueTo?: string; sortBy?: string; sortDir?: 'asc'|'desc'; }): Observable<any> {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
    });
    return this.http.get<any>('/api/tasks', { params: p });
  }

  create(task: Partial<Task>) {
    return this.http.post<Task>('/api/tasks', task);
  }

  get(id: string) {
    return this.http.get<Task>(`/api/tasks/${id}`);
  }

  update(id: string, task: Partial<Task>) {
    return this.http.put<Task>(`/api/tasks/${id}`, task);
  }

  delete(id: string) {
    return this.http.delete(`/api/tasks/${id}`);
  }

  stats() {
    return this.http.get<any>('/api/stats');
  }

  categories() {
    return this.http.get<{ categories: string[] }>('/api/meta/categories');
  }

  tags() {
    return this.http.get<{ tags: string[] }>('/api/meta/tags');
  }
}
