import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { TranslationService } from '../services/translation.service';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const translationService = inject(TranslationService);
  const router = inject(Router);

  const token = tokenService.getToken();

  let authReq = req;

  if (token) {
    if (tokenService.isTokenExpired(token)) {
      authService.logout();
      router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      const expiredMsg = translationService.translate('COMMON.SESSION_EXPIRED');
      return throwError(() => new Error(expiredMsg));
    }

    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => error);
    })
  );
};
