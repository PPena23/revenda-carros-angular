import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LeadsService } from '../../../core/services/leads.service';
import { comEstado } from '../../../core/utils/estado-requisicao';
import { tituloVeiculo } from '../../../core/utils/rotulos';
import { CarIllustration } from '../../../shared/components/car-illustration/car-illustration';
import { EstadoErro, Skeleton } from '../../../shared/components/estados/estados';
import { Icone } from '../../../shared/components/icone/icone';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { MoedaBrPipe } from '../../../shared/pipes/moeda-br.pipe';
import { TempoEmEstoquePipe } from '../../../shared/pipes/tempo-em-estoque.pipe';
import { GraficoBarras, GraficoRosca } from './graficos';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    Icone,
    Skeleton,
    EstadoErro,
    StatusBadge,
    CarIllustration,
    GraficoBarras,
    GraficoRosca,
    MoedaBrPipe,
    TempoEmEstoquePipe,
    TooltipDirective,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly leads = inject(LeadsService);
  protected readonly auth = inject(AuthService);
  protected readonly recarregar$ = new BehaviorSubject<void>(undefined);
  protected readonly titulo = tituloVeiculo;

  protected readonly estado = toSignal(
    this.recarregar$.pipe(switchMap(() => this.leads.dashboard().pipe(comEstado()))),
    { initialValue: { status: 'carregando' } as const },
  );

  /** Adapta os dados da API para o formato dos componentes de gráfico. */
  protected readonly barras = computed(() => {
    const e = this.estado();
    return e.status === 'sucesso'
      ? e.dados.vendasPorMes.map((m) => ({ rotulo: m.mes, valor: m.quantidade, detalhe: m.receita }))
      : [];
  });

  protected readonly fatias = computed(() => {
    const e = this.estado();
    return e.status === 'sucesso'
      ? e.dados.estoquePorCategoria.map((c) => ({ rotulo: c.categoria, valor: c.quantidade }))
      : [];
  });

  protected readonly saudacao = computed(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  });

  // "quarta-feira, 21 de outubro" -> só a primeira letra maiúscula (padrão do português)
  protected readonly hoje = ((d) => d.charAt(0).toUpperCase() + d.slice(1))(
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
  );
}
