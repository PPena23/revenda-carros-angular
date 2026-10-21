import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, map, startWith } from 'rxjs';
import { CORES, MARCAS_CONHECIDAS, SUGESTOES_OPCIONAIS } from '../../../core/data/seed';
import { ComAlteracoesPendentes } from '../../../core/guards/alteracoes-pendentes.guard';
import {
  CAMBIOS,
  CATEGORIAS,
  COMBUSTIVEIS,
  Cambio,
  Categoria,
  Combustivel,
  StatusVeiculo,
  Veiculo,
  VeiculoPayload,
} from '../../../core/models/veiculo.model';
import { NotificacaoService } from '../../../core/services/notificacao.service';
import { VeiculosService } from '../../../core/services/veiculos.service';
import { mensagemDeErro } from '../../../core/utils/estado-requisicao';
import { ROTULO_STATUS_VEICULO } from '../../../core/utils/rotulos';
import { CarIllustration } from '../../../shared/components/car-illustration/car-illustration';
import { EstadoErro, Skeleton } from '../../../shared/components/estados/estados';
import { Icone } from '../../../shared/components/icone/icone';
import { MascaraPlacaDirective } from '../../../shared/directives/mascara-placa.directive';
import { KmPipe } from '../../../shared/pipes/km.pipe';
import { MoedaBrPipe } from '../../../shared/pipes/moeda-br.pipe';
import {
  anoModeloValidator,
  placaUnicaValidator,
  placaValidator,
  semDuplicadosValidator,
} from '../../../shared/validators/validadores';

const ANO_ATUAL = new Date().getFullYear();

/**
 * Cadastro/edição de veículo — o "formulário grande" do projeto:
 * FormGroup aninhado (anos) com validador cross-field, FormArray de opcionais,
 * validador assíncrono de placa única, máscara por diretiva e prévia ao vivo.
 * Implementa ComAlteracoesPendentes para o guard CanDeactivate.
 */
@Component({
  selector: 'app-veiculo-form',
  imports: [ReactiveFormsModule, RouterLink, CarIllustration, Icone, Skeleton, EstadoErro, MascaraPlacaDirective, MoedaBrPipe, KmPipe],
  templateUrl: './veiculo-form.html',
  styleUrl: './veiculo-form.scss',
  host: { '(window:beforeunload)': 'avisarAoFecharAba($event)' },
})
export class VeiculoForm implements OnInit, ComAlteracoesPendentes {
  /** :id da rota (ausente em /admin/veiculos/novo). */
  readonly id = input<string>();

  private readonly api = inject(VeiculosService);
  private readonly router = inject(Router);
  private readonly notificacao = inject(NotificacaoService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly categorias = CATEGORIAS;
  protected readonly cambios = CAMBIOS;
  protected readonly combustiveis = COMBUSTIVEIS;
  protected readonly cores = CORES;
  protected readonly marcas = MARCAS_CONHECIDAS;
  protected readonly rotuloStatus = ROTULO_STATUS_VEICULO;
  protected readonly anoMax = ANO_ATUAL + 1;

  protected readonly modoEdicao = computed(() => !!this.id());
  protected readonly carregando = signal(false);
  protected readonly erroCarga = signal<string | null>(null);
  protected readonly salvando = signal(false);
  private salvo = false;
  private statusOriginal: StatusVeiculo = 'disponivel';

  protected readonly form = this.fb.group({
    marca: ['', [Validators.required, Validators.maxLength(30)]],
    modelo: ['', [Validators.required, Validators.maxLength(40)]],
    versao: ['', Validators.maxLength(40)],
    categoria: ['SUV' as Categoria, Validators.required],
    placa: this.fb.control('', {
      validators: [Validators.required, placaValidator],
      asyncValidators: [placaUnicaValidator((placa) => this.api.placaDisponivel(placa, this.id()))],
    }),
    // Grupo aninhado: o validador cross-field enxerga os dois anos juntos.
    anos: this.fb.group(
      {
        anoFabricacao: [ANO_ATUAL, [Validators.required, Validators.min(1990), Validators.max(ANO_ATUAL)]],
        anoModelo: [ANO_ATUAL, [Validators.required, Validators.max(ANO_ATUAL + 1)]],
      },
      { validators: anoModeloValidator() },
    ),
    km: [0, [Validators.required, Validators.min(0), Validators.max(999_999)]],
    motor: ['', Validators.required],
    cambio: ['Automático' as Cambio],
    combustivel: ['Flex' as Combustivel],
    portas: [4],
    cor: ['Branco', Validators.required],
    corHex: ['#ECEEF1'],
    preco: [0, [Validators.required, Validators.min(1)]],
    status: ['disponivel' as StatusVeiculo],
    destaque: [false],
    descricao: ['', Validators.maxLength(600)],
    opcionais: this.fb.array<FormControl<string>>([], { validators: [semDuplicadosValidator, Validators.maxLength(20)] }),
  });

  protected get opcionais() {
    return this.form.controls.opcionais;
  }

  /** Prévia do anúncio, atualizada a cada digitação (valueChanges → signal). */
  protected readonly previa = toSignal(
    this.form.valueChanges.pipe(
      startWith(null),
      map(() => this.form.getRawValue()),
    ),
    { initialValue: this.form.getRawValue() },
  );

  /** Status do formulário como signal — inclui PENDING enquanto a placa é verificada. */
  protected readonly statusForm = toSignal(this.form.statusChanges, { initialValue: this.form.status });
  protected readonly statusPlaca = toSignal(this.form.controls.placa.statusChanges, {
    initialValue: this.form.controls.placa.status,
  });

  protected readonly sugestoes = computed(() => {
    const atuais = new Set(this.previa().opcionais.map((o) => o.toLowerCase()));
    return SUGESTOES_OPCIONAIS.filter((s) => !atuais.has(s.toLowerCase())).slice(0, 10);
  });

  protected readonly tentouSalvar = signal(false);

  ngOnInit(): void {
    const id = this.id();
    if (id) this.carregar(id);
  }

  protected carregar(id: string): void {
    this.carregando.set(true);
    this.erroCarga.set(null);
    this.api
      .obter(id)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (v) => this.preencher(v),
        error: (e: unknown) => this.erroCarga.set(mensagemDeErro(e)),
      });
  }

  private preencher(v: Veiculo): void {
    this.statusOriginal = v.status;
    this.opcionais.clear();
    v.opcionais.forEach((o) => this.opcionais.push(this.novoOpcional(o)));
    // reset() (em vez de patchValue) deixa o formulário "pristine" — sem alerta de alterações.
    this.form.reset({
      marca: v.marca,
      modelo: v.modelo,
      versao: v.versao,
      categoria: v.categoria,
      placa: v.placa,
      anos: { anoFabricacao: v.anoFabricacao, anoModelo: v.anoModelo },
      km: v.km,
      motor: v.motor,
      cambio: v.cambio,
      combustivel: v.combustivel,
      portas: v.portas,
      cor: v.cor,
      corHex: v.corHex,
      preco: v.preco,
      status: v.status,
      destaque: v.destaque,
      descricao: v.descricao,
      opcionais: v.opcionais,
    });
  }

  /** Status disponíveis no select: "vendido" só aparece se o carro já foi vendido (venda tem fluxo próprio). */
  protected readonly opcoesStatus = computed<StatusVeiculo[]>(() =>
    this.previa().status === 'vendido' || this.statusOriginal === 'vendido'
      ? ['disponivel', 'reservado', 'vendido']
      : ['disponivel', 'reservado'],
  );

  // ---------- FormArray de opcionais ----------
  private novoOpcional(valor = ''): FormControl<string> {
    return this.fb.control(valor, [Validators.required, Validators.maxLength(40)]);
  }

  protected adicionarOpcional(valor = ''): void {
    this.opcionais.push(this.novoOpcional(valor));
    this.opcionais.markAsDirty();
    if (!valor) {
      // Foca o novo campo vazio.
      queueMicrotask(() => document.getElementById(`opcional-${this.opcionais.length - 1}`)?.focus());
    }
  }

  protected removerOpcional(i: number): void {
    this.opcionais.removeAt(i);
    this.opcionais.markAsDirty();
  }

  protected escolherCor(nome: string, hex: string): void {
    this.form.patchValue({ cor: nome, corHex: hex });
    this.form.markAsDirty();
  }

  // ---------- Mensagens de erro ----------
  protected mostrarErro(caminho: string): boolean {
    const c = this.form.get(caminho);
    return !!c && c.invalid && (c.touched || this.tentouSalvar());
  }

  protected erro(caminho: string): string {
    const e = this.form.get(caminho)?.errors ?? {};
    if (e['required']) return 'Campo obrigatório.';
    if (e['placa']) return 'Use o padrão Mercosul (ABC1D23) ou antigo (ABC1234).';
    if (e['placaEmUso']) return 'Já existe um veículo com esta placa.';
    if (e['min']) return `Valor mínimo: ${e['min'].min}.`;
    if (e['max']) return `Valor máximo: ${e['max'].max}.`;
    if (e['maxlength']) return `Máximo de ${e['maxlength'].requiredLength} caracteres.`;
    return 'Valor inválido.';
  }

  /** Lista de problemas exibida no topo ao tentar salvar (padrão "error summary" acessível). */
  protected readonly resumoErros = computed(() => {
    this.statusForm();
    this.previa();
    if (!this.tentouSalvar()) return [];
    const rotulos: Record<string, string> = {
      marca: 'Marca', modelo: 'Modelo', versao: 'Versão', placa: 'Placa', km: 'Quilometragem',
      motor: 'Motor', cor: 'Cor', preco: 'Preço', descricao: 'Descrição',
      'anos.anoFabricacao': 'Ano de fabricação', 'anos.anoModelo': 'Ano modelo',
    };
    const lista = Object.entries(rotulos)
      .filter(([caminho]) => this.form.get(caminho)?.invalid)
      .map(([caminho, rotulo]) => ({ id: 'campo-' + caminho.replace('anos.', ''), texto: `${rotulo}: ${this.erro(caminho)}` }));
    const anos = this.form.controls.anos.errors?.['anoModelo'];
    if (anos) lista.push({ id: 'campo-anoModelo', texto: anos as string });
    if (this.opcionais.invalid) lista.push({ id: 'opcionais', texto: 'Opcionais: preencha ou remova itens vazios/duplicados.' });
    return lista;
  });

  protected focar(id: string): void {
    document.getElementById(id)?.focus();
  }

  // ---------- Salvar ----------
  protected salvar(): void {
    this.tentouSalvar.set(true);
    this.form.markAllAsTouched();
    if (this.form.pending) {
      this.notificacao.info('Aguarde a verificação da placa…');
      return;
    }
    if (this.form.invalid) {
      queueMicrotask(() => document.getElementById('resumo-erros')?.focus());
      return;
    }

    const v = this.form.getRawValue();
    const payload: VeiculoPayload = {
      marca: v.marca.trim(),
      modelo: v.modelo.trim(),
      versao: v.versao.trim(),
      categoria: v.categoria,
      placa: v.placa,
      anoFabricacao: Number(v.anos.anoFabricacao),
      anoModelo: Number(v.anos.anoModelo),
      km: Number(v.km),
      preco: Number(v.preco),
      cambio: v.cambio,
      combustivel: v.combustivel,
      cor: v.cor.trim(),
      corHex: v.corHex,
      portas: Number(v.portas),
      motor: v.motor.trim(),
      opcionais: v.opcionais.map((o) => o.trim()).filter(Boolean),
      descricao: v.descricao.trim(),
      destaque: v.destaque,
      status: v.status,
    };

    const id = this.id();
    const requisicao$ = id ? this.api.atualizar(id, payload) : this.api.criar(payload);

    this.salvando.set(true);
    requisicao$.pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: (salvo) => {
        this.salvo = true;
        this.form.markAsPristine();
        this.notificacao.sucesso(id ? 'Alterações salvas.' : `${salvo.marca} ${salvo.modelo} cadastrado!`);
        this.router.navigate(['/admin/veiculos']);
      },
      error: (e: unknown) => this.notificacao.erro(mensagemDeErro(e)),
    });
  }

  // ---------- Guard CanDeactivate ----------
  temAlteracoesPendentes(): boolean {
    return this.form.dirty && !this.salvo;
  }

  protected avisarAoFecharAba(evento: BeforeUnloadEvent): void {
    if (this.temAlteracoesPendentes()) evento.preventDefault();
  }
}
