import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { StatsService } from '../services/stats.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { BaseChartDirective } from 'ng2-charts';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, registerables, ChartConfiguration, ChartData } from 'chart.js';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-stats-news',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    BaseChartDirective,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule
  ],
  templateUrl: './stats-news.component.html',
  styleUrls: ['./stats-news.component.css']
})
export class StatsNewsComponent implements OnInit {
  @ViewChild('barChart') barChart: BaseChartDirective | undefined;

  // Variables para los gráficos y datos
  pieClickLogs: any[] = [];
  clickLogs: any[] = [];
  startDate: string = '';
  endDate: string = '';
  totalClicks: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedClicks: { date: string, clicks: number }[] = [];
  paginatedClickLogs: any[] = []; // Array paginado
  clickLogsPage: number = 1;
  newsClickCounts: { name: string, clicks: number }[] = []; // Lista de noticias con clics
  minDate: Date | null = null; // Fecha mínima para los filtros
  maxDate: Date | null = null; // Fecha máxima para los filtros
  errorMessage: string = ''; // Variable para el mensaje de error




  barChartData: ChartData<'bar'> = {
    labels: [], // Las fechas se cargarán dinámicamente
    datasets: [
      {
        data: [], // Los valores de clics se cargarán dinámicamente
        label: 'Clics por Día',
        backgroundColor: '#FFB800', // Color de las barras
        borderColor: '#FFA000', // Color del borde de las barras
        borderWidth: 1, // Grosor del borde
        hoverBackgroundColor: '#FFC107', // Color al pasar el mouse
        hoverBorderColor: '#FF9800' // Borde al pasar el mouse
      }
    ]
  };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false, // Permite ajustar la relación de aspecto
    layout: {
      padding: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            family: 'Merriweather',
            size: 16, // Aumenta el tamaño de la fuente de la leyenda
            weight: 'bold'
          },
          color: '#1A1A1A'
        }
      },
      title: {
        display: true,
        text: 'Clics por Día en Noticias',
        font: {
          size: 22, // Aumenta el tamaño del título
          weight: 'bold',
          family: 'Merriweather'
        },
        color: '#1A1A1A',
      },
      datalabels: {
        display: false, // Desactiva las etiquetas de datos
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Fecha',
          font: {
            family: 'Merriweather',
            size: 16, // Aumenta el tamaño de la fuente del título del eje X
            weight: 'bold'
          },
          color: '#1A1A1A'
        },
        ticks: {
          font: {
            size: 14, // Aumenta el tamaño de las etiquetas del eje X
            weight: 'bold',
            family: 'Merriweather'
          },
          color: '#1A1A1A',
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false
        },
      },
      y: {
        beginAtZero: true,
        grace: '10%',
        title: {
          display: true,
          text: 'Cantidad de Clics',
          font: {
            family: 'Merriweather',
            size: 12, // Aumenta el tamaño del título del eje Y
            weight: 'bold'
          },
          color: '#1A1A1A'
        },
        ticks: {
          font: {
            size: 12, // Aumenta el tamaño de las etiquetas del eje Y
            weight: 'bold',
            family: 'Merriweather'
          },
          color: '#1A1A1A'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };
  

  
  
  
  
  
  
  constructor(private statsService: StatsService, private cdr: ChangeDetectorRef, private location: Location) {}

  goBack(): void {
    this.location.back();
  }


  ngOnInit(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);

    this.startDate = this.formatDateInput(firstDayOfMonth);
    this.endDate = this.formatDateInput(today);
    this.minDate = twoMonthsAgo; // Fecha mínima permitida
    this.maxDate = today; // Fecha máxima permitida

    this.applyFilters();
  }

  applyFilters(): void {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  
    // Validar el rango de fechas
    if (diffMonths > 2) {
      this.errorMessage = 'El rango de fechas no puede ser mayor a 2 meses.';
      return;
    }
  
    // Si no hay errores, limpiar el mensaje y aplicar filtros
    this.errorMessage = '';
    this.getBarChartData();
    this.getClickLogsForTable();
    this.getInfoGroupData();
  }
  

  getBarChartData(): void {
    const startDateFormatted = this.setStartOfDay(this.startDate);
    const endDateFormatted = this.setEndOfDay(this.endDate);

    this.statsService.getClickLogs(startDateFormatted, endDateFormatted, 'news', 'follow')
      .subscribe(
        (response: any) => {
          const logs = response.logs || [];
          const clicksByDate: { [key: string]: number } = {};

          logs.forEach((log: any) => {
            const date = new Date(log.log_date).toLocaleDateString();
            clicksByDate[date] = (clicksByDate[date] || 0) + 1;
          });

          const sortedDates = Object.keys(clicksByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
          this.barChartData.labels = sortedDates;
          this.barChartData.datasets[0].data = sortedDates.map(date => clicksByDate[date]);
          this.cdr.detectChanges();
        },
        (error: any) => {
          console.error('Error al obtener los datos del gráfico:', error);
        }
      );
  }

  updateBarChartData(): void {
    const startDateFormatted = this.setStartOfDay(this.startDate);
    const endDateFormatted = this.setEndOfDay(this.endDate);
  
    this.statsService.getClickLogs(startDateFormatted, endDateFormatted, 'news', 'follow') // Cambié 'post' por 'follow'
      .subscribe(
        (response: any) => {
          const clicksByDate: { [key: string]: number } = {};
          const logs = response.logs || [];
  
          logs.forEach((log: any) => {
            const date = new Date(log.log_date).toLocaleDateString();
            clicksByDate[date] = (clicksByDate[date] || 0) + 1;
          });
  
          const sortedDates = Object.keys(clicksByDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
          // Actualizar los datos del gráfico de barras
          this.barChartData.labels = sortedDates;
          this.barChartData.datasets[0].data = sortedDates.map(date => clicksByDate[date]);
  
          // Forzar detección de cambios
          this.cdr.detectChanges();
        },
        (error: any) => {
          console.error('Error al actualizar los datos del gráfico de barras:', error);
        }
      );
  }
  


  getInfoGroupData(): void {
    const startDateFormatted = this.setStartOfDay(this.startDate);
    const endDateFormatted = this.setEndOfDay(this.endDate);
  
    this.statsService.getClickLogs(startDateFormatted, endDateFormatted, 'news', 'follow')
      .subscribe(
        (response: any) => {

          if (response && response.logs) {
            this.pieClickLogs = response.logs;
            this.calculateCategoryClicks();
            this.cdr.detectChanges();
          } else {
            console.warn('El response no contiene logs:', response);
            this.pieClickLogs = []; // Evita errores posteriores
          }
        },
        (error: any) => {
          console.error('Error al obtener los datos de clics por grupo:', error);
        }
      );
  }
  
  calculateCategoryClicks(): void {
    const categoryLogs = this.pieClickLogs.filter(log => log.selection === 'follow');

  
    // Usa el número de registros como total
    this.totalClicks = categoryLogs.length;

  }
  
  calculateNewsClickCounts(): void {
    const newsClickCounts: { [key: string]: number } = {};
  
    // Verificar si clickLogs contiene datos
    if (!this.clickLogs || this.clickLogs.length === 0) {
      console.warn('No hay datos en clickLogs para calcular.');
      this.paginatedClickLogs = []; // Asegurarse de limpiar la tabla
      return;
    }
  
    // Agrupa clics por título de la noticia
    this.clickLogs.forEach(log => {
      const newsTitle = log.log_category_details; // Título de la noticia
  
      // Validar datos antes de procesar
      if (!newsTitle) {
        console.warn('Log con datos inválidos:', log);
        return;
      }
  
      // Incrementar el contador de clics
      newsClickCounts[newsTitle] = (newsClickCounts[newsTitle] || 0) + 1;
    });
  
    // Convierte el objeto en un array y ordena por clics
    this.newsClickCounts = Object.keys(newsClickCounts).map(title => ({
      name: title, // Cambiar clave a "name"
      clicks: newsClickCounts[title],
    })).sort((a, b) => b.clicks - a.clicks);
  

  
    // Actualiza la paginación
    this.updatePaginatedNews();
  }
  
  
  getClickLogsForTable(): void {
    const startDateFormatted = this.setStartOfDay(this.startDate);
    const endDateFormatted = this.setEndOfDay(this.endDate);
  
    this.statsService.getClickLogs(startDateFormatted, endDateFormatted, 'news', 'follow')
      .subscribe(
        (response: any) => {
        
  
          // Validar si logs existen y tienen datos
          if (!response.logs || response.logs.length === 0) {
            console.warn('No se encontraron logs en la respuesta.');
            this.clickLogs = [];
            this.newsClickCounts = [];
            this.updatePaginatedNews(); // Actualiza la vista para reflejar la ausencia de datos
            return;
          }
  
          // Mapear los logs directamente
          this.clickLogs = response.logs.map((log: any) => ({
            log_category_details: log.log_category_details, // Nombre de la noticia
          }));
  

  
          this.calculateNewsClickCounts(); // Calcula los clics por noticia
        },
        (error: any) => {
          console.error('Error al obtener los logs de clics:', error);
        }
      );
  }
  
  updatePaginatedNews(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedClickLogs = this.newsClickCounts.slice(start, end); // Usa los clics por noticia para paginar
  }
  
  // Cambiar a la página anterior
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedNews();
    }
  }
  
  // Cambiar a la página siguiente
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedNews();
    }
  }
  
  // Cambiar a una página específica
  goToPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedNews();
    }
  }
  
  // Obtener el número total de páginas
  get totalPages(): number {
    return Math.ceil(this.newsClickCounts.length / this.itemsPerPage);
  }
  
  // Mostrar páginas en la paginación
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
  

  validateDateRange(): void {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
  
    const differenceInMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  
    if (differenceInMonths > 2) {

      this.endDate = ''; // Limpia la fecha de fin para que el usuario corrija
    }
  }
  




  setStartOfDay(date: string): string {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);
    dateObj.setDate(dateObj.getDate() + 1); // Sumar un día
    return dateObj.toISOString();
  }

  setEndOfDay(date: string): string {
    const dateObj = new Date(date);
    dateObj.setHours(23, 59, 59, 999);
    dateObj.setDate(dateObj.getDate() + 1); // Sumar un día
    return dateObj.toISOString();
  }

  formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
