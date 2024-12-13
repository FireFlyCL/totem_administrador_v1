import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para usar ngModel
import { RouterLink, Router } from '@angular/router';

interface Permission {
  id_permission: number;
  permission_name: string;
  permission_type: string;
  module: string;
  level: string;
  faq_category?: {
    id_faq_category: number;
    faq_category_name: string;
  };
  collaborator_category?: {
    id_collaborator_category: number;
    collaborator_category_name: string;
  };
  info?: {
    id_info: number;
    information_title: string;
  };
}

interface User {
  id_user: number;
  username: string;
  is_blocked: boolean;
  permissions: Permission[]; // Permisos con detalles
  canDelete?: boolean;
  groupedPermissions?: { [module: string]: Permission[] }; // Agrupados por módulo
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css'],
  imports: [CommonModule, FormsModule, RouterLink]
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  allPermissions: Permission[] = [];
  currentUserId: number = 0;
  currentUserPermissions: Permission[] = [];

  // Filtros
  searchQuery: string = '';
  filterStatus: string = '';
  filterPermission: string = '';

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadCurrentUserPermissions();
    if (this.hasPermission([1, 2, 13])) {
      this.loadUsers();
    } else {
      console.error('No tienes los permisos necesarios para acceder a esta página');
    }
  }

  /**
   * Cargar permisos del usuario actual desde el localStorage
   */
  loadCurrentUserPermissions(): void {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      const parsedDetails = JSON.parse(userDetails);
      this.currentUserId = parsedDetails.id_user;
      this.currentUserPermissions = parsedDetails.permissionsDetails;
    }
  }

  /**
   * Cargar lista de usuarios y sus permisos
   */
  loadUsers(): void {
    this.userService.getAllUsers().subscribe(
      (response: any) => {
        this.users = response.users.map((user: any) => {
          // Procesar permisos
          const processedPermissions: Permission[] = user.permissions.map((perm: any) => {
            let permissionName = perm.permission_name;

            // Concatenar el nombre de la categoría si es un permiso categórico
            if (perm.level === 'categorical') {
              if (perm.faq_category) {
                permissionName += `: ${perm.faq_category.faq_category_name}`;
              } else if (perm.collaborator_category) {
                permissionName += `: ${perm.collaborator_category.collaborator_category_name}`;
              } else if (perm.info) {
                permissionName += `: ${perm.info.information_title}`;
              }
            }

            return {
              ...perm,
              permission_name: permissionName
            };
          });

          // Agrupar los permisos por módulo
          const groupedPermissions = this.groupPermissionsByModule(processedPermissions);

          return {
            ...user,
            permissions: processedPermissions,
            canDelete: false,
            groupedPermissions: groupedPermissions // Guardamos los permisos agrupados
          };
        });

        this.filteredUsers = [...this.users];
        this.extractPermissions();
      },
      (error: any) => {
        console.error('Error al obtener los usuarios:', error);
      }
    );
  }

  /**
   * Agrupar permisos por módulo
   */
  groupPermissionsByModule(permissions: Permission[]): { [module: string]: Permission[] } {
    return permissions.reduce((acc: { [module: string]: Permission[] }, perm: Permission) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {});
  }

  /**
   * Aplicar filtros de búsqueda, estado y permisos
   */
  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus =
        this.filterStatus === '' ||
        (this.filterStatus === 'blocked' && user.is_blocked) ||
        (this.filterStatus === 'active' && !user.is_blocked);
      const matchesPermission =
        this.filterPermission === '' ||
        user.permissions.some(perm => perm.id_permission === parseInt(this.filterPermission, 10));

      return matchesSearch && matchesStatus && matchesPermission;
    });
  }

  /**
   * Extraer permisos únicos de todos los usuarios
   */
  extractPermissions(): void {
    const permissionMap = new Map<number, Permission>();
    this.users.forEach(user => {
      user.permissions.forEach((perm: Permission) => {
        if (!permissionMap.has(perm.id_permission)) {
          permissionMap.set(perm.id_permission, perm);
        }
      });
    });
    this.allPermissions = Array.from(permissionMap.values());
  }

  /**
   * Verificar si el usuario actual tiene un permiso específico por ID o es administrador (ID 1 o 2)
   * @param permissionIds - Array de IDs de permisos a verificar
   * @returns boolean - Si tiene alguno de los permisos
   */
  hasPermission(permissionIds: number[]): boolean {
    return (
      this.currentUserPermissions.some((p: Permission) => permissionIds.includes(p.id_permission)) ||
      this.currentUserPermissions.some((p: Permission) => [1, 3].includes(p.id_permission))
    ); // IDs 1 y 2 son Administradores
  }

  /**
   * Bloquear o desbloquear un usuario
   */
  toggleBlockUser(userId: number, isBlocked: boolean): void {
    if (!this.hasPermission([11])) {
      console.error('No tienes permiso para bloquear/desbloquear usuarios');
      return;
    }

    if (userId === this.currentUserId) {
      console.error('No puedes bloquearte a ti mismo');
      return;
    }

    this.userService.blockOrUnblockUser(userId, !isBlocked).subscribe(
      () => {
        this.loadUsers(); // Recargar lista de usuarios
      },
      (error: any) => {
        console.error('Error al bloquear/desbloquear el usuario:', error);
      }
    );
  }

  /**
   * Confirmar y eliminar un usuario
   */
  confirmDelete(user: User): void {
    if (!this.hasPermission([12])) {
      console.error('No tienes permiso para eliminar usuarios');
      return;
    }

    if (user.id_user === this.currentUserId) {
      console.error('No puedes eliminarte a ti mismo');
      return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar al usuario: ${user.username}?`)) {
      this.deleteUser(user.id_user);
    }
  }

  /**
   * Activar la opción de eliminar para un usuario
   */
  toggleDelete(user: User, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    user.canDelete = inputElement.checked;
  }

  /**
   * Eliminar un usuario
   */
  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe(
      () => {
        this.loadUsers(); // Recargar lista de usuarios después de eliminar
      },
      (error: any) => {
        console.error('Error al eliminar el usuario:', error);
      }
    );
  }

  /**
   * Editar los permisos de un usuario
   */
  editPermissions(userId: number, username: string): void {
    if (!this.hasPermission([17])) {
      console.error('No tienes permiso para editar permisos');
      return;
    }
    // Navegar a la página de edición de permisos del usuario con el ID y el username
    this.router.navigate(['/users/permission', userId], { queryParams: { username: username } });
  }

  /**
   * Asignar un color a los permisos dependiendo del módulo
   */
  getPermissionColor(permission: Permission): string {
    switch (permission.module) {
      case 'global':
        return 'gold';
      case 'users':
        return 'yellow';
      case 'permissions':
        return 'red';
      case 'news':
        return 'blue';
      case 'maps':
        return 'orange';
      case 'faqs':
        return 'grey';
      case 'stats':
        return 'beige';
      case 'collaborators':
        return 'pink';
      case 'information':
        return 'green';
      default:
        return 'lightgrey'; // Color por defecto
    }
  }

  // Modal para invitar usuario

  username: string = '';
  confirmUsername: string = '';
  selectedDomain: string = 'duoc.cl'; // Dominio seleccionado
  showInviteModal: boolean = false;
  isLoading: boolean = false; // Estado de carga

  openInviteModal(): void {
    this.showInviteModal = true;
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
    this.username = '';
    this.confirmUsername = '';
  }

  hasPermissionToInvite(): boolean {
    return this.hasPermission([10]);
  }

  inviteUser(): void {
    const email = `${this.username}@${this.selectedDomain}`; // Construir el correo electrónico

    if (this.username === this.confirmUsername) {
      this.isLoading = true;
      this.userService.addUser(email).subscribe(
        () => {
          alert('Invitación enviada correctamente');
          this.isLoading = false;
          this.closeInviteModal();
          this.reloadPage();
        },
        (error) => {
          this.isLoading = false;
          if (
            error.message ===
            'El nombre de usuario ya existe. Por favor, elige otro nombre de usuario.'
          ) {
            alert('El nombre de usuario ya existe. Por favor, elige otro nombre de usuario.');
          } else {
            alert('Hubo un error al invitar al usuario.');
          }
        }
      );
    }
  }

  reloadPage(): void {
    window.location.reload();
  }
}
