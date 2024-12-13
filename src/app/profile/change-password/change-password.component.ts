import { Component } from '@angular/core';
import { MyUserService } from '../services/my-user.service'; // Asegúrate de tener el AuthService implementado
import { Router } from '@angular/router'; // Para redirigir al usuario al login
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  currentPassword: string = ''; // Contraseña actual del usuario
  newPassword: string = ''; // Nueva contraseña
  confirmPassword: string = ''; // Confirmación de la nueva contraseña
  passwordError: string = ''; // Mensaje de error de validación
  successMessage: string = ''; // Mensaje de éxito

  constructor(private myUserService: MyUserService, private router: Router) {}

  // Validar la nueva contraseña según las reglas
  validatePassword(): boolean {
    const hasUpperCase = /[A-Z]/.test(this.newPassword);
    const hasLowerCase = /[a-z]/.test(this.newPassword);
    const hasNumber = /\d/.test(this.newPassword);
    const isValidLength = this.newPassword.length >= 8;

    if (!isValidLength) {
      this.passwordError = 'La contraseña debe tener al menos 8 caracteres.';
      return false;
    } else if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden.';
      return false;
    } else if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      this.passwordError = 'La contraseña debe incluir al menos una letra mayúscula, una minúscula y un número.';
      return false;
    } else {
      this.passwordError = '';
      return true;
    }
  }

  changePassword(): void {
    if (!this.validatePassword()) {
      return;
    } 
    
    const userId = this.getUserIdFromLocalStorage(); // Obtener el userId del localStorage
    const accountToken = this.getAccountTokenFromLocalStorage(); // Obtener el accountToken del localStorage

    // Llamar al servicio para cambiar la contraseña
    this.myUserService.changePassword(userId,this.currentPassword, this.newPassword,accountToken).subscribe(
      (response) => {
        if (response.success) {
          // Mostrar el mensaje de éxito y cerrar sesión
          this.successMessage = 'Contraseña cambiada correctamente. Cerrando sesión...';
          setTimeout(() => {
            this.clearSession(); // Cerrar sesión
            this.router.navigate(['/login']); // Redirigir al login
          }, 3000);
        } else {
          this.passwordError = response.message || 'Ocurrió un error al cambiar la contraseña.';
        }
      },
      (error) => {
        console.error('Error al cambiar la contraseña:', error);
        this.passwordError = error.message || 'Ocurrió un error al cambiar la contraseña.';
      }
    );
  }
  // Método para obtener el userId del localStorage
  private getUserIdFromLocalStorage(): number {
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    return userDetails.id_user;
  }

  // Método para obtener el accountToken del localStorage
  private getAccountTokenFromLocalStorage(): string {
    return localStorage.getItem('accountToken') || '';
  }
  // Método para borrar la sesión después de cambiar la contraseña
  clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('accountToken');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
  }
}
