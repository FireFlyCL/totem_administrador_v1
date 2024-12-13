import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RenewService } from '../../core/services/renew.service';

@Injectable({
  providedIn: 'root',
})
export class CollaboratorService {
  [x: string]: any;
  updateImageName(id_image: any, newName: string) {
    throw new Error('Method not implemented.');
  }
  getImagesByCategory(categoryId: number) {
    throw new Error('Method not implemented.');
  }
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient, private renewService: RenewService) {}

  // -----------------------------------------
  // Sección 1: Colaboradores
  // -----------------------------------------

  /**
   * Obtener todos los colaboradores
   */
  getAllCollaborators(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .get<any>(`${this.apiUrl}collaborators/collaborators`, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.getAllCollaborators()
          );
        })
      );
  }

  /**
   * Obtener colaboradores por categoría
   * @param categoryId - ID de la categoría
   */
  getCollaboratorsByCategory(
    categoryId: number,
    number?: any
  ): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .get<any>(
        `${this.apiUrl}collaborators/collaborators/category/${categoryId}`,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.getCollaboratorsByCategory(categoryId)
          );
        })
      );
  }

  /**
   * Obtener colaborador por ID
   * @param collaboratorId - ID del colaborador
   */
  getCollaboratorById(collaboratorId: number): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .get<any>(`${this.apiUrl}collaborators/collaborators/${collaboratorId}`, {
        headers,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.getCollaboratorById(collaboratorId)
          );
        })
      );
  }

  /**
   * Crear un colaborador (con opción de subir una imagen)
   * @param collaboratorData - Datos del colaborador
   * @param imageFile - Archivo de imagen (opcional)
   */
  createCollaborator(collaboratorData: any, imageFile?: File): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    const formData = new FormData();
    formData.append('first_name', collaboratorData.first_name);
    formData.append('last_name', collaboratorData.last_name);
    formData.append('role', collaboratorData.role);
    formData.append('email', collaboratorData.email);
    formData.append('id_category', collaboratorData.id_category.toString());

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http
      .post<any>(`${this.apiUrl}collaborators/collaborators`, formData, {
        headers,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.createCollaborator(collaboratorData, imageFile)
          );
        })
      );
  }

  /**
   * Actualizar un colaborador
   * @param collaboratorId - ID del colaborador
   * @param collaboratorData - Datos del colaborador a actualizar
   */
  updateCollaborator(
    collaboratorId: number,
    collaboratorData: any,
    p0?: any
  ): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .put<any>(
        `${this.apiUrl}collaborators/collaborators/${collaboratorId}`,
        collaboratorData,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.updateCollaborator(collaboratorId, collaboratorData)
          );
        })
      );
  }

  /**
   * Cambiar estado de un colaborador (activar/desactivar)
   * @param collaboratorId - ID del colaborador
   * @param idCategory - ID de la categoría
   */
  toggleCollaboratorStatus(
    collaboratorId: number,
    idCategory: number
  ): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });
    const body = { id_category: idCategory };

    return this.http
      .patch<any>(
        `${this.apiUrl}collaborators/collaborators/${collaboratorId}/toggle-status`,
        body,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.toggleCollaboratorStatus(collaboratorId, idCategory)
          );
        })
      );
  }

  /**
   * Eliminar un colaborador
   * @param collaboratorId - ID del colaborador
   * @param idCategory - ID de la categoría
   */
  deleteCollaborator(
    collaboratorId: number,
    idCategory: number
  ): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });
    const body = { id_category: idCategory };

    return this.http
      .delete<any>(
        `${this.apiUrl}collaborators/collaborators/${collaboratorId}`,
        { headers, body }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.deleteCollaborator(collaboratorId, idCategory)
          );
        })
      );
  }

  /**
   * Subir, reemplazar o eliminar una imagen para un colaborador
   * @param collaboratorId - ID del colaborador
   * @param idCategory - ID de la categoría
   * @param imageFile - Archivo de imagen (opcional)
   */
  updateCollaboratorImage(
    collaboratorId: number,
    idCategory: number,
    imageFile?: File
  ): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    const formData = new FormData();
    formData.append('id_category', idCategory.toString());
    if (imageFile) {
      formData.append('image', imageFile);
    }

    return this.http
      .put<any>(
        `${this.apiUrl}collaborators/image/collaborators/${collaboratorId}`,
        formData,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.updateCollaboratorImage(collaboratorId, idCategory, imageFile)
          );
        })
      );
  }

  // -----------------------------------------
  // Sección 2: Categorías de Colaboradores
  // -----------------------------------------

  /**
   * Obtener todas las categorías de colaboradores
   */
  getAllCollaboratorCategories(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .get<any>(`${this.apiUrl}collaborators/collaborator-categories`, {
        headers,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.getAllCollaboratorCategories()
          );
        })
      );
  }

  /**
   * Crear una nueva categoría de colaboradores
   * @param categoryData - Datos de la categoría
   */
  createCollaboratorCategory(categoryData: any): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .post<any>(
        `${this.apiUrl}collaborators/collaborator-categories`,
        categoryData,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.createCollaboratorCategory(categoryData)
          );
        })
      );
  }

  /**
   * Actualizar una categoría de colaboradores
   * @param categoryId - ID de la categoría
   * @param categoryData - Datos a actualizar
   */
  updateCollaboratorCategory(
    categoryId: number,
    categoryData: any
  ): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .put<any>(
        `${this.apiUrl}collaborators/collaborator-categories/name/${categoryId}`,
        categoryData,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.updateCollaboratorCategory(categoryId, categoryData)
          );
        })
      );
  }

  /**
   * Eliminar una categoría de colaboradores
   * @param categoryId - ID de la categoría
   */
  deleteCollaboratorCategory(categoryId: number): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .delete<any>(
        `${this.apiUrl}collaborators/collaborator-categories/${categoryId}`,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.deleteCollaboratorCategory(categoryId)
          );
        })
      );
  }

  /**
   * Reordenar categorías de colaboradores
   * @param reorderData - Datos de reordenamiento
   */
  reorderCollaboratorCategories(reorderData: any): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .put<any>(
        `${this.apiUrl}collaborators/collaborator-categories/reorder`,
        reorderData,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.reorderCollaboratorCategories(reorderData)
          );
        })
      );
  }

  // -----------------------------------------
  // Sección 3: Grupos de Categorías de Colaboradores
  // -----------------------------------------

  /**
   * Obtener todos los grupos de categorías de colaboradores
   */
  getAllCollaboratorGroupCategories(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .get<any>(`${this.apiUrl}collaborators/collaborator-group-categories`, {
        headers,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.getAllCollaboratorGroupCategories()
          );
        })
      );
  }

  /**
   * Crear una nueva categoría de grupo de colaboradores
   * @param groupCategoryData - Datos de la categoría de grupo
   */
  createCollaboratorGroupCategory(groupCategoryData: any): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .post<any>(
        `${this.apiUrl}collaborators/collaborator-group-categories`,
        groupCategoryData,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.createCollaboratorGroupCategory(groupCategoryData)
          );
        })
      );
  }

  /**
   * Actualizar una categoría de grupo de colaboradores
   * @param groupCategoryId - ID de la categoría de grupo
   * @param groupCategoryData - Datos a actualizar
   */
  updateCollaboratorGroupCategory(
    groupCategoryId: number,
    groupCategoryData: any
  ): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .put<any>(
        `${this.apiUrl}collaborators/collaborator-group-categories/name/${groupCategoryId}`,
        groupCategoryData,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.updateCollaboratorGroupCategory(
              groupCategoryId,
              groupCategoryData
            )
          );
        })
      );
  }

  /**
   * Eliminar una categoría de grupo de colaboradores
   * @param groupCategoryId - ID de la categoría de grupo
   */
  deleteCollaboratorGroupCategory(groupCategoryId: number): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .delete<any>(
        `${this.apiUrl}collaborators/collaborator-group-categories/${groupCategoryId}`,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.deleteCollaboratorGroupCategory(groupCategoryId)
          );
        })
      );
  }

  /**
   * Reordenar grupos de categorías de colaboradores
   * @param reorderData - Datos de reordenamiento
   */
  reorderCollaboratorGroupCategories(reorderData: any): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .put<any>(
        `${this.apiUrl}collaborators/collaborator-group-categories/reorder`,
        reorderData,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.reorderCollaboratorGroupCategories(reorderData)
          );
        })
      );
  }

  // -----------------------------------------
  // Sección 4: Imágenes de Colaboradores
  // -----------------------------------------

  /**
   * Obtener imágenes de colaboradores sin asignar
   */
  getUnassignedCollaboratorImages(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .get<any>(`${this.apiUrl}collaborators/image/collaborators/unassigned`, {
        headers,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.getUnassignedCollaboratorImages()
          );
        })
      );
  }

  /**
   * Subir múltiples imágenes en lote (sin asignarlas inmediatamente a colaboradores)
   * @param imageFiles - Array de archivos de imagen
   */
  uploadMultipleImages(imageFiles: File[]): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    const formData = new FormData();
    imageFiles.forEach((file, index) => {
      formData.append('images', file);
    });

    return this.http
      .post<any>(
        `${this.apiUrl}collaborators/image/collaborators/batch-upload`,
        formData,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.uploadMultipleImages(imageFiles)
          );
        })
      );
  }

  /**
   * Asignar imágenes a uno o más colaboradores
   * @param assignments - Array de objetos con id_collaborator y id_image
   */
  assignImagesToCollaborators(assignments: any[]): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });
    const body = { assignments };

    return this.http
      .post<any>(
        `${this.apiUrl}collaborators/image/collaborators/assign`,
        body,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.assignImagesToCollaborators(assignments)
          );
        })
      );
  }

  /**
   * Sincronizar imágenes de colaboradores
   */
  syncCollaboratorImages(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .delete<any>(`${this.apiUrl}collaborators/image/collaborators/sync`, {
        headers,
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.syncCollaboratorImages()
          );
        })
      );
  }



  // -----------------------------------------
  // Sección 5: Importación y Exportación de Excel
  // -----------------------------------------

  /**
   * Descargar todos los colaboradores en un archivo Excel
   */
  downloadAllCollaborators(): Observable<Blob> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .get(`${this.apiUrl}collaborators/sheet/collaborators/download-all`, {
        headers,
        responseType: 'blob',
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.downloadAllCollaborators()
          );
        })
      );
  }

  /**
   * Subir todos los colaboradores desde un archivo Excel
   * @param excelFile - Archivo Excel
   */
  uploadAllCollaborators(excelFile: File | null): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    const formData = new FormData();
    if (excelFile) {
      formData.append('file', excelFile);
    }

    console.log('archivo:', excelFile);
    return this.http
      .post<any>(
        `${this.apiUrl}collaborators/sheet/collaborators/upload-all`,
        formData,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.log(error);
          return this.renewService.handleTokenError(error, () =>
            this.uploadAllCollaborators(excelFile)
          );
        })
      );
  }

  /**
   * Descargar colaboradores de una categoría específica en un archivo Excel
   * @param idCategory - ID de la categoría
   */
  downloadCollaboratorsByCategory(idCategory: number): Observable<Blob> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });
    const body = { id_category: idCategory };

    return this.http
      .post(
        `${this.apiUrl}collaborators/sheet/collaborators/category/download-excel`,
        body,
        { headers, responseType: 'blob' }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.downloadCollaboratorsByCategory(idCategory)
          );
        })
      );
  }

  /**
   * Subir colaboradores de una categoría específica desde un archivo Excel
   * @param idCategory - ID de la categoría
   * @param excelFile - Archivo Excel
   */
  uploadCollaboratorsByCategory(
    idCategory: number,
    excelFile: File
  ): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    const formData = new FormData();
    formData.append('id_category', idCategory.toString());
    formData.append('file', excelFile);

    return this.http
      .post<any>(
        `${this.apiUrl}collaborators/sheet/collaborators/category/upload-excel`,
        formData,
        { headers }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return this.renewService.handleTokenError(error, () =>
            this.uploadCollaboratorsByCategory(idCategory, excelFile)
          );
        })
      );
  }
}
