// src/app/features/auth/register.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('RegisterComponent', () => {
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegisterComponent, RouterTestingModule, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [provideMockStore()]
    });
    store = TestBed.inject(MockStore);
    spyOn(store, 'select').and.returnValue(of(false));
  });

  it('dispatches register on submit', () => {
    const spy = spyOn(store, 'dispatch');
    const f = TestBed.createComponent(RegisterComponent);
    f.componentInstance.form.setValue({ name: 'Nikolay', email: 'a@a.com', password: 'secret123', confirmPassword: 'secret123' });
    f.componentInstance.form.updateValueAndValidity();
    const cmp: any = f.componentInstance;
    (cmp.onSubmit ? cmp.onSubmit.bind(cmp) : cmp.submit.bind(cmp))();
    expect(spy).toHaveBeenCalled();
  });
});
