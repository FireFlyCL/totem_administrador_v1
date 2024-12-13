import { Component, OnInit } from '@angular/core';
import { NewsService } from '../services/news.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface News {
  id_news: number;
  caption: string;
  media_type: string;
  permalink: string | null;
  media_url: string | null;
  is_automatic: boolean; // Añadir esta propiedad
  id_instagram?: number; // Añadir esta propiedad para las noticias que vienen de Instagram
  is_from_instagram?: boolean; // Añadir la propiedad para identificar noticias de Instagram
  importance: number; // También si la usas para el orden
}

@Component({
  selector: 'app-news-common',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './news-common.component.html',
  styleUrls: ['./news-common.component.css'],
})
export class NewsCommonComponent implements OnInit {
  newsForm: FormGroup;
  newsList: News[] = [];
  activeMessage: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  isEditing = false;
  currentEditingId: number | null = null;
  is_automatic?: boolean; // Añadir esta propiedad para identificar noticias automáticas
  showModal = false;
  instructionsVisible: boolean[] = []; // Para controlar la visibilidad de instrucciones en cada tarjeta.
  mediaPreviewUrl: string | ArrayBuffer | null = null;
  fileName: string | null = null;

  readonly mediaBaseUrl = 'https://totemvespucio.cl/assets/news';

  constructor(
    private newsService: NewsService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.newsForm = this.fb.group({
      caption: ['', Validators.required],
      permalink: [''],
      file: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadNews();
  }

  toggleInstructions(index: number): void {
    // Asegura que se está manejando el estado de visibilidad de la tarjeta correcta.
    this.instructionsVisible[index] = !this.instructionsVisible[index];
  }
  hideInstructions(index: number): void {
    this.instructionsVisible[index] = false;
  }

  // Drag and Drop Handlers
  onDragStart(event: DragEvent, index: number): void {
    event.dataTransfer?.setData('text', index.toString());
    // Añadir la clase 'dragging' para aplicar el estilo durante el arrastre
    const target = event.target as HTMLElement;
    if (target) {
      target.classList.add('dragging');
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    // Si se desea, se podría agregar una clase para indicar dónde se soltará la tarjeta
  }

  onDrop(event: DragEvent, currentIndex: number): void {
    event.preventDefault();

    // Remover la clase 'dragging' del elemento arrastrado
    const target = event.target as HTMLElement;
    if (target) {
      target.classList.remove('dragging');
    }

    const previousIndex = event.dataTransfer?.getData('text');
    if (previousIndex !== undefined) {
      const prevIndex = parseInt(previousIndex, 10);
      if (!isNaN(prevIndex) && prevIndex !== currentIndex) {
        // Reorganiza los elementos en la lista
        const movedItem = this.newsList.splice(prevIndex, 1)[0];
        this.newsList.splice(currentIndex, 0, movedItem);

        // Actualiza el orden en el backend automáticamente
        this.reorderNews();
      }
    }
  }

  goToInstagramModule(): void {
    this.router.navigate(['/news-instagram']).catch((err) => {
      console.error('Error en la navegación a /news-instagram:', err);
    });
  }

  loadNews(): void {
    this.newsService.getAllNews().subscribe(
      (response: any) => {
        this.newsList = response.data.map((news: News) => {
          if (news.media_url && !news.media_url.startsWith('http')) {
            news.media_url = `${this.mediaBaseUrl}${news.media_url}`;
          }

          // Asignar la propiedad `is_from_instagram` para noticias que tienen un identificador de Instagram
          news.is_from_instagram = !!news.id_instagram; // Ejemplo: si tiene un `id_instagram` lo marcamos como noticia de Instagram
          news.is_automatic = news.is_automatic ?? false; // Asignar valor por defecto si no está definido
          return news;
        });
      },
      (error: any) => {
        this.showTemporaryMessage('error', 'Error al cargar las noticias');
      }
    );
  }

  // Para determinar si la vista previa es de una imagen
  isImage(): boolean {
    const file = this.newsForm.get('file')?.value;
    if (file) {
      return file.type.startsWith('image');
    }
    return false;
  }

  // Para determinar si la vista previa es de un video
  isVideo(): boolean {
    const file = this.newsForm.get('file')?.value;
    if (file) {
      return file.type.startsWith('video');
    }
    return false;
  }

  // Manejar la selección del archivo
  onFileSelect(event: any): void {
    const file = event.target.files[0];
    this.fileName = file?.name ?? null; // Guardar el nombre del archivo

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.mediaPreviewUrl = e.target?.result as string; // Generar URL para la vista previa
      };
      reader.readAsDataURL(file);
    } else {
      this.mediaPreviewUrl = null;
    }

    this.newsForm.patchValue({ file }); // Actualizar el formulario con el archivo
  }

  // Mostrar mensaje temporal de éxito o error
  private showTemporaryMessage(
    type: 'success' | 'error',
    message: string,
    duration: number = 5000
  ): void {
    if (type === 'success') {
      this.successMessage = message;
    } else if (type === 'error') {
      this.errorMessage = message;
    }
    this.activeMessage = true;

    setTimeout(() => {
      this.activeMessage = false;
      if (type === 'success') {
        this.successMessage = '';
      } else if (type === 'error') {
        this.errorMessage = '';
      }
    }, duration);
  }

  onSubmit(): void {
    const formData = new FormData();
    formData.append('caption', this.newsForm.get('caption')?.value);
    formData.append('permalink', this.newsForm.get('permalink')?.value || '');
    if (this.newsForm.get('file')?.value) {
      formData.append('file', this.newsForm.get('file')?.value);
    }

    if (this.isEditing && this.currentEditingId !== null) {
      this.newsService.updateOwnNews(this.currentEditingId, formData).subscribe(
        () => {
          this.loadNews();
          this.resetForm();
          this.showTemporaryMessage(
            'success',
            'Noticia actualizada correctamente'
          );
        },
        (error: any) => {
          console.error('Error al actualizar la noticia:', error);
          this.showTemporaryMessage('error', 'Error al actualizar la noticia');
        }
      );
    } else {
      this.newsService.createOwnNews(formData).subscribe(
        () => {
          this.loadNews();
          this.resetForm();
          this.showTemporaryMessage('success', 'Noticia creada correctamente');
        },
        (error: any) => {
          console.error('Error al agregar la noticia:', error);
          this.showTemporaryMessage('error', 'Error al agregar la noticia');
        }
      );
    }
    this.closeModal();
  }

  // Abrir el modal para crear nueva noticia
  openCreateModal(): void {
    this.resetForm();
    this.showModal = true;
    this.isEditing = false;
  }

  // Abrir el modal para editar noticia existente
  openEditModal(news: News): void {
    this.isEditing = true;
    this.currentEditingId = news.id_news;
    this.newsForm.patchValue({
      caption: news.caption,
      permalink: news.permalink || '',
      file: null,
    });
    this.showModal = true;
  }

  // Cerrar el modal
  closeModal(): void {
    this.showModal = false;
  }

  deleteNews(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta noticia?')) {
      this.newsService.deleteNews(id).subscribe(
        () => {
          this.loadNews();
          this.showTemporaryMessage(
            'success',
            'Noticia eliminada correctamente'
          );
        },
        (error: any) => {
          console.error('Error al eliminar la noticia:', error);
          this.showTemporaryMessage('error', 'Error al eliminar la noticia');
        }
      );
    }
  }

  reorderNews(): void {
    const idOrder = this.newsList.map((news) => news.id_news);
    this.newsService.reorderNews(idOrder).subscribe(
      () => {
        this.showTemporaryMessage('success', 'Noticias reordenadas con éxito');
      },
      (error: any) => {
        console.error('Error al reordenar las noticias:', error);
        this.showTemporaryMessage('error', 'Error al reordenar las noticias');
      }
    );
  }

  // Restablecer el formulario después de agregar o actualizar
  resetForm(): void {
    this.newsForm.reset();
    this.isEditing = false;
    this.currentEditingId = null;
    this.successMessage = '';
    this.errorMessage = '';
    this.mediaPreviewUrl = null;
  }

  // Verificar si el usuario tiene permisos
  hasPermission(permissionId: number, categoryId?: number | null): boolean {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const currentUserPermissions = JSON.parse(userDetails).permissionsDetails;

      // Verifica si el permiso es categórico o modular, y también si tiene el permiso 1 o 5
      if (categoryId) {
        return currentUserPermissions.some(
          (p: any) =>
            (p.id_permission === permissionId &&
              p.faq_category?.id_faq_category === categoryId) ||
            p.id_permission === 1 ||
            p.id_permission === 5
        );
      } else {
        return currentUserPermissions.some(
          (p: any) =>
            p.id_permission === permissionId ||
            p.id_permission === 1 ||
            p.id_permission === 5
        );
      }
    }
    return false;
  }
}
