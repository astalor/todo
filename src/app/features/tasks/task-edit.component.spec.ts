// src/app/features/tasks/task-edit.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { TaskEditComponent } from './task-edit.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TasksService } from '../../services/tasks.service';
import { selectTasksLoading, selectTaskCategories, selectTaskTags } from '../../store/tasks/tasks.selectors';

function provideApi(spyValues: Partial<jasmine.SpyObj<TasksService>> = {}) {
  const api = jasmine.createSpyObj<TasksService>('TasksService', ['get','create','update','delete','categories','tags']);
  api.get.and.returnValue(of({ id: '1', title: 'Old', description: 'D', status: 'todo', priority: 'low', categories: ['work'], tags: ['urgent'] } as any));
  api.create.and.returnValue(of({ id: '2', title: 'Valid title 123' } as any));
  api.update.and.returnValue(of({ id: '1', title: 'Valid title 123' } as any));
  api.categories.and.returnValue(of({ categories: ['work','home'] } as any));
  api.tags.and.returnValue(of({ tags: ['urgent','test'] } as any));
  Object.assign(api, spyValues);
  return api;
}

function setup(id: 'new' | '1') {
  TestBed.resetTestingModule();
  const api = provideApi();
  TestBed.configureTestingModule({
    imports: [TaskEditComponent, RouterTestingModule.withRoutes([]), TranslateModule.forRoot(), NoopAnimationsModule],
    providers: [
      provideMockStore(),
      { provide: ActivatedRoute, useValue: { params: of({ id }), snapshot: { paramMap: new Map([['id', id]]) } } },
      { provide: TasksService, useValue: api }
    ]
  }).compileComponents();
  const store = TestBed.inject(MockStore);
  spyOn(store, 'select').and.callFake((sel: any) => {
    if (sel === selectTasksLoading) return of(false);
    if (sel === selectTaskCategories) return of(['work','home']);
    if (sel === selectTaskTags) return of(['urgent','test']);
    return of(null);
  });
  const fixture = TestBed.createComponent(TaskEditComponent);
  const cmp: any = fixture.componentInstance;
  fixture.detectChanges();
  return { fixture, cmp, store, api };
}

function fillValid(cmp: any) {
  const due = new Date(Date.now() + 3600000).toISOString();
  cmp.form.patchValue({
    title: 'Valid title 123',
    description: 'Some description',
    status: 'todo',
    priority: 'medium',
    categories: ['work'],
    tags: ['urgent'],
    dueDate: due,
    dueTime: '10:30'
  });
}

function submit(fixture: any, cmp: any) {
  fixture.detectChanges();
  const form: HTMLFormElement | null = fixture.nativeElement.querySelector('form');
  if (form) {
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    return;
  }
  const btn: HTMLButtonElement | null = fixture.nativeElement.querySelector('button[type="submit"]');
  if (btn) {
    btn.click();
    fixture.detectChanges();
    return;
  }
  if (typeof cmp.save === 'function') cmp.save();
}

describe('TaskEditComponent', () => {
  it('dispatches create on submit for new task', () => {
    const { fixture, cmp, store, api } = setup('new');
    const dispatchSpy = spyOn(store, 'dispatch');
    fillValid(cmp);
    submit(fixture, cmp);
    expect(api.create).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('dispatches update on submit for existing task', () => {
    const { fixture, cmp, store, api } = setup('1');
    const dispatchSpy = spyOn(store, 'dispatch');
    fillValid(cmp);
    submit(fixture, cmp);
    expect(api.update).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
