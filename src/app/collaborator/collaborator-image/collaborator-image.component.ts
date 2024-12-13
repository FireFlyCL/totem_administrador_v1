import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CollaboratorService } from '../services/collaborator.service';
import { CommonModule, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-collaborator-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collaborator-image.component.html',
  styleUrls: ['./collaborator-image.component.css'],
})
export class CollaboratorImageComponent implements OnInit {
  imageBasePath: string = `https://totemvespucio.cl/assets/colaboradores/`;
  isUploadModalOpen: boolean = false;
  selectedImages: File[] = [];
  unassignedImages: any[] = [];
  filteredCollaborators: any[] = [];
  selectedCollaborator: any = null;
  pendingAssignments: {
    id_collaborator: number;
    id_image: number;
    previousImageName?: string;
  }[] = [];
  categoryId: number | null = null;
  loading: boolean = false;
  formData = new FormData();
  assignments: any;
  imagesToDelete: string[] = [];
  showAlertModal1: boolean = false;
  showAlertModal2: boolean = false;
  showErrorAlertModal: boolean = false;
  showErrorAlertUpload: boolean = false;
  showErrorAlertAsign: boolean = false;
  showAlertNoPenAsign: boolean = false;

  constructor(
    private collaboratorService: CollaboratorService,
    private location: Location,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Obtener el ID de categoría desde la URL y asignarlo a `categoryId`
    const categoryIdParam = this.route.snapshot.paramMap.get('categoryId');
    this.categoryId = categoryIdParam ? Number(categoryIdParam) : null;

    if (this.categoryId && !isNaN(this.categoryId)) {
      // Cargar colaboradores e imágenes de la categoría seleccionada
      this.loadCollaboratorsByCategory();
      this.loadUnassignedImages();
    } else {
      console.warn('No se recibió un ID de categoría válido.');
      this.openErrorAlertModal();
    }
  }

  loadCollaboratorsByCategory(): void {
    console.log(
      'Iniciando carga de colaboradores para la categoría:',
      this.categoryId
    );

    if (this.categoryId == null) {
      console.warn(
        'categoryId es nulo o indefinido. No se puede proceder con la carga de colaboradores.'
      );
      return;
    }

    // Llamar al servicio para obtener todos los colaboradores
    this.collaboratorService.getAllCollaborators().subscribe(
      (response: any) => {
        if (
          response &&
          response.collaborators &&
          Array.isArray(response.collaborators)
        ) {
          console.log(
            'Todos los colaboradores obtenidos:',
            response.collaborators
          );

          // Convertir `categoryId` en número si no lo es
          const categoryIdAsNumber = Number(this.categoryId);

          // No filtrar por el estado activo/inactivo, incluir todos los colaboradores de la categoría
          this.filteredCollaborators = response.collaborators.filter(
            (collaborator: any) =>
              collaborator.id_collaborator_category === categoryIdAsNumber
          );

          console.log(
            'Colaboradores filtrados por categoría (sin importar estado):',
            this.filteredCollaborators
          );

          // Mostrar mensaje si no hay colaboradores filtrados
          if (this.filteredCollaborators.length === 0) {
            console.warn(
              `No se encontraron colaboradores para la categoría con ID ${categoryIdAsNumber}`
            );
          }
        } else {
          console.warn(
            'La respuesta no contiene un array válido de colaboradores.'
          );
        }
      },
      (error) => {
        console.error(
          `Error al cargar colaboradores para la categoría ${this.categoryId}:`,
          error
        );
      }
    );
  }

  openUploadModal(): void {
    this.isUploadModalOpen = true;
  }

  closeUploadModal(): void {
    this.isUploadModalOpen = false;
    this.selectedImages = []; // Limpiar la selección de imágenes cuando se cierra el modal
  }

  // Obtener URL completa de una imagen
  getFullImagePath(uniqueName: string): string {
    if (!uniqueName) {
      console.warn(
        'Nombre de imagen no proporcionado, mostrando imagen por defecto.'
      );
      return 'https://totemvespucio.cl/assets/colaboradores/placeholder.png'; // Imagen genérica
    }

    const fullPath = `${this.imageBasePath}${uniqueName}`;
    console.log('URL completa para la imagen:', fullPath);
    return fullPath;
  }

  // Manejar selección de archivos
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedImages = Array.from(event.target.files);
      console.log('Archivos seleccionados:', this.selectedImages);
    }
  }

  // Método para subir las imágenes seleccionadas
  uploadImages(): void {
    if (this.selectedImages.length === 0) {
      this.openErrorAlertUpload();
      return;
    }

    this.loading = true; // Activar indicador de carga

    this.collaboratorService
      .uploadMultipleImages(this.selectedImages)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.openAlertModal1();
            this.isUploadModalOpen = false; // Cerrar el modal después de subir las imágenes

            // Recargar las imágenes sin asignar después de subir
            this.loadUnassignedImages(); // Asegúrate de tener esta función definida para recargar las imágenes
          } else {
            this.openErrorAlertModal();
            console.warn('Respuesta del servidor:', response);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al subir las imágenes:', error);
          this.openErrorAlertModal();
        },
        complete: () => {
          this.loading = false; // Desactivar indicador de carga
          this.selectedImages = []; // Reiniciar la lista de archivos seleccionados
        },
      });
  }

  assignImages(): void {
    if (this.assignments.length === 0) {
      this.openErrorAlertAsign();
      return;
    }
    this.collaboratorService
      .assignImagesToCollaborators(this.assignments)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.openAlertModal1();
            this.assignments = []; // Resetear asignaciones después de una subida exitosa
            this.loadUnassignedImages(); // Recargar imágenes sin asignar para actualizar el estado
            // Recargar la página después de la asignación
            window.location.reload();
          } else {
            this.openErrorAlertModal();
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al asignar imágenes:', error);
          this.openErrorAlertModal();
        },
      });
  }

  // Añadir asignación a la cola (sin sincronización inmediata)
  addAssignmentToQueue(collaboratorId: number, imageId: number): void {
    const collaborator = this.filteredCollaborators.find(
      (collab) => collab.id_collaborator === collaboratorId
    );

    const previousImageName = collaborator?.image_path; // Imagen anterior del colaborador

    const assignment = {
      id_collaborator: collaboratorId,
      id_image: imageId,
      previousImageName: previousImageName, // Guardar la imagen previa para eliminar después
    };

    // Añadir a la cola de asignaciones
    this.pendingAssignments.push(assignment);
    console.log('Asignaciones pendientes:', this.pendingAssignments);

    // Eliminar la imagen de la lista de imágenes sin asignar para reflejar la asignación
    this.unassignedImages = this.unassignedImages.filter(
      (img) => img.id_image !== imageId
    );
  }

  // Sincronizar las asignaciones pendientes y luego eliminar las imágenes sin asignar
  synchronizeAssignments(): void {
    if (this.pendingAssignments.length === 0) {
      this.openAlertNoPenAsign();
      return;
    }

    // Ejecutar las asignaciones
    this.collaboratorService
      .assignImagesToCollaborators(this.pendingAssignments)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.openAlertModal2(); // Después de asignar, eliminar las imágenes no asignadas restantes usando el servicio de sincronización
            this.synchronizeUnassignedImages();
          } else {
            this.openErrorAlertModal();
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error al sincronizar las asignaciones:', error);
          this.openErrorAlertModal();
        },
      });

    // Limpiar la cola de asignaciones
    this.pendingAssignments = [];
  }

  // Sincronizar las imágenes no asignadas restantes
  synchronizeUnassignedImages(): void {
    this.collaboratorService.syncCollaboratorImages().subscribe({
      next: (response) => {
        if (response.success) {
          this.openErrorAlertModal(); // Recargar la página después de eliminar las imágenes no asignadas
          window.location.reload();
        } else {
          this.openErrorAlertModal();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al eliminar las imágenes no asignadas:', error);
        this.openErrorAlertModal();
      },
    });
  }

  // Cargar imágenes sin asignar del backend
  loadUnassignedImages(): void {
    this.collaboratorService.getUnassignedCollaboratorImages().subscribe(
      (response: any) => {
        this.unassignedImages = response.images || [];
        console.log('Imágenes sin asignar obtenidas:', this.unassignedImages);
      },
      (error) => {
        console.error('Error al cargar las imágenes sin asignar:', error);
      }
    );
  }

  // Seleccionar colaborador
  selectCollaborator(collaborator: any): void {
    this.selectedCollaborator = collaborator;
    console.log('Colaborador seleccionado:', collaborator);
  }

  // Volver atrás
  goBack(): void {
    this.location.back();
  }

  //------------------------------
  //MODALES DE ALERTA
  //------------------------------
  openAlertModal1(): void {
    this.showAlertModal1 = true;
  }

  closeAlertModal1(): void {
    this.showAlertModal1 = false;
  }

  openAlertModal2(): void {
    this.showAlertModal2 = true;
  }

  closeAlertModal2(): void {
    this.showAlertModal2 = false;

    window.location.reload();
  }

  openErrorAlertModal(): void {
    this.showErrorAlertModal = true;
  }

  closeErrorAlertModal(): void {
    this.showErrorAlertModal = false;
  }

  openErrorAlertUpload(): void {
    this.showErrorAlertUpload = true;
  }

  closeErrorAlertUpload(): void {
    this.showErrorAlertUpload = false;
  }

  openErrorAlertAsign(): void {
    this.showErrorAlertAsign = true;
  }

  closeErrorAlertAsign(): void {
    this.showErrorAlertAsign = false;
  }
  openAlertNoPenAsign(): void {
    this.showAlertNoPenAsign = true;
  }

  closeAlertNoPenAsign(): void {
    this.showAlertNoPenAsign = false;
  }
}
