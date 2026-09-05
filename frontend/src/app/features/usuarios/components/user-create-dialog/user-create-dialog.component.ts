import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { UsuarioSexo } from '../../../../core/models/usuario.model';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('contraseña');
  const confirmPassword = control.get('confirmarContraseña');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-user-create-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './user-create-dialog.component.html',
  styleUrls: ['./user-create-dialog.component.css']
})
export class UserCreateDialogComponent {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<UserCreateDialogComponent>);
  private cdr = inject(ChangeDetectorRef);

  UsuarioSexo = UsuarioSexo;
  createForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor() {
    this.createForm = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.minLength(7)]],
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(10)]],
      confirmarContraseña: ['', [Validators.required]],
      sexo: [UsuarioSexo.Masculino, [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      const formValue = this.createForm.value;
      const createData = {
        email: formValue.email.trim(),
        nombreUsuario: formValue.nombreUsuario.trim(),
        contraseña: formValue.contraseña,
        confirmarContraseña: formValue.confirmarContraseña,
        sexo: Number(formValue.sexo)
      };

      this.usuarioService.createUsuario(createData).pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          const msg = error?.message || (typeof error === 'string' ? error : 'Error al crear usuario');
          this.errorMessage = msg;
          this.snackBar.open(msg, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.cdr.detectChanges();
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
