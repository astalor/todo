import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectTaskMap } from '../../store/tasks/tasks.selectors';
import { TasksActions } from '../../store/tasks/tasks.actions';
import { TasksService, Task } from '../../services/tasks.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-task-edit',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  template: `
    <div class="wrap" *ngIf="loaded">
      <h2>Edit Task</h2>
      <form [formGroup]="form" (ngSubmit)="save()">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Description</mat-label>
          <textarea matInput rows="4" formControlName="description"></textarea>
        </mat-form-field>
        <div class="grid">
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="todo">To Do</mat-option>
              <mat-option value="in-progress">In Progress</mat-option>
              <mat-option value="done">Done</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="low">Low</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="high">High</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <input matInput formControlName="category" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Tags (comma separated)</mat-label>
            <input matInput formControlName="tags" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Due date</mat-label>
            <input matInput type="date" formControlName="dueDate" />
          </mat-form-field>
        </div>
        <div class="actions">
          <button mat-raised-button color="primary" [disabled]="form.invalid">Save</button>
          <button mat-button type="button" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .wrap { max-width: 800px; margin: 16px auto; padding: 0 12px; }
    .full { width: 100%; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
    .actions { margin-top: 12px; display: flex; gap: 12px; }
  `]
})
export class TaskEditComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private api = inject(TasksService);
  private fb = inject(FormBuilder);
  id = this.route.snapshot.paramMap.get('id')!;
  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: ['todo', Validators.required],
    priority: ['medium', Validators.required],
    category: [''],
    tags: [''],
    dueDate: ['']
  });
  loaded = false;

  constructor() {
    this.store.select(selectTaskMap).subscribe(map => {
      const existing = map[this.id];
      if (existing) {
        this.patch(existing);
        this.loaded = true;
      } else {
        this.api.get(this.id).subscribe(t => {
          this.patch(t);
          this.loaded = true;
        });
      }
    });
  }

  private patch(t: Task) {
    this.form.patchValue({
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      category: t.category || '',
      tags: (t.tags || []).join(', '),
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().slice(0,10) : ''
    });
  }

  save() {
    const v = this.form.value as any;
    const payload = {
      title: v.title,
      description: v.description,
      status: v.status,
      priority: v.priority,
      category: v.category || null,
      tags: (v.tags || '').split(',').map((s: string) => s.trim()).filter((s: string) => !!s),
      dueDate: v.dueDate ? new Date(v.dueDate).toISOString() : null
    };
    this.store.dispatch(TasksActions.update({ id: this.id, changes: payload }));
  }

  cancel() {
    this.router.navigateByUrl('/tasks');
  }
}
