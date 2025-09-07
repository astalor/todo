import { createActionGroup, props, emptyProps } from '@ngrx/store';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ email: string; password: string }>(),
    'Login Success': props<{ user: any; token: string }>(),
    'Login Failure': props<{ error: string }>(),
    'Register': props<{ name: string; email: string; password: string }>(),
    'Register Success': props<{ user: any; token: string }>(),
    'Register Failure': props<{ error: string }>(),
    'Load Me': emptyProps(),
    'Load Me Success': props<{ user: any }>(),
    'Load Me Failure': props<{ error: string }>(),
    'Logout': emptyProps(),
    'Clear Error': emptyProps()
  }
});
