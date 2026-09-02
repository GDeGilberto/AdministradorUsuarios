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
import { UsuarioTableData } from '../../../Models/usuario/usuario.model';
import { UsuarioService } from '../../../Services/usuario.service';
import { TranslationService } from '../../../Services/translation.service';
import { TranslatePipe } from '../../../Pipes/translate.pipe';

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
    MatSnackBarModule,
    TranslatePipe
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css']
})
export class EditUserDialogComponent {
  editForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private translationService: TranslationService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UsuarioTableData
  ) {
    this.editForm = this.fb.group({
      nombreUsuario: [data.nombreUsuario, [Validators.required, Validators.minLength(3)]],
      email: [data.email, [Validators.required, Validators.email]],
      contraseña: [''],
      confirmarContraseña: [''],
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

      if (formValue.contraseña && formValue.contraseña.trim()) {
        updateData.contraseña = formValue.contraseña;
        updateData.confirmarContraseña = formValue.confirmarContraseña;
      }

      this.usuarioService.updateUsuario(this.data.id, updateData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open(
            this.translationService.translate('EDIT_DIALOG.SUCCESS'),
            this.translationService.translate('COMMON.CLOSE'),
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error actualizando usuario:', error);
          this.snackBar.open(
            error.message || this.translationService.translate('COMMON.ERROR'),
            this.translationService.translate('COMMON.CLOSE'),
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
