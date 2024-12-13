import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CollaboratorService } from '../services/collaborator.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface Collaborator {
  id_category: number;
}

@Component({
  selector: 'app-collaborator-index',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './collaborator-index.component.html',
  styleUrls: ['./collaborator-index.component.css'],
})
export class CollaboratorIndexComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  defaultCategoryId: any;
  apiURL: any;
  collaborator: any = {};
  editingCollaborator: any = null;
  categories: any[] = [];
  selectedCollaborator: any = {
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    imagepath: '',
    is_active: false,
    id_category: null,
  };
  newCollaborator: any = {
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    id_category: null, // Se asignará automáticamente
  };
  groupCategoryId: number | null = null;
  filteredCollaborators: any[] = [];
  selectedImageFile?: any;
  selectedCategoryId: number | null = null;
  categoryId: number | null = null;
  idCategory!: number;
  successMessage: string = '';
  isModalOpen: boolean = false;
  excelFile!: File | null;
  isCreateModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  fileSelected: boolean = false;
  showDeleteConfirmationModal: boolean = false;
  collaboratorToDelete: {
    collaboratorId: number | null;
    idCategory: number | null;
  } = {
    collaboratorId: null,
    idCategory: null,
  };
  showDownloadConfirmationModal: boolean = false;
  isUploadModalOpen: boolean = false;
  isUploadConfirmationModalOpen: boolean = false;
  showAlertModal1: boolean = false;
  showAlertModal2: boolean = false;

  constructor(
    private collaboratorService: CollaboratorService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Obtener `categoryId` desde la URL y asignarlo
    const categoryIdParam = this.route.snapshot.paramMap.get('categoryId');
    this.categoryId = categoryIdParam ? Number(categoryIdParam) : null;

    // Si tenemos un categoryId válido, lo asignamos como categoría por defecto.
    if (this.categoryId && !isNaN(this.categoryId)) {
      this.idCategory = this.categoryId;
    } else {
      console.warn('No se recibió un ID de categoría válido.');
      alert('Error: No se recibió un ID de categoría válido.'); // Notificar al usuario si no hay un ID válido
      return;
    }

    // No se modifica la lógica de carga de colaboradores
    this.loadCollaboratorsByCategory();
  }

  loadCollaboratorsByCategory(): void {
    // Validar que el `categoryId` no sea nulo o indefinido
    if (this.categoryId === null || this.categoryId === undefined) {
      console.warn(
        'categoryId es nulo o indefinido. No se puede proceder con la carga de colaboradores.'
      );
      return;
    }

    // Llamar al servicio para obtener los colaboradores de la categoría especificada
    this.collaboratorService
      .getCollaboratorsByCategory(this.categoryId)
      .subscribe(
        (response: any) => {
          // Asegurarse de que `response.collaborators` sea un array antes de asignarlo
          this.filteredCollaborators = Array.isArray(response.collaborators)
            ? response.collaborators
            : [];

          // Log adicional para verificar cada colaborador cargado
          this.filteredCollaborators.forEach((collaborator, index) => {});
        },
        (error) => {
          console.error(
            `Error al cargar colaboradores para la categoría ${this.categoryId}:`,
            error
          );
        }
      );
  }

  // Cargar categorías y colaboradores
  loadCategoriesAndCollaborators(): void {
    // Asegurarse de que el `groupCategoryId` está definido
    if (this.groupCategoryId == null) {
      console.warn(
        'groupCategoryId es nulo o indefinido. No se puede proceder con la carga de colaboradores.'
      );
      return;
    }

    // Obtener todas las categorías de colaboradores
    this.collaboratorService.getAllCollaboratorCategories().subscribe(
      (categoryResponse: any) => {
        const categories = categoryResponse.groupCategories || [];

        // Filtrar las categorías pertenecientes al grupo deseado
        const relevantCategories = categories
          .filter(
            (group: any) => group.id_group_category === this.groupCategoryId
          )
          .map((group: any) => group.CollaboratorCategories)
          .flat(); // Aplanar la lista de categorías

        this.categories = relevantCategories; // Guardar categorías relevantes para usarlas en el select

        // Reiniciar la lista de colaboradores filtrados
        this.filteredCollaborators = [];

        if (relevantCategories.length === 0) {
          console.warn('No hay categorías relevantes disponibles.');
          return;
        }

        // Obtener los colaboradores por cada categoría relevante
        let remainingRequests = relevantCategories.length;
        relevantCategories.forEach((category: any) => {
          this.collaboratorService
            .getCollaboratorsByCategory(category.id_category)
            .subscribe(
              (collabResponse: any) => {
                const collaborators = collabResponse.collaborators || [];

                // Agregar colaboradores a la lista filtrada
                this.filteredCollaborators.push(...collaborators);

                // Reducir el contador de solicitudes pendientes y verificar si se completaron todas
                remainingRequests--;
                if (remainingRequests === 0) {
                }
              },
              (error) => {
                console.error(
                  `Error al cargar colaboradores para la categoría ${category.id_category}:`,
                  error
                );
                remainingRequests--; // Aún si hay error, seguimos decrementando
                if (remainingRequests === 0) {
                }
              }
            );
        });
      },
      (error) => {
        console.error('Error al cargar categorías de colaboradores:', error);
      }
    );
  }

  // Método para activar la selección de archivo
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onCategorySelected(categoryId: number): void {
    this.selectedCategoryId = categoryId;
  }

  navigateToImages(categoryId: number): void {
    if (categoryId == null) {
      console.error('categoryId es nulo o indefinido. Navegación abortada.');
      return;
    }
    this.router.navigate(['collaborator/image', categoryId]);
  }

  // Método para gestionar el archivo de imagen seleccionado
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
    }
  }

  // Lógica de envío del formulario unificada
  onSubmitCollaboratorForm(): void {
    if (
      !this.selectedCollaborator.first_name ||
      !this.selectedCollaborator.last_name ||
      !this.selectedCollaborator.role ||
      !this.selectedCollaborator.email ||
      !this.selectedCollaborator.id_category
    ) {
      console.error('Error: Todos los campos son requeridos.');
      return;
    }

    // Si el colaborador ya tiene un id, entonces lo estamos editando
    if (this.selectedCollaborator.id) {
      this.updateCollaborator();
    } else {
      this.createCollaborator();
    }
  }

  // Abrir Modal de Creación de Colaborador
  openCreateCollaboratorModal(): void {
    // Inicializar un nuevo colaborador con la categoría preasignada
    this.selectedCollaborator = {
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      id_category: this.categoryId, // Asignar la categoría por defecto
      is_active: true,
    };
    this.isCreateModalOpen = true;
    this.isEditModalOpen = false;
  }

  // Abrir modal para editar colaborador
  openEditCollaboratorModal(collaborator: any): void {
    if (!collaborator.id_collaborator) {
      console.error(
        'Error: El colaborador seleccionado no tiene un ID válido al abrir el modal:',
        collaborator
      );
      return;
    }

    this.selectedCollaborator = {
      ...collaborator,
      id: collaborator.id_collaborator,
    };

    this.isEditModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.clearForm(); // Limpiar formulario al cerrar modal
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.clearForm(); // Limpiar formulario al cerrar modal
  }

  imagePreview: string | null = null; // Variable para almacenar la URL de la vista previa

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedImageFile = input.files[0]; // Asignar el archivo seleccionado a selectedImageFile
      console.log('Imagen seleccionada:', this.selectedImageFile);
    } else {
      console.warn('No se seleccionó ninguna imagen.'); // Convierte el archivo en una URL
    }
  }

  updateCollaborator(): void {
    // Validar campos obligatorios
    if (
      !this.selectedCollaborator.first_name ||
      !this.selectedCollaborator.last_name ||
      !this.selectedCollaborator.role ||
      !this.selectedCollaborator.email
    ) {
      console.error(
        'Error: Todos los campos son requeridos, excepto la imagen al editar.'
      );
      return;
    }

    // Asignar la categoría por defecto si es necesario
    if (!this.selectedCollaborator.id_category) {
      this.selectedCollaborator.id_category = this.categoryId;
    }

    // Crear el payload con los datos del colaborador
    const collaboratorData = {
      first_name: this.selectedCollaborator.first_name,
      last_name: this.selectedCollaborator.last_name,
      email: this.selectedCollaborator.email,
      role: this.selectedCollaborator.role,
      id_category: this.selectedCollaborator.id_category,
      is_active: this.selectedCollaborator.is_active,
    };

    // Primero actualizar los datos básicos del colaborador
    this.collaboratorService
      .updateCollaborator(this.selectedCollaborator.id, collaboratorData)
      .subscribe(
        (response: any) => {
          // Si se seleccionó una nueva imagen, actualizarla
          if (this.selectedImageFile) {
            // Llamar a `updateCollaboratorImage` para actualizar la imagen del colaborador
            this.collaboratorService
              .updateCollaboratorImage(
                this.selectedCollaborator.id,
                this.selectedCollaborator.id_category,
                this.selectedImageFile
              )
              .subscribe(
                (imageResponse: any) => {
                  this.successMessage =
                    'Colaborador actualizado exitosamente con nueva imagen';
                  this.loadCategoriesAndCollaborators(); // Recargar colaboradores después de actualizar la imagen
                  this.closeEditModal(); // Cerrar el modal
                  setTimeout(() => {
                    this.successMessage = '';
                    this.openAlertModal2();
                  }, 3000);
                },
                (error: any) => {
                  console.error(
                    'Error al actualizar la imagen del colaborador:',
                    error
                  );
                  alert(
                    'Hubo un problema al actualizar la imagen. El colaborador fue actualizado, pero la imagen no.'
                  );
                  this.openAlertModal2();
                }
              );
          } else {
            // Si no hay imagen para actualizar, simplemente recargar los colaboradores
            this.successMessage = 'Colaborador actualizado exitosamente';
            this.loadCategoriesAndCollaborators(); // Recargar colaboradores
            this.closeEditModal(); // Cerrar el modal
            setTimeout(() => {
              this.successMessage = '';
              this.openAlertModal2();
            }, 3000);
          }
        },
        (error: any) => {
          console.error('Error al actualizar el colaborador:', error);
          alert(
            'Error al actualizar el colaborador. Por favor, inténtalo de nuevo.'
          );
        }
      );
  }

  // Crear un nuevo colaborador
  createCollaborator(): void {
    if (
      !this.selectedCollaborator.first_name ||
      !this.selectedCollaborator.last_name ||
      !this.selectedCollaborator.role ||
      !this.selectedCollaborator.emailName ||
      !this.selectedCollaborator.emailDomain
    ) {
      console.error(
        'Error: Todos los campos son requeridos para crear un nuevo colaborador.'
      );
      return;
    }

    // Combinar el nombre del correo y el dominio para formar el email completo
    this.selectedCollaborator.email = `${this.selectedCollaborator.emailName}@${this.selectedCollaborator.emailDomain}`;

    // Asignar categoría predeterminada si no se ha seleccionado
    this.selectedCollaborator.id_category = this.categoryId;

    this.collaboratorService
      .createCollaborator(
        this.selectedCollaborator,
        this.selectedImageFile || null
      )
      .subscribe(
        (response: any) => {
          this.loadCategoriesAndCollaborators(); // Recargar colaboradores
          this.successMessage = 'Colaborador agregado exitosamente';
          this.clearForm();
          this.closeCreateModal(); // Cerrar el modal
          setTimeout(() => {
            this.successMessage = '';
            this.openAlertModal2();
          }, 3000);
        },
        (error: any) => {
          console.error('Error al crear el colaborador:', error);
        }
      );
  }

  // En el archivo collaborator-index.component.ts (o donde corresponda)
  getCollaboratorImageUrl(collaborator: any): string {
    // Asegúrate de que collaborator tiene un campo de imagen válido
    if (!collaborator || !collaborator.image_path) {
      return ''; // No mostrar imagen si no hay una ruta válida
    }

    // Suponiendo que `this.apiUrl` apunta al backend y las imágenes se sirven desde allí.
    return `https://totemvespucio.cl/assets/colaboradores/${collaborator.image_path}`;
  }

  // Método que se llama cuando el usuario selecciona un archivo
  onExcelFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      console.warn('No se seleccionó ningún archivo.');
    } else {
      this.excelFile = file;
    }
  }

  openUploadModal(): void {
    this.isUploadModalOpen = true;
  }

  openUploadConfirmationModal(): void {
    if (!this.excelFile) {
      alert('Por favor, selecciona un archivo antes de continuar.');
      return;
    }
    this.isUploadConfirmationModalOpen = true;
  }

  confirmUpload(): void {
    if (
      this.idCategory !== undefined &&
      this.idCategory !== null &&
      this.excelFile
    ) {
      this.collaboratorService
        .uploadCollaboratorsByCategory(this.idCategory, this.excelFile)
        .subscribe({
          next: () => {
            alert('Archivo subido exitosamente.');
            this.closeUploadModal();
            this.closeUploadConfirmationModal();
          },
          error: (error) => {
            console.error('Error al subir el archivo:', error);
            alert(
              'Hubo un error al subir el archivo. Revisa la consola para más detalles.'
            );
          },
        });
    } else {
      console.error('ID de categoría o archivo no definido.');
    }
  }

  closeUploadModal(): void {
    this.isUploadModalOpen = false;
  }

  closeUploadConfirmationModal(): void {
    this.isUploadConfirmationModalOpen = false;
  }

  openDownloadConfirmationModal(): void {
    // Verifica que el ID de la categoría esté definido y sea un número válido
    if (
      this.idCategory === undefined ||
      this.idCategory === null ||
      isNaN(this.idCategory)
    ) {
      console.error('ID de categoría no definido o inválido para la descarga.');
      alert(
        'Error: No se ha definido un ID de categoría válido para la descarga.'
      );
      return;
    }

    // Abrir el modal de confirmación
    this.showDownloadConfirmationModal = true;
  }

  confirmDownloadCollaborators(): void {
    // Llamada al servicio para descargar los colaboradores
    this.collaboratorService
      .downloadCollaboratorsByCategory(this.idCategory)
      .subscribe({
        next: (blob) => {
          // Procesar la descarga del archivo
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Colaboradores_Categoria_${this.idCategory}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error al descargar el archivo:', error);
          alert(
            'Hubo un error al descargar el archivo. Por favor, revisa la consola para más detalles.'
          );
        },
      });

    // Cerrar el modal de confirmación
    this.closeDownloadConfirmationModal();
  }

  closeDownloadConfirmationModal(): void {
    this.showDownloadConfirmationModal = false;
  }

  // Método para limpiar los campos del formulario
  clearForm(): void {
    this.selectedCollaborator = {
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      id_category: this.categoryId, // Mantén la categoría por defecto
      is_active: true,
    };
  }

  openDeleteConfirmationModal(
    collaboratorId: number,
    idCategory: number
  ): void {
    console.log(
      'Opening delete confirmation modal for collaborator:',
      collaboratorId
    ); // DEBUG
    this.collaboratorToDelete = { collaboratorId, idCategory };
    this.showDeleteConfirmationModal = true;
  }

  // Confirmar la eliminación
  confirmDeleteCollaborator(): void {
    const { collaboratorId, idCategory } = this.collaboratorToDelete;

    // Verificar si los parámetros son válidos
    if (collaboratorId == null || idCategory == null) {
      console.error(
        'collaboratorId o idCategory es undefined',
        collaboratorId,
        idCategory
      );
      return;
    }

    // Proceder con la eliminación si se confirma
    this.collaboratorService
      .deleteCollaborator(collaboratorId, idCategory)
      .subscribe({
        next: () => {
          this.loadCollaboratorsByCategory(); // Refresca la lista después de eliminar
          this.closeDeleteConfirmationModal(); // Cierra el modal
          this.openAlertModal1();
        },
        error: (error: any) => {
          console.error('Error eliminando colaborador', error);
        },
      });
  }

  // Cancelar la eliminación y cerrar el modal
  closeDeleteConfirmationModal(): void {
    this.showDeleteConfirmationModal = false;
    this.collaboratorToDelete = { collaboratorId: null, idCategory: null };
  }

  // Cambiar el estado activo/inactivo de un colaborador
  toggleCollaboratorStatus(collaboratorId: number, idCategory: number): void {
    // Si cualquiera de los valores es undefined, mostramos un mensaje de error y detenemos la función
    if (collaboratorId == null || idCategory == null) {
      console.error(
        'collaboratorId o idCategory es undefined:',
        collaboratorId,
        idCategory
      );
      return;
    }

    this.collaboratorService
      .toggleCollaboratorStatus(collaboratorId, idCategory)
      .subscribe(
        (response: any) => {
          this.loadCollaboratorsByCategory(); // Recargar colaboradores después de cambiar el estado
        },
        (error: any) => {
          console.error('Error al cambiar el estado del colaborador:', error);
        }
      );
  }

  // Editar colaborador (cargar la información en el formulario)
  editCollaborator(collaborator: any): void {
    this.selectedCollaborator = { ...collaborator };
    this.selectedCollaborator.id_category = this.categoryId;
    this.isModalOpen = true;
  }

  // Cancelar la edición del colaborador
  cancelEdit(): void {
    this.selectedCollaborator = {
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      imagepath: '',
      is_active: false,
    };
  }

  goBack(): void {
    this.location.back();
  }

  //------------------------------
  //MODAL DE ALERTA DE CAMBIOS
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
}
