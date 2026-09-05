import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { TranslationService, SupportedLang } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Usuario, UsuarioTableData, UsuarioEstatus } from '../../../core/models/usuario.model';
import { UserListComponent } from '../components/user-list/user-list.component';
import { UserEditDialogComponent } from '../components/user-edit-dialog/user-edit-dialog.component';
import { UserCreateDialogComponent } from '../components/user-create-dialog/user-create-dialog.component';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslatePipe,
    UserListComponent
  ],
  templateUrl: './usuarios-page.component.html',
  styleUrls: ['./usuarios-page.component.css']
})
export class UsuariosPageComponent implements OnInit {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  public translationService = inject(TranslationService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  usuarios: Usuario[] = [];
  loading = false;
  currentUser$ = this.authService.currentUser$;

  ngOnInit(): void {
    this.loadUsuarios();
  }

  changeLanguage(lang: SupportedLang): void {
    this.translationService.setLanguage(lang);
    this.cdr.detectChanges();
  }

  loadUsuarios(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios = [...usuarios];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error cargando usuarios:', error);
        this.loading = false;
        this.cdr.detectChanges();
        this.snackBar.open(
          error.message || this.translationService.translate('COMMON.ERROR'),
          this.translationService.translate('COMMON.CLOSE'),
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserCreateDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      disableClose: true,
      autoFocus: false,
      panelClass: 'custom-dialog-container',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop'
    });

    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      if (result === true) {
        this.loadUsuarios();
      }
    });
  }

  openEditDialog(usuario: UsuarioTableData): void {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: usuario,
      disableClose: true,
      autoFocus: false,
      panelClass: 'custom-dialog-container',
      hasBackdrop: true,
      backdropClass: 'custom-backdrop'
    });

    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      if (result === true) {
        this.loadUsuarios();
      }
    });
  }

  handleToggleStatus(usuario: UsuarioTableData): void {
    const isActivo = usuario.estatus === UsuarioEstatus.Activo;
    const accionKey = isActivo ? 'desactivar' : 'activar';
    const confirmMessage = this.translationService.translate('DASHBOARD.CONFIRM_TOGGLE', {
      accion: accionKey,
      usuario: usuario.nombreUsuario
    });

    if (confirm(confirmMessage)) {
      const request$ = isActivo 
        ? this.usuarioService.deleteUsuario(usuario.id)
        : this.usuarioService.updateUsuarioEstatus(usuario.id, UsuarioEstatus.Activo);

      request$.subscribe({
        next: () => {
          const successMsg = this.translationService.translate('DASHBOARD.TOGGLE_SUCCESS', {
            usuario: usuario.nombreUsuario,
            accion: isActivo ? 'desactivado' : 'activado'
          });
          this.snackBar.open(
            successMsg,
            this.translationService.translate('COMMON.CLOSE'),
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.loadUsuarios();
        },
        error: (error: any) => {
          console.error('Error al actualizar usuario:', error);
          this.snackBar.open(
            error.message || this.translationService.translate('COMMON.ERROR'),
            this.translationService.translate('COMMON.CLOSE'),
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getTotalUsuarios(): number {
    return this.usuarios.length;
  }

  getUsuariosActivos(): number {
    return this.usuarios.filter(u => u.estatus === UsuarioEstatus.Activo).length;
  }

  getUsuariosInactivos(): number {
    return this.usuarios.filter(u => u.estatus === UsuarioEstatus.Inactivo).length;
  }
}
