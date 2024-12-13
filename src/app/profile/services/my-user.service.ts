import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RenewService } from '../../core/services/renew.service';

@Injectable({
  providedIn: 'root'
})
export class MyUserService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient, private renewService: RenewService) {}

   /**
   * Cambiar contraseña de un usuario
   * @param userId - ID del usuario
   * @param oldPassword - Contraseña actual
   * @param newPassword - Nueva contraseña
   * @param accountToken - Account Token
   */
   changePassword(userId: number, oldPassword: string, newPassword: string, accountToken: string): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    const body = { user_id: userId, oldPassword, newPassword, accountToken };

    return this.http.post<any>(`${this.apiUrl}administrator/users/change-password`, body, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores relacionados con el token
        return this.renewService.handleTokenError(error, () => this.changePassword(userId, oldPassword, newPassword, accountToken));
      })
    );
  }

  /**
   * Obtener permisos del usuario autenticado
   */
  getMyPermissions(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.get<any>(`${this.apiUrl}administrator/users/my-permissions`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores relacionados con el token
        return this.renewService.handleTokenError(error, () => this.getMyPermissions());
      })
    );
  }

}
