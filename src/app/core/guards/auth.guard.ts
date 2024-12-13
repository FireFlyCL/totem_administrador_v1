import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Inyecta el servicio de autenticación
  const router = inject(Router); // Inyecta el router

  if (authService.isLoggedIn()) {
    // El usuario está autenticado, puede acceder
    return true;
  } else {
    // El usuario no está autenticado, redirigir al login
    router.navigate(['/login']);
    return false;
  }
};
