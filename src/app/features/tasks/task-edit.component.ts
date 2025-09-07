// src/app/features/tasks/task-edit.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TasksService, Task } from '../../services/tasks.service';
import { TasksActions } from '../../store/tasks/tasks.actions';
import { selectTaskCategories, selectTaskTags } from '../../store/tasks/tasks.selectors';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-task-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule
  ],
  template: `
    <div class="wrap">
      <form [formGroup]="form" (ngSubmit)="save()">
        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ 'edit.title' | translate }}</mat-label>
          <input matInput formControlName="title">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>{{ 'edit.description' | translate }}</mat-label>
          <textarea matInput rows="6" formControlName="description"></textarea>
        </mat-form-field>

        <div class="row meta">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'common.status' | translate }}</mat-label>
            <mat-select formControlName="status" required>
              <mat-option value="todo">{{ 'status.todo' | translate }}</mat-option>
              <mat-option value="in-progress">{{ 'status.inProgress' | translate }}</mat-option>
              <mat-option value="done">{{ 'status.done' | translate }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'common.priority' | translate }}</mat-label>
            <mat-select formControlName="priority" required>
              <mat-option value="low">{{ 'priority.low' | translate }}</mat-option>
              <mat-option value="medium">{{ 'priority.medium' | translate }}</mat-option>
              <mat-option value="high">{{ 'priority.high' | translate }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'common.dueDate' | translate }}</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dueDateDate">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>{{ 'common.time' | translate }}</mat-label>
            <input matInput type="time" formControlName="dueDateTime">
          </mat-form-field>
        </div>

        <div class="line">
          <mat-form-field appearance="outline" class="flex">
            <mat-label>{{ 'common.categories' | translate }}</mat-label>
            <mat-select formControlName="categories" multiple>
              <mat-select-trigger>
                <ng-container *ngIf="form.value.categories?.length as c">
                  <span class="chip" *ngFor="let cat of form.value.categories | slice:0:3">{{ cat }}</span>
                  <span class="more" *ngIf="c>3">+{{ c-3 }}</span>
                </ng-container>
              </mat-select-trigger>
              <mat-option *ngFor="let c of categories" [value]="c">{{ c }}</mat-option>
            </mat-select>
          </mat-form-field>
          <button class="add-btn" mat-stroked-button type="button" (click)="promptAddCategory()">{{ 'edit.addCategory' | translate }}</button>
        </div>

        <div class="line">
          <mat-form-field appearance="outline" class="flex">
            <mat-label>{{ 'common.tags' | translate }}</mat-label>
            <mat-select formControlName="tags" multiple>
              <mat-select-trigger>
                <ng-container *ngIf="form.value.tags?.length as c">
                  <span class="chip" *ngFor="let tag of form.value.tags | slice:0:3">{{ tag }}</span>
                  <span class="more" *ngIf="c>3">+{{ c-3 }}</span>
                </ng-container>
              </mat-select-trigger>
              <mat-option *ngFor="let t of tags" [value]="t">{{ t }}</mat-option>
            </mat-select>
          </mat-form-field>
          <button class="add-btn" mat-stroked-button type="button" (click)="promptAddTag()">{{ 'edit.addTag' | translate }}</button>
        </div>

        <div class="actions">
          <button mat-flat-button color="primary" [disabled]="form.invalid">{{ isNew() ? ('edit.create' | translate) : ('edit.save' | translate) }}</button>
          <button *ngIf="!isNew()" mat-stroked-button color="warn" type="button" (click)="del()">{{ 'common.delete' | translate }}</button>
          <a mat-stroked-button routerLink="/tasks">{{ 'common.cancel' | translate }}</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .wrap { max-width: 1000px; margin: 16px auto; padding: 0 16px; }
    form { display: grid; gap: 12px; }
    .full { grid-column: 1 / -1; }
    .row { display: grid; gap: 12px; align-items: end; }
    .row.meta { grid-template-columns: repeat(4, minmax(180px, 1fr)); }
    .line { display: grid; grid-template-columns: 1fr max-content; gap: 12px; align-items: center; }
    .flex { width: 100%; }
    .add-btn { height: 56px; }
    .chip { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 999px; font-size: 12px; background: #f2f2f2; margin-right: 6px; }
    .more { font-size: 12px; color: #666; }
    .actions { display: flex; gap: 10px; }
    @media (max-width: 900px) {
      .row.meta { grid-template-columns: 1fr 1fr; }
      .line { grid-template-columns: 1fr; }
      .add-btn { height: 40px; justify-self: start; }
    }
    @media (max-width: 600px) {
      .row.meta { grid-template-columns: 1fr; }
    }
  `]
})
export class TaskEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private api = inject(TasksService);

  id = signal<string | null>(null);
  categories: string[] = [];
  tags: string[] = [];

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: ['todo', Validators.required],
    priority: ['medium', Validators.required],
    categories: [[] as string[]],
    tags: [[] as string[]],
    dueDateDate: [null as Date | null],
    dueDateTime: ['']
  });

  ngOnInit() {
    this.store.dispatch(TasksActions.loadCategories());
    this.store.dispatch(TasksActions.loadTags());
    this.store.select(selectTaskCategories).subscribe(x => this.categories = x || []);
    this.store.select(selectTaskTags).subscribe(x => this.tags = x || []);
    const rid = this.route.snapshot.paramMap.get('id');
    this.id.set(rid);
    if (rid && rid !== 'new') {
      this.api.get(rid).subscribe(t => this.patchFromTask(t));
    }
  }

  isNew() {
    return this.id() === 'new' || !this.id();
  }

  patchFromTask(t: Task) {
    const d = t.dueDate ? new Date(t.dueDate) : null;
    this.form.patchValue({
      title: t.title || '',
      description: t.description || '',
      status: t.status || 'todo',
      priority: t.priority || 'medium',
      categories: Array.isArray(t.categories) ? t.categories : [],
      tags: Array.isArray(t.tags) ? t.tags : [],
      dueDateDate: d,
      dueDateTime: d ? this.toTime(d) : ''
    });
  }

  toTime(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  combine(date: Date | null, time: string | null) {
    if (!date && !time) return null;
    const base = date ? new Date(date) : new Date();
    const [hh, mm] = (time || '00:00').split(':').map(x => parseInt(x, 10));
    base.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
    return base.toISOString();
  }

  save() {
    const v = this.form.value;
    const body: any = {
      title: v.title || '',
      description: v.description || '',
      status: v.status || 'todo',
      priority: v.priority || 'medium',
      categories: v.categories || [],
      category: (v.categories || [])[0] || null,
      tags: v.tags || [],
      dueDate: this.combine(v.dueDateDate || null, v.dueDateTime || '')
    };
    if (this.isNew()) {
      this.api.create(body).subscribe(() => {
        this.store.dispatch(TasksActions.loadList({ query: {} }));
        this.router.navigateByUrl('/tasks');
      });
    } else {
      this.api.update(this.id() as string, body).subscribe(() => {
        this.store.dispatch(TasksActions.loadList({ query: {} }));
        this.router.navigateByUrl('/tasks');
      });
    }
  }

  del() {
    if (this.isNew() || !this.id()) return;
    const ok = window.confirm('Delete this task?');
    if (!ok) return;
    this.api.delete(this.id() as string).subscribe(() => {
      this.store.dispatch(TasksActions.loadList({ query: {} }));
      this.router.navigateByUrl('/tasks');
    });
  }

  promptAddCategory() {
    const val = window.prompt('New category name');
    if (!val) return;
    if (!this.categories.includes(val)) this.categories = [...this.categories, val];
    const cur = this.form.value.categories || [];
    this.form.patchValue({ categories: Array.from(new Set([...cur, val])) });
  }

  promptAddTag() {
    const val = window.prompt('New tag');
    if (!val) return;
    if (!this.tags.includes(val)) this.tags = [...this.tags, val];
    const cur = this.form.value.tags || [];
    this.form.patchValue({ tags: Array.from(new Set([...cur, val])) });
  }
}
