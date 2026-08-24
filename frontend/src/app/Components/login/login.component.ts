import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { environment } from '../../Environments/enviroment';
import { AuthService } from '../../Services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  environment = environment;
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener la URL de retorno si existe
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  fillTestData(): void {
    this.loginForm.patchValue({
      email: 'usuario@test.com',
      contraseña: 'Usuario!90'
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    const credentials = this.loginForm.value;

    this.authService.login(credentials)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          this.successMessage = '¡Login exitoso! Redirigiendo...';
          
          // Redirigir después de mostrar el mensaje
          setTimeout(() => {
            this.router.navigate([this.returnUrl]);
          }, 1500);
        },
        error: (error: any) => {
          
          if (error.message) {
            this.errorMessage = error.message;
          } else {
            this.errorMessage = 'Error inesperado. Intenta nuevamente.';
          }
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
