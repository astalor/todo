// src/app/features/tasks/task-edit.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksService, Task } from '../../services/tasks.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  standalone: true,
  selector: 'app-task-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="wrap">
      <form [formGroup]="form" (ngSubmit)="save()">
        <mat-form-field appearance="outline" class="full">
          <input matInput placeholder="Title" formControlName="title">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <textarea matInput placeholder="Description" formControlName="description" rows="4"></textarea>
        </mat-form-field>

        <div class="row">
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
            <mat-label>Categories</mat-label>
            <mat-select formControlName="categories" multiple>
              <mat-option *ngFor="let c of categories" [value]="c">{{ c }}</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="due-wrap">
            <mat-form-field appearance="outline">
              <mat-label>Due date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dueDateDate">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Time</mat-label>
              <input matInput type="time" formControlName="dueDateTime">
            </mat-form-field>
          </div>
        </div>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Tags</mat-label>
          <mat-chip-set>
            <mat-chip *ngFor="let tag of tagsCtrl()" (removed)="removeTag(tag)">
              {{ tag }}
              <button matChipRemove mat-icon-button aria-label="remove">
                <mat-icon>close</mat-icon>
              </button>
            </mat-chip>
          </mat-chip-set>
          <input matInput placeholder="Add tag"
                 #tagTrigger="matAutocompleteTrigger"
                 [matAutocomplete]="auto"
                 (focus)="tagTrigger.openPanel()"
                 (keydown.enter)="addTag($any($event.target).value); $any($event.target).value=''">
          <mat-autocomplete #auto="matAutocomplete" (optionSelected)="addTag($event.option.value)" [autoActiveFirstOption]="true">
            <mat-option *ngFor="let t of tagsOptions" [value]="t">{{ t }}</mat-option>
          </mat-autocomplete>
        </mat-form-field>

        <div class="actions">
          <button mat-raised-button color="primary">{{ isCreate ? 'Create' : 'Save' }}</button>
          <button mat-stroked-button type="button" (click)="cancel()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .wrap { max-width: 840px; margin: 16px auto; padding: 0 16px; }
    .full { width: 100%; }
    .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; align-items: start; }
    .due-wrap { display: grid; grid-template-columns: 1fr 160px; gap: 10px; }
    .actions { display: flex; gap: 8px; margin-top: 12px; }
  `]
})
export class TaskEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(TasksService);
  private fb = inject(FormBuilder);
  id: string | null = null;
  isCreate = true;

  categories: string[] = [];
  tagsOptions: string[] = [];

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    status: ['todo', Validators.required],
    priority: ['medium', Validators.required],
    categories: [[] as string[]],
    dueDateDate: [null as Date | null],
    dueDateTime: [''],
    tags: [[] as string[]]
  });

  ngOnInit() {
    this.api.categories().subscribe((r: any) => this.categories = r.categories || []);
    this.api.tags().subscribe((r: any) => this.tagsOptions = r.tags || []);
    const param = this.route.snapshot.paramMap.get('id');
    this.isCreate = !param || param === 'new';
    if (!this.isCreate) {
      this.id = param!;
      this.api.get(this.id).subscribe((t: Task) => {
        const d = t.dueDate ? new Date(t.dueDate) : null;
        this.form.patchValue({
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          categories: Array.isArray(t.categories) && t.categories.length ? t.categories : (t.category ? [t.category] : []),
          dueDateDate: d,
          dueDateTime: d ? this.toTime(d) : '',
          tags: t.tags || []
        });
      });
    }
  }

  save() {
    const v = this.form.value as any;
    const dueIso = this.combineDue(v.dueDateDate, v.dueDateTime);
    const payload: any = {
      title: v.title,
      description: v.description || '',
      status: v.status,
      priority: v.priority,
      categories: v.categories || [],
      category: v.categories && v.categories.length ? v.categories[0] : null,
      tags: v.tags || [],
      dueDate: dueIso
    };
    if (this.isCreate) {
      this.api.create(payload).subscribe(() => this.router.navigateByUrl('/tasks'));
    } else {
      this.api.update(this.id!, payload).subscribe(() => this.router.navigateByUrl('/tasks'));
    }
  }

  cancel() {
    this.router.navigateByUrl('/tasks');
  }

  tagsCtrl() {
    return this.form.get('tags')!.value as string[];
  }

  addTag(val: string) {
    const v = (val || '').trim();
    if (!v) return;
    const set = new Set([...(this.tagsCtrl() || []), v]);
    this.form.patchValue({ tags: Array.from(set) });
  }

  removeTag(tag: string) {
    const next = (this.tagsCtrl() || []).filter(x => x !== tag);
    this.form.patchValue({ tags: next });
  }

  toTime(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  combineDue(date: Date | null, time: string | null) {
    if (!date && !time) return null;
    const base = date ? new Date(date) : new Date();
    const [hh, mm] = (time || '00:00').split(':').map((x: string) => parseInt(x, 10));
    base.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
    return base.toISOString();
  }
}
