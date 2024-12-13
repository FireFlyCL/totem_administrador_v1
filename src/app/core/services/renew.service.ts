import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable, throwError, of,switchMap } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RenewService {
  private apiUrl: string = environment.apiUrl;
  private apiKey: string = environment.apiKey;

 constructor(private http: HttpClient, private router: Router) {}

 /**
   * Renovar el Access Token usando el Account Token almacenado en el localStorage
   * @returns Observable<any> - Respuesta de la solicitud de renovación
   */
 renewAccessToken(): Observable<boolean> {
  // Recuperar el Account Token almacenado localmente
  const accountToken = localStorage.getItem('accountToken');
  // Recuperar los detalles del usuario desde el localStorage
  const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
  const userId = userDetails.id_user;

  // Si no se encuentra el Account Token o los detalles del usuario, la renovación no es posible
  if (!accountToken || !userId) {
    return of(false); // Devuelve false si faltan los tokens o detalles del usuario
  }

  // Crear las cabeceras necesarias, incluyendo el x-api-key
  const headers = new HttpHeaders({
    'x-api-key': this.apiKey,
  });
  // Definir el cuerpo de la solicitud con el Account Token y el ID del usuario
  const body = {
    accountToken: accountToken,
    user_id: userId,
  };

  // Realizar la solicitud HTTP POST al endpoint de renovación de token
  return this.http.post<any>(`${this.apiUrl}administrator/auth/renew-access-token`, body, { headers }).pipe(
    // Procesar la respuesta de la solicitud
    map((response: any) => {
      // Si la respuesta es exitosa, actualizar el Access Token en el localStorage
      if (response.success) {
        localStorage.setItem('accessToken', response.accessToken); // Guardar el nuevo Access Token
        localStorage.setItem('lastAccessTime', new Date().getTime().toString()); // Actualizar la marca de tiempo de la última solicitud
        return true; // Renovación exitosa
      }
      this.clearSession(); // Limpiar todos los datos de la sesión
      return false; // Si la respuesta no es exitosa, devuelve false
    }),
    // Manejar los errores en caso de fallo de la renovación
    catchError((error: HttpErrorResponse) => {
      // Si la renovación del token falla, limpiar la sesión y redirigir al login
      this.clearSession(); // Limpiar todos los datos de la sesión
      this.router.navigate(['/login']); // Redirigir al login
      return of(false); // Devuelve false en caso de error
    })
  );
}

/**
 * Función para tratar errores relacionados con el token.
 * Si es un error de token expirado o inválido, intentará renovar el Access Token.
 * @param error - El error recibido desde la solicitud HTTP
 * @param retryCallback - Función de callback que se ejecutará si la renovación es exitosa
 * @returns Observable<any> - Devuelve el observable resultante de la renovación o el error.
 */
handleTokenError(error: HttpErrorResponse, retryCallback: () => Observable<any>): Observable<any> {
  // Verifica si el error es por token expirado o inválido (401 o 403)
  if (error.status === 401 || error.status === 403) {
    return this.renewAccessToken().pipe(
      switchMap((renewSuccess) => {
        if (renewSuccess) {
          // Si la renovación fue exitosa, intenta la solicitud original nuevamente
          return retryCallback();
        } else {
          // Si falla la renovación, limpia la sesión y devuelve un observable vacío
          this.clearSession();
          return of(null);
        }
      }),
      catchError(() => {
        // Si la renovación del token también falla, limpiar la sesión y redirigir al login
        this.clearSession();
        this.router.navigate(['/login']);
        return of(null);
      })
    );
  }

  // Si no es un error de token, devolver el error original
  return throwError(() => new Error('Error no relacionado con token.'));
}

private clearSession(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('accountToken');
  localStorage.removeItem('userDetails');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('lastAccessTime'); // También elimina la última vez que se accedió
}
}
