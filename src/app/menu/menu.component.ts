import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  userPermissions: any[] = [];  // Arreglo para los permisos detallados

  constructor(private router: Router) {}

  ngOnInit(): void {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      // Cargar los detalles completos de los permisos
      this.userPermissions = JSON.parse(userDetails).permissionsDetails || [];
    }
  }

  /**
   * Verificar si el usuario tiene algún permiso relacionado con un módulo específico o si es administrador (ID 1).
   * @param moduleName - El nombre del módulo (e.g., 'users', 'collaborators').
   * @returns boolean - True si el usuario tiene algún permiso del módulo o es administrador.
   */
  hasPermission(moduleName: string): boolean {
    // Verificar si el usuario tiene algún permiso del módulo especificado o es administrador (ID 1)
    return this.userPermissions.some(p => p.module === moduleName) ||
           this.userPermissions.some(p => p.id_permission === 1);  // ID 1 es el permiso de administrador
  }

  /**
   * Obtener todos los permisos relacionados con un módulo específico.
   * @param moduleName - El nombre del módulo (e.g., 'users', 'collaborators').
   * @returns string[] - Lista de permisos relacionados con el módulo.
   */
  getPermissionsFor(moduleName: string): string[] {
    const relatedPermissions = this.userPermissions
      .filter(p => p.module === moduleName)  // Filtrar permisos por módulo
      .map(p => p.permission_name);  // Devolver solo los nombres de los permisos

    // Si el usuario es administrador (ID 1), agregarlo a la lista de permisos
    if (this.userPermissions.some(p => p.id_permission === 1)) {
      relatedPermissions.push('Global: Administrador');
    }

    return relatedPermissions;
  }

  /**
   * Navegar a la ruta seleccionada.
   * @param route - La ruta a la que se desea navegar.
   */
  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}
