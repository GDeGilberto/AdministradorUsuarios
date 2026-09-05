import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../Environments/enviroment';
import { ErrorService } from './error.service';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/Usuario`;

  constructor(
    private http: HttpClient,
    private errorService: ErrorService
  ) { }

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl)
      .pipe(
        catchError(error => throwError(() => new Error(this.errorService.extractErrorMessage(error, 'Error al obtener lista de usuarios'))))
      );
  }

  createUsuario(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData)
      .pipe(
        catchError(error => throwError(() => new Error(this.errorService.extractErrorMessage(error, 'Error al crear usuario'))))
      );
  }

  updateUsuario(id: number, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData)
      .pipe(
        catchError(error => throwError(() => new Error(this.errorService.extractErrorMessage(error, 'Error al actualizar usuario'))))
      );
  }

  updateUsuarioEstatus(id: number, estatus: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/estatus`, { estatus })
      .pipe(
        catchError(error => throwError(() => new Error(this.errorService.extractErrorMessage(error, 'Error al actualizar estatus de usuario'))))
      );
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => throwError(() => new Error(this.errorService.extractErrorMessage(error, 'Error al eliminar/desactivar usuario'))))
      );
  }
}
