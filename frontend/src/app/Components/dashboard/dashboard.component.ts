import { Component, OnInit, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../Services/auth';
import { UsuarioService } from '../../Services/usuario.service';
import { Usuario, UsuarioTableData, UsuarioEstatus, UsuarioSexo } from '../../Models/usuario/usuario.model';
import { EditUserDialogComponent } from './edit-user-dialog/edit-user-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatChipsModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private dialog = inject(MatDialog) as MatDialog;
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'nombreUsuario', 'email', 'sexo', 'estatus', 'acciones'];
  dataSource = new MatTableDataSource<UsuarioTableData>();
  usuarios: Usuario[] = [];
  loading = false;
  currentUser$ = this.authService.currentUser$;
  
  filtroEstatus: string = 'todos';
  filtroTexto: string = '';

  estatusOptions = [
    { value: 'todos', label: 'Todos los usuarios' },
    { value: '1', label: 'Activos' },
    { value: '0', label: 'Inactivos' }
  ];

  ngOnInit(): void {
    this.loadUsuarios();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.createFilter();
  }

  loadUsuarios(): void {
    this.loading = true;
    this.usuarioService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios = usuarios;
        this.updateDataSource();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando usuarios:', error);
        this.loading = false;
        this.snackBar.open(
          'Error al cargar la lista de usuarios: ' + (error.message || 'Fallo de conexión'),
          'Cerrar',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
    });
  }

  updateDataSource(): void {
    const tableData: UsuarioTableData[] = this.usuarios.map(usuario => ({
      ...usuario,
      estatusText: usuario.estatus === UsuarioEstatus.Activo ? 'Activo' : 'Inactivo',
      sexoText: usuario.sexo === UsuarioSexo.Masculino ? 'Masculino' : 'Femenino'
    }));
    
    this.dataSource.data = tableData;
    this.applyFilters();
  }

  createFilter(): (data: UsuarioTableData, filter: string) => boolean {
    return (data: UsuarioTableData, filter: string): boolean => {
      const filterObj = JSON.parse(filter);
      
      if (filterObj.estatus !== 'todos' && data.estatus.toString() !== filterObj.estatus) {
        return false;
      }
      
      if (filterObj.texto) {
        const searchText = filterObj.texto.toLowerCase();
        return data.nombreUsuario.toLowerCase().includes(searchText) ||
               data.email.toLowerCase().includes(searchText) ||
               data.sexoText.toLowerCase().includes(searchText) ||
               data.estatusText.toLowerCase().includes(searchText);
      }
      
      return true;
    };
  }

  applyFilters(): void {
    const filterValue = JSON.stringify({
      estatus: this.filtroEstatus,
      texto: this.filtroTexto
    });
    this.dataSource.filter = filterValue;
  }

  onFiltroEstatusChange(): void {
    this.applyFilters();
  }

  onFiltroTextoChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filtroEstatus = 'todos';
    this.filtroTexto = '';
    this.applyFilters();
  }

  editarUsuario(usuario: UsuarioTableData): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '650px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: usuario,
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
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

  eliminarUsuario(usuario: UsuarioTableData): void {
    const isActivo = usuario.estatus === UsuarioEstatus.Activo;
    const accion = isActivo ? 'desactivar' : 'activar';
    const accionPasado = isActivo ? 'desactivado' : 'activado';
    
    if (confirm(`¿Estás seguro de que quieres ${accion} al usuario ${usuario.nombreUsuario}?`)) {
      const request$ = isActivo 
        ? this.usuarioService.deleteUsuario(usuario.id)
        : this.usuarioService.updateUsuarioEstatus(usuario.id, UsuarioEstatus.Activo);

      request$.subscribe({
        next: () => {
          this.snackBar.open(
            `Usuario "${usuario.nombreUsuario}" ${accionPasado} exitosamente`,
            'Cerrar',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this.loadUsuarios();
        },
        error: (error: any) => {
          console.error(`Error al ${accion} usuario:`, error);
          this.snackBar.open(
            `Error al ${accion} usuario: ` + (error.message || 'Fallo inesperado'),
            'Cerrar',
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
    return this.dataSource.filteredData.length;
  }

  getUsuariosActivos(): number {
    return this.dataSource.filteredData.filter((u: UsuarioTableData) => u.estatus === UsuarioEstatus.Activo).length;
  }

  getUsuariosInactivos(): number {
    return this.dataSource.filteredData.filter((u: UsuarioTableData) => u.estatus === UsuarioEstatus.Inactivo).length;
  }
}
