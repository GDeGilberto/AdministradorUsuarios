import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../Environments/enviroment';
import { LoginRequest, LoginResponse, User } from '../Models/auth/auth-module';
import { TokenService } from './token.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private errorService: ErrorService
  ) {
    const storedUser = this.tokenService.getUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
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
          
          this.tokenService.setToken(response.token);
          this.tokenService.setUserInStorage(user);
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          return throwError(() => new Error(this.errorService.extractErrorMessage(error, 'Error en el inicio de sesión')));
        })
      );
  }

  logout(): void {
    this.tokenService.removeToken();
    this.tokenService.removeUserFromStorage();
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    const token = this.tokenService.getToken();
    if (!token) {
      return false;
    }

    if (this.tokenService.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }
}
