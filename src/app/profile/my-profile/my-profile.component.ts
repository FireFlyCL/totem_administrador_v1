import { Component, OnInit } from '@angular/core';
import { MyUserService } from '../services/my-user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css'],
  imports: [CommonModule]
})
export class MyProfileComponent implements OnInit {
  userPermissions: any[] = [];  // Permisos con detalles de módulos y categorías
  categorizedPermissions: { [key: string]: any[] } = {}; // Permisos categorizados por módulo
  modules: string[] = []; // Lista de módulos para usar en la plantilla

  constructor(private myUserService: MyUserService) {}

  ngOnInit(): void {
    this.loadPermissions();
  }

  /**
   * Cargar los permisos del usuario desde el servicio.
   */
  loadPermissions(): void {
    this.myUserService.getMyPermissions().subscribe(
      (response) => {
        if (response && response.permissions) {
          this.userPermissions = response.permissions; // Cargar permisos con detalles
          this.categorizePermissions();
        }
      }
    );
  }

  /**
   * Categorizar los permisos por módulo.
   */
  categorizePermissions(): void {
    if (this.userPermissions && this.userPermissions.length > 0) {
      this.userPermissions.forEach(permission => {
        const module =  this.getSpanishModuleName(permission.module) || 'Otros'; // Categorizar por módulo, 'Otros' si no tiene módulo
        if (!this.categorizedPermissions[module]) {
          this.categorizedPermissions[module] = [];
        }
        this.categorizedPermissions[module].push(permission);
      });
      // Obtener la lista de módulos para usarse en la plantilla
      this.modules = Object.keys(this.categorizedPermissions);
    }
  }

  /**
   * Obtener el color basado en el nombre del permiso.
   * @param permission - Detalles del permiso.
   * @returns Color asociado al permiso.
   */
  getPermissionColor(permission: any): string {
    switch (permission.module) {
      case 'global': return 'gold';
      case 'users': return 'yellow';
      case 'permissions': return 'red';
      case 'news': return 'blue';
      case 'maps': return 'orange';
      case 'faqs': return 'grey';
      case 'stats': return 'beige';
      case 'collaborators': return 'pink';
      case 'information': return 'green';
      default: return 'lightgrey'; // Color por defecto
    }
  }
  // Function to get the module name in Spanish
  getSpanishModuleName(module: string): string {
    switch (module) {
      case 'global': return 'Global';
      case 'users': return 'Usuarios';
      case 'permissions': return 'Permisos';
      case 'news': return 'Noticias';
      case 'maps': return 'Mapas';
      case 'faqs': return 'FAQs';
      case 'stats': return 'Estadísticas';
      case 'collaborators': return 'Colaboradores';
      case 'information': return 'Información';
      default: return 'Otros'; // Default for any undefined module
    }
  }
}
