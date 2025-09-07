import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { TasksActions } from '../../store/tasks/tasks.actions';
import { selectStats, selectTasksLoading } from '../../store/tasks/tasks.selectors';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, MatCardModule, MatProgressBarModule],
  template: `
    <div class="wrap">
      <mat-card *ngIf="stats$ | async as s">
        <h2>Overview</h2>
        <div class="grid">
          <div class="kpi"><div class="v">{{ s.total }}</div><div class="k">Total Tasks</div></div>
          <div class="kpi"><div class="v">{{ s.byStatus?.['todo'] || 0 }}</div><div class="k">To Do</div></div>
          <div class="kpi"><div class="v">{{ s.byStatus?.['in-progress'] || 0 }}</div><div class="k">In Progress</div></div>
          <div class="kpi"><div class="v">{{ s.byStatus?.['done'] || 0 }}</div><div class="k">Done</div></div>
          <div class="kpi"><div class="v">{{ s.overdue }}</div><div class="k">Overdue</div></div>
          <div class="kpi"><div class="v">{{ s.dueToday }}</div><div class="k">Due Today</div></div>
          <div class="kpi"><div class="v">{{ s.upcoming7Days }}</div><div class="k">Next 7 Days</div></div>
          <div class="kpi"><div class="v">{{ s.completionRate }}%</div><div class="k">Completion</div></div>
        </div>
      </mat-card>
      <mat-progress-bar mode="indeterminate" *ngIf="loading$ | async"></mat-progress-bar>
    </div>
  `,
  styles: [`
    .wrap { max-width: 1024px; margin: 16px auto; padding: 0 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
    .kpi { background: #fafafa; border-radius: 8px; padding: 12px; text-align: center; }
    .v { font-size: 24px; font-weight: 700; }
    .k { color: #666; }
  `]
})
export class DashboardComponent {
  private store = inject(Store);
  stats$ = this.store.select(selectStats);
  loading$ = this.store.select(selectTasksLoading);
  constructor() {
    this.store.dispatch(TasksActions.loadStats());
  }
}
