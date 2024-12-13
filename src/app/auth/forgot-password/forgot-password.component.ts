import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { interval, Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  email: string = '';
  isButtonDisabled: boolean = true;
  message: string = '';
  success: boolean = false;
  remainingTime: number = 0;
  countdownSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {

  
    // Solo acceder a sessionStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const savedTime = sessionStorage.getItem('remainingTime');
      if (savedTime) {
        this.remainingTime = parseInt(savedTime, 10);
        if (this.remainingTime > 0) {
          this.isButtonDisabled = true; // Deshabilitar el botón mientras hay tiempo restante
          this.startCountdown(); // Iniciar la cuenta regresiva si hay tiempo guardado
        }
      }
    }
  }
  
  ngOnDestroy(): void {
    this.stopCountdown();
  }
  
  forgotPassword(): void {
    if (!this.email.includes('@')) {
      return;
    }
  
    this.authService.forgotPassword(this.email).subscribe(
      (response: any) => {
        if (response.success) {
          this.success = true;
          this.stopCountdown(); // Detener cualquier cuenta regresiva anterior
          this.message = response.message;
          this.isButtonDisabled = true; // Deshabilitar el botón tras el éxito
        }
      },
      (error) => {
        console.log("Este es el error completo:", error); // Log completo del error desde el backend
  
        this.success = false; // Mostrar el mensaje en rojo
  
        // Mostrar el mensaje del backend directamente si existe
        if (error && error.message) {
          this.message = error.message;
        } else {
          this.message = 'Error inesperado en la solicitud.';
        }
  
        // Si el error es un mensaje de espera específico, iniciar la cuenta regresiva
        if (this.isWaitMessage(error.message)) {
          this.startCountdown(error.message); // Iniciar la cuenta regresiva si es un mensaje de espera
        }
      }
    );
  }
  
  // Verificar si el mensaje de error es sobre la espera de tiempo
  isWaitMessage(message: string): boolean {
    console.log("este es el mensaje", message);
    return /Debes esperar (\d+) minutos y (\d+) segundos/.test(message);
  }
  
  // Iniciar la cuenta regresiva
  startCountdown(message?: string): void {
    if (message) {
      const match = /Debes esperar (\d+) minutos y (\d+) segundos/.exec(message);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        this.remainingTime = minutes * 60 + seconds;
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem('remainingTime', this.remainingTime.toString());
        }
      }
    }
  
    this.isButtonDisabled = true;
    this.updateMessage();
  
    this.countdownSubscription = interval(1000).subscribe(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.updateMessage();
        if (isPlatformBrowser(this.platformId)) {
          sessionStorage.setItem('remainingTime', this.remainingTime.toString());
        }
      } else {
        this.stopCountdown();
      }
    });
  }
  
  // Actualizar el mensaje del contador
  updateMessage(): void {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    this.message = `Debes esperar ${minutes} minutos y ${seconds} segundos antes de solicitar un nuevo token.`;
  }
  
  // Detener la cuenta regresiva
  stopCountdown(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = null;
    }
    this.isButtonDisabled = false;
    this.message = '';
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('remainingTime');
    }
  }
  
  checkFormValidity(): void {
    if (this.remainingTime <= 0) {
      this.isButtonDisabled = !this.email.includes('@');
    }
  }

  // Método para volver a la página de login
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
