import { Component, OnInit } from '@angular/core';
import { FaqsService } from '../services/faqs.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-faqs-categories',
  standalone: true,
  imports: [FormsModule, CommonModule, DragDropModule],
  templateUrl: './faqs-categories.component.html',
  styleUrls: ['./faqs-categories.component.css']
})
export class FaqsCategoriesComponent implements OnInit {
  categories: any[] = []; // Lista de categorías
  newCategory: any = { faq_category_name: '' }; // Nueva categoría a agregar
  isAddingCategory = false; // Estado del modal de agregar categoría
  isDeletingCategory = false; // Estado del modal de confirmación de eliminación
  isUploadModalOpen = false; // Estado del modal de subida de archivo
  categoryIdToDelete: number | null = null; // ID de la categoría a eliminar
  fileToUpload: File | null = null; // Archivo seleccionado para subir
  uploadMessage: string = ''; // Mensaje de éxito o error de subida de archivo
  isUploadSuccess: boolean = false; // Indica si la subida de archivo fue exitosa
  errorMessage: string = ''; // Mensaje de error para la validación de categoría

  constructor(private faqsService: FaqsService, private router: Router) {}

  ngOnInit(): void {
    this.loadCategories(); // Cargar categorías al iniciar el componente
  }

  // Cargar todas las categorías
  loadCategories(): void {
    this.faqsService.getAllCategories().subscribe(
      (response: any) => {
        this.categories = response.categories;
      },
      (error: any) => {
        console.error('Error al obtener las categorías:', error);
      }
    );
  }

  // Abrir el modal para agregar una nueva categoría
  addCategory(): void {
    this.isAddingCategory = true;
  }

  // Guardar la nueva categoría con validaciones
  saveNewCategory(): void {
    const categoryName = this.newCategory.faq_category_name.trim();

    // Validar que el nombre no esté vacío y tenga un máximo de 20 caracteres
    if (!categoryName) {
      this.errorMessage = 'El nombre de la categoría no puede estar vacío.';
      return;
    } else if (categoryName.length > 100) {
      this.errorMessage = 'El nombre de la categoría no puede tener más de 100 caracteres.';
      return;
    }

    // Resetear mensaje de error si la validación es exitosa
    this.errorMessage = '';

    this.faqsService.createCategory(this.newCategory).subscribe(() => {
      this.isAddingCategory = false;
      this.newCategory = { faq_category_name: '' };
      this.loadCategories(); // Recargar categorías después de agregar una nueva
    });
  }

  // Cancelar la adición de una nueva categoría
  cancelAdding(): void {
    this.isAddingCategory = false;
    this.newCategory = { faq_category_name: '' };
    this.errorMessage = ''; // Limpiar mensaje de error al cancelar
  }

  // Preparar la eliminación de una categoría
  prepareDeleteCategory(categoryId: number): void {
    this.isDeletingCategory = true;
    this.categoryIdToDelete = categoryId;
  }

  // Confirmar la eliminación de una categoría
  confirmDeleteCategory(): void {
    if (this.categoryIdToDelete !== null) {
      this.faqsService.deleteCategory(this.categoryIdToDelete).subscribe(() => {
        this.isDeletingCategory = false;
        this.categoryIdToDelete = null;
        this.loadCategories(); // Recargar categorías después de eliminar
      });
    }
  }

  // Cancelar la eliminación de una categoría
  cancelDelete(): void {
    this.isDeletingCategory = false;
    this.categoryIdToDelete = null;
  }

  // Abrir el modal para subir un archivo Excel
  openUploadModal(): void {
    this.isUploadModalOpen = true;
  }

  // Cerrar el modal de subida de archivo
  closeUploadModal(): void {
    this.isUploadModalOpen = false;
    this.fileToUpload = null;
    this.uploadMessage = '';
  }

  // Manejar el archivo seleccionado para la subida
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileToUpload = input.files[0];
    }
  }

  uploadExcel(): void {
    if (this.fileToUpload) {
      const formData = new FormData();
      formData.append('file', this.fileToUpload);
  
      // Limpiar mensajes previos
      this.uploadMessage = '';
      this.isUploadSuccess = false;
  
      this.faqsService.uploadExcel(formData).subscribe(
        (response: any) => {
          
  
          if (response.success) {
            this.uploadMessage = 'Archivo subido correctamente.';
            this.isUploadSuccess = true;
            this.loadCategories(); // Recargar categorías si es necesario
  
            // Cerrar el modal automáticamente después de subir con éxito
            setTimeout(() => {
              this.closeUploadModal();
            }, 2000); // Espera 2 segundos antes de cerrar para que el mensaje sea visible
          } else {
            this.uploadMessage = 'Error: ' + (response.message || 'Error desconocido.');
            this.isUploadSuccess = false;
          }
  
          // Permitir subir otro archivo
          this.fileToUpload = null;
        },
        (error: any) => {
          console.error('Error al subir el archivo:', error);
          this.uploadMessage = 'Error al subir el archivo. Por favor, intenta nuevamente.';
          this.isUploadSuccess = false;
  
          // Permitir subir otro archivo
          this.fileToUpload = null;
        }
      );
    } else {
      this.uploadMessage = 'Por favor, selecciona un archivo antes de subir.';
      this.isUploadSuccess = false;
    }
  }
  
  
  // Descargar todas las preguntas frecuentes en un archivo Excel
  downloadExcel(): void {
    const fechaHoy = new Date().toLocaleDateString('en-CA'); // Formato 'YYYY-MM-DD'
    const nombreArchivo = `todas_las_preguntas_al_${fechaHoy}.xlsx`;

    this.faqsService.downloadExcel().subscribe(
      (response: Blob) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      (error: any) => {
        console.error('Error al descargar el Excel:', error);
      }
    );
  }

  // Reordenar categorías
  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
    this.updateCategoryOrder(); // Llamar al servicio para actualizar el orden en el backend
  }

  // Enviar el nuevo orden al backend
  updateCategoryOrder(): void {
    const categoryOrder = this.categories.map((category) => ({
      category_id: category.id_faq_category,
      importance: category.importance, // Enviar el nuevo número de importancia
    }));
  
    this.faqsService.reorderCategories(categoryOrder).subscribe(
      (response: any) => {
       
        this.loadCategories(); // Recargar categorías para obtener los números actualizados
      },
      (error: any) => {
        console.error('Error al actualizar el orden de categorías:', error);
      }
    );
  }
  
  // Navegar a la página de preguntas de una categoría específica
  navigateToFaqsIndex(categoryId: number): void {
    this.router.navigate(['faqs/categories', categoryId]);
  }

  // Verificar permisos para mostrar elementos de la interfaz
  hasPermission(permissionId: number, categoryId?: number | null): boolean {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const currentUserPermissions = JSON.parse(userDetails).permissionsDetails;

      if (categoryId) {
        return currentUserPermissions.some((p: any) =>
          (p.id_permission === permissionId && p.faq_category?.id_faq_category === categoryId) || p.id_permission === 1 || p.id_permission === 7
        );
      } else {
        return currentUserPermissions.some((p: any) =>
          p.id_permission === permissionId || p.id_permission === 1 || p.id_permission === 7
        );
      }
    }
    return false;
  }
}
