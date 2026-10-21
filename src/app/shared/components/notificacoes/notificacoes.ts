import { Component, inject } from '@angular/core';
import { NotificacaoService } from '../../../core/services/notificacao.service';
import { Icone } from '../icone/icone';

/** Pilha de toasts em uma região aria-live (anunciada sem roubar o foco). */
@Component({
  selector: 'app-notificacoes',
  imports: [Icone],
  template: `
    <div class="toasts" aria-live="polite" aria-relevant="additions">
      @for (n of servico.itens(); track n.id) {
        <div class="toast" [attr.data-tipo]="n.tipo">
          <app-icone [nome]="n.tipo === 'erro' ? 'alerta' : n.tipo === 'sucesso' ? 'check' : 'estrela'" [tamanho]="18" />
          <span>{{ n.mensagem }}</span>
          <button type="button" class="toast__fechar" aria-label="Fechar aviso" (click)="servico.fechar(n.id)">
            <app-icone nome="fechar" [tamanho]="16" />
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts {
      position: fixed; z-index: 1000; left: 50%; bottom: 1rem; transform: translateX(-50%);
      display: flex; flex-direction: column; gap: .5rem; width: min(26rem, calc(100vw - 2rem));
    }
    .toast {
      display: flex; align-items: center; gap: .65rem; padding: .75rem .75rem .75rem 1rem;
      border-radius: 12px; background: #1c1d22; color: #f5f6f7; font-size: .9rem;
      border: 1px solid rgba(255,255,255,.1); box-shadow: 0 12px 32px rgba(0,0,0,.35);
      animation: entrar 220ms cubic-bezier(.2,.7,.2,1);
    }
    .toast span { flex: 1; }
    .toast[data-tipo='sucesso'] app-icone { color: #6fdc9b; }
    .toast[data-tipo='erro'] app-icone { color: #ff6b63; }
    .toast[data-tipo='info'] app-icone { color: #c9ccd1; }
    .toast__fechar {
      display: grid; place-items: center; width: 2rem; height: 2rem; border: 0; border-radius: 8px;
      background: transparent; color: inherit; cursor: pointer;
    }
    .toast__fechar:hover { background: rgba(255,255,255,.08); }
    @keyframes entrar { from { opacity: 0; transform: translateY(8px); } }
  `,
})
export class Notificacoes {
  protected readonly servico = inject(NotificacaoService);
}
