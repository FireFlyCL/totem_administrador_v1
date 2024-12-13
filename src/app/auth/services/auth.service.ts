import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router'; // Para redirigir en caso de logout
import { environment } from '../../../environments/environment'; // Asegúrate de tener configurado tu environment

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string = environment.apiUrl; // URL base de la API
  private apiKey: string = environment.apiKey; // API key para el servicio

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  /**
   * Iniciar sesión (Login)
   * @param username - Nombre de usuario
   * @param password - Contraseña
   */
  login(username: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'x-api-key': this.apiKey
    });

    const body = { username, password };

    return this.http.post<any>(`${this.apiUrl}administrator/auth/login`, body, { headers }).pipe(
      tap((response: any) => {
        if (response.success) {
          this.saveTokens(response.accessToken, response.accountToken, response.userDetails);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Guardar los tokens en localStorage
   * @param accessToken - Token de acceso
   * @param accountToken - Token de cuenta
   * @param userDetails - Detalles del usuario
   */
  private saveTokens(accessToken: string, accountToken: string, userDetails: any): void {
    // Verificar que estamos en el navegador antes de usar localStorage
    if (isPlatformBrowser(this.platformId) && typeof localStorage !== 'undefined') {
      // Guardar los tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('accountToken', accountToken);
  
      // Guardar los detalles del usuario, incluyendo permisos con detalles
      localStorage.setItem('userDetails', JSON.stringify({
        id_user: userDetails.id_user,
        username: userDetails.username,
        is_blocked: userDetails.is_blocked,
        failed_attempts: userDetails.failed_attempts,
        permissionsDetails: userDetails.permissionsDetails // Guardar los permisos y sus detalles
      }));
  
      // Guardar el estado de la sesión como "logeado"
      localStorage.setItem('isLoggedIn', 'true');
  
      // Guardar la marca de tiempo de la última solicitud de acceso
      localStorage.setItem('lastAccessTime', new Date().getTime().toString());
    }
  }
  

  /**
   * Enviar solicitud para recuperar contraseña
   * @param username - Nombre de usuario
   */
  forgotPassword(username: string): Observable<any> {
    const headers = new HttpHeaders({
      'x-api-key': this.apiKey
    });

    const body = { username };

    return this.http.post<any>(`${this.apiUrl}administrator/auth/forgot-password`, body, { headers }).pipe(
      tap((response: any) => {
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error.error);
      })
    );
  }

  /**
   * Resetear contraseña usando el token
   * @param token - Token de recuperación de contraseña
   * @param newPassword - Nueva contraseña
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'x-api-key': this.apiKey
    });

    const body = { token, newPassword };

    return this.http.post<any>(`${this.apiUrl}administrator/auth/forgot-password/reset-password`, body, { headers }).pipe(
      tap((response: any) => {
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error('Error al restablecer la contraseña.'));
      })
    );
  }

  /**
   * Manejo de errores en las solicitudes HTTP
   * @param error - Error de la solicitud HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<any> {
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
