import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioTableData, UsuarioEstatus, UsuarioSexo, Usuario } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-user-list',
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
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements AfterViewInit, OnChanges {
  @Input() usuarios: Usuario[] = [];
  @Input() loading = false;

  @Output() editUser = new EventEmitter<UsuarioTableData>();
  @Output() toggleStatus = new EventEmitter<UsuarioTableData>();
  @Output() openCreateUser = new EventEmitter<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = ['id', 'nombreUsuario', 'email', 'sexo', 'estatus', 'acciones'];
  dataSource = new MatTableDataSource<UsuarioTableData>();

  filtroEstatus: string = 'todos';
  filtroTexto: string = '';

  estatusOptions = [
    { value: 'todos', label: 'Todos los usuarios' },
    { value: '1', label: 'Activos' },
    { value: '0', label: 'Inactivos' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuarios'] || changes['loading']) {
      this.updateDataSource();
      this.cdr.detectChanges();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.createFilter();
    this.cdr.detectChanges();
  }

  updateDataSource(): void {
    const tableData: UsuarioTableData[] = (this.usuarios || []).map(usuario => ({
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
    this.cdr.detectChanges();
  }

  onFiltroTextoChange(): void {
    this.applyFilters();
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.filtroEstatus = 'todos';
    this.filtroTexto = '';
    this.applyFilters();
    this.cdr.detectChanges();
  }

  onEdit(usuario: UsuarioTableData): void {
    this.editUser.emit(usuario);
  }

  onToggle(usuario: UsuarioTableData): void {
    this.toggleStatus.emit(usuario);
  }

  onCreate(): void {
    this.openCreateUser.emit();
  }
}
