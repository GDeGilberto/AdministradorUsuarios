import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  extractErrorMessage(error: any, defaultMsg: string = 'Ocurrió un error inesperado'): string {
    try {
      if (!error) return defaultMsg;

      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Verifique su conexión a internet o el estado del backend.';
      }

      const errBody = error.error !== undefined ? error.error : error;

      if (typeof errBody === 'string' && errBody.trim().length > 0) {
        return errBody;
      }

      if (errBody && typeof errBody === 'object') {
        if (errBody.errors && typeof errBody.errors === 'object') {
          const messages: string[] = [];
          for (const key of Object.keys(errBody.errors)) {
            const fieldErrors = errBody.errors[key];
            if (Array.isArray(fieldErrors)) {
              messages.push(...fieldErrors);
            } else if (typeof fieldErrors === 'string') {
              messages.push(fieldErrors);
            }
          }
          if (messages.length > 0) {
            return messages.join('. ');
          }
        }

        if (errBody.message && typeof errBody.message === 'string') {
          return errBody.message;
        }

        if (errBody.detail && typeof errBody.detail === 'string') {
          return errBody.detail;
        }

        if (errBody.title && typeof errBody.title === 'string') {
          return errBody.title;
        }
      }

      if (error.message && typeof error.message === 'string') {
        return error.message;
      }

      if (error.statusText) {
        return `Error del servidor (${error.status} ${error.statusText})`;
      }

      return defaultMsg;
    } catch {
      return defaultMsg;
    }
  }
}
