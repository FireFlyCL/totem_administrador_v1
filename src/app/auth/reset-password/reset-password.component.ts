import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = ''; // Token que se obtiene desde la URL
  newPassword: string = ''; // Nueva contraseña ingresada por el usuario
  confirmPassword: string = ''; // Confirmación de la nueva contraseña
  passwordError: string = ''; // Mensaje de error para contraseñas no válidas
  successMessage: string = ''; // Mensaje de éxito cuando se restablece la contraseña

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener el token de la URL cuando se carga la página
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  // Validar las contraseñas cuando se pulse el botón
  validatePassword(): boolean {
    const hasUpperCase = /[A-Z]/.test(this.newPassword); // Validar que tenga una mayúscula
    const hasLowerCase = /[a-z]/.test(this.newPassword); // Validar que tenga una minúscula
    const hasNumber = /\d/.test(this.newPassword); // Validar que tenga un número
    const isValidLength = this.newPassword.length >= 8; // Validar que tenga al menos 8 caracteres

    // Si la contraseña no tiene al menos 8 caracteres
    if (!isValidLength) {
      this.passwordError = 'La contraseña debe tener al menos 8 caracteres.';
      return false;
    } 
     // Si las contraseñas no coinciden
     else if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden.';
      return false;
    } 
    // Si no contiene una mayúscula, minúscula o número
    else if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      this.passwordError = 'La contraseña debe incluir al menos una letra mayúscula, una letra minúscula y un número.';
      return false;
    } 
    // Si todo está correcto, no hay error
    else {
      this.passwordError = '';
      return true;
    }
  }

  resetPassword(): void {
    // Verificar si la contraseña es válida antes de enviarla
    if (!this.validatePassword()) {
      return; // Si la validación falla, no hacemos nada
    }
  
    // Si la validación es correcta, enviamos la nueva contraseña al backend
    this.authService.resetPassword(this.token, this.newPassword).subscribe(
      response => {
        // Revisar si la respuesta contiene success: true
        if (response.success) {
          // Borrar los datos de la cuenta almacenada
          this.clearSession();
  
          // Mostrar mensaje de éxito cuando la contraseña se restablece correctamente
          this.successMessage = 'La contraseña se ha restablecido correctamente. Redirigiendo al inicio de sesión...';
          setTimeout(() => {
            this.router.navigate(['/login']); // Redirigir al login después de 3 segundos
          }, 3000);
        } else {
          // Si el backend no devuelve success: true, mostrar el mensaje de error
          this.passwordError = response.message || 'Ocurrió un error al restablecer la contraseña.';
        }
      },
      error => {
        console.error('Error al restablecer la contraseña', error);
  
        // Verificar si el error es por un token inválido o no encontrado
        if (error === 'Token no encontrado o inválido.') {
          // Borrar los datos de la cuenta almacenada
          this.clearSession();
  
          // Mostrar mensaje de error si el token es inválido y redirigir al login
          this.passwordError = 'Este link ya no es válido. Redirigiendo al inicio de sesión...';
          setTimeout(() => {
            this.router.navigate(['/login']); // Redirigir al login después de 3 segundos
          }, 3000);
        } else {
          // Otro error al restablecer la contraseña
          this.passwordError = error || 'Ocurrió un error al restablecer la contraseña. Intente nuevamente.';
        }
      }
    );
  }
  
  // Método para borrar la sesión
  clearSession(): void {
    // Eliminar los datos de la sesión guardados en localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('accountToken');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
  }
}
