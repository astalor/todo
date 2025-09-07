import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const router = inject(Router);
  const token = localStorage.getItem('tm_token');
  return token ? true : router.parseUrl('/login?redirect=' + encodeURIComponent(state.url));
};
