import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const router = inject(Router);
  
  const isAuthenticated = sessionStorage.getItem('general_auth');
  
  if (isAuthenticated === 'true') {
    return true;
  }
  
  // No está autenticado, redirigir al login
  return router.parseUrl('/login');
};
