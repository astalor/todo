// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authReducer } from './app/store/auth/auth.reducer';
import { tasksReducer } from './app/store/tasks/tasks.reducer';
import { AuthEffects } from './app/store/auth/auth.effects';
import { TasksEffects } from './app/store/tasks/tasks.effects';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { authInterceptor } from './app/core/auth.interceptor';
import { Observable, firstValueFrom } from 'rxjs';

class SimpleHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}
  getTranslation(lang: string): Observable<any> {
    return this.http.get(`/i18n/${lang}.json`);
  }
}
function httpLoaderFactory(http: HttpClient): TranslateLoader {
  return new SimpleHttpLoader(http);
}

function initTranslate(translate: TranslateService) {
  return () => {
    const saved = localStorage.getItem('lang') || 'en';
    translate.addLangs(['en', 'bg']);
    translate.setDefaultLang('en');
    return firstValueFrom(translate.use(saved));
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideStore({ auth: authReducer, tasks: tasksReducer }),
    provideEffects([AuthEffects, TasksEffects]),
    provideAnimations(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useFactory: httpLoaderFactory, deps: [HttpClient] }
      })
    ),
    { provide: APP_INITIALIZER, useFactory: initTranslate, deps: [TranslateService], multi: true }
  ]
}).catch(err => console.error(err));
