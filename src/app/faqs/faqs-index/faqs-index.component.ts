import { Component, OnInit } from '@angular/core';
import { FaqsService } from '../services/faqs.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-faqs-index',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './faqs-index.component.html',
  styleUrls: ['./faqs-index.component.css']
})
export class FaqsIndexComponent implements OnInit {
  faqs: any[] = []; // Lista de FAQs
  filteredFaqs: any[] = []; // Lista de FAQs filtradas por búsqueda
  categories: any[] = []; // Lista de categorías
  categoryId: number = 0; // ID de la categoría seleccionada
  searchTerm: string = ''; // Término de búsqueda

  // Propiedades para el modal de agregar pregunta
  isAddingFaq: boolean = false; // Indica si el modal de agregar está abierto
  newQuestion: string = ''; // Nueva pregunta a agregar
  newAnswer: string = ''; // Nueva respuesta a agregar

  // Propiedades para el modal de edición de pregunta
  isEditingFaq: boolean = false; // Indica si el modal de edición está abierto
  editedFaq: any = { id_faq: null, faq_question: '', faq_answer: '' }; // Pregunta que se está editando

  // Propiedades para el modal de confirmación de eliminación
  isDeletingFaq: boolean = false; // Indica si el modal de eliminación está abierto
  faqToDeleteId: number | null = null; // ID de la pregunta a eliminar

  // Propiedades para el modal de subida de archivo
  isUploadModalOpen: boolean = false; // Indica si el modal de subida de archivo está abierto
  selectedFile: File | null = null; // Archivo seleccionado para subir
  uploadMessage: string = ''; // Mensaje de confirmación o error para la subida de archivo
  isUploadSuccess: boolean = false; // Indica si la subida de archivo fue exitosa

  constructor(
    private faqsService: FaqsService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Carga la categoría desde la URL
    this.route.paramMap.subscribe({
      next: (params) => {
        const id = params.get('categoryId');
        if (id) {
          this.categoryId = +id; // Convierte a número
          this.loadFaqs(); // Carga las FAQs de la categoría seleccionada
        } else {
          console.warn("No se encontró un ID de categoría en la URL.");
        }
      },
      error: (err) => console.error('Error al obtener el parámetro de categoría:', err)
    });
    this.loadCategories(); // Carga todas las categorías
  }

  goBack(): void {
    this.location.back(); // Navega hacia atrás en la historia
  }

  // Métodos para manejar el modal de agregar pregunta
  openAddFaqModal(): void {
    this.isAddingFaq = true;
    this.newQuestion = '';
    this.newAnswer = '';
  }

  cancelAddFaq(): void {
    this.isAddingFaq = false;
  }

  // Guardar la nueva pregunta
  saveNewFaq(): void {
    // Verifica si los campos están vacíos o tienen menos de 3 caracteres
    if (!this.newQuestion.trim() || !this.newAnswer.trim()) {
      this.uploadMessage = 'No se puede tener campos vacíos';
      this.isUploadSuccess = false;
      return;
    }

    if (this.newQuestion.length < 3 || this.newAnswer.length < 3) {
      this.uploadMessage = 'La pregunta y respuesta deben tener al menos 3 caracteres.';
      this.isUploadSuccess = false;
      return;
    }

    // Crear objeto de datos de la FAQ
    const faqData = { faq_question: this.newQuestion, faq_answer: this.newAnswer };
    this.faqsService.createFaq(this.categoryId, faqData).subscribe({
      next: (response) => {
        
        this.loadFaqs();
        this.isAddingFaq = false;
        this.uploadMessage = ''; // Limpia mensajes previos
      },
      error: (error) => {
        console.error('Error al agregar la pregunta:', error);
        // Mostrar mensaje de error si viene del backend
        if (error.error && error.error.message) {
          this.uploadMessage = error.error.message;
        } else {
          this.uploadMessage = 'Ocurrió un error al agregar la pregunta. Inténtalo de nuevo.';
        }
        this.isUploadSuccess = false;
      }
    });
  }

  // Cargar todas las categorías
  public loadCategories(): void {
    this.faqsService.getAllCategories().subscribe({
      next: (response) => {
        this.categories = Array.isArray(response.category) ? response.category : [response.category];
        
      },
      error: (error) => {
        console.error('Error al obtener las categorías:', error);
      }
    });
  }

  // Cargar FAQs de la categoría seleccionada
  public loadFaqs(): void {
    this.faqsService.getFaqsByCategory(this.categoryId).subscribe({
      next: (response) => {
        this.faqs = response.category.Faqs || [];
        this.filteredFaqs = this.faqs; // Inicializa `filteredFaqs` con todas las preguntas
       
      },
      error: (error) => {
        console.error('Error al cargar FAQs:', error);
      }
    });
  }

 // Método para normalizar texto removiendo acentos y convirtiendo a minúsculas
normalizeText(text: string): string {
  return text
    .toLowerCase() // Convertir a minúsculas
    .normalize("NFD") // Normalizar los caracteres Unicode
    .replace(/[\u0300-\u036f]/g, ""); // Remover diacríticos (acentos)
}

// Filtrar FAQs según el término de búsqueda
filterFaqs(): void {
  const normalizedSearchTerm = this.normalizeText(this.searchTerm);
  this.filteredFaqs = this.faqs.filter(faq =>
    this.normalizeText(faq.faq_question).includes(normalizedSearchTerm) ||
    this.normalizeText(faq.faq_answer).includes(normalizedSearchTerm)
  );
}

  // Métodos para manejar el modal de confirmación de eliminación
  prepareDeleteFaq(faqId: number): void {
    this.isDeletingFaq = true;
    this.faqToDeleteId = faqId;
  }

  cancelDelete(): void {
    this.isDeletingFaq = false;
    this.faqToDeleteId = null;
  }

  confirmDelete(): void {
    if (this.faqToDeleteId !== null) {
      this.faqsService.deleteFaq(this.faqToDeleteId, this.categoryId).subscribe({
        next: () => {
          
          this.loadFaqs();
          this.cancelDelete();
        },
        error: (error) => {
          console.error(`Error al eliminar la pregunta con ID ${this.faqToDeleteId}:`, error);
        }
      });
    }
  }

  // Cambiar el estado activo/inactivo de una FAQ
  toggleFaqStatus(faqId: number): void {
  
    this.faqsService.toggleFaqStatus(faqId, this.categoryId).subscribe({
      next: () => {
        const faq = this.faqs.find(f => f.id_faq === faqId);
        if (faq) {
          faq.is_active = !faq.is_active;
          
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado de la pregunta:', error);
      }
    });
  }

  // Abre el modal de edición y carga los datos de la pregunta seleccionada en `editedFaq`
  openEditFaqModal(faq: any): void {
    
    this.isEditingFaq = true;
    this.editedFaq = { 
      id_faq: faq.id_faq,
      faq_question: faq.faq_question,
      faq_answer: faq.faq_answer
    };
  }

  // Cierra el modal de edición sin guardar cambios
  cancelEditFaq(): void {
    this.isEditingFaq = false;
    this.editedFaq = { id_faq: null, faq_question: '', faq_answer: '' };
  }

  // Guarda los cambios realizados en la pregunta editada
  saveEditedFaq(): void {
    const { id_faq, faq_question, faq_answer } = this.editedFaq;

    // Llama al método updateFaq con cada campo como parámetro individual, usando `categoryId`
    this.faqsService.updateFaq(id_faq, faq_question, faq_answer, this.categoryId).subscribe({
      next: (response) => {
        
        this.loadFaqs(); // Recarga la lista de preguntas
        this.isEditingFaq = false; // Cierra el modal de edición
      },
      error: (error) => {
        console.error('Error al actualizar la pregunta:', error);
        alert('Ocurrió un error al actualizar la pregunta. Inténtalo de nuevo.');
      }
    });
  }

  // Reordenar FAQs con drag-and-drop
  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.faqs, event.previousIndex, event.currentIndex);

    const faqOrder = this.faqs.map((faq: any, index: number) => ({
      faq_id: faq.id_faq,
      importance: index + 1
    }));

    this.faqsService.reorderFaqs(this.categoryId, faqOrder).subscribe({
      
    });
  }

  // Descargar preguntas como Excel por categoría
  downloadExcelPorCategoria(): void {
    if (!this.categoryId) {
      console.warn('ID de categoría no disponible.');
      return;
    }

    this.faqsService.downloadFaqsByCategory(this.categoryId).subscribe(
      (response: Blob) => {
        const fechaHoy = new Date().toLocaleDateString('en-CA');
        const fileName = `FAQs_${fechaHoy}.xlsx`;
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error al descargar el Excel por categoría:', error);
      }
    );
  }

  // Abrir el modal para subir preguntas desde un archivo
  openUploadModal(): void {
    this.isUploadModalOpen = true;
    this.selectedFile = null;
    this.uploadMessage = ''; // Limpia mensajes al abrir el modal
    this.isUploadSuccess = false; // Reinicia el estado de éxito
  }
  

  closeUploadModal(): void {
    this.isUploadModalOpen = false;
    this.selectedFile = null;
    this.uploadMessage = ''; // Limpia el mensaje al cerrar el modal
    this.isUploadSuccess = false; // Reinicia el estado de éxito
  }
  

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.uploadMessage = ''; // Limpia mensajes al seleccionar un archivo nuevo
      this.isUploadSuccess = false; // Reinicia el estado de éxito
    }
  }
  

  uploadFile(): void {
    if (!this.selectedFile || !this.categoryId) return;
  
    this.faqsService.uploadFaqsByCategory(this.categoryId, this.selectedFile)
      .subscribe({
        next: () => {
          this.isUploadSuccess = true;
          this.uploadMessage = 'Preguntas subidas correctamente.';
          this.loadFaqs(); // Recargar FAQs si es necesario
          setTimeout(() => this.closeUploadModal(), 2000); // Cierra el modal tras 2 segundos
        },
        error: () => {
          this.isUploadSuccess = false;
          this.uploadMessage = 'Error al subir el archivo. Por favor, intenta nuevamente.';
        }
      });
  }
}  
