import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { CORES } from '../../../core/data/seed';
import {
  CAMBIOS,
  CATEGORIAS,
  COMBUSTIVEIS,
  Cambio,
  Categoria,
  Combustivel,
  FiltroVeiculos,
  Ordenacao,
} from '../../../core/models/veiculo.model';
import { VeiculosService } from '../../../core/services/veiculos.service';
import { comEstado } from '../../../core/utils/estado-requisicao';
import {
  contarFiltrosAtivos,
  filtroDeParams,
  filtroParaParams,
  filtrosIguais,
  limparFiltro,
} from '../../../core/utils/filtro-veiculos';
import { EstadoErro, EstadoVazio, Skeleton } from '../../../shared/components/estados/estados';
import { Icone } from '../../../shared/components/icone/icone';
import { VeiculoCard } from '../../../shared/components/veiculo-card/veiculo-card';
import { MoedaBrPipe } from '../../../shared/pipes/moeda-br.pipe';
import { KmPipe } from '../../../shared/pipes/km.pipe';

const POR_PAGINA = 12;

const numero = (v: string) => (v === '' ? undefined : Number(v));

/**
 * Estoque com filtros sincronizados à URL.
 * Fluxo: query params → filtro tipado → switchMap(API) → estado (carregando/sucesso/erro).
 * O formulário apenas ESCREVE na URL; a URL é a única fonte da verdade (links compartilháveis,
 * botão voltar do navegador funciona).
 */
@Component({
  selector: 'app-estoque',
  imports: [ReactiveFormsModule, VeiculoCard, Icone, Skeleton, EstadoErro, EstadoVazio, MoedaBrPipe, KmPipe],
  templateUrl: './estoque.html',
  styleUrl: './estoque.scss',
})
export class Estoque {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly veiculos = inject(VeiculosService);

  protected readonly categorias = CATEGORIAS;
  protected readonly cambios = CAMBIOS;
  protected readonly combustiveis = COMBUSTIVEIS;
  protected readonly faixasMin = [40_000, 60_000, 80_000, 100_000, 150_000];
  protected readonly faixasMax = [60_000, 80_000, 100_000, 150_000, 200_000, 300_000];
  protected readonly kms = [10_000, 30_000, 50_000, 80_000, 100_000];
  protected readonly ordenacoes: { valor: Ordenacao; rotulo: string }[] = [
    { valor: 'relevancia', rotulo: 'Mais relevantes' },
    { valor: 'menor-preco', rotulo: 'Menor preço' },
    { valor: 'maior-preco', rotulo: 'Maior preço' },
    { valor: 'mais-novo', rotulo: 'Mais novo' },
    { valor: 'menor-km', rotulo: 'Menor km' },
  ];

  protected readonly filtrosAbertos = signal(false);
  private readonly recarregar$ = new BehaviorSubject<void>(undefined);

  /** 1) URL → filtro. distinctUntilChanged evita buscas repetidas com os mesmos parâmetros. */
  private readonly filtro$ = this.route.queryParamMap.pipe(
    map(filtroDeParams),
    distinctUntilChanged(filtrosIguais),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  protected readonly filtro = toSignal(this.filtro$, { initialValue: {} as FiltroVeiculos });
  protected readonly qtdFiltros = computed(() => contarFiltrosAtivos(this.filtro()));

  /** 2) filtro → API. switchMap cancela a requisição anterior se o usuário mudar o filtro no meio. */
  protected readonly resultado = toSignal(
    combineLatest([this.filtro$, this.recarregar$]).pipe(
      switchMap(([f]) => this.veiculos.buscar({ ...f, porPagina: POR_PAGINA }).pipe(comEstado())),
    ),
    { initialValue: { status: 'carregando' } as const },
  );

  protected readonly totalPaginas = computed(() => {
    const r = this.resultado();
    return r.status === 'sucesso' ? Math.ceil(r.dados.total / r.dados.porPagina) : 0;
  });

  protected readonly paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  protected readonly opcoes = toSignal(this.veiculos.opcoes().pipe(catchError(() => of(null))), {
    initialValue: null,
  });

  protected readonly anos = computed(() => {
    const o = this.opcoes();
    if (!o) return [];
    return Array.from({ length: o.anoMax - o.anoMin + 1 }, (_, i) => o.anoMax - i);
  });

  protected readonly cores = computed(() =>
    (this.opcoes()?.cores ?? []).map((nome) => ({ nome, hex: CORES.find((c) => c.nome === nome)?.hex ?? '#888' })),
  );

  protected readonly form = inject(FormBuilder).nonNullable.group({
    q: '',
    marca: '',
    categoria: '',
    precoMin: '',
    precoMax: '',
    anoMin: '',
    kmMax: '',
    cambio: '',
    combustivel: '',
    cor: '',
  });

  protected readonly ordenacao = inject(FormBuilder).nonNullable.control<Ordenacao>('relevancia');

  constructor() {
    // URL → formulário (sem emitir eventos, para não criar laço).
    this.filtro$.pipe(takeUntilDestroyed()).subscribe((f) => {
      this.form.setValue(this.paraFormulario(f), { emitEvent: false });
      this.ordenacao.setValue(f.ordenar ?? 'relevancia', { emitEvent: false });
    });

    // Formulário → URL. debounceTime segura a digitação; o filter ignora valores iguais à URL atual.
    this.form.valueChanges
      .pipe(
        debounceTime(350),
        map(() => this.doFormulario()),
        withLatestFrom(this.filtro$),
        filter(([doForm, daUrl]) => !filtrosIguais(doForm, this.semPaginacao(daUrl))),
        takeUntilDestroyed(),
      )
      .subscribe(([doForm, daUrl]) => this.navegar({ ...doForm, ordenar: daUrl.ordenar }));

    this.ordenacao.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((ordenar) => this.navegar({ ...this.semPaginacao(this.filtro()), ordenar }));
  }

  protected irParaPagina(pagina: number): void {
    this.navegar({ ...this.filtro(), pagina });
    document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected removerFiltro(chave: keyof FiltroVeiculos): void {
    const { [chave]: _removido, ...resto } = this.semPaginacao(this.filtro());
    this.navegar(resto);
  }

  protected limparFiltros(): void {
    this.navegar({ ordenar: this.filtro().ordenar });
  }

  protected tentarNovamente(): void {
    this.recarregar$.next();
  }

  /** Lista de "chips" com os filtros ativos — cada um pode ser removido individualmente. */
  protected readonly chipsAtivos = computed(() => {
    const f = this.filtro();
    const moeda = (v: number) => `R$ ${(v / 1000).toLocaleString('pt-BR')} mil`;
    const chips: { chave: keyof FiltroVeiculos; rotulo: string }[] = [];
    if (f.q) chips.push({ chave: 'q', rotulo: `“${f.q}”` });
    if (f.marca) chips.push({ chave: 'marca', rotulo: f.marca });
    if (f.categoria) chips.push({ chave: 'categoria', rotulo: f.categoria });
    if (f.precoMin) chips.push({ chave: 'precoMin', rotulo: `A partir de ${moeda(f.precoMin)}` });
    if (f.precoMax) chips.push({ chave: 'precoMax', rotulo: `Até ${moeda(f.precoMax)}` });
    if (f.anoMin) chips.push({ chave: 'anoMin', rotulo: `${f.anoMin} ou mais novo` });
    if (f.kmMax) chips.push({ chave: 'kmMax', rotulo: `Até ${f.kmMax.toLocaleString('pt-BR')} km` });
    if (f.cambio) chips.push({ chave: 'cambio', rotulo: f.cambio });
    if (f.combustivel) chips.push({ chave: 'combustivel', rotulo: f.combustivel });
    if (f.cor) chips.push({ chave: 'cor', rotulo: f.cor });
    return chips;
  });

  private navegar(filtro: FiltroVeiculos): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: filtroParaParams({ ...filtro, ordenar: filtro.ordenar === 'relevancia' ? undefined : filtro.ordenar }),
    });
  }

  private semPaginacao(f: FiltroVeiculos): FiltroVeiculos {
    const { pagina, porPagina, ordenar, ...resto } = f;
    return resto;
  }

  private paraFormulario(f: FiltroVeiculos) {
    const s = (v: unknown) => (v === undefined || v === null ? '' : String(v));
    return {
      q: s(f.q),
      marca: s(f.marca),
      categoria: s(f.categoria),
      precoMin: s(f.precoMin),
      precoMax: s(f.precoMax),
      anoMin: s(f.anoMin),
      kmMax: s(f.kmMax),
      cambio: s(f.cambio),
      combustivel: s(f.combustivel),
      cor: s(f.cor),
    };
  }

  private doFormulario(): FiltroVeiculos {
    const v = this.form.getRawValue();
    return limparFiltro<FiltroVeiculos>({
      q: v.q.trim() || undefined,
      marca: v.marca || undefined,
      categoria: (v.categoria || undefined) as Categoria | undefined,
      precoMin: numero(v.precoMin),
      precoMax: numero(v.precoMax),
      anoMin: numero(v.anoMin),
      kmMax: numero(v.kmMax),
      cambio: (v.cambio || undefined) as Cambio | undefined,
      combustivel: (v.combustivel || undefined) as Combustivel | undefined,
      cor: v.cor || undefined,
    });
  }
}
