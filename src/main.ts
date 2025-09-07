import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';
import { reducers } from './app/store';
import { AuthEffects } from './app/store/auth/auth.effects';
import { TasksEffects } from './app/store/tasks/tasks.effects';
import { authInterceptor } from './app/core/auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideRouter(routes),
    provideStore(reducers),
    provideEffects([AuthEffects, TasksEffects]),
    provideStoreDevtools({ maxAge: 25 }),
    provideRouterStore(), provideAnimationsAsync()
  ]
});
