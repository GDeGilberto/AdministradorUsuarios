import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { environment } from '../../Environments/enviroment';
import { AuthService } from '../../Services/auth';
import { TranslationService, SupportedLang } from '../../Services/translation.service';
import { TranslatePipe } from '../../Pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
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

  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  public translationService = inject(TranslationService);

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  changeLanguage(lang: SupportedLang): void {
    this.translationService.setLanguage(lang);
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
        next: () => {
          this.loading = false;
          this.successMessage = this.translationService.translate('LOGIN.SUCCESS');
          setTimeout(() => {
            this.router.navigate([this.returnUrl]);
          }, 1500);
        },
        error: (error: any) => {
          this.loading = false;
          this.errorMessage = error.message || this.translationService.translate('COMMON.ERROR');
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
