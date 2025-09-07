// src/app/features/dashboard/dashboard.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DashboardComponent', () => {
  it('dispatches loadStats on init', () => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [provideMockStore()]
    });
    const store = TestBed.inject(MockStore);
    const spy = spyOn(store, 'dispatch');
    const f = TestBed.createComponent(DashboardComponent);
    f.detectChanges();
    expect(spy).toHaveBeenCalled();
  });
});
