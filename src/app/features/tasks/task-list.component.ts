// src/app/features/tasks/task-list.component.ts
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TasksActions } from '../../store/tasks/tasks.actions';
import { selectAllTasks, selectTasksLoading, selectTasksPage, selectTasksPageSize, selectTasksTotal, selectTaskCategories, selectTaskTags } from '../../store/tasks/tasks.selectors';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-task-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    RouterLink
  ],
  template: `
    <div class="wrap">
      <div class="filters-header">
        <button mat-stroked-button class="filters-toggle" (click)="filtersOpen = !filtersOpen">
          <mat-icon>tune</mat-icon>
          Filters
        </button>
        <span class="spacer"></span>
        <button mat-flat-button color="primary" type="button" (click)="create()">New Task</button>
      </div>

      <form [formGroup]="form" class="filters filters-collapsible" [class.collapsed]="!filtersOpen" (ngSubmit)="apply()">
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="">Any</mat-option>
            <mat-option value="todo">To Do</mat-option>
            <mat-option value="in-progress">In Progress</mat-option>
            <mat-option value="done">Done</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Priority</mat-label>
          <mat-select formControlName="priority">
            <mat-option value="">Any</mat-option>
            <mat-option value="low">Low</mat-option>
            <mat-option value="medium">Medium</mat-option>
            <mat-option value="high">High</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Categories</mat-label>
          <mat-select formControlName="categories" multiple>
            <mat-option *ngFor="let c of categories$ | async" [value]="c">{{ c }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tags</mat-label>
          <mat-select formControlName="tags" multiple>
            <mat-option *ngFor="let t of tags$ | async" [value]="t">{{ t }}</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="search-ff">
          <mat-label>Search</mat-label>
          <input matInput formControlName="q">
        </mat-form-field>

        <div class="range-row">
          <div class="range">
            <mat-form-field appearance="outline">
              <mat-label>From date</mat-label>
              <input matInput [matDatepicker]="fromPicker" formControlName="dueFromDate">
              <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
              <mat-datepicker #fromPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline" class="time-ff">
              <mat-label>Time</mat-label>
              <input matInput type="time" formControlName="dueFromTime">
            </mat-form-field>
          </div>

          <div class="range">
            <mat-form-field appearance="outline">
              <mat-label>To date</mat-label>
              <input matInput [matDatepicker]="toPicker" formControlName="dueToDate">
              <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
              <mat-datepicker #toPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline" class="time-ff">
              <mat-label>Time</mat-label>
              <input matInput type="time" formControlName="dueToTime">
            </mat-form-field>
          </div>
        </div>

        <button mat-raised-button color="primary">Apply</button>
        <button mat-stroked-button type="button" (click)="reset()">Reset</button>
      </form>

      <div class="toolbar">
        <div class="page">Page {{ page$ | async }}</div>
        <span class="spacer"></span>
        <button mat-stroked-button (click)="prev()" [disabled]="(page$ | async) === 1">Prev</button>
        <button mat-stroked-button (click)="next()" [disabled]="disableNext()">Next</button>
      </div>

      <div class="cards" *ngIf="items$ | async as items">
        <div class="card" *ngFor="let t of items; trackBy: track" [class.overdue]="isOverdue(t)">
          <div class="card-head">
            <a class="title" [routerLink]="['/tasks', t.id]">{{ t.title }}</a>
            <div class="badges">
              <span class="pill p-{{t.priority}}">{{ t.priority }}</span>
              <span class="pill s-{{t.status}}">{{ t.status }}</span>
              <span class="pill due" *ngIf="t.dueDate">{{ dueHuman(t.dueDate) }}</span>
            </div>
          </div>

          <div class="desc" *ngIf="t.description">{{ t.description }}</div>

          <div class="grid">
            <div class="due-wrap">
              <mat-form-field appearance="outline" class="due-date">
                <mat-label>Due date</mat-label>
                <input matInput [matDatepicker]="picker" [value]="toDateObj(t.dueDate)" (dateChange)="onDueDateChange(t, $event)">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
              <mat-form-field appearance="outline" class="due-time">
                <mat-label>Time</mat-label>
                <input matInput type="time" [value]="toTime(t.dueDate)" (change)="onDueTimeChange(t, $event)">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [value]="t.status" (valueChange)="update(t, { status: $event })">
                <mat-option value="todo">To Do</mat-option>
                <mat-option value="in-progress">In Progress</mat-option>
                <mat-option value="done">Done</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Categories</mat-label>
              <mat-select [value]="t.categories || (t.category ? [t.category] : [])" multiple (valueChange)="updateCategories(t, $event)">
                <mat-option *ngFor="let c of categories$ | async" [value]="c">{{ c }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tags</mat-label>
              <mat-select [value]="t.tags" multiple (valueChange)="update(t, { tags: $event })">
                <mat-option *ngFor="let tag of tags$ | async" [value]="tag">{{ tag }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="foot">
            <div class="cats">
              <span class="chip" *ngFor="let c of (t.categories || (t.category ? [t.category] : []))">{{ c }}</span>
            </div>
            <div class="actions">
              <button mat-stroked-button color="primary" [routerLink]="['/tasks', t.id]">Edit</button>
            </div>
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="loading$ | async">Loading…</div>
    </div>
  `,
  styles: [`
    .wrap { max-width: 1200px; margin: 16px auto; padding: 0 16px; display: grid; gap: 14px; }
    .filters-header { display: flex; align-items: center; gap: 10px; }
    .filters-toggle { display: inline-flex; align-items: center; gap: 6px; }
    .filters { display: grid; grid-template-columns: 180px 160px 240px 240px minmax(320px,1fr) auto auto; gap: 10px; align-items: end; }
    .filters-collapsible.collapsed { display: none; }
    .range-row { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(2, minmax(320px, 1fr)); gap: 10px; }
    .range { display: grid; grid-template-columns: 1fr 140px; gap: 10px; align-items: center; }
    .time-ff { min-width: 120px; }
    .search-ff { width: 100%; }
    .spacer { flex: 1; }
    .toolbar { display: flex; align-items: center; gap: 8px; }
    .page { min-width: 90px; text-align: center; }
    .cards { display: grid; gap: 12px; }
    .card { background: #fff; border: 1px solid #ececec; border-radius: 14px; padding: 12px; display: grid; gap: 10px; }
    .card.overdue { border-color: #ffcdd2; }
    .card-head { display: flex; gap: 12px; align-items: start; justify-content: space-between; }
    .title { font-weight: 700; text-decoration: none; color: inherit; word-break: break-word; }
    .badges { display: flex; gap: 6px; flex-wrap: wrap; }
    .pill { padding: 2px 8px; border-radius: 999px; font-size: 12px; background: #f2f2f2; text-transform: capitalize; }
    .pill.p-low { background: #e8f5e9; }
    .pill.p-medium { background: #fff8e1; }
    .pill.p-high { background: #ffebee; }
    .pill.s-todo { background: #e3f2fd; }
    .pill.s-in-progress { background: #ede7f6; }
    .pill.s-done { background: #e8eaf6; }
    .pill.due { background: #e0f2f1; font-size: 11px; padding: 1px 6px; }
    .desc { color: #555; font-size: 13px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .grid { display: grid; grid-template-columns: 1fr 220px 260px 260px; gap: 10px; align-items: start; }
    .due-wrap { display: grid; grid-template-columns: 1fr 140px; gap: 10px; }
    .foot { display: flex; justify-content: space-between; align-items: center; }
    .cats { display: flex; gap: 6px; flex-wrap: wrap; }
    .chip { background: #f7f7f7; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
    .actions { display: flex; gap: 8px; }
    .loading { padding: 8px 0; color: #777; }
    @media (min-width: 960px) { .filters-collapsible { display: grid !important; } .filters-toggle { display: none; } }
    @media (max-width: 960px) {
      .filters { grid-template-columns: 1fr 1fr; }
      .range-row { grid-template-columns: 1fr; }
      .grid { grid-template-columns: 1fr; }
      .card-head { flex-direction: column; align-items: stretch; }
      .badges { margin-top: 4px; }
      .foot { flex-direction: column; align-items: stretch; gap: 8px; }
    }
  `]
})
export class TaskListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sub: Subscription | null = null;

  items$ = this.store.select(selectAllTasks);
  loading$ = this.store.select(selectTasksLoading);
  page$ = this.store.select(selectTasksPage);
  pageSize$ = this.store.select(selectTasksPageSize);
  total$ = this.store.select(selectTasksTotal);
  categories$ = this.store.select(selectTaskCategories);
  tags$ = this.store.select(selectTaskTags);

  total = signal(0);
  page = signal(1);
  pageSize = signal(20);
  filtersOpen = false;
  dueDraft: Record<string, { date?: Date | null; time?: string | null }> = {};

  form = this.fb.group({
    status: [''],
    priority: [''],
    categories: [[] as string[]],
    tags: [[] as string[]],
    q: [''],
    dueFromDate: [null as Date | null],
    dueFromTime: [''],
    dueToDate: [null as Date | null],
    dueToTime: ['']
  });

  ngOnInit() {
    this.store.dispatch(TasksActions.loadCategories());
    this.store.dispatch(TasksActions.loadTags());
    this.sub = this.route.queryParams.subscribe(p => {
      const catsCsv = p['category'] || '';
      const catsArr = catsCsv ? String(catsCsv).split(',').map((x: string) => x.trim()).filter(Boolean) : [];
      const tagsCsv = p['tags'] || '';
      const tagsArr = tagsCsv ? String(tagsCsv).split(',').map((x: string) => x.trim()).filter(Boolean) : [];
      const dueFromIso = p['dueFrom'] || '';
      const dueToIso = p['dueTo'] || '';
      const fromD = dueFromIso ? new Date(String(dueFromIso)) : null;
      const toD = dueToIso ? new Date(String(dueToIso)) : null;
      this.form.patchValue({
        status: p['status'] || '',
        priority: p['priority'] || '',
        categories: catsArr,
        tags: tagsArr,
        q: p['q'] || '',
        dueFromDate: fromD,
        dueFromTime: fromD ? this.toTime(dueFromIso) : '',
        dueToDate: toD,
        dueToTime: toD ? this.toTime(dueToIso) : ''
      }, { emitEvent: false });
      const queryForApi: any = {
        status: p['status'] || '',
        priority: p['priority'] || '',
        category: catsArr.join(','),
        tags: tagsArr.join(','),
        q: p['q'] || '',
        dueFrom: dueFromIso || '',
        dueTo: dueToIso || '',
        excludeDone: p['excludeDone'] || '',
        page: Number(p['page'] || 1),
        pageSize: Number(p['pageSize'] || 20)
      };
      Object.keys(queryForApi).forEach(k => (queryForApi[k] === '' || queryForApi[k] == null) && delete queryForApi[k]);
      this.store.dispatch(TasksActions.loadList({ query: queryForApi }));
    });
    this.total$.subscribe(v => this.total.set(v));
    this.page$.subscribe(v => this.page.set(v));
    this.pageSize$.subscribe(v => this.pageSize.set(v));
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }

  apply() {
    const v = this.form.value;
    const query: any = {
      status: v.status || '',
      priority: v.priority || '',
      category: (v.categories || []).join(','),
      tags: (v.tags || []).join(','),
      q: v.q || '',
      dueFrom: this.combine(v.dueFromDate || null, v.dueFromTime || ''),
      dueTo: this.combine(v.dueToDate || null, v.dueToTime || ''),
      page: 1,
      pageSize: this.pageSize()
    };
    Object.keys(query).forEach(k => (query[k] === '' || query[k] == null) && delete query[k]);
    this.router.navigate([], { relativeTo: this.route, queryParams: query });
  }

  reset() {
    this.form.reset({ status: '', priority: '', categories: [], tags: [], q: '', dueFromDate: null, dueFromTime: '', dueToDate: null, dueToTime: '' });
    this.router.navigate([], { relativeTo: this.route, queryParams: { page: 1, pageSize: this.pageSize() } });
  }

  prev() {
    const p = Math.max(1, this.page() - 1);
    this.router.navigate([], { relativeTo: this.route, queryParams: { ...this.route.snapshot.queryParams, page: p } });
  }

  next() {
    const p = Math.min(this.totalPagesCalc(), this.page() + 1);
    this.router.navigate([], { relativeTo: this.route, queryParams: { ...this.route.snapshot.queryParams, page: p } });
  }

  disableNext() {
    return this.page() >= this.totalPagesCalc();
  }

  totalPagesCalc() {
    const ps = this.pageSize();
    const t = this.total();
    return Math.max(1, Math.ceil(t / ps));
  }

  toDateObj(iso: string | null) {
    return iso ? new Date(iso) : null;
  }

  toTime(iso: string | null) {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  combine(date: Date | null, time: string | null) {
    if (!date && !time) return '';
    const base = date ? new Date(date) : new Date();
    const [hh, mm] = (time || '00:00').split(':').map(x => parseInt(x, 10));
    base.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
    return base.toISOString();
  }

  onDueDateChange(t: any, e: any) {
    const date = e.value as Date | null;
    this.setDueDraft(t.id, { date });
    const iso = this.combineDraft(t.id, t.dueDate);
    this.update(t, { dueDate: iso });
  }

  onDueTimeChange(t: any, evt: Event) {
    const input = evt.target as HTMLInputElement | null;
    const time = input?.value || null;
    this.setDueDraft(t.id, { time });
    const iso = this.combineDraft(t.id, t.dueDate);
    this.update(t, { dueDate: iso });
  }

  setDueDraft(id: string, part: { date?: Date | null; time?: string | null }) {
    const cur = this.dueDraft[id] || {};
    this.dueDraft[id] = { ...cur, ...part };
  }

  combineDraft(id: string, fallbackIso: string | null) {
    const draft = this.dueDraft[id] || {};
    const base = draft.date ?? (fallbackIso ? new Date(fallbackIso) : new Date());
    const timeStr = draft.time ?? this.toTime(fallbackIso);
    const [hh, mm] = (timeStr || '00:00').split(':').map(x => parseInt(x, 10));
    const d = new Date(base);
    d.setHours(Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
    return d.toISOString();
  }

  updateCategories(t: any, arr: string[]) {
    this.update(t, { categories: arr, category: arr[0] || null });
  }

  update(t: any, changes: any) {
    this.store.dispatch(TasksActions.update({ id: t.id, changes }));
  }

  track(_: number, t: any) {
    return t.id;
  }

  create() {
    this.router.navigateByUrl('/tasks/new');
  }

  isOverdue(t: any) {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate).getTime();
    const start = new Date().setHours(0,0,0,0);
    return d < start && t.status !== 'done';
  }

  dueHuman(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((d.getTime() - now.getTime()) / 86400000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    if (diff === 0) return `Today ${hh}:${mm}`;
    if (diff === 1) return `Tomorrow ${hh}:${mm}`;
    if (diff === -1) return `Yesterday ${hh}:${mm}`;
    return `${d.toLocaleDateString()} ${hh}:${mm}`;
  }
}
