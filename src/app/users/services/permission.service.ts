import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RenewService } from '../../core/services/renew.service'; // Importa el RenewService

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient, private renewService: RenewService) {}

  /**
   * Obtener todos los permisos de un usuario
   * @param userId - ID del usuario para el cual se desean obtener los permisos
   */
  getAllPermissions(userId: number): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.get<any>(`${this.apiUrl}administrator/permission/all?id_user=${userId}`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores relacionados con el token
        return this.renewService.handleTokenError(error, () => this.getAllPermissions(userId));
      })
    );
  }

  /**
   * Asignar un permiso a un usuario
   * @param userId - ID del usuario
   * @param permissionId - ID del permiso
   * @param idFaqCategory - ID de la categoría de FAQ (puede ser null)
   * @param idCollaboratorCategory - ID de la categoría de colaborador (puede ser null)
   * @param idInfo - ID de información (puede ser null)
   */
  assignPermission(userId: number, permissionId: number, idFaqCategory: number | null, idCollaboratorCategory: number | null, idInfo: number | null): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    const body = { 
      user_id: userId, 
      permission_id: permissionId, 
      id_faq_category: idFaqCategory, 
      id_collaborator_category: idCollaboratorCategory, 
      id_info: idInfo 
    };

    return this.http.post<any>(`${this.apiUrl}administrator/permission/assign`, body, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores relacionados con el token
        return this.renewService.handleTokenError(error, () => this.assignPermission(userId, permissionId, idFaqCategory, idCollaboratorCategory, idInfo));
      })
    );
  }

  /**
   * Remover un permiso de un usuario
   * @param userId - ID del usuario
   * @param permissionId - ID del permiso
   * @param idFaqCategory - ID de la categoría de FAQ (puede ser null)
   * @param idCollaboratorCategory - ID de la categoría de colaborador (puede ser null)
   * @param idInfo - ID de información (puede ser null)
   */
  removePermission(userId: number, permissionId: number, idFaqCategory: number | null, idCollaboratorCategory: number | null, idInfo: number | null): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
    const body = { 
      user_id: userId, 
      permission_id: permissionId, 
      id_faq_category: idFaqCategory, 
      id_collaborator_category: idCollaboratorCategory, 
      id_info: idInfo 
    };

    return this.http.request<any>('delete', `${this.apiUrl}administrator/permission/remove`, { headers, body }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores relacionados con el token
        return this.renewService.handleTokenError(error, () => this.removePermission(userId, permissionId, idFaqCategory, idCollaboratorCategory, idInfo));
      })
    );
  }
}
