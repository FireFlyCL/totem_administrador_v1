import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit} from '@angular/core';
import { StatsService } from '../services/stats.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { BaseChartDirective } from 'ng2-charts';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Chart, registerables, ChartConfiguration, ChartData } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-stats-information',
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
  templateUrl: './stats-information.component.html',
  styleUrl: './stats-information.component.css'
})
export class StatsInformationComponent implements OnInit {
  // Referencias a los gráficos
  @ViewChild('barChart') barChart: BaseChartDirective | undefined;

  // Datos y configuraciones para los gráficos
  clickLogs: any[] = [];
  pieClickLogs: any[] = [];
  barClickLogs: any[] = [];
  infoClickCounts: { name: string, clicks: number }[] = [];
  startDate: string = '';
  endDate: string = '';
  searchLogs: any[] = [];
  searchLogsPage: number = 1;
  clickLogsPage: number = 1;
  totalClicks: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedInfo: { name: string, clicks: number }[] = [];
  searchLogsCurrentPage: number = 1;
  searchLogsItemsPerPage: number = 10;
  paginatedSearchLogs: any[] = [];
  

  // Configuraciones del gráfico de pastel
  
  // Configuraciones del gráfico de barras
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: '#FFB800',
        borderColor: '#FFB800'
      }
    ]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Cantidad de Clicks por Categoría',
        color: '#1A1A1A',
        font: {
          family: 'Merriweather',
          size: 20,
          weight: 'bold'
        },
        padding: {
          top: 20,
          bottom: 20
        }
      },
      datalabels: {
        anchor: 'end',
        align: 'right',
        color: '#1A1A1A',
        font: {
          family: 'Merriweather',
          weight: 'bold',
          size: 12
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 0,
        title: {
          display: true,
          text: 'Cantidad de Clicks',
          font: {
            family: 'Merriweather',
            size: 14
          }
        },
        ticks: {
          font: {
            family: 'Merriweather',
            size: 14
          }
        },
        grid: {
          display: false // Desactiva las líneas de la cuadrícula en el eje x
        }
      },
      y: {
        title: {
          display: true,
          text: 'Categoría',
          font: {
            family: 'Merriweather',
            size: 14
          }
        },
        ticks: {
          font: {
            family: 'Merriweather',
            size: 14
          }
        },
        grid: {
          display: false // Desactiva las líneas de la cuadrícula en el eje y
        }
      }
    }
  };
  

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

  // Llamar a los métodos para obtener datos con el filtro por defecto
  this.applyFilters();
    
    // Obtener datos iniciales para ambos gráficos
    this.getInfoGroupData();
    this.getBarChartData();
    this.getSearchLogs();
    
  }



// Función para obtener datos del gráfico de pastel
getInfoGroupData(): void {
  const startDateFormatted = this.setStartOfDay(this.startDate);
  const endDateFormatted = this.setEndOfDay(this.endDate);

  this.statsService.getClickLogs(startDateFormatted, endDateFormatted, 'information', 'category')
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
        console.error('Error al obtener los datos de colaboradores por grupo:', error);
      }
    );
}


  // Función para obtener datos del gráfico de barras
  getBarChartData(): void {
    const startDateFormatted = this.setStartOfDay(this.startDate);
    const endDateFormatted = this.setEndOfDay(this.endDate);
  
    this.statsService.getClickLogs(startDateFormatted, endDateFormatted, 'information', 'category')
      .subscribe(
        (response: any) => {
          this.barClickLogs = response.logs;
          this.updateBarChartData();
          this.cdr.detectChanges();
        },
        (error: any) => {
          console.error('Error al obtener los datos del gráfico de barras:', error);
        }
      );
  }

  calculateCategoryClicks(): void {
    const categoryLogs = this.barClickLogs.filter(log => log.selection === 'category');

  
    // Usa el número de registros como total
    this.totalClicks = categoryLogs.length;

  }
  
  

  // Actualizar datos y refrescar el gráfico de barras

  updateBarChartData(): void {
    const categoryCounts: { [key: string]: number } = {};
    
    this.barClickLogs.forEach(log => {
      const category = log.log_category_details;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });
  
    const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    const maxDataValue = Math.max(...sortedCategories.map(entry => entry[1]));
    const dynamicMax = Math.ceil(maxDataValue/6)*7;
  
    // Reassign the barChartData object
    this.barChartData = {
      labels: sortedCategories.map(entry => entry[0]),
      datasets: [
        {
          data: sortedCategories.map(entry => entry[1]),
          backgroundColor: '#FFB800',
          borderColor: '#FFFFFF'
        }
      ]
    };

    this.barChartOptions!.scales!['x']!.max = dynamicMax;
          // Refresca el gráfico para aplicar los cambios
        
        }
  
  formatName(name: string): string {
    return name.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
     }


    


 
// Método para ordenar los logs por fecha de la más reciente a la más antigua
  sortLogsByDate(): void {
    this.searchLogs.sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());
  }

  getSearchLogs(): void {
    const startDateFormatted = this.setStartOfDay(this.startDate);
    const endDateFormatted = this.setEndOfDay(this.endDate);
  
    this.statsService.getSearchLogs(startDateFormatted, endDateFormatted, 'information', 'search')
      .subscribe(
        (response: any) => {

  
          // Ordena los logs por fecha de forma descendente
          this.searchLogs = response.logs;
          this.sortLogsByDate(); // Ordena los logs después de obtenerlos
  
          // Agrupa por fecha, filtra términos mayores a 3 letras y cuenta ocurrencias
          const groupedLogs = this.aggregateSearchLogs(this.searchLogs);
  
          // Actualiza la paginación con los datos agrupados
          this.searchLogs = groupedLogs;
          this.updatePaginatedSearchLogs();
        },
        (error: any) => {
          console.error('Error al obtener los datos del registro de búsqueda:', error);
        }
      );
  }

  aggregateSearchLogs(logs: any[]): any[] {
    const groupedLogs: any = {};
  
    logs.forEach(log => {
      const date = new Date(log.log_date).toLocaleDateString(); // Formatea la fecha
      let term = log.log_category_details.toLowerCase(); // Convierte el término a minúsculas
      term = term.trim().replace(/\s+/g, ' '); // Elimina espacios adicionales
  
      // Filtrar términos con más de 3 letras
      if (term && term.length > 3) {
        if (!groupedLogs[date]) {
          groupedLogs[date] = {};
        }
        // Si ya existe el término en esa fecha, suma la cantidad
        groupedLogs[date][term] = (groupedLogs[date][term] || 0) + 1;
      }
    });
  
    // Convertir a un array de objetos agrupados y ordenar
    const result: any[] = [];
    Object.keys(groupedLogs).forEach(date => {
      // Ordena los términos dentro de cada fecha por la cantidad de búsquedas (descendente)
      const termsArray = Object.keys(groupedLogs[date]).map(term => ({
        date,
        term,
        count: groupedLogs[date][term]
      })).sort((a, b) => b.count - a.count);
  
      result.push(...termsArray);
    });
  
    // Ordena por fecha de manera descendente
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  

  // Validar formato de fecha
  isValidDate(date: string): boolean {
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    return regex.test(date);
  }

  // Aplicar filtros y actualizar ambos gráficos
  applyFilters(): void {
    this.getInfoGroupData();
    this.getBarChartData();
    this.getSearchLogs();
  }

  // Convertir fecha de 'DD-MM-YYYY' a 'YYYY-MM-DD'
  parseDate(date: string): string {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`;
  }

  formatDate(value: number): string {
    const date = new Date(value);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }



// Método para obtener la lista paginada de registros de búsqueda
updatePaginatedSearchLogs() {
  const start = (this.searchLogsCurrentPage - 1) * this.searchLogsItemsPerPage;
  const end = start + this.searchLogsItemsPerPage;
  this.paginatedSearchLogs = this.searchLogs.slice(start, end);
  
}

// Cambia a una página específica en searchLogs
goToSearchLogsPage(page: number) {
  this.searchLogsCurrentPage = page;
  this.updatePaginatedSearchLogs();
}

// Cambia a la siguiente página en searchLogs
nextSearchLogsPage() {
  if (this.searchLogsCurrentPage < this.searchLogsTotalPages) {
    this.searchLogsCurrentPage++;
    this.updatePaginatedSearchLogs();
  }
}

// Cambia a la página anterior en searchLogs
previousSearchLogsPage() {
  if (this.searchLogsCurrentPage > 1) {
    this.searchLogsCurrentPage--;
    this.updatePaginatedSearchLogs();
  }
}

// Calcula el total de páginas basado en el número de registros de búsqueda
get searchLogsTotalPages() {
  return Math.ceil(this.searchLogs.length / this.searchLogsItemsPerPage);
}

getDisplayedPages(totalPages: number, currentPage: number): number[] {
  const pages: number[] = [];
  const maxPagesToShow = 6;

  if (totalPages <= maxPagesToShow) {
    // Muestra todas las páginas si hay menos o igual a 5
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Siempre muestra la primera página
    pages.push(1);

    if (currentPage <= 3) {
      // Si la página actual está cerca del inicio, muestra las primeras 5 páginas
      for (let i = 2; i <= 5; i++) {
        pages.push(i);
      }
      pages.push(-1); // Representa "..."
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Si la página actual está cerca del final, muestra las últimas 5 páginas
      pages.push(-1); // Representa "..."
      for (let i = totalPages - 4; i < totalPages; i++) {
        pages.push(i);
      }
      pages.push(totalPages);
    } else {
      // Muestra páginas alrededor de la página actual
      pages.push(-1); // Representa "..."
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push(-1); // Representa "..."
      pages.push(totalPages);
    }
  }

  return pages;
}


  // Método para ajustar la fecha de inicio al comienzo del día (00:00:00) y sumar un día
  setStartOfDay(date: string): string {
    if (!date) return '';
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0); // Ajustar a las 00:00:00
    dateObj.setDate(dateObj.getDate() + 1); // Sumar un día
    return dateObj.toISOString();
  }

// Método para ajustar la fecha de fin al final del día (23:59:59)
setEndOfDay(date: string): string {
  if (!date) return '';
  const dateObj = new Date(date);
  dateObj.setHours(23, 59, 59, 999); // Ajustar a las 23:59:59
  dateObj.setDate(dateObj.getDate() + 1); // Sumar un día
  return dateObj.toISOString();


}

private formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Agregar cero si es necesario
  const day = date.getDate().toString().padStart(2, '0'); // Agregar cero si es necesario
  return `${year}-${month}-${day}`;
}


}


