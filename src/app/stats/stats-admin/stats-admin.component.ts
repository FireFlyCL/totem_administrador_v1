import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StatsService } from '../services/stats.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-stats-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './stats-admin.component.html',
  styleUrls: ['./stats-admin.component.css']
})
export class StatsAdminComponent implements OnInit {
  adminLogs: any[] = []; // Logs originales del administrador
  filteredLogs: any[] = []; // Logs filtrados según los criterios
  paginatedLogs: any[] = []; // Logs paginados
  startDate: string = ''; // Fecha de inicio para el filtro
  endDate: string = ''; // Fecha de fin para el filtro
  actionType: string = ''; // Tipo de acción para el filtro
  componentType: string = ''; // Componente para el filtro
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 10; // Elementos por página

  constructor(private statsService: StatsService, private cdr: ChangeDetectorRef, private location: Location) {}

  goBack(): void {
    this.location.back(); // Navega a la página anterior
  }

  ngOnInit(): void {
    // Establecer las fechas iniciales: del primer día del mes actual hasta hoy
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.startDate = this.formatDateInput(firstDayOfMonth); // Formato YYYY-MM-DD
    this.endDate = this.formatDateInput(today);

    // Obtener logs iniciales
    this.getAdminLogs();
  }

  // Obtener logs de administrador con filtros aplicados
  getAdminLogs(): void {
    const startDateAdjusted = this.setStartOfDay(this.startDate);
    const endDateAdjusted = this.setEndOfDay(this.endDate);

    this.statsService.getAdminLogs(this.actionType, '', '', '', '', startDateAdjusted, endDateAdjusted)
      .subscribe(
        (response: any) => {
          this.adminLogs = response.logs;
          this.filteredLogs = [...this.adminLogs]; // Inicializa los logs filtrados
          this.sortLogsByDate(); // Ordenar por fecha descendente
          this.updatePaginatedLogs();
  
        },
        (error: any) => {
          console.error('Error al obtener los logs de administrador:', error);
        }
      );
  }

  // Método para aplicar los filtros
  applyFilters(): void {
    const searchAction = this.actionType.toLowerCase();
    const searchComponent = this.componentType.toLowerCase();

    const startDateAdjusted = this.setStartOfDay(this.startDate); // Usar fechas ajustadas
    const endDateAdjusted = this.setEndOfDay(this.endDate);

    // Filtrar los logs respetando las fechas ajustadas
    this.filteredLogs = this.adminLogs.filter(log =>
      (!searchAction || log.log_action.toLowerCase().includes(searchAction)) &&
      (!searchComponent || log.log_component.toLowerCase().includes(searchComponent)) &&
      (new Date(log.log_date) >= new Date(startDateAdjusted)) &&
      (new Date(log.log_date) <= new Date(endDateAdjusted))
    );

    this.sortLogsByDate(); // Ordena los logs después de filtrar
    this.currentPage = 1; // Reinicia la página actual
    this.updatePaginatedLogs(); // Actualiza los datos paginados
  }

  // Ordenar logs por fecha (de más reciente a más antigua)
  sortLogsByDate(): void {
    this.filteredLogs.sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
  }

  // Actualizar los datos paginados
  updatePaginatedLogs(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedLogs = this.filteredLogs.slice(start, end);
  }

  // Cambiar a una página específica
  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedLogs();
  }

  // Cambiar a la página siguiente
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedLogs();
    }
  }

  // Cambiar a la página anterior
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedLogs();
    }
  }

  // Obtener el total de páginas
  get totalPages(): number {
    return Math.ceil(this.filteredLogs.length / this.itemsPerPage);
  }

  // Obtener las páginas visibles para la paginación
  getDisplayedPages(totalPages: number, currentPage: number): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 6;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(-1);
        for (let i = totalPages - 4; i < totalPages; i++) {
          pages.push(i);
        }
        pages.push(totalPages);
      } else {
        pages.push(-1);
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  }

  // Ajustar fecha de inicio al comienzo del día y sumar un día más
  setStartOfDay(date: string): string {
    if (!date) return '';
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    dateObj.setDate(dateObj.getDate() + 1);
    return dateObj.toISOString();
  }

  // Ajustar fecha de fin al final del día y sumar un día más
  setEndOfDay(date: string): string {
    if (!date) return '';
    const dateObj = new Date(date);
    dateObj.setHours(23, 59, 59, 999);
    dateObj.setDate(dateObj.getDate() + 1);
    return dateObj.toISOString();
  }

  // Formatear fecha en formato YYYY-MM-DD
  private formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }



  resetFilters(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
    this.startDate = this.formatDateInput(firstDayOfMonth); // Restablecer al primer día del mes
    this.endDate = this.formatDateInput(today); // Restablecer a la fecha actual
    this.actionType = ''; // Limpiar el filtro de acción
    this.componentType = ''; // Limpiar el filtro de componente
  
    this.getAdminLogs(); // Recargar los logs iniciales
  }

  
}
