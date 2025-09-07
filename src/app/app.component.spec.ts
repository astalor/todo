// src/app/app.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideMockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AppComponent', () => {
  it('creates', () => {
    TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [provideMockStore()]
    });
    const f = TestBed.createComponent(AppComponent);
    expect(f.componentInstance).toBeTruthy();
  });
});
