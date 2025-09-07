// src/app/features/tasks/task-list.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { initialState as tasksInitial, TasksState } from '../../store/tasks/tasks.reducer';

describe('TaskListComponent', () => {
  let store: MockStore<{ tasks: TasksState }>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TaskListComponent, RouterTestingModule, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [provideMockStore({ initialState: { tasks: tasksInitial } })]
    });
    store = TestBed.inject(MockStore);
  });

  it('dispatches loadList with defaults', () => {
    const spy = spyOn(store, 'dispatch');
    const f = TestBed.createComponent(TaskListComponent);
    f.detectChanges();
    expect(spy.calls.all().some(c => String(c.args[0].type).includes('Load List'))).toBeTrue();
  });

  it('applies filters and reloads', () => {
    const spy = spyOn(store, 'dispatch');
    const f = TestBed.createComponent(TaskListComponent);
    f.detectChanges();
    f.componentInstance.apply();
    expect(spy.calls.all().some(c => String(c.args[0].type).includes('Load List'))).toBeTrue();
  });
});
