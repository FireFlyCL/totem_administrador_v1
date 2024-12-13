import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interface para cada permiso individual
export interface Permission {
  permission_id: number;
  permission_name: string;
  permission_details: string;
  id_faq_category: number | null;
  id_collaborator_category: number | null;
  id_info: number | null;
  hasPermission: boolean;
}

// Interface para un módulo que contiene permisos
export interface ModulePermissions {
  module: string;
  description: string;
  columns: string[];
  permissions?: { [key: string]: Permission };
  rows?: Array<{ category_name?: string; information_title?: string; permissions: { [key: string]: Permission } }>;
  isModular: boolean;
  isExpanded: boolean;
}

@Component({
  selector: 'app-edit-user-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-user-permissions.component.html',
  styleUrls: ['./edit-user-permissions.component.css']
})
export class EditUserPermissionsComponent implements OnInit {
  userId: number = 0;
  modules: ModulePermissions[] = [];
  isAdminUser: boolean = false; // Variable para saber si el usuario es administrador
  errorMessage: string = '';
  loading: boolean = false;
  successMessage: string = '';
  showSuccessMessage: boolean = false;
  displayUsername: string = '';

  constructor(
    private route: ActivatedRoute,
    private permissionService: PermissionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.userId = Number(params.get('userId'));
    });

    // Capturar el username desde los query params
    this.route.queryParams.subscribe((queryParams) => {
      const username = queryParams['username'];
      if (username) {
        this.displayUsername = username;
      }
    });

    // Verificar si el usuario tiene permisos de administrador
    this.checkAdminPermissions();

    if (this.userId) {
      this.loadPermissions();
    }
  }

  // Verificar si el usuario tiene permisos de administrador (permiso 1 o 3)
  checkAdminPermissions(): void {
    const userDetails = localStorage.getItem('userDetails');
    
    if (userDetails) {
      const currentUserPermissions = JSON.parse(userDetails).permissionsDetails;
      // Verificar si el usuario tiene el id_permission 1 o 3
      this.isAdminUser = currentUserPermissions.some(
        (p: any) => p.id_permission === 1 || p.id_permission === 3
      );
    }
  }

  // Verificar si el usuario tiene un permiso específico por ID
  hasPermission(permissionId: number): boolean {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const currentUserPermissions = JSON.parse(userDetails).permissionsDetails;

      // Buscar el permiso por id_permission
      return currentUserPermissions.some((p: any) => p.id_permission === permissionId)||this.isAdminUser;
    }
    return false||this.isAdminUser;
  }

  loadPermissions(): void {
    this.permissionService.getAllPermissions(this.userId).subscribe(
      (response: any) => {
      
        if (response.success && response.permissions) {
          
          this.modules = response.permissions.map((moduleData: any) => ({
            module: moduleData.module,
            description: moduleData.description ?? 'Sin descripción',
            columns: moduleData.columns ?? [],
            permissions: moduleData.permissions ?? {},
            rows: moduleData.rows ?? [],
            isModular: moduleData.isModular,
            isExpanded: false
          }));
        }
      },
      (error) => {
        console.error('Error al cargar permisos', error);
        this.errorMessage = 'Error al cargar permisos.';
      }
    );
  }

  goBackToUsers(): void {
    this.router.navigate(['/users']);
  }

  // Usa el Router para navegar con fragmentos
  navigateToModule(moduleId: string): void {
    window.location.hash = moduleId;
  }

  // Método para desplazarse a la sección correcta
  scrollToFragment(fragment: string | null): void {
    if (fragment) {
      const element = document.getElementById(fragment);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  scrollToTop(): void {
    const element = document.getElementById('titulo');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleModuleExpansion(module: ModulePermissions): void {
    module.isExpanded = !module.isExpanded;
  }

  // Método para asociar un permiso
  assignPermission(permissionId: number, faqCategoryId: number | null, collaboratorCategoryId: number | null, infoId: number | null): void {
    if (!permissionId) return;
    this.permissionService.assignPermission(this.userId, permissionId, faqCategoryId, collaboratorCategoryId, infoId).subscribe(
      () => {
        this.showSuccess('Permiso asociado');
        this.loadPermissions();
      },
      (error) => {
        console.error('Error al asociar permiso', error);
      }
    );
  }

  // Método para eliminar un permiso
  removePermission(permissionId: number, faqCategoryId: number | null, collaboratorCategoryId: number | null, infoId: number | null): void {
    if (!permissionId) return;
    this.permissionService.removePermission(this.userId, permissionId, faqCategoryId, collaboratorCategoryId, infoId).subscribe(
      () => {
        this.showSuccess('Permiso eliminado');
        this.loadPermissions();
      },
      (error) => {
        console.error('Error al eliminar permiso', error);
      }
    );
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }
}
