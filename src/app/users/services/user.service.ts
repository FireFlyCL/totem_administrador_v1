import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RenewService } from '../../core/services/renew.service';

@Injectable({
  providedIn: 'root' 
})
export class UserService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient, private renewService: RenewService) {}

  /**
   * Agregar un nuevo usuario
   * @param username - Nombre de usuario a agregar
   */
  addUser(username: string): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    const body = { username };

    return this.http.post<any>(`${this.apiUrl}administrator/users/add`, body, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores relacionados con el token
        return this.renewService.handleTokenError(error, () => this.addUser(username));
      })
    );
  }

  /**
   * Obtener todos los usuarios
   */
  getAllUsers(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.get<any>(`${this.apiUrl}administrator/users/all`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores relacionados con el token
        return this.renewService.handleTokenError(error, () => this.getAllUsers());
      })
    );
  } 

  /**
   * Bloquear o desbloquear un usuario
   * @param userId - ID del usuario
   * @param isBlocked - Estado de bloqueo (true para bloquear, false para desbloquear)
   */
  blockOrUnblockUser(userId: number, isBlocked: boolean): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    const body = { user_id: userId, is_blocked: isBlocked };

    return this.http.put<any>(`${this.apiUrl}administrator/users/block-unblock`, body, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores relacionados con el token
        return this.renewService.handleTokenError(error, () => this.blockOrUnblockUser(userId, isBlocked));
      })
    );
  }

  /**
   * Eliminar un usuario
   * @param userId - ID del usuario
   */
  deleteUser(userId: number): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    const body = { user_id: userId };

    return this.http.delete<any>(`${this.apiUrl}administrator/users/delete`, { headers, body }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores relacionados con el token
        return this.renewService.handleTokenError(error, () => this.deleteUser(userId));
      })
    );
  }
}
