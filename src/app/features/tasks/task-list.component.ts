import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TasksActions } from '../../store/tasks/tasks.actions';
import { selectTasks, selectPagination, selectCategories, selectTags, selectTasksLoading, selectLastQuery } from '../../store/tasks/tasks.selectors';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-task-list',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule],
  template: `
    <div class="wrap">
      <h2>Tasks</h2>
      <form class="filters" [formGroup]="form" (ngSubmit)="apply()">
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="">All</mat-option>
            <mat-option value="todo">To Do</mat-option>
            <mat-option value="in-progress">In Progress</mat-option>
            <mat-option value="done">Done</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Priority</mat-label>
          <mat-select formControlName="priority">
            <mat-option value="">All</mat-option>
            <mat-option value="low">Low</mat-option>
            <mat-option value="medium">Medium</mat-option>
            <mat-option value="high">High</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            <mat-option value="">All</mat-option>
            <mat-option *ngFor="let c of (categories$ | async) || []" [value]="c">{{ c }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="q">
          <mat-label>Search</mat-label>
          <input matInput formControlName="q" placeholder="Title or description" />
        </mat-form-field>
        <button mat-raised-button color="primary">Apply</button>
        <button mat-button type="button" (click)="reset()">Reset</button>
        <span class="spacer"></span>
        <button mat-raised-button color="accent" type="button" (click)="create()">New Task</button>
      </form>

      <div class="list" *ngIf="tasks$ | async as tasks">
        <div class="row hdr">
          <div class="c title">Title</div>
          <div class="c">Status</div>
          <div class="c">Priority</div>
          <div class="c">Category</div>
          <div class="c">Due</div>
          <div class="c actions"></div>
        </div>
        <div class="row" *ngFor="let t of tasks">
          <div class="c title">{{ t.title }}</div>
          <div class="c">{{ t.status }}</div>
          <div class="c">{{ t.priority }}</div>
          <div class="c">{{ t.category || '-' }}</div>
          <div class="c">{{ t.dueDate ? (t.dueDate | date:'mediumDate') : '-' }}</div>
          <div class="c actions">
            <button mat-button color="primary" (click)="edit(t.id)">Edit</button>
            <button mat-button color="warn" (click)="remove(t.id)">Delete</button>
          </div>
        </div>
      </div>

      <div class="pager" *ngIf="pagination$ | async as p">
        <button mat-button (click)="changePage(p.page - 1)" [disabled]="p.page <= 1">Prev</button>
        <span>Page {{ p.page }} / {{ p.totalPages }} • {{ p.total }} total</span>
        <button mat-button (click)="changePage(p.page + 1)" [disabled]="p.page >= p.totalPages">Next</button>
      </div>
    </div>
  `,
  styles: [`
    .wrap { max-width: 1024px; margin: 16px auto; padding: 0 12px; }
    .filters { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }
    .filters .q { min-width: 280px; flex: 1; }
    .spacer { flex: 1 1 auto; }
    .list { border: 1px solid #eee; border-radius: 8px; }
    .row { display: grid; grid-template-columns: 1.8fr 1fr 1fr 1fr 1fr 1fr; padding: 10px 12px; border-top: 1px solid #eee; align-items: center; }
    .row.hdr { font-weight: 600; background: #fafafa; border-top: none; }
    .c.title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .c.actions { text-align: right; }
    .pager { display: flex; gap: 12px; align-items: center; justify-content: center; padding: 12px; }
  `]
})
export class TaskListComponent {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  tasks$ = this.store.select(selectTasks);
  pagination$ = this.store.select(selectPagination);
  categories$ = this.store.select(selectCategories);
  tags$ = this.store.select(selectTags);
  loading$ = this.store.select(selectTasksLoading);
  lastQuery$ = this.store.select(selectLastQuery);
  form = this.fb.group({ status: [''], priority: [''], category: [''], q: [''] });
  page = signal(1);
  pageSize = signal(20);
  constructor() {
    this.store.dispatch(TasksActions.loadCategories());
    this.store.dispatch(TasksActions.loadTags());
    this.apply();
  }
  apply() {
    const query = { page: this.page(), pageSize: this.pageSize(), ...this.form.value } as any;
    this.store.dispatch(TasksActions.loadList({ query }));
  }
  reset() {
    this.form.reset({ status: '', priority: '', category: '', q: '' });
    this.page.set(1);
    this.apply();
  }
  changePage(p: number) {
    this.page.set(Math.max(1, p));
    this.apply();
  }
  create() {
    const title = prompt('Title');
    if (!title) return;
    this.store.dispatch(TasksActions.create({ task: { title, status: 'todo', priority: 'medium' } }));
  }
  edit(id: string) {
    location.assign('/tasks/' + id);
  }
  remove(id: string) {
    if (confirm('Delete task?')) this.store.dispatch(TasksActions.delete({ id }));
  }
}
