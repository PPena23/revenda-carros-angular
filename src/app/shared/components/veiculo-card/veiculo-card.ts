import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Veiculo } from '../../../core/models/veiculo.model';
import { ComparadorService, LIMITE_COMPARACAO } from '../../../core/services/comparador.service';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { NotificacaoService } from '../../../core/services/notificacao.service';
import { tituloVeiculo } from '../../../core/utils/rotulos';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { KmPipe } from '../../pipes/km.pipe';
import { MoedaBrPipe } from '../../pipes/moeda-br.pipe';
import { CarIllustration } from '../car-illustration/car-illustration';
import { Icone } from '../icone/icone';
import { StatusBadge } from '../status-badge/status-badge';

/** Card do catálogo: imagem, dados principais, favorito e comparar. */
@Component({
  selector: 'app-veiculo-card',
  imports: [RouterLink, CarIllustration, Icone, StatusBadge, MoedaBrPipe, KmPipe, TooltipDirective],
  templateUrl: './veiculo-card.html',
  styleUrl: './veiculo-card.scss',
})
export class VeiculoCard {
  readonly veiculo = input.required<Veiculo>();

  private readonly favoritos = inject(FavoritosService);
  private readonly comparador = inject(ComparadorService);
  private readonly notificacao = inject(NotificacaoService);

  protected readonly titulo = computed(() => `${this.veiculo().marca} ${this.veiculo().modelo}`);
  protected readonly favorito = computed(() => this.favoritos.lista().includes(this.veiculo().id));
  protected readonly comparando = computed(() => this.comparador.lista().includes(this.veiculo().id));

  protected alternarFavorito(): void {
    const adicionou = this.favoritos.alternar(this.veiculo().id);
    this.notificacao.info(adicionou ? 'Adicionado aos favoritos.' : 'Removido dos favoritos.');
  }

  protected alternarComparacao(): void {
    if (!this.comparador.alternar(this.veiculo().id)) {
      this.notificacao.erro(`Você pode comparar até ${LIMITE_COMPARACAO} veículos.`);
    }
  }

  protected readonly tituloCompleto = computed(() => tituloVeiculo(this.veiculo()));
}
