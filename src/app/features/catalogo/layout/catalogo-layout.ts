import { Component, DOCUMENT, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { LOJA_CONFIG } from '../../../core/config/app.tokens';
import { ComparadorService } from '../../../core/services/comparador.service';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { DemoControles } from '../../../shared/components/demo-controles/demo-controles';
import { Icone } from '../../../shared/components/icone/icone';
import { Logo } from '../../../shared/components/logo/logo';

/** Casca do catálogo público (tema escuro): cabeçalho, conteúdo, rodapé e barra de comparação. */
@Component({
  selector: 'app-catalogo-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icone, Logo, DemoControles],
  templateUrl: './catalogo-layout.html',
  styleUrl: './catalogo-layout.scss',
  host: { class: 'tema-escuro' },
})
export class CatalogoLayout {
  protected readonly loja = inject(LOJA_CONFIG);
  protected readonly favoritos = inject(FavoritosService);
  protected readonly comparador = inject(ComparadorService);
  private readonly documento = inject(DOCUMENT);

  protected readonly menuAberto = signal(false);
  protected readonly ano = new Date().getFullYear();

  protected readonly links = [
    { rota: '/', rotulo: 'Início', exato: true },
    { rota: '/estoque', rotulo: 'Estoque', exato: false },
    { rota: '/contato', rotulo: 'Contato', exato: false },
  ];

  constructor() {
    // Fecha o menu mobile a cada navegação.
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuAberto.set(false));
  }

  protected irParaConteudo(): void {
    this.documento.getElementById('conteudo')?.focus();
  }
}
