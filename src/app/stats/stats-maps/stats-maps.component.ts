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
  selector: 'app-stats-maps',
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
  templateUrl: './stats-maps.component.html',
  styleUrl: './stats-maps.component.css'
})
export class StatsMapsComponent implements OnInit {
  // Referencias a los gráficos
  @ViewChild('barChart') barChart: BaseChartDirective | undefined;

  // Datos y configuraciones para los gráficos
// Datos y configuraciones para los gráficos
mostSelectedLocation: string = ''; // Para almacenar la ubicación más seleccionada
clickLogs: any[] = []; // Array para almacenar los logs de clics en la tabla
barClickLogs: any[] = []; // Logs específicos para el gráfico de barras
mapClickCounts: { location: string, clicks: number }[] = []; // Clics agrupados por ubicación
startDate: string = ''; // Fecha de inicio del filtro
endDate: string = ''; // Fecha de fin del filtro
totalClicks: number = 0; // Total de clics
currentPage: number = 1; // Página actual para la tabla
itemsPerPage: number = 10; // Cantidad de elementos por página
paginatedMaps: { location: string, clicks: number }[] = []; // Lista paginada de ubicaciones clickeadas

 
  
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
 
    this.getBarChartData();
    this.getClickLogsForTable();

    
  }

  cleanCategoryDetails(logCategoryDetails: string): string {
    if (logCategoryDetails.toLowerCase().includes('sede principal')) {
      return 'Sede Principal';
    } else if (logCategoryDetails.toLowerCase().includes('edificio boulevard')) {
      return 'Edificio Boulevard';
    } else {
      return logCategoryDetails; // Devuelve el valor original si no coincide con las categorías esperadas
    }
  }


// Función para obtener datos del gráfico de barras
getBarChartData(): void {
  const startDateFormatted = this.setStartOfDay(this.startDate);
  const endDateFormatted = this.setEndOfDay(this.endDate);

  this.statsService.getClickLogs(startDateFormatted, endDateFormatted, 'maps', 'map_change')
    .subscribe(
      (response: any) => {
        // Limpieza y filtrado de los logs
        const filteredLogs = response.logs
          .map((log: any) => ({
            ...log,
            log_category_details: this.cleanCategoryDetails(log.log_category_details),
          }))
          .filter((log: any) =>
            log.log_category_details === 'Sede Principal' || log.log_category_details === 'Edificio Boulevard'
          );

        this.barClickLogs = filteredLogs;
        this.updateBarChartData(); // Actualiza el gráfico de barras
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error('Error al obtener los datos del gráfico de barras:', error);
      }
    );
  }

  // Actualizar datos y refrescar el gráfico de barras

  updateBarChartData(): void {
    const categoryCounts: { [key: string]: number } = {};
  
    // Cuenta los clics agrupados por categoría
    this.barClickLogs.forEach(log => {
      const category = log.log_category_details;
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });
  
    // Ordenar las categorías por la cantidad de clics de forma descendente
    const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  
    // Calcula el valor máximo dinámico para la escala del eje X
    const maxDataValue = Math.max(...sortedCategories.map(entry => entry[1]));
    const dynamicMax = Math.ceil(maxDataValue / 6) * 7;
  
    // Asigna los datos al gráfico
    this.barChartData = {
      labels: sortedCategories.map(entry => entry[0]), // Categorías: "Sede Principal", "Edificio Boulevard"
      datasets: [
        {
          data: sortedCategories.map(entry => entry[1]), // Cantidad de clics por categoría
          backgroundColor: ['#FFB800'], // Colores personalizados para las barras
          borderColor: '#FFFFFF',
          borderWidth: 2
        }
      ]
    };
  
    // Actualiza el valor máximo dinámico del eje X
    if (this.barChartOptions?.scales) {
      this.barChartOptions.scales['x']!.max = dynamicMax;
    }
  
    // Refresca el gráfico para reflejar los cambios
    this.cdr.detectChanges();
  }
  
  



// Método para calcular las ubicaciones más seleccionadas
calculateMapClickCounts(): void {
  const categoryCounts: { [key: string]: number } = {};

  // Agrupar clics por ubicación
  this.barClickLogs.forEach(log => {
    const location = log.log_category_details; // Ubicación específica
    if (location) {
      categoryCounts[location] = (categoryCounts[location] || 0) + 1;
    }
  });

  // Convertir a un array ordenado por clics descendente
  this.mapClickCounts = Object.keys(categoryCounts).map(key => ({
    location: key,
    clicks: categoryCounts[key]
  })).sort((a, b) => b.clicks - a.clicks);



  // Actualizar la lista paginada
  this.updatePaginatedMaps();
}

 
// Obtener los logs de clics para el gráfico y tabla
getClickLogsForTable(): void {
  const startDateFormatted = this.setStartOfDay(this.startDate);
  const endDateFormatted = this.setEndOfDay(this.endDate);

  this.statsService.getClickLogs(startDateFormatted, endDateFormatted, 'maps', 'map_change')
    .subscribe(
      (response: any) => {
        this.barClickLogs = response.logs;
        this.calculateMapClickCounts(); // Procesar los datos para el gráfico y la tabla
        this.totalClicks = this.barClickLogs.length; // Actualizar el total de clics
    
      },
      (error: any) => {
        console.error('Error al obtener los logs de clics:', error);
      }
    );
}

  

  // Validar formato de fecha
  isValidDate(date: string): boolean {
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    return regex.test(date);
  }

  // Aplicar filtros y actualizar ambos gráficos
  applyFilters(): void {
    this.getBarChartData();
    this.getClickLogsForTable();

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




// Método para actualizar la lista paginada de ubicaciones clickeadas
updatePaginatedMaps(): void {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  const end = start + this.itemsPerPage;
  this.paginatedMaps = this.mapClickCounts.slice(start, end); // Selecciona el rango de datos paginados
 
}

  // Cambia a una página específica
  goToPage(page: number) {
    this.currentPage = page;
    this.updatePaginatedMaps();
  }

  // Cambia a la siguiente página
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedMaps();
    }
  }

  // Cambia a la página anterior
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedMaps();
    }
  }

  // Calcula el total de páginas basado en el número de colaboradores
  get totalPages() {
    return Math.ceil(this.calculateMapClickCounts.length / this.itemsPerPage);
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


