import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RenewService } from '../../core/services/renew.service';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  private apiUrl: string = environment.apiUrl;
  

  constructor(private http: HttpClient, private renewService: RenewService) {}



  // Método para obtener todas las publicaciones de Instagram (primera página)
  getFirstPageWithActiveStatus(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
    
    return this.http.get<any>(`${this.apiUrl}news/instagram/first-page`, { headers }).pipe(
      timeout(10000), // Tiempo máximo de espera de 10 segundos
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        return this.renewService.handleTokenError(error, () => this.getFirstPageWithActiveStatus());
      })
    );
  }

  // Método para obtener publicaciones de una página específica de Instagram
  getInstagramPostsByPage(cursorType: string, cursorValue: string): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get<any>(
      `${this.apiUrl}news/instagram/page?cursorType=${cursorType}&cursorValue=${cursorValue}`,
      { headers }
    ).pipe(
      timeout(10000),
      catchError((error: HttpErrorResponse) => {
        return this.renewService.handleTokenError(error, () => this.getInstagramPostsByPage(cursorType, cursorValue));
      })
    );
  }

  // Método para agregar un post de Instagram a la base de datos de noticias
  addInstagramNews(instagramId: string): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.post<any>(`${this.apiUrl}news/instagram/news`, { instagramId }, { headers }).pipe(
      timeout(10000),
      catchError((error: HttpErrorResponse) => {
        return this.renewService.handleTokenError(error, () => this.addInstagramNews(instagramId));
      })
    );
  }

  // Método para eliminar una noticia específica de la base de datos
  deleteInstagramNews(instagramId: number): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
  
    return this.http.delete<any>(`${this.apiUrl}news/instagram/news/${instagramId}`, { headers }).pipe(
      timeout(10000),
      catchError((error: HttpErrorResponse) => {
        return this.renewService.handleTokenError(error, () => this.deleteInstagramNews(instagramId));
      })
    );
  }


  // Método para crear automáticamente una noticia a partir de una publicación de Instagram
  createAutomaticNews(type: string): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.post<any>(`${this.apiUrl}news/instagram/automatic`, { type }, { headers }).pipe(
      timeout(10000),
      catchError((error: HttpErrorResponse) => {
        return this.renewService.handleTokenError(error, () => this.createAutomaticNews(type));
      })
    );
  }

  /**
   * Obtener todas las noticias
   */
  getAllNews(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get<any>(`${this.apiUrl}news/all`, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores relacionados con el token
        return this.renewService.handleTokenError(error, () =>
          this.getAllNews()
        );
      })
    );
  }

  /**
   * Crear una noticia propia
   * @param formData - Datos del formulario, incluyendo el archivo de imagen/video
   */
  createOwnNews(formData: FormData): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .post<any>(`${this.apiUrl}news/own`, formData, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Manejar errores relacionados con el token
          return this.renewService.handleTokenError(error, () =>
            this.createOwnNews(formData)
          );
        })
      );
  }

  /**
   * Actualizar una noticia propia
   * @param newsId - ID de la noticia que se va a actualizar
   * @param formData - Datos del formulario, incluyendo el archivo de imagen/video
   */
  updateOwnNews(newsId: number, formData: FormData): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .put<any>(`${this.apiUrl}news/own/${newsId}`, formData, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Manejar errores relacionados con el token
          return this.renewService.handleTokenError(error, () =>
            this.updateOwnNews(newsId, formData)
          );
        })
      );
  }

  /**
   * Eliminar una noticia
   * @param newsId - ID de la noticia a eliminar
   */
  deleteNews(newsId: number): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .delete<any>(`${this.apiUrl}news/${newsId}`, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Manejar errores relacionados con el token
          return this.renewService.handleTokenError(error, () =>
            this.deleteNews(newsId)
          );
        })
      );
  }

  /**
   * Reordenar la importancia de las noticias
   * @param idOrder - Array con los IDs de las noticias en el orden deseado
   */
  reorderNews(idOrder: number[]): Observable<any> {
    const accessToken = localStorage.getItem('accessToken'); // Recupera el token
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .post<any>(`${this.apiUrl}news/reorder`, { idOrder }, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          // Manejar errores relacionados con el token
          return this.renewService.handleTokenError(error, () =>
            this.reorderNews(idOrder)
          );
        })
      );
  }
}

