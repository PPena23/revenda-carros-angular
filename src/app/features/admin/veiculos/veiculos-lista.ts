import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs';
import { CATEGORIAS, StatusVeiculo, Veiculo } from '../../../core/models/veiculo.model';
import { ConfirmacaoService } from '../../../core/services/confirmacao.service';
import { NotificacaoService } from '../../../core/services/notificacao.service';
import { VeiculosService } from '../../../core/services/veiculos.service';
import { comEstado, mensagemDeErro } from '../../../core/utils/estado-requisicao';
import { ROTULO_STATUS_VEICULO, tituloVeiculo } from '../../../core/utils/rotulos';
import { CarIllustration } from '../../../shared/components/car-illustration/car-illustration';
import { EstadoErro, EstadoVazio, Skeleton } from '../../../shared/components/estados/estados';
import { Icone } from '../../../shared/components/icone/icone';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { KmPipe } from '../../../shared/pipes/km.pipe';
import { MoedaBrPipe } from '../../../shared/pipes/moeda-br.pipe';
import { TempoEmEstoquePipe } from '../../../shared/pipes/tempo-em-estoque.pipe';
import { VendaDialogo } from './venda-dialogo';

type Coluna = 'veiculo' | 'ano' | 'km' | 'preco' | 'status' | 'entrada';

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Tabela administrativa de veículos: busca com debounce, filtros, ordenação e ações. */
@Component({
  selector: 'app-veiculos-lista',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CarIllustration,
    Icone,
    StatusBadge,
    Skeleton,
    EstadoErro,
    EstadoVazio,
    VendaDialogo,
    MoedaBrPipe,
    KmPipe,
    TempoEmEstoquePipe,
    TooltipDirective,
  ],
  templateUrl: './veiculos-lista.html',
  styleUrl: './veiculos-lista.scss',
})
export class VeiculosLista {
  /** Query param opcional (?ordenar=antigos) vindo do dashboard. */
  readonly ordenar = input<string>();

  private readonly api = inject(VeiculosService);
  private readonly confirmacao = inject(ConfirmacaoService);
  private readonly notificacao = inject(NotificacaoService);

  protected readonly categorias = CATEGORIAS;
  protected readonly abas: { valor: StatusVeiculo | 'todos'; rotulo: string }[] = [
    { valor: 'todos', rotulo: 'Todos' },
    ...(['disponivel', 'reservado', 'vendido'] as const).map((s) => ({ valor: s, rotulo: ROTULO_STATUS_VEICULO[s] })),
  ];
  protected readonly colunas: { id: Coluna; rotulo: string }[] = [
    { id: 'veiculo', rotulo: 'Veículo' },
    { id: 'ano', rotulo: 'Ano' },
    { id: 'km', rotulo: 'Km' },
    { id: 'preco', rotulo: 'Preço' },
    { id: 'status', rotulo: 'Status' },
    { id: 'entrada', rotulo: 'No estoque' },
  ];
  protected readonly titulo = tituloVeiculo;

  private readonly recarregar$ = new BehaviorSubject<void>(undefined);
  protected readonly estado = toSignal(
    this.recarregar$.pipe(switchMap(() => this.api.listarTodos().pipe(comEstado()))),
    { initialValue: { status: 'carregando' } as const },
  );

  /**
   * linkedSignal: guarda a última lista válida. Ao recarregar (após editar/vender),
   * a tabela continua visível em vez de piscar o skeleton. Também é gravável,
   * para atualizações otimistas.
   */
  protected readonly lista = linkedSignal<ReturnType<typeof this.estado>, Veiculo[] | null>({
    source: this.estado,
    computation: (e, anterior) => (e.status === 'sucesso' ? e.dados : (anterior?.value ?? null)),
  });
  protected readonly atualizando = computed(() => this.estado().status === 'carregando' && this.lista() !== null);

  // Busca: FormControl + debounceTime/distinctUntilChanged → signal
  protected readonly busca = new FormControl('', { nonNullable: true });
  private readonly termo = toSignal(
    this.busca.valueChanges.pipe(
      debounceTime(250),
      map((t) => normalizar(t.trim())),
      distinctUntilChanged(),
      startWith(''),
    ),
    { initialValue: '' },
  );

  protected readonly filtroStatus = signal<StatusVeiculo | 'todos'>('todos');
  protected readonly filtroCategoria = new FormControl('', { nonNullable: true });
  private readonly categoria = toSignal(this.filtroCategoria.valueChanges, { initialValue: '' });

  protected readonly ordenacao = linkedSignal<{ coluna: Coluna; asc: boolean }>(() =>
    this.ordenar() === 'antigos' ? { coluna: 'entrada', asc: true } : { coluna: 'entrada', asc: false },
  );

  protected readonly contagem = computed<Record<StatusVeiculo | 'todos', number>>(() => {
    const l = this.lista() ?? [];
    return {
      todos: l.length,
      disponivel: l.filter((v) => v.status === 'disponivel').length,
      reservado: l.filter((v) => v.status === 'reservado').length,
      vendido: l.filter((v) => v.status === 'vendido').length,
    };
  });

  protected readonly filtrados = computed(() => {
    const termo = this.termo();
    const status = this.filtroStatus();
    const categoria = this.categoria();
    const { coluna, asc } = this.ordenacao();

    const chave: Record<Coluna, (v: Veiculo) => number | string> = {
      veiculo: (v) => tituloVeiculo(v),
      ano: (v) => v.anoModelo,
      km: (v) => v.km,
      preco: (v) => v.preco,
      status: (v) => v.status,
      entrada: (v) => v.dataEntrada,
    };

    return (this.lista() ?? [])
      .filter((v) => status === 'todos' || v.status === status)
      .filter((v) => !categoria || v.categoria === categoria)
      .filter((v) => !termo || normalizar(`${tituloVeiculo(v)} ${v.placa}`).includes(termo))
      .sort((a, b) => {
        const [x, y] = [chave[coluna](a), chave[coluna](b)];
        const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
        return asc ? r : -r;
      });
  });

  protected readonly vendendo = signal<Veiculo | null>(null);

  protected ordenarPor(coluna: Coluna): void {
    this.ordenacao.update((o) => ({ coluna, asc: o.coluna === coluna ? !o.asc : true }));
  }

  protected ariaSort(coluna: Coluna): 'ascending' | 'descending' | null {
    const o = this.ordenacao();
    return o.coluna === coluna ? (o.asc ? 'ascending' : 'descending') : null;
  }

  protected tentarNovamente(): void {
    this.recarregar$.next();
  }

  protected limparFiltros(): void {
    this.busca.setValue('');
    this.filtroCategoria.setValue('');
    this.filtroStatus.set('todos');
  }

  protected async excluir(v: Veiculo): Promise<void> {
    const ok = await this.confirmacao.perguntar({
      titulo: `Excluir ${v.marca} ${v.modelo}?`,
      mensagem: `O anúncio da placa ${v.placa} será removido do catálogo. Esta ação não pode ser desfeita.`,
      confirmar: 'Excluir',
      perigo: true,
    });
    if (!ok) return;

    // Atualização otimista: some da tabela na hora; se a API falhar, volta.
    const anterior = this.lista();
    this.lista.update((l) => l?.filter((x) => x.id !== v.id) ?? null);
    this.api.excluir(v.id).subscribe({
      next: () => this.notificacao.sucesso('Veículo excluído.'),
      error: (e: unknown) => {
        this.lista.set(anterior);
        this.notificacao.erro(mensagemDeErro(e));
      },
    });
  }

  protected vendaConcluida(v: Veiculo): void {
    this.vendendo.set(null);
    this.lista.update((l) => l?.map((x) => (x.id === v.id ? v : x)) ?? null);
    this.notificacao.sucesso(`${v.marca} ${v.modelo} marcado como vendido.`);
  }
}
