import { Component, Inject } from '@angular/core';
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
import { UsuarioTableData, UsuarioSexo, UsuarioEstatus } from '../../../Models/usuario/usuario.model';
import { AuthService } from '../../../Services/auth';

// Validador personalizado para confirmar contraseñas
function passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
  const password = control.get('contraseña');
  const confirmPassword = control.get('confirmarContraseña');
  
  if (password && confirmPassword && password.value && confirmPassword.value) {
    if (password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    // Validar longitud mínima si se proporciona contraseña
    if (password.value.length < 8) {
      return { passwordTooShort: true };
    }
  }
  
  // Si se llena una contraseña, ambas deben estar llenas
  if ((password?.value && !confirmPassword?.value) || (!password?.value && confirmPassword?.value)) {
    return { passwordIncomplete: true };
  }
  
  return null;
}

@Component({
  selector: 'app-edit-user-dialog',
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
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css']
})
export class EditUserDialogComponent {
  editForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsuarioTableData
  ) {
    this.editForm = this.fb.group({
      nombreUsuario: [data.nombreUsuario, [Validators.required, Validators.minLength(3)]],
      email: [data.email, [Validators.required, Validators.email]],
      contraseña: [''], // Opcional
      confirmarContraseña: [''], // Opcional
      sexo: [data.sexo !== undefined ? data.sexo : null, [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.isLoading = true;
      const formValue = this.editForm.value;
      
      const updateData: any = {
        email: formValue.email,
        nombreUsuario: formValue.nombreUsuario,
        sexo: formValue.sexo
      };

      // Solo incluir contraseñas si se proporcionaron
      if (formValue.contraseña && formValue.contraseña.trim()) {
        updateData.contraseña = formValue.contraseña;
        updateData.confirmarContraseña = formValue.confirmarContraseña;
      }

      this.authService.updateUsuario(this.data.id, updateData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true); // Devolvemos true para indicar éxito
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error actualizando usuario:', error);
          this.snackBar.open('Error al actualizar usuario: ' + error.message, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
