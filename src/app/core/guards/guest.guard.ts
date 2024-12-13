import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Inyecta el servicio de autenticación
  const router = inject(Router); // Inyecta el router

  if (!authService.isLoggedIn()) {
    // El usuario no está autenticado, puede acceder a la ruta
    return true;
  } else {
    // El usuario está autenticado, redirigir a la página principal u otra
    router.navigate(['/home']);
    return false;
  }
};
