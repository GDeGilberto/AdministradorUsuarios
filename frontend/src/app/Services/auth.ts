import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../Environments/enviroment';
import { LoginRequest, LoginResponse, User } from '../Models/auth/auth-module';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    let storedUser = null;
    
    if (this.isBrowser) {
      storedUser = localStorage.getItem('currentUser');
    }
    
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Usuario/login`, credentials)
      .pipe(
        tap(response => {
          const user: User = {
            id: response.id,
            email: response.email,
            nombreUsuario: response.nombreUsuario
          };
          
          if (this.isBrowser) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('currentUser', JSON.stringify(user));
          }

          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          return throwError(() => new Error(error.error || 'Error en el inicio de sesion'));
        })
      );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Usuario`, userData)
      .pipe(
        tap(response => {
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Error al registrar usuario'));
        })
      );
  }

  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Usuario`)
      .pipe(
        tap(response => {
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Error al obtener usuarios'));
        })
      );
  }

  updateUsuarioEstatus(id: number, estatus: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Usuario/${id}/estatus`, { estatus })
      .pipe(
        tap(response => {
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Error al actualizar usuario'));
        })
      );
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Usuario/${id}`)
      .pipe(
        tap(response => {
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Error al desactivar usuario'));
        })
      );
  }

  updateUsuario(id: number, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Usuario/${id}`, userData)
      .pipe(
        tap(response => {
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Error al actualizar usuario'));
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    const token = localStorage.getItem('token');
    return !!token;
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem('token');
  }
}
