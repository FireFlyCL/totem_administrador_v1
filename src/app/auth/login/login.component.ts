import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isButtonDisabled: boolean = true;
  isSubmitting: boolean = false;

  constructor(private authService: AuthService,private router: Router) {}

  ngOnInit(): void {
   
  }

  // Verifica si los campos cumplen las condiciones para habilitar o deshabilitar el botón
  onInputChange(): void {
    const emailValid = this.username.includes('@') && this.username.includes('.');
    const passwordValid = this.password.length >= 8;
    this.isButtonDisabled = !(emailValid && passwordValid);
  }

  async onLogin(form: NgForm): Promise<void> {
    if (form.invalid) {
      this.errorMessage = 'Se requiere un nombre de usuario y contraseña válidos.';
      return;
    }

    // Deshabilita el botón cuando se presiona
    this.isButtonDisabled = true;
    this.isSubmitting = true;

    try {
      const response = await this.authService.login(this.username, this.password).toPromise();
      if (response.success) {
        this.successMessage = response.message;
        this.errorMessage = '';
        this.router.navigate(['/menu']);
      } else {
        this.errorMessage = response.message;
        this.successMessage = '';
      }
    } catch (error: unknown) {
      this.errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
      this.successMessage = '';
      console.error('Login failed', error);
    }

    // Mantiene el botón deshabilitado por 3 segundos después del intento de login
    setTimeout(() => {
      this.isSubmitting = false;
      this.onInputChange();  // Revalida el formulario después de los 3 segundos
    }, 3000);
  }

  onForgotPassword(): void {
 
    this.router.navigate(['/login/forgot-password']);
  }
}
