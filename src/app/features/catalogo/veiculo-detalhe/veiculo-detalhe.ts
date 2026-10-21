import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, filter, of, switchMap } from 'rxjs';
import { FINANCIAMENTO_CONFIG, LOJA_CONFIG } from '../../../core/config/app.tokens';
import { Veiculo } from '../../../core/models/veiculo.model';
import { ComparadorService, LIMITE_COMPARACAO } from '../../../core/services/comparador.service';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { NotificacaoService } from '../../../core/services/notificacao.service';
import { VeiculosService } from '../../../core/services/veiculos.service';
import { comEstado } from '../../../core/utils/estado-requisicao';
import { calcularPrice } from '../../../core/utils/financiamento';
import { tituloVeiculo } from '../../../core/utils/rotulos';
import { EstadoErro, Skeleton } from '../../../shared/components/estados/estados';
import { Icone } from '../../../shared/components/icone/icone';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { VeiculoCard } from '../../../shared/components/veiculo-card/veiculo-card';
import { KmPipe } from '../../../shared/pipes/km.pipe';
import { MoedaBrPipe } from '../../../shared/pipes/moeda-br.pipe';
import { TempoEmEstoquePipe } from '../../../shared/pipes/tempo-em-estoque.pipe';
import { LeadForm } from '../lead-form/lead-form';
import { Galeria } from './galeria/galeria';
import { Simulador } from './simulador/simulador';

@Component({
  selector: 'app-veiculo-detalhe',
  imports: [
    RouterLink,
    Galeria,
    Simulador,
    LeadForm,
    VeiculoCard,
    Icone,
    StatusBadge,
    Skeleton,
    EstadoErro,
    MoedaBrPipe,
    KmPipe,
    TempoEmEstoquePipe,
    DecimalPipe,
  ],
  templateUrl: './veiculo-detalhe.html',
  styleUrl: './veiculo-detalhe.scss',
})
export class VeiculoDetalhe {
  /** Parâmetro :id da rota, entregue como input graças ao withComponentInputBinding(). */
  readonly id = input.required<string>();

  private readonly veiculos = inject(VeiculosService);
  private readonly favoritos = inject(FavoritosService);
  private readonly comparador = inject(ComparadorService);
  private readonly notificacao = inject(NotificacaoService);
  private readonly financiamento = inject(FINANCIAMENTO_CONFIG);
  protected readonly loja = inject(LOJA_CONFIG);
  protected readonly taxaReferencia = this.financiamento.taxaMensalPadrao;
  protected readonly entradaReferencia = this.financiamento.entradaSugeridaPercentual;

  private readonly recarregar$ = new BehaviorSubject<void>(undefined);

  /** toObservable(signal) + switchMap: trocar de carro (ex.: clicar em um similar) cancela a busca anterior. */
  protected readonly estado = toSignal(
    combineLatest([toObservable(this.id), this.recarregar$]).pipe(
      switchMap(([id]) => this.veiculos.obter(id).pipe(comEstado())),
    ),
    { initialValue: { status: 'carregando' } as const },
  );

  protected readonly veiculo = computed<Veiculo | null>(() => {
    const e = this.estado();
    return e.status === 'sucesso' ? e.dados : null;
  });

  protected readonly similares = toSignal(
    toObservable(this.veiculo).pipe(
      filter((v): v is Veiculo => v !== null),
      distinctUntilChanged((a, b) => a.id === b.id),
      switchMap((v) => this.veiculos.similares(v, 3).pipe(catchError(() => of<Veiculo[]>([])))),
    ),
    { initialValue: [] as Veiculo[] },
  );

  protected readonly favorito = computed(() => this.favoritos.lista().includes(this.id()));
  protected readonly comparando = computed(() => this.comparador.lista().includes(this.id()));

  /** "A partir de" — parcela com entrada sugerida e taxa padrão do token de configuração. */
  protected readonly parcelaReferencia = computed(() => {
    const v = this.veiculo();
    if (!v) return null;
    // Mesmo arredondamento do simulador, para os dois valores baterem.
    const entrada = Math.round((v.preco * this.financiamento.entradaSugeridaPercentual) / 100 / 1000) * 1000;
    return calcularPrice(v.preco, entrada, 48, this.financiamento.taxaMensalPadrao).parcela;
  });

  protected readonly especificacoes = computed(() => {
    const v = this.veiculo();
    if (!v) return [];
    return [
      { rotulo: 'Marca', valor: v.marca },
      { rotulo: 'Modelo', valor: `${v.modelo} ${v.versao}` },
      { rotulo: 'Carroceria', valor: v.categoria },
      { rotulo: 'Ano fab./modelo', valor: `${v.anoFabricacao}/${v.anoModelo}` },
      { rotulo: 'Motor', valor: v.motor },
      { rotulo: 'Câmbio', valor: v.cambio },
      { rotulo: 'Combustível', valor: v.combustivel },
      { rotulo: 'Cor', valor: v.cor },
      { rotulo: 'Portas', valor: String(v.portas) },
      { rotulo: 'Final da placa', valor: v.placa.slice(-1) },
    ];
  });

  constructor() {
    // Título da aba com o nome do carro (o TituloStrategy só conhece o título estático da rota).
    const title = inject(Title);
    effect(() => {
      const v = this.veiculo();
      if (v) title.setTitle(`${tituloVeiculo(v)} ${v.anoModelo} · ${this.loja.nome}`);
    });
  }

  protected tentarNovamente(): void {
    this.recarregar$.next();
  }

  protected alternarFavorito(): void {
    const adicionou = this.favoritos.alternar(this.id());
    this.notificacao.info(adicionou ? 'Adicionado aos favoritos.' : 'Removido dos favoritos.');
  }

  protected alternarComparacao(): void {
    if (!this.comparador.alternar(this.id())) {
      this.notificacao.erro(`Você pode comparar até ${LIMITE_COMPARACAO} veículos.`);
    }
  }

  protected async compartilhar(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.notificacao.sucesso('Link copiado para a área de transferência.');
    } catch {
      this.notificacao.erro('Não foi possível copiar o link.');
    }
  }

  protected irParaFormulario(): void {
    const alvo = document.getElementById('interesse');
    alvo?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => alvo?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true }), 450);
  }
}
