import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { StatsService } from '../services/stats.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartConfiguration, ChartData } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-stats-global',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, BaseChartDirective],
  templateUrl: './stats-global.component.html',
  styleUrls: ['./stats-global.component.css']
})
export class StatsGlobalComponent implements OnInit {
  @ViewChild('lineChart') lineChart: BaseChartDirective | undefined;

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            family: 'Merriweather',
            weight: 'bold',
            size: 14
          },
          color: '#000000'
        }
      },
      title: {
        display: true,
        text: 'Visitas por Categoría',
        font: {
          family: 'Merriweather',
          weight: 'bold',
          size: 20
        },
        color: '#000000'
      },
      tooltip: {
        enabled: true
      },
      datalabels: {
        display: false
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tiempo',
          font: {
            family: 'Merriweather',
            weight: 'bold',
            size: 14
          },
          color: '#000000'
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            family: 'Merriweather',
            weight: 'bold',
            size: 12
          },
          color: '#000000'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Visitas',
          font: {
            family: 'Merriweather',
            weight: 'bold',
            size: 14
          },
          color: '#000000'
        },
        ticks: {
          font: {
            family: 'Merriweather',
            weight: 'bold',
            size: 12
          },
          color: '#000000'
        }
      }
    }
  };

  startDate: string = '';
  endDate: string = '';
  totalClicks: number = 0;
  clickLogs: any[] = [];

  constructor(
    private statsService: StatsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.startDate = this.formatDateInput(firstDayOfMonth);
    this.endDate = this.formatDateInput(today);

    this.applyFilters();
  }

  applyFilters(): void {
    this.getClickLogsForLineChart();
  }

  getClickLogsForLineChart(): void {
    const startDateFormatted = this.setStartOfDay(this.startDate);
    const endDateFormatted = this.setEndOfDay(this.endDate);

    this.statsService
      .getClickLogs(startDateFormatted, endDateFormatted, 'home', 'visit')
      .subscribe(
        (response: any) => {
          this.clickLogs = response.logs;
          console.log('Datos obtenidos:', this.clickLogs);
          this.totalClicks = this.clickLogs.length;
          this.updateLineChartData();
        },
        (error: any) => {
          console.error('Error al obtener los datos del gráfico de líneas:', error);
        }
      );
  }

  updateLineChartData(): void {
    const categoryCounts: { [key: string]: { [key: string]: number } } = {};

    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);

    const groupByMonth = dayDiff > 31;

    this.clickLogs.forEach((log: any) => {
      const date = new Date(log.log_date);
      const category = log.log_category_details;

      if (!categoryCounts[category]) {
        categoryCounts[category] = {};
      }

      let key: string;

      if (groupByMonth) {
        // Agrupar por mes y año
        key = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}`;
      } else {
        // Agrupar por día
        key = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      }

      categoryCounts[category][key] = (categoryCounts[category][key] || 0) + 1;
    });

    let labels: string[];

    if (groupByMonth) {
      // Generar labels por mes
      labels = this.generateMonthRange(this.startDate, this.endDate);
    } else {
      // Generar labels por día
      labels = this.generateDateRange(this.startDate, this.endDate);
    }

    const datasets = Object.keys(categoryCounts).map(category => ({
      label: this.getTranslatedCategory(category),
      data: labels.map(label => categoryCounts[category][label] || 0),
      borderColor: this.getCategoryColor(category),
      backgroundColor: this.getCategoryBackgroundColor(category),
      fill: false,
      tension: 0.3
    }));

    this.lineChartData = {
      labels: labels.map(label => {
        if (groupByMonth) {
          // Formatear labels de mes
          return this.formatMonthLabel(label);
        } else {
          return label;
        }
      }),
      datasets: datasets
    };
  }

  private generateDateRange(startDateStr: string, endDateStr: string): string[] {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const dateArray = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateArray.push(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dateArray;
  }

  private generateMonthRange(startDateStr: string, endDateStr: string): string[] {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const months = [];
    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (currentDate <= endDate) {
      const monthStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      months.push(monthStr);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  }

  private formatMonthLabel(month: string): string {
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[parseInt(monthNum, 10) - 1]} ${year}`;
  }

  private getCategoryColor(category: string): string {
    switch (category.toLowerCase()) {
      case 'collaborators':
        return '#FFB800';
      case 'faqs':
        return '#008FFB';
      case 'news':
        return '#FF4560';
      case 'informations':
        return '#00E396';
      case 'maps':
        return '#775DD0';
      default:
        return '#999999';
    }
  }

  private getCategoryBackgroundColor(category: string): string {
    switch (category.toLowerCase()) {
      case 'collaborators':
        return 'rgba(255, 184, 0, 0.2)';
      case 'faqs':
        return 'rgba(0, 143, 251, 0.2)';
      case 'news':
        return 'rgba(255, 69, 96, 0.2)';
      case 'informations':
        return 'rgba(0, 227, 150, 0.2)';
      case 'maps':
        return 'rgba(119, 93, 208, 0.2)';
      default:
        return 'rgba(153, 153, 153, 0.2)';
    }
  }

  private getTranslatedCategory(category: string): string {
    switch (category.toLowerCase()) {
      case 'collaborators':
        return 'Colaboradores';
      case 'faqs':
        return 'Preguntas Frecuentes';
      case 'news':
        return 'Noticias';
      case 'informations':
        return 'Información';
      case 'maps':
        return 'Mapas';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }

  private formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private setStartOfDay(date: string): string {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0); // Establece el inicio del día
    return dateObj.toISOString();
  }

  private setEndOfDay(date: string): string {
    const dateObj = new Date(date);
    dateObj.setHours(23, 59, 59, 999); // Establece el final del día
    return dateObj.toISOString();
  }

  hasPermission(permissionId: number, categoryId?: number | null): boolean {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const currentUserPermissions = JSON.parse(userDetails).permissionsDetails;

      if (categoryId) {
        return currentUserPermissions.some(
          (p: any) =>
            (p.id_permission === permissionId && p.faq_category?.id_faq_category === categoryId) ||
            p.id_permission === 1 ||
            p.id_permission === 4
        );
      } else {
        return currentUserPermissions.some(
          (p: any) =>
            p.id_permission === permissionId || p.id_permission === 1 || p.id_permission === 4
        );
      }
    }
    return false;
  }

  goToAdmin() {
    this.router.navigate(['/stats/admin']);
  }

  goToCollaborator() {
    this.router.navigate(['/stats/collaborator']);
  }

  goToFaqs() {
    this.router.navigate(['/stats/faqs']);
  }

  goToInformation() {
    this.router.navigate(['/stats/information']);
  }

  goToMaps() {
    this.router.navigate(['/stats/maps']);
  }

  goToNews() {
    this.router.navigate(['/stats/news']);
  }
}
