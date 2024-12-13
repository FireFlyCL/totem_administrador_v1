import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RenewService } from '../../core/services/renew.service';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient, private renewService: RenewService) {}

  private createHeaders(): HttpHeaders {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error("Token de acceso no encontrado");
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });
  }

  private handleError<T>(retryFn: () => Observable<T>): (error: HttpErrorResponse) => Observable<T> {
    return (error: HttpErrorResponse): Observable<T> => {
      console.log(error)
      return this.renewService.handleTokenError(error, retryFn);
    };
  }

  // Servicio para obtener todos los logs administrativos
  getLogsAdminAll(): Observable<any> {
    const headers = this.createHeaders();

    return this.http.get<any>(`${this.apiUrl}administrator/stats/logs/admin-log`, { headers })
      .pipe(catchError(this.handleError(() => this.getLogsAdminAll())));
  }

  // Servicio para obtener los logs de clics, con parámetros opcionales para filtrar por fecha, componente y selección
  getClickLogs(startDate?: string, endDate?: string, component?: string, selection?: string): Observable<any> {
    const headers = this.createHeaders();
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (component) params = params.set('component', component);
    if (selection) params = params.set('selection', selection);
    return this.http.get<any>(`${this.apiUrl}administrator/stats/logs/click`, { headers, params })
      .pipe(catchError(this.handleError(() => this.getClickLogs(startDate, endDate, component, selection))));
  }

  // Servicio para obtener los logs de búsqueda, con parámetros opcionales para filtrar por fecha, componente y término de búsqueda
  getSearchLogs(startDate?: string, endDate?: string, component?: string, search_term?: string): Observable<any> {
    const headers = this.createHeaders();
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (component) params = params.set('component', component);
    if (search_term) params = params.set('search_term', search_term);

    return this.http.get<any>(`${this.apiUrl}administrator/stats/logs/search`, { headers, params })
      .pipe(catchError(this.handleError(() => this.getSearchLogs(startDate, endDate, component, search_term))));
  }

  // Servicio para obtener los logs de puntuación, con parámetros opcionales para filtrar por fecha y detalles de puntuación
  getScoreLogs(startDate?: string, endDate?: string, score_details?: string): Observable<any> {
    const headers = this.createHeaders();
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (score_details) params = params.set('score_details', score_details);

    return this.http.get<any>(`${this.apiUrl}administrator/stats/logs/score`, { headers, params })
      .pipe(catchError(this.handleError(() => this.getScoreLogs(startDate, endDate, score_details))));
  }

  // Servicio para obtener los logs de administrador, con múltiples parámetros opcionales para filtrar por acción, componente, detalles, usuario, objeto, y fechas
  getAdminLogs(
    log_action: string = '',
    log_component: string = '',
    log_details: string = '',
    log_user: string = '',
    log_object: string = '',
    startDate: string = '',
    endDate: string = ''
  ): Observable<any> {
    const headers = this.createHeaders();
    let params = new HttpParams();
    if (log_action) params = params.set('log_action', log_action);
    if (log_component) params = params.set('log_component', log_component);
    if (log_details) params = params.set('log_details', log_details);
    if (log_user) params = params.set('log_user', log_user);
    if (log_object) params = params.set('log_object', log_object);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<any>(`${this.apiUrl}administrator/stats/logs/admin-log`, { headers, params })
      .pipe(catchError(this.handleError(() => this.getAdminLogs(log_action, log_component, log_details, log_user, log_object, startDate, endDate))));
  }

  

  
}
