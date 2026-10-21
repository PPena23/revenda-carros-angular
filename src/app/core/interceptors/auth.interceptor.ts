import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Anexa o token (fake) no cabeçalho Authorization e trata 401 globalmente,
 * encerrando a sessão e levando o usuário de volta ao login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  const requisicao = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      const ehLogin = req.url.endsWith('/auth/login');
      if (erro instanceof HttpErrorResponse && erro.status === 401 && !ehLogin && auth.autenticado()) {
        auth.logout();
      }
      return throwError(() => erro);
    }),
  );
};
