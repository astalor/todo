import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors, HttpClient, HttpClientModule } from '@angular/common/http';
import { authInterceptor } from './app/core/auth.interceptor';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';
import { authReducer } from './app/store/auth/auth.reducer';
import { tasksReducer } from './app/store/tasks/tasks.reducer';
import { AuthEffects } from './app/store/auth/auth.effects';
import { TasksEffects } from './app/store/tasks/tasks.effects';

export function httpTranslateLoader(http: HttpClient): TranslateLoader {
  return { getTranslation: (lang: string): Observable<any> => http.get(`/i18n/${lang}.json`) } as TranslateLoader;
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      HttpClientModule,
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useFactory: httpTranslateLoader, deps: [HttpClient] }
      })
    ),
    provideStore(),
    provideState('auth', authReducer),
    provideState('tasks', tasksReducer),
    provideEffects([AuthEffects, TasksEffects]),
    provideRouterStore(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ]
});
