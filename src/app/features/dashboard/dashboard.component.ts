import { Component, inject } from '@angular/core';
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

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatChipsModule, MatIconModule, MatDividerModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="wrap">
      <div class="header">
        <h1>Dashboard</h1>
        <button mat-stroked-button color="primary" (click)="reload()" [disabled]="loading$ | async">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>

      <mat-progress-bar mode="indeterminate" *ngIf="loading$ | async"></mat-progress-bar>

      <mat-card *ngIf="stats$ | async as s" class="card kpi-card">
        <div class="kpi-grid">
          <div class="kpi">
            <div class="kpi-title">Total</div>
            <div class="kpi-value">{{ s.total }}</div>
          </div>
          <div class="kpi">
            <div class="kpi-title">To Do</div>
            <div class="kpi-value">{{ s.byStatus?.['todo'] || 0 }}</div>
          </div>
          <div class="kpi">
            <div class="kpi-title">In Progress</div>
            <div class="kpi-value">{{ s.byStatus?.['in-progress'] || 0 }}</div>
          </div>
          <div class="kpi">
            <div class="kpi-title">Done</div>
            <div class="kpi-value">{{ s.byStatus?.['done'] || 0 }}</div>
          </div>
          <div class="kpi alert">
            <div class="kpi-title">Overdue</div>
            <div class="kpi-value">{{ s.overdue }}</div>
          </div>
          <div class="kpi">
            <div class="kpi-title">Due Today</div>
            <div class="kpi-value">{{ s.dueToday }}</div>
          </div>
          <div class="kpi">
            <div class="kpi-title">Next 7 Days</div>
            <div class="kpi-value">{{ s.upcoming7Days }}</div>
          </div>
          <div class="kpi progress" [matTooltip]="s.completionRate + '%'">
            <div class="ring" [style.background]="ringBg(s.completionRate)">
              <div class="ring-center">
                <div class="kpi-value">{{ s.completionRate }}%</div>
                <div class="kpi-title">Completion</div>
              </div>
            </div>
          </div>
        </div>
      </mat-card>

      <div class="grid" *ngIf="stats$ | async as s">
        <mat-card class="card">
          <div class="card-title">Status</div>
          <div class="bar" *ngFor="let k of statusKeys">
            <div class="bar-label">{{ k }}</div>
            <mat-progress-bar mode="determinate" [value]="percent(s.byStatus?.[k] || 0, s.total)"></mat-progress-bar>
            <div class="bar-value">{{ s.byStatus?.[k] || 0 }}</div>
          </div>
        </mat-card>

        <mat-card class="card">
          <div class="card-title">Priority</div>
          <div class="bar" *ngFor="let k of priorityKeys">
            <div class="bar-label">{{ k }}</div>
            <mat-progress-bar mode="determinate" [value]="percent(s.byPriority?.[k] || 0, s.total)"></mat-progress-bar>
            <div class="bar-value">{{ s.byPriority?.[k] || 0 }}</div>
          </div>
        </mat-card>

        <mat-card class="card">
          <div class="card-title">Categories</div>
          <div class="chip-wrap" *ngIf="categoryList(s) as cats; else noCat">
            <mat-chip-set>
              <mat-chip *ngFor="let c of cats | slice:0:12" matTooltip="{{ s.byCategory[c] }} tasks">
                {{ c }} ({{ s.byCategory[c] }})
              </mat-chip>
            </mat-chip-set>
          </div>
          <ng-template #noCat>
            <div class="muted">No categories yet</div>
          </ng-template>
          <mat-divider></mat-divider>
          <div class="card-title small">Top Tags</div>
          <div class="chip-wrap" *ngIf="s.topTags?.length; else noTags">
            <mat-chip-set>
              <mat-chip *ngFor="let t of s.topTags; trackBy: tagTrack">
                {{ t.tag }} ({{ t.count }})
              </mat-chip>
            </mat-chip-set>
          </div>
          <ng-template #noTags>
            <div class="muted">No tags yet</div>
          </ng-template>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .wrap { max-width: 1200px; margin: 16px auto; padding: 0 16px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .card { padding: 12px; }
    .kpi-card { padding: 16px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
    .kpi { background: var(--kpi-bg, #fafafa); border-radius: 12px; padding: 14px; display: grid; gap: 6px; place-content: center; text-align: center; }
    .kpi.alert { background: #fff4f5; }
    .kpi-title { font-size: 12px; color: #666; letter-spacing: .2px; }
    .kpi-value { font-size: 24px; font-weight: 700; }
    .kpi.progress { padding: 0; }
    .ring { width: 140px; height: 140px; border-radius: 50%; display: grid; place-items: center; margin: 0 auto; background: conic-gradient(#3f51b5 0deg, #e0e0e0 0deg); }
    .ring-center { width: 110px; height: 110px; border-radius: 50%; background: #fff; display: grid; place-items: center; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; margin-top: 12px; }
    .card-title { font-weight: 600; margin-bottom: 8px; }
    .card-title.small { font-weight: 600; margin-top: 10px; margin-bottom: 8px; font-size: 13px; color: #555; }
    .bar { display: grid; grid-template-columns: 100px 1fr 52px; align-items: center; gap: 10px; margin: 8px 0; }
    .bar-label { text-transform: capitalize; color: #555; }
    .bar-value { text-align: right; font-variant-numeric: tabular-nums; color: #333; }
    .chip-wrap { padding: 4px 0; }
    .muted { color: #888; font-size: 13px; padding: 8px 0; }
    @media (max-width: 520px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .ring { width: 120px; height: 120px; }
      .ring-center { width: 92px; height: 92px; }
    }
  `]
})
export class DashboardComponent {
  private store = inject(Store);
  stats$ = this.store.select(selectStats);
  loading$ = this.store.select(selectTasksLoading);
  statusKeys = ['todo', 'in-progress', 'done'];
  priorityKeys = ['low', 'medium', 'high'];

  constructor() {
    this.store.dispatch(TasksActions.loadStats());
  }

  reload() {
    this.store.dispatch(TasksActions.loadStats());
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
