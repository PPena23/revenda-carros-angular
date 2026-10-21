import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Guard funcional: só entra no painel quem está logado; senão vai ao login com returnUrl. */
export const authGuard: CanActivateFn = (_rota, estado) => {
  const auth = inject(AuthService);
  if (auth.autenticado()) return true;

  return inject(Router).createUrlTree(['/admin/login'], {
    queryParams: { returnUrl: estado.url },
  });
};

/** Inverso: usuário já logado não precisa ver a tela de login. */
export const visitanteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.autenticado() ? inject(Router).createUrlTree(['/admin']) : true;
};
