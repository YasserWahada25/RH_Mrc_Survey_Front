import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);

  if (!token) {
    // Pas de token → redirection vers login
    return router.parseUrl('/authentication/side-login');
  }

  return true;
};
