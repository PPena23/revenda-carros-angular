import { DatePipe } from '@angular/common';
import { Component, computed, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs';
import { Lead, PIPELINE_LEADS, StatusLead } from '../../../core/models/lead.model';
import { LeadsService } from '../../../core/services/leads.service';
import { NotificacaoService } from '../../../core/services/notificacao.service';
import { comEstado, mensagemDeErro } from '../../../core/utils/estado-requisicao';
import { ROTULO_ORIGEM_LEAD, ROTULO_STATUS_LEAD } from '../../../core/utils/rotulos';
import { EstadoErro, EstadoVazio, Skeleton } from '../../../shared/components/estados/estados';
import { Icone } from '../../../shared/components/icone/icone';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { TempoEmEstoquePipe } from '../../../shared/pipes/tempo-em-estoque.pipe';

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Funil de leads: colunas por status (Novo → Em contato → Proposta → Fechado/Perdido). */
@Component({
  selector: 'app-leads',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, Icone, StatusBadge, Skeleton, EstadoErro, EstadoVazio, TempoEmEstoquePipe],
  templateUrl: './leads.html',
  styleUrl: './leads.scss',
})
export class Leads {
  private readonly api = inject(LeadsService);
  private readonly notificacao = inject(NotificacaoService);

  protected readonly pipeline = PIPELINE_LEADS;
  protected readonly rotulo = ROTULO_STATUS_LEAD;
  protected readonly origem = ROTULO_ORIGEM_LEAD;

  protected readonly recarregar$ = new BehaviorSubject<void>(undefined);
  protected readonly estado = toSignal(
    this.recarregar$.pipe(switchMap(() => this.api.listar().pipe(comEstado()))),
    { initialValue: { status: 'carregando' } as const },
  );

  /** Cópia local e gravável dos leads (linkedSignal) — permite mudar status de forma otimista. */
  protected readonly leads = linkedSignal<ReturnType<typeof this.estado>, Lead[] | null>({
    source: this.estado,
    computation: (e, anterior) => (e.status === 'sucesso' ? e.dados : (anterior?.value ?? null)),
  });

  protected readonly busca = new FormControl('', { nonNullable: true });
  private readonly termo = toSignal(
    this.busca.valueChanges.pipe(debounceTime(250), map((t) => normalizar(t.trim())), distinctUntilChanged(), startWith('')),
    { initialValue: '' },
  );

  protected readonly colunas = computed(() => {
    const termo = this.termo();
    const lista = (this.leads() ?? []).filter(
      (l) => !termo || normalizar(`${l.nome} ${l.email} ${l.telefone} ${l.veiculoTitulo ?? ''}`).includes(termo),
    );
    return this.pipeline.map((status) => ({
      status,
      itens: lista.filter((l) => l.status === status).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
    }));
  });

  protected readonly totalFiltrado = computed(() => this.colunas().reduce((s, c) => s + c.itens.length, 0));

  protected readonly taxaConversao = computed(() => {
    const l = this.leads() ?? [];
    const encerrados = l.filter((x) => x.status === 'fechado' || x.status === 'perdido');
    const fechados = encerrados.filter((x) => x.status === 'fechado').length;
    return encerrados.length ? Math.round((fechados / encerrados.length) * 100) : 0;
  });

  /** Próximo passo natural do funil, para o botão de avanço rápido. */
  protected proximo(status: StatusLead): StatusLead | null {
    const ordem: Partial<Record<StatusLead, StatusLead>> = { novo: 'em-contato', 'em-contato': 'proposta', proposta: 'fechado' };
    return ordem[status] ?? null;
  }

  protected mudarStatus(lead: Lead, status: StatusLead): void {
    if (lead.status === status) return;
    const anterior = this.leads();
    this.leads.update((l) => l?.map((x) => (x.id === lead.id ? { ...x, status } : x)) ?? null);

    this.api.alterarStatus(lead.id, status).subscribe({
      next: () => this.notificacao.sucesso(`${lead.nome.split(' ')[0]} movido para "${this.rotulo[status]}".`),
      error: (e: unknown) => {
        this.leads.set(anterior); // desfaz a mudança otimista
        this.notificacao.erro(mensagemDeErro(e));
      },
    });
  }

  protected aoSelecionar(lead: Lead, evento: Event): void {
    this.mudarStatus(lead, (evento.target as HTMLSelectElement).value as StatusLead);
  }
}
