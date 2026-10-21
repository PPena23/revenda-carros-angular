import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { finalize, tap } from 'rxjs';

/** Registra no console método, URL, status e duração de cada requisição (somente em desenvolvimento). */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isDevMode()) return next(req);

  const inicio = performance.now();
  let status: number | string = '—';

  return next(req).pipe(
    tap({
      next: (evento) => {
        if (evento instanceof HttpResponse) status = evento.status;
      },
      error: (erro: unknown) => {
        status = erro instanceof HttpErrorResponse ? erro.status : 'erro';
      },
    }),
    finalize(() => {
      const ms = Math.round(performance.now() - inicio);
      console.debug(`[API] ${req.method} ${req.urlWithParams} → ${status} (${ms} ms)`);
    }),
  );
};
