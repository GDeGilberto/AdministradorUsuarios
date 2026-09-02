import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../Services/usuario.service';
import { TranslationService, SupportedLang } from '../../Services/translation.service';
import { TranslatePipe } from '../../Pipes/translate.pipe';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  public translationService = inject(TranslationService);

  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

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

  changeLanguage(lang: SupportedLang): void {
    this.translationService.setLanguage(lang);
  }

  alphanumericValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    return /^[a-zA-Z0-9]+$/.test(value) ? null : { alphanumeric: true };
  }

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

      this.usuarioService.createUsuario(registerData)
        .pipe(finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }))
        .subscribe({
          next: () => {
            this.loading = false;
            this.successMessage = this.translationService.translate('REGISTER.SUCCESS');
            this.cdr.detectChanges();
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (error: any) => {
            this.loading = false;
            if (typeof error === 'string') {
              this.errorMessage = error;
            } else if (error?.message && typeof error.message === 'string') {
              this.errorMessage = error.message;
            } else {
              this.errorMessage = this.translationService.translate('COMMON.ERROR');
            }
            this.cdr.detectChanges();
          }
        });
    }
  }
}
