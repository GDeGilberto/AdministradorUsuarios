import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        provideZonelessChangeDetection()
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isLoggedIn', () => {
    beforeEach(() => {
      // Aseguramos que isBrowser sea true para simular el navegador
      (service as any).isBrowser = true;
    });

    it('should return false if token is not present', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should return true if token is present and not expired', () => {
      // exp: 9999999999 (año 2286, futuro)
      const validToken = 'header.eyJleHAiOiA5OTk5OTk5OTk5fQ.signature';
      spyOn(localStorage, 'getItem').and.returnValue(validToken);
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('should return false and call logout if token is present but expired', () => {
      // exp: 1000000000 (año 2001, pasado)
      const expiredToken = 'header.eyJleHAiOiAxMDAwMDAwMDAwfQ.signature';
      spyOn(localStorage, 'getItem').and.returnValue(expiredToken);
      spyOn(service, 'logout').and.callThrough();

      expect(service.isLoggedIn()).toBeFalse();
      expect(service.logout).toHaveBeenCalled();
    });

    it('should return false and call logout if token has invalid format', () => {
      spyOn(localStorage, 'getItem').and.returnValue('token_invalido_sin_formato_jwt');
      spyOn(service, 'logout').and.callThrough();

      expect(service.isLoggedIn()).toBeFalse();
      expect(service.logout).toHaveBeenCalled();
    });
  });
});
