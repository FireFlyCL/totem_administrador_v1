import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams, HttpRequest, HttpEventType  } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, filter } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RenewService } from '../../core/services/renew.service';


@Injectable({
  providedIn: 'root'
})
export class FaqsService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient, private renewService: RenewService) {}

  private getHeaders(): HttpHeaders {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      return new HttpHeaders({ 'Authorization': `Bearer ${accessToken}` });
    } else {
      console.error("Token de acceso no encontrado");
      return new HttpHeaders();
    }
  }

  // ----------------- Servicios para Categorías -----------------

  // Obtener todas las categorías de FAQ
  getAllCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}faqs/categories`, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  // Crear una nueva categoría de FAQ
  createCategory(categoryData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}faqs/categories`, categoryData, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  // Eliminar una categoría de FAQ
  deleteCategory(categoryId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}faqs/categories/${categoryId}`, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  // ----------------- Servicios para Preguntas -----------------

  // Obtener preguntas de una categoría específica
  getFaqsByCategory(categoryId: number): Observable<any> {
    
    return this.http.get<any>(`${this.apiUrl}faqs/faqs/categories/${categoryId}`, { headers: this.getHeaders() }).pipe(
        catchError((error: HttpErrorResponse) => this.handleError(error))
    );
}

  // Obtener todas las preguntas agrupadas por categoría
  getAllFaqs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}faqs`, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  // Método para crear una nueva pregunta
  createFaq(categoryId: number, faqData: any): Observable<any> {
    const url = `${this.apiUrl}faqs/faqs`; // Asegúrate de que esta URL sea correcta
    const body = { ...faqData, id_category: categoryId };
    return this.http.post<any>(url, body, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }
 // Método para eliminar una pregunta específica, enviando el id_category en el body
 deleteFaq(faqId: number, categoryId: number): Observable<any> {
  const url = `${this.apiUrl}faqs/faqs/${faqId}`;
  const options = {
    headers: this.getHeaders(),
    body: { id_category: categoryId }
  };
  return this.http.delete(url, options).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error instanceof ErrorEvent) {
        console.error('Error del lado del cliente:', error.error.message);
      } else {
        console.error('Error del lado del servidor:', error.message);
        if (error.error && typeof error.error === 'string') {
          console.error('Mensaje de error:', error.error);
        }
      }
      return this.handleError(error);
    })
  );
}


// Cambiar el estado (activo/inactivo) de una pregunta
toggleFaqStatus(faqId: number, idCategory: number): Observable<any> {
  const body = { id_category : idCategory }; // Asegúrate de incluir id_category en el cuerpo de la solicitud
 
  const url = `${this.apiUrl}faqs/faqs/status/${faqId}`;

  return this.http.put<any>(url, body, { headers: this.getHeaders() }).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`Error en la solicitud:`, error);
      return this.handleError(error);
    })
  );
}



// Método en el servicio para actualizar una pregunta específica, enviando cada campo en el body directamente
updateFaq(faqId: number, faq_question: string, faq_answer: string, id_category: number): Observable<any> {
  const url = `${this.apiUrl}faqs/faqs/${faqId}`;
  const headers = this.getHeaders();

  // Creación del body con los datos necesarios
  const body = {
    faq_question: faq_question,
    faq_answer: faq_answer,
    id_category: id_category
  };


  return this.http.put<any>(url, body, { headers }).pipe(
    catchError((error: HttpErrorResponse) => this.handleError(error))
  );
}



  // Método para cambiar el orden de las preguntas en una categoría
  reorderFaqs(categoryId: number, faqOrder: { faq_id: number, importance?: number }[]): Observable<any> {
    const url = `${this.apiUrl}faqs/faqs/reorder/categories/${categoryId}`;
    return this.http.put<any>(url, { id_category: categoryId, faqOrder }, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }
  
 
  // reordenar categorías
  reorderCategories(categoryOrder: { category_id: number }[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}faqs/categories/reorder`, { categoryOrder }, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }
  
  
  // ----------------- Servicios para Excel -----------------

  // Subir Excel de preguntas frecuentes
  uploadExcel(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}faqs/sheet/upload`, formData, { headers: this.getHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  // Descargar Excel de preguntas frecuentes
  downloadExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}faqs/sheet/download`, { headers: this.getHeaders(), responseType: 'blob' }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  // Descargar Excel de preguntas frecuentes de una categoría específica
  downloadFaqsByCategory(idCategory: number): Observable<Blob> {
    const url = `${this.apiUrl}faqs/sheet/download/categories`;
    const body = { id_category: idCategory }; // id_category en el cuerpo
  
    return this.http.post<Blob>(url, body, { headers: this.getHeaders(), responseType: 'blob' as 'json' }).pipe(
      catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }


// Método para subir FAQs desde un archivo Excel
uploadFaqsByCategory(categoryId: number, file: File): Observable<any> {
  const url = `${this.apiUrl}faqs/sheet/upload/categories`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('id_category', categoryId.toString());

  return this.http.post(url, formData, { headers: this.getHeaders() }).pipe(
    catchError((error: HttpErrorResponse) => this.handleError(error))
  );
}

  

  // ----------------- Manejo de errores -----------------

  // Manejo de errores para solicitudes HTTP
// Manejo de errores para solicitudes HTTP
private handleError(error: HttpErrorResponse): Observable<never> {
  if (error.status === 401 || error.status === 403) {
    // Error relacionado con token (no autorizado o prohibido)
    this.renewService.handleTokenError(error, () => throwError(error));
  }

  console.error('Ocurrió un error en la solicitud HTTP:', error);

  if (error.error instanceof Blob) {
    // Intenta leer el contenido del Blob como texto para obtener más detalles
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        const errorText = reader.result as string;
        console.error('Detalles del error (Blob como texto):', errorText);
        observer.error('Ocurrió un error, por favor intenta de nuevo más tarde.');
      };
      reader.onerror = () => {
        observer.error('Ocurrió un error, por favor intenta de nuevo más tarde.');
      };
      reader.readAsText(error.error);
    });
  }

  return throwError('Ocurrió un error, por favor intenta de nuevo más tarde.');
}

}