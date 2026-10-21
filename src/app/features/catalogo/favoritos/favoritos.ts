import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, switchMap } from 'rxjs';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { VeiculosService } from '../../../core/services/veiculos.service';
import { comEstado } from '../../../core/utils/estado-requisicao';
import { EstadoErro, EstadoVazio, Skeleton } from '../../../shared/components/estados/estados';
import { VeiculoCard } from '../../../shared/components/veiculo-card/veiculo-card';

@Component({
  selector: 'app-favoritos',
  imports: [RouterLink, VeiculoCard, Skeleton, EstadoErro, EstadoVazio],
  template: `
    <div class="container pagina">
      <header class="pagina__topo">
        <p class="sobretitulo">Sua lista</p>
        <h1>Favoritos</h1>
        <p class="texto-suave">Salvos neste navegador. Toque no coração de qualquer carro para adicionar ou remover.</p>
      </header>

      @let e = estado();
      @if (e.status === 'carregando') {
        <app-skeleton tipo="card" [quantidade]="Math.max(favoritos.quantidade(), 1)" />
      } @else if (e.status === 'erro') {
        <app-estado-erro [mensagem]="e.mensagem" (tentarNovamente)="recarregar$.next()" />
      } @else if (visiveis().length === 0) {
        <app-estado-vazio icone="coracao" titulo="Nenhum favorito ainda" texto="Explore o estoque e salve os carros que chamarem sua atenção.">
          <a routerLink="/estoque" class="btn btn--primario">Explorar estoque</a>
        </app-estado-vazio>
      } @else {
        <ul class="grade">
          @for (v of visiveis(); track v.id) {
            <li><app-veiculo-card [veiculo]="v" /></li>
          }
        </ul>
      }
    </div>
  `,
  styleUrl: '../pagina-simples.scss',
})
export class Favoritos {
  protected readonly favoritos = inject(FavoritosService);
  private readonly veiculos = inject(VeiculosService);
  protected readonly recarregar$ = new BehaviorSubject<void>(undefined);
  protected readonly Math = Math;

  /** Busca (forkJoin) os ids favoritados ao abrir a página ou ao tentar novamente. */
  protected readonly estado = toSignal(
    this.recarregar$.pipe(
      switchMap(() => this.veiculos.obterVarios(this.favoritos.lista()).pipe(comEstado())),
    ),
    { initialValue: { status: 'carregando' } as const },
  );

  /** Desfavoritar some com o card na hora, sem nova requisição (computed sobre o signal). */
  protected readonly visiveis = computed(() => {
    const e = this.estado();
    const ids = this.favoritos.lista();
    return e.status === 'sucesso' ? e.dados.filter((v) => ids.includes(v.id)) : [];
  });
}
