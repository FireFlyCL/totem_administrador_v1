import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  userPermissions: any[] = [];  // Almacena los permisos detallados
  isProfileMenuOpen: boolean = false;  // Para controlar el menú desplegable de perfil
  isSidebarExpanded: boolean = false;  // Para controlar la expansión de la sidebar

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      // Cargar los detalles completos de los permisos
      this.userPermissions = JSON.parse(userDetails).permissionsDetails || [];
    }
  }

  /**
   * Verificar si el usuario tiene algún permiso relacionado con un módulo o si es administrador (ID 1).
   * @param moduleName - El nombre del módulo (e.g., 'users', 'collaborators').
   * @returns boolean - True si el usuario tiene algún permiso del módulo o es administrador.
   */
  hasPermission(moduleName: string): boolean {
    // Verificar si el usuario tiene algún permiso del módulo especificado o si es administrador (ID 1)
    return this.userPermissions.some(p => p.module === moduleName) ||
           this.userPermissions.some(p => p.id_permission === 1);  // ID 1 es el permiso de administrador
  }

  /**
   * Navegar a la ruta seleccionada.
   * @param route - La ruta a la que se desea navegar.
   */
  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  /**
   * Cerrar sesión y redirigir al login.
   */
  logout(): void {
    this.authService.logout().subscribe(
      () => {
        this.router.navigate(['/login']);
      },
      (error: any) => {
        console.error('Logout failed', error);
      }
    );
  }

  /**
   * Alternar el menú del perfil (mostrar/ocultar).
   */
  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  /**
   * Expandir la sidebar cuando el mouse está sobre ella.
   * @param expand - Si es true, la sidebar se expande.
   */
  toggleSidebar(expand: boolean): void {
    this.isSidebarExpanded = expand;
    if(!expand){
      this.isProfileMenuOpen = false;
    }
  }
}
