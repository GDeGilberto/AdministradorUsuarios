import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AddUsuarioRequest, UsuarioResponse } from '../Models/usuario/usuario-module';
import { environment } from '../Environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/Usuario`;

  constructor(private http: HttpClient) { }

  createUsuario(usuario: AddUsuarioRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.apiUrl, usuario)
      .pipe(
        catchError(this.handleError)
      );
  }

  getUsuarios(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 400 && error.error) {
        // Handle validation errors
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.errors) {
          const validationErrors = [];
          for (const key in error.error.errors) {
            if (error.error.errors[key]) {
              validationErrors.push(error.error.errors[key]);
            }
          }
          errorMessage = validationErrors.join('. ');
        }
      } else {
        errorMessage = `Código: ${error.status}, Mensaje: ${error.statusText || error.message}`;
      }
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
