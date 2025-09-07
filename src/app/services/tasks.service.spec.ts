// src/app/services/tasks.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TasksService, Task } from './tasks.service';
import { authInterceptor } from '../core/auth.interceptor';
import { TaskQuery } from '../store/tasks/tasks.actions';

describe('TasksService', () => {
  let api: TasksService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    api = TestBed.inject(TasksService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list sends query params', () => {
    const q: TaskQuery = { page: 2, pageSize: 10, status: 'todo', tags: 'x,y', sortBy: 'dueDate', sortDir: 'asc', q: 'foo' };
    let res: any;
    api.list(q).subscribe(r => (res = r));
    const req = http.expectOne(r => r.method === 'GET' && r.url === '/api/tasks');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('status')).toBe('todo');
    expect(req.request.params.get('tags')).toBe('x,y');
    expect(req.request.params.get('sortBy')).toBe('dueDate');
    expect(req.request.params.get('sortDir')).toBe('asc');
    expect(req.request.params.get('q')).toBe('foo');
    req.flush({ data: [], page: 2, pageSize: 10, total: 0, totalPages: 0 });
    expect(res.page).toBe(2);
  });

  it('create sends body', () => {
    const t: Partial<Task> = { title: 'A' };
    let res: Task | undefined;
    api.create(t).subscribe(r => (res = r));
    const req = http.expectOne('/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('A');
    req.flush({ id: '1', title: 'A' });
    expect(res?.id).toBe('1');
  });

  it('update sends patch', () => {
    let res: Task | undefined;
    api.update('1', { title: 'B' }).subscribe(r => (res = r));
    const req = http.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.title).toBe('B');
    req.flush({ id: '1', title: 'B' });
    expect(res?.title).toBe('B');
  });

  it('delete calls endpoint', () => {
    let done = false;
    api.delete('1').subscribe(() => (done = true));
    const req = http.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    expect(done).toBeTrue();
  });

  it('categories returns list', () => {
    let res: any;
    api.categories().subscribe(r => (res = r));
    const req = http.expectOne('/api/tasks/categories');
    expect(req.request.method).toBe('GET');
    req.flush({ categories: ['a', 'b'] });
    expect(res.categories.length).toBe(2);
  });

  it('tags returns list', () => {
    let res: any;
    api.tags().subscribe(r => (res = r));
    const req = http.expectOne('/api/tasks/tags');
    expect(req.request.method).toBe('GET');
    req.flush({ tags: ['x', 'y'] });
    expect(res.tags.length).toBe(2);
  });

  it('stats returns object', () => {
    let res: any;
    api.stats().subscribe(r => (res = r));
    const req = http.expectOne('/api/tasks/stats');
    expect(req.request.method).toBe('GET');
    req.flush({ total: 1, byStatus: {} });
    expect(res.total).toBe(1);
  });
});
