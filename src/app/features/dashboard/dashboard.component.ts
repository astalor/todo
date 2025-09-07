// src/app/features/dashboard/dashboard.component.ts
import { Component, inject, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TasksActions } from '../../store/tasks/tasks.actions';
import { selectStats, selectTasksLoading } from '../../store/tasks/tasks.selectors';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { animate, AnimationBuilder, style } from '@angular/animations';
import { combineLatest, filter } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatChipsModule, MatIconModule, MatDividerModule, MatButtonModule, MatTooltipModule, TranslateModule],
  template: `
    <div class="wrap">
      <div class="header">
        <h1>{{ 'dashboard.h1' | translate }}</h1>
        <button mat-stroked-button color="primary" (click)="reload()">
          <mat-icon>refresh</mat-icon>
          {{ 'dashboard.refresh' | translate }}
        </button>
      </div>

      <div class="overlay" *ngIf="loading$ | async">
        <div class="spinner"></div>
      </div>

      <mat-card *ngIf="stats$ | async as s" class="card kpi-card">
        <div class="kpi-grid">
          <button class="kpi btn" #kpi (click)="goToTasks({})">
            <div class="kpi-title">{{ 'dashboard.total' | translate }}</div>
            <div class="kpi-value">{{ s.total }}</div>
          </button>
          <button class="kpi btn" #kpi (click)="goToTasks({ status: 'todo' })">
            <div class="kpi-title">{{ 'status.todo' | translate }}</div>
            <div class="kpi-value">{{ s.byStatus?.['todo'] || 0 }}</div>
          </button>
          <button class="kpi btn" #kpi (click)="goToTasks({ status: 'in-progress' })">
            <div class="kpi-title">{{ 'status.inProgress' | translate }}</div>
            <div class="kpi-value">{{ s.byStatus?.['in-progress'] || 0 }}</div>
          </button>
          <button class="kpi btn" #kpi (click)="goToTasks({ status: 'done' })">
            <div class="kpi-title">{{ 'status.done' | translate }}</div>
            <div class="kpi-value">{{ s.byStatus?.['done'] || 0 }}</div>
          </button>
          <button class="kpi btn alert" #kpi (click)="goToOverdue()">
            <div class="kpi-title">{{ 'dashboard.overdue' | translate }}</div>
            <div class="kpi-value">{{ s.overdue }}</div>
          </button>
          <button class="kpi btn" #kpi (click)="goToToday()">
            <div class="kpi-title">{{ 'dashboard.dueToday' | translate }}</div>
            <div class="kpi-value">{{ s.dueToday }}</div>
          </button>
          <button class="kpi btn" #kpi (click)="goToNext7()">
            <div class="kpi-title">{{ 'dashboard.next7' | translate }}</div>
            <div class="kpi-value">{{ s.upcoming7Days }}</div>
          </button>
          <div class="kpi progress" #kpi>
            <div class="ring" [style.background]="ringBg(s.completionRate)">
              <div class="ring-center">
                <div class="kpi-value">{{ s.completionRate }}%</div>
                <div class="kpi-title">{{ 'dashboard.completion' | translate }}</div>
              </div>
            </div>
          </div>
        </div>
      </mat-card>

      <div class="grid" *ngIf="stats$ | async as s">
        <mat-card class="card" #card>
          <div class="card-title">{{ 'dashboard.status' | translate }}</div>
          <div class="bar clickable" *ngFor="let k of statusKeys" #bar (click)="goToTasks({ status: k })">
            <div class="bar-label">
              {{ ('status.' + (k === 'in-progress' ? 'inProgress' : k)) | translate }}
            </div>
            <mat-progress-bar mode="determinate" [value]="percent(s.byStatus?.[k] || 0, s.total)"></mat-progress-bar>
            <div class="bar-value">{{ s.byStatus?.[k] || 0 }}</div>
          </div>
        </mat-card>

        <mat-card class="card" #card>
          <div class="card-title">{{ 'dashboard.priority' | translate }}</div>
          <div class="bar clickable" *ngFor="let k of priorityKeys" #bar (click)="goToTasks({ priority: k })">
            <div class="bar-label">{{ ('priority.' + k) | translate }}</div>
            <mat-progress-bar mode="determinate" [value]="percent(s.byPriority?.[k] || 0, s.total)"></mat-progress-bar>
            <div class="bar-value">{{ s.byPriority?.[k] || 0 }}</div>
          </div>
        </mat-card>

        <mat-card class="card" #card>
          <div class="card-title">{{ 'dashboard.categories' | translate }}</div>
          <div class="chip-wrap" *ngIf="categoryList(s) as cats; else noCat">
            <mat-chip-set>
              <mat-chip *ngFor="let c of cats | slice:0:12" #chip [matTooltip]="s.byCategory[c] + ' ' + ('dashboard.tasks' | translate)" (click)="goToTasks({ category: c })">
                {{ c }} ({{ s.byCategory[c] }})
              </mat-chip>
            </mat-chip-set>
          </div>
          <ng-template #noCat>
            <div class="muted">{{ 'dashboard.noCategories' | translate }}</div>
          </ng-template>
          <mat-divider></mat-divider>
          <div class="card-title small">{{ 'dashboard.topTags' | translate }}</div>
          <div class="chip-wrap" *ngIf="s.topTags?.length; else noTags">
            <mat-chip-set>
              <mat-chip *ngFor="let t of s.topTags; trackBy: tagTrack" #chip2>
                {{ t.tag }} ({{ t.count }})
              </mat-chip>
            </mat-chip-set>
          </div>
          <ng-template #noTags>
            <div class="muted">{{ 'dashboard.noTags' | translate }}</div>
          </ng-template>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .wrap { max-width: 1200px; margin: 16px auto; padding: 0 16px; position: relative; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .card { padding: 12px; }
    .kpi-card { padding: 16px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
    .kpi { background: var(--kpi-bg, #fafafa); border-radius: 12px; padding: 14px; display: grid; gap: 6px; place-content: center; text-align: center; transform: translateY(0); }
    .kpi.alert { background: #fff4f5; }
    .kpi-title { font-size: 12px; color: #666; letter-spacing: .2px; }
    .kpi-value { font-size: 24px; font-weight: 700; }
    .kpi.progress { padding: 0; }
    .kpi.btn { cursor: pointer; border: none; background: transparent; }
    .kpi.btn:hover { box-shadow: 0 0 0 2px rgba(63,81,181,.15) inset; }
    .ring { width: 140px; height: 140px; border-radius: 50%; display: grid; place-items: center; margin: 0 auto; background: conic-gradient(#3f51b5 0deg, #e0e0e0 0deg); transition: background .35s linear; }
    .ring-center { width: 110px; height: 110px; border-radius: 50%; background: #fff; display: grid; place-items: center; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; margin-top: 12px; }
    .card-title { font-weight: 600; margin-bottom: 8px; }
    .card-title.small { font-weight: 600; margin-top: 10px; margin-bottom: 8px; font-size: 13px; color: #555; }
    .bar { display: grid; grid-template-columns: 100px 1fr 52px; align-items: center; gap: 10px; margin: 8px 0; }
    .bar-label { text-transform: capitalize; color: #555; }
    .bar-value { text-align: right; font-variant-numeric: tabular-nums; color: #333; }
    .bar.clickable { cursor: pointer; }
    .bar.clickable:hover { filter: brightness(.98); }
    .chip-wrap { padding: 4px 0; }
    .muted { color: #888; font-size: 13px; padding: 8px 0; }
    .overlay { position: absolute; inset: 0; background: rgba(255,255,255,.6); display: grid; place-items: center; z-index: 5; backdrop-filter: blur(1px); }
    .spinner { width: 36px; height: 36px; border-radius: 50%; border: 3px solid #c5cae9; border-top-color: #3f51b5; animation: spin 900ms linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 520px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .ring { width: 120px; height: 120px; }
      .ring-center { width: 92px; height: 92px; }
    }
  `]
})
export class DashboardComponent {
  private store = inject(Store);
  private router = inject(Router);
  private builder = inject(AnimationBuilder);

  @ViewChildren('kpi', { read: ElementRef }) kpiEls!: QueryList<ElementRef>;
  @ViewChildren('card', { read: ElementRef }) cardEls!: QueryList<ElementRef>;
  @ViewChildren('bar', { read: ElementRef }) barEls!: QueryList<ElementRef>;
  @ViewChildren('chip', { read: ElementRef }) chipEls!: QueryList<ElementRef>;
  @ViewChildren('chip2', { read: ElementRef }) chip2Els!: QueryList<ElementRef>;

  stats$ = this.store.select(selectStats);
  loading$ = this.store.select(selectTasksLoading);

  statusKeys = ['todo', 'in-progress', 'done'];
  priorityKeys = ['low', 'medium', 'high'];

  constructor() {
    this.store.dispatch(TasksActions.loadStats());
    combineLatest([this.stats$, this.loading$])
      .pipe(filter(([s, loading]) => !!s && loading === false))
      .subscribe(() => this.runAnimations());
  }

  reload() {
    this.store.dispatch(TasksActions.loadStats());
  }

  private runAnimations() {
    setTimeout(() => {
      this.playStagger(this.kpiEls, { transform: 'translateY(24px) scale(.96)', opacity: 0 }, { transform: 'translateY(0) scale(1)', opacity: 1 }, 80, 340);
      this.playStagger(this.cardEls, { transform: 'translateX(28px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }, 60, 300);
      this.playStagger(this.barEls, { transform: 'translateX(-24px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }, 20, 220);
      this.playStagger([...this.chipEls.toArray(), ...this.chip2Els.toArray()], { transform: 'scale(.9)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }, 12, 180);
    });
  }

  private playStagger(list: Array<ElementRef> | QueryList<ElementRef>, from: any, to: any, gap: number, dur: number) {
    const arr = Array.isArray(list) ? list as Array<ElementRef> : (list as QueryList<ElementRef>).toArray();
    arr.forEach((el, i) => {
      const player = this.builder.build([
        style(from),
        animate(dur + 'ms cubic-bezier(.2,.8,.2,1)', style(to))
      ]).create(el.nativeElement);
      setTimeout(() => player.play(), i * gap);
    });
  }

  goToTasks(params: any) {
    this.router.navigate(['/tasks'], { queryParams: { ...params, page: 1 } });
  }

  goToOverdue() {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    this.router.navigate(['/tasks'], { queryParams: { dueTo: start, excludeDone: true, page: 1 } });
  }

  goToToday() {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    const end = new Date(new Date(start).getTime() + 86400000 - 1).toISOString();
    this.router.navigate(['/tasks'], { queryParams: { dueFrom: start, dueTo: end, page: 1 } });
  }

  goToNext7() {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    const end = new Date(new Date(start).getTime() + 7 * 86400000 - 1).toISOString();
    this.router.navigate(['/tasks'], { queryParams: { dueFrom: start, dueTo: end, page: 1 } });
  }

  percent(v: number, total: number) {
    if (!total) return 0;
    const p = Math.round((v / total) * 100);
    return Math.max(0, Math.min(100, p));
  }

  ringBg(p: number) {
    const pct = Math.max(0, Math.min(100, Number(p) || 0));
    const deg = Math.round((pct / 100) * 360);
    return `conic-gradient(#43a047 0deg ${deg}deg, #e0e0e0 ${deg}deg 360deg)`;
  }

  categoryList(s: any) {
    return Object.keys(s.byCategory || {}).sort((a, b) => (s.byCategory[b] || 0) - (s.byCategory[a] || 0));
  }

  tagTrack(_: number, t: any) {
    return t.tag;
  }
}
