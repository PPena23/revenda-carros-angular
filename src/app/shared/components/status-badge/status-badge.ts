import { Component, computed, input } from '@angular/core';
import { StatusLead } from '../../../core/models/lead.model';
import { StatusVeiculo } from '../../../core/models/veiculo.model';
import { ROTULO_STATUS_LEAD, ROTULO_STATUS_VEICULO } from '../../../core/utils/rotulos';

/** Selo de status: sempre texto + ícone + cor (nunca só cor — acessibilidade). */
@Component({
  selector: 'app-status-badge',
  template: `<span class="selo" [attr.data-status]="status()"><span class="ponto" aria-hidden="true"></span>{{ rotulo() }}</span>`,
  styles: `
    .selo {
      display: inline-flex; align-items: center; gap: .4rem; white-space: nowrap;
      padding: .22rem .6rem .22rem .5rem; border-radius: 999px;
      font: 600 .75rem/1.2 var(--fonte-texto); letter-spacing: .01em;
      background: var(--selo-fundo, #e9ebef); color: var(--selo-texto, #30343b);
      border: 1px solid var(--selo-borda, transparent);
    }
    .ponto { width: .5rem; height: .5rem; border-radius: 50%; background: currentColor; }
    [data-status='disponivel'], [data-status='fechado'] { --selo-fundo: #e3f4ea; --selo-texto: #17663a; }
    [data-status='reservado'], [data-status='proposta'] { --selo-fundo: #fff1d6; --selo-texto: #8a5300; }
    [data-status='vendido'] { --selo-fundo: #e8e9ec; --selo-texto: #3d424a; }
    [data-status='vendido'] .ponto { border-radius: 2px; }
    [data-status='novo'] { --selo-fundo: #fde6e5; --selo-texto: #b00500; }
    [data-status='em-contato'] { --selo-fundo: #e2ecfb; --selo-texto: #1d4f99; }
    [data-status='perdido'] { --selo-fundo: #f0f0f2; --selo-texto: #5b606a; }
    [data-status='perdido'] .ponto { background: transparent; border: 1.5px solid currentColor; }
    :host-context(.tema-escuro) [data-status='disponivel'] { --selo-fundo: rgba(46, 160, 95, .16); --selo-texto: #7be0a5; }
    :host-context(.tema-escuro) [data-status='reservado'] { --selo-fundo: rgba(240, 170, 40, .16); --selo-texto: #ffc861; }
    :host-context(.tema-escuro) [data-status='vendido'] { --selo-fundo: rgba(255, 255, 255, .1); --selo-texto: #d4d6da; }
  `,
})
export class StatusBadge {
  readonly status = input.required<StatusVeiculo | StatusLead>();

  protected readonly rotulo = computed(() => {
    const s = this.status();
    return (ROTULO_STATUS_VEICULO as Record<string, string>)[s] ?? ROTULO_STATUS_LEAD[s as StatusLead];
  });
}
