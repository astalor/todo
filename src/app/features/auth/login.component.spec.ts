// src/app/features/auth/login.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [provideMockStore()]
    });
    store = TestBed.inject(MockStore);
  });

  it('dispatches login on submit', () => {
    const spy = spyOn(store, 'dispatch');
    const f = TestBed.createComponent(LoginComponent);
    f.componentInstance.form.setValue({ email: 'a@a.com', password: 'secret' });
    f.detectChanges();
    const form: HTMLFormElement = f.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    f.detectChanges();
    expect(spy).toHaveBeenCalled();
  });
});
