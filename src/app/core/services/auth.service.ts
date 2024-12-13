import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { RenewService } from './renew.service'
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenValidityDuration = 1 * 60 * 1000; // 29 minutos en milisegundos
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;

  constructor(private http: HttpClient, private router: Router,private renewService:RenewService, @Inject(PLATFORM_ID) private platformId: Object) {}

   /**
   * Verificar si el usuario está autenticado
   * Si ha pasado más de 25 minutos, intentará renovar el token.
   * Si la renovación falla, desloguea al usuario.
   * @returns boolean
   */
   isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
        
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      
      // Verificar si la variable de isLoggedIn está presente
      if (!isLoggedIn) {

        return false; // No está logueado
      }

      const lastAccessTime = localStorage.getItem('lastAccessTime');
      
      // Si no existe lastAccessTime, no se puede verificar el tiempo, por lo que no está logueado
      if (!lastAccessTime) {
        return false;
      }
 
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - parseInt(lastAccessTime, 10);

      // Si han pasado más de 25 minutos, intentar renovar el token
      if (elapsedTime > this.tokenValidityDuration) {
        const renewSuccess = this.renewService.renewAccessToken(); // Llama a la función de renovación del token
        
        if (renewSuccess) {
          return true; // Si se renueva correctamente, sigue logueado
        } else {
          return false;
        }
      }
      // Si no han pasado 25 minutos, el usuario sigue logueado
      return true;
    }
    return false;
  }

  /**
   * Cerrar sesión (Logout)
   * Llama al backend si existen las credenciales, de lo contrario borra el localStorage.
   * Si falla por problemas de token, intenta renovar el token y reintenta el logout.
   * @returns Observable<any>
   */
  logout(): Observable<any> {
    // Recuperar los tokens y detalles del usuario desde localStorage
    const accessToken = localStorage.getItem('accessToken');
    const accountToken = localStorage.getItem('accountToken');
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    const userId = userDetails.id_user;

    // Si no se encuentran las credenciales, limpiar el storage y salir
    if (!accessToken || !accountToken || !userId) {
      this.clearSession();
      return of(null); // No hace solicitud si faltan credenciales, solo borra la sesión
    }

    // Crear headers con el Access Token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
    });

    // Cuerpo de la solicitud con el Account Token y el User ID
    const body = {
      user_id: userId,
      accountToken: accountToken,
    };

    // Realizar la solicitud de logout al servidor
    return this.http.post<any>(`${this.apiUrl}administrator/auth/logout`, body, { headers }).pipe(
      tap(() => {
        // Si el logout es exitoso, limpiar la sesión
        this.clearSession();
      }),
      // Manejar errores si la solicitud falla
      catchError((error: HttpErrorResponse) => {
        if ((error.status === 401 || error.status === 403) && error.error.token) {
          // Si es un error de token, intentar renovar el Access Token
          return this.renewService.renewAccessToken().pipe(
            switchMap((renewSuccess) => {
              if (renewSuccess) {
                // Si la renovación fue exitosa, volver a intentar el logout
                return this.logout();
              } else {
                // Si la renovación falla, limpiar la sesión y redirigir al login
                this.clearSession();
                this.router.navigate(['/login']);
                return of(null);
              }
            }),
            catchError(() => {
              // Si la renovación también falla, limpiar la sesión y redirigir al login
              this.clearSession();
              this.router.navigate(['/login']);
              return of(null);
            })
          );
        } else {
          // Si es otro tipo de error, limpiar la sesión y redirigir al login
          this.clearSession();
          this.router.navigate(['/login']);
          return throwError(() => new Error('Error al cerrar sesión.'));
        }
      })
    );
  }

  /**
   * Limpiar los tokens y cerrar sesión
   */
  private clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('accountToken');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('lastAccessTime');
  }

}
