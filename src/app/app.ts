import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { DialogoConfirmacao } from './shared/components/dialogo-confirmacao/dialogo-confirmacao';
import { Notificacoes } from './shared/components/notificacoes/notificacoes';

/** Componente raiz: apenas o outlet e os serviços visuais globais (toasts e diálogo). */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Notificacoes, DialogoConfirmacao],
  template: `
    <router-outlet />
    <app-notificacoes />
    <app-dialogo-confirmacao />
  `,
})
export class App {
  constructor() {
    // Volta ao topo só quando o CAMINHO muda — trocar filtros (query params) não "pula" a página.
    inject(Router)
      .events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map((e) => e.urlAfterRedirects.split('?')[0]),
        distinctUntilChanged(),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => window.scrollTo({ top: 0 }));
  }
}
