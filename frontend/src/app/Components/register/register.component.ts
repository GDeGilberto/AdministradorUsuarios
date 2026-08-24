import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Services/auth';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  
  sexoOptions = [
    { value: 0, label: 'Masculino' },
    { value: 1, label: 'Femenino' }
  ];

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [
        Validators.required, 
        Validators.minLength(7),
        this.alphanumericValidator
      ]],
      contraseña: ['', [
        Validators.required, 
        Validators.minLength(10),
        this.passwordStrengthValidator
      ]],
      confirmarContraseña: ['', Validators.required],
      sexo: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validador alfanumérico
  alphanumericValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    return /^[a-zA-Z0-9]+$/.test(value) ? null : { alphanumeric: true };
  }

  // Validador de contraseña fuerte
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

    if (hasUpperCase && hasLowerCase && hasNumeric && hasSymbol) {
      return null;
    }

    return { passwordStrength: true };
  }

  // Validador para confirmar contraseñas
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('contraseña');
    const confirmPassword = form.get('confirmarContraseña');

    if (!password || !confirmPassword) return null;

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.loading) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = this.registerForm.value;
      const registerData = {
        email: formData.email.trim(),
        nombreUsuario: formData.nombreUsuario.trim(),
        contraseña: formData.contraseña,
        confirmarContraseña: formData.confirmarContraseña,
        sexo: parseInt(formData.sexo)
      };

      this.authService.register(registerData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (response: any) => {
            this.successMessage = 'Usuario registrado exitosamente. Redirigiendo...';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (error: any) => {
            this.errorMessage = error.message || 'Error al registrar usuario. Inténtalo de nuevo.';
          }
        });
    }
  }
}
