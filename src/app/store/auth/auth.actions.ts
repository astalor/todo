// src/app/store/auth/auth.actions.ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export interface User { id: string; email: string; name: string; }

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ email: string; password: string }>(),
    'Login Success': props<{ token: string; user: User }>(),
    'Login Failure': props<{ error: string }>(),
    'Register': props<{ name: string; email: string; password: string }>(),
    'Register Success': props<{ token: string; user: User }>(),
    'Register Failure': props<{ error: string }>(),
    'Load Me': emptyProps(),
    'Load Me Success': props<{ user: User }>(),
    'Load Me Failure': props<{ error: string }>(),
    'Logout': emptyProps(),
    'Clear Error': emptyProps()
  }
});
