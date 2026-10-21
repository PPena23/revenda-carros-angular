import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, map, of, switchMap } from 'rxjs';
import { CATEGORIAS, FiltroVeiculos } from '../../../core/models/veiculo.model';
import { VeiculosService } from '../../../core/services/veiculos.service';
import { comEstado } from '../../../core/utils/estado-requisicao';
import { filtroParaParams } from '../../../core/utils/filtro-veiculos';
import { CarIllustration } from '../../../shared/components/car-illustration/car-illustration';
import { EstadoErro, EstadoVazio, Skeleton } from '../../../shared/components/estados/estados';
import { Icone } from '../../../shared/components/icone/icone';
import { VeiculoCard } from '../../../shared/components/veiculo-card/veiculo-card';
import { RevelarDirective } from '../../../shared/directives/revelar.directive';

@Component({
  selector: 'app-home',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CarIllustration,
    VeiculoCard,
    Icone,
    Skeleton,
    EstadoErro,
    EstadoVazio,
    RevelarDirective,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly veiculos = inject(VeiculosService);
  private readonly router = inject(Router);

  /** Disparar .next() refaz a busca (botão "Tentar novamente"). */
  private readonly recarregar$ = new BehaviorSubject<void>(undefined);

  protected readonly destaques = toSignal(
    this.recarregar$.pipe(switchMap(() => this.veiculos.destaques(6).pipe(comEstado()))),
    { initialValue: { status: 'carregando' } as const },
  );

  /** Marcas para o select de busca; em caso de erro, o select apenas fica com "Todas". */
  protected readonly marcas = toSignal(
    this.veiculos.opcoes().pipe(
      map((o) => o.marcas),
      catchError(() => of<string[]>([])),
    ),
    { initialValue: [] as string[] },
  );

  protected readonly busca = inject(FormBuilder).nonNullable.group({ marca: '', q: '' });

  protected readonly atalhos: { rotulo: string; filtro: FiltroVeiculos }[] = [
    { rotulo: 'SUV', filtro: { categoria: 'SUV' } },
    { rotulo: 'Sedã', filtro: { categoria: 'Sedã' } },
    { rotulo: 'Hatch', filtro: { categoria: 'Hatch' } },
    { rotulo: 'Picape', filtro: { categoria: 'Picape' } },
    { rotulo: 'Até R$ 80 mil', filtro: { precoMax: 80_000 } },
    { rotulo: 'Até 30 mil km', filtro: { kmMax: 30_000 } },
    { rotulo: 'Automáticos', filtro: { cambio: 'Automático' } },
    { rotulo: 'Híbridos e elétricos', filtro: { combustivel: 'Híbrido' } },
  ];

  protected readonly categorias = CATEGORIAS.map((c, i) => ({
    nome: c,
    cor: ['#A3161D', '#ECEEF1', '#24467F', '#5A6069'][i],
    descricao: {
      Hatch: 'Ágeis e econômicos para a cidade',
      Sedã: 'Conforto e porta-malas para a família',
      SUV: 'Posição alta e versatilidade',
      Picape: 'Força para o trabalho e o lazer',
    }[c],
  }));

  protected readonly diferenciais = [
    { icone: 'escudo' as const, titulo: 'Laudo cautelar aprovado', texto: 'Todos os carros passam por vistoria independente e revisão completa antes de entrar no estoque.' },
    { icone: 'cifrao' as const, titulo: 'Financiamento em até 60x', texto: 'Simule a parcela na página do veículo e receba uma proposta em minutos, sem compromisso.' },
    { icone: 'atualizar' as const, titulo: 'Seu usado na troca', texto: 'Avaliação transparente na hora, com valor de tabela de referência e pagamento à vista.' },
  ];

  protected params(filtro: FiltroVeiculos) {
    return filtroParaParams(filtro);
  }

  protected buscar(): void {
    const { marca, q } = this.busca.getRawValue();
    this.router.navigate(['/estoque'], { queryParams: filtroParaParams({ marca, q: q.trim() }) });
  }

  protected tentarNovamente(): void {
    this.recarregar$.next();
  }
}
