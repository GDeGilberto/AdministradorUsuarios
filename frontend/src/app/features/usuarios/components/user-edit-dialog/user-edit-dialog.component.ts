import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { UsuarioTableData, UsuarioSexo } from '../../../../core/models/usuario.model';
import { UsuarioService } from '../../../../core/services/usuario.service';

function passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
  const password = control.get('contraseña');
  const confirmPassword = control.get('confirmarContraseña');
  
  if (password && confirmPassword && password.value && confirmPassword.value) {
    if (password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    if (password.value.length < 8) {
      return { passwordTooShort: true };
    }
  }
  
  if ((password?.value && !confirmPassword?.value) || (!password?.value && confirmPassword?.value)) {
    return { passwordIncomplete: true };
  }
  
  return null;
}

@Component({
  selector: 'app-user-edit-dialog',
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
  templateUrl: './user-edit-dialog.component.html',
  styleUrls: ['./user-edit-dialog.component.css']
})
export class UserEditDialogComponent {
  UsuarioSexo = UsuarioSexo;
  editForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UserEditDialogComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: UsuarioTableData
  ) {
    const initialSexo = data.sexo !== undefined && data.sexo !== null ? Number(data.sexo) : UsuarioSexo.Masculino;
    this.editForm = this.fb.group({
      nombreUsuario: [data.nombreUsuario, [Validators.required, Validators.minLength(3)]],
      email: [data.email, [Validators.required, Validators.email]],
      contraseña: [''],
      confirmarContraseña: [''],
      sexo: [initialSexo, [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      const formValue = this.editForm.value;
      
      const updateData: any = {
        email: formValue.email.trim(),
        nombreUsuario: formValue.nombreUsuario.trim(),
        sexo: Number(formValue.sexo)
      };

      if (formValue.contraseña && formValue.contraseña.trim()) {
        updateData.contraseña = formValue.contraseña;
        updateData.confirmarContraseña = formValue.confirmarContraseña;
      }

      this.usuarioService.updateUsuario(this.data.id, updateData).pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          const msg = error?.message || (typeof error === 'string' ? error : 'Error al actualizar usuario');
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
