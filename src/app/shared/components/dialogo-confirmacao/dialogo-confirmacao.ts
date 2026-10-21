import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { ConfirmacaoService } from '../../../core/services/confirmacao.service';

/**
 * Diálogo modal com <dialog> nativo: foco preso, Esc fecha e o foco volta ao
 * elemento anterior — acessibilidade "de graça" pelo navegador.
 */
@Component({
  selector: 'app-dialogo-confirmacao',
  template: `
    <dialog #dialogo class="dialogo" aria-labelledby="dialogo-titulo" aria-describedby="dialogo-texto" (cancel)="responder(false, $event)">
      @if (servico.ativo(); as pedido) {
        <h2 id="dialogo-titulo">{{ pedido.titulo }}</h2>
        <p id="dialogo-texto">{{ pedido.mensagem }}</p>
        <div class="dialogo__acoes">
          <button type="button" class="btn btn--fantasma" (click)="responder(false)">
            {{ pedido.cancelar ?? 'Cancelar' }}
          </button>
          <button type="button" class="btn" [class.btn--perigo]="pedido.perigo" [class.btn--primario]="!pedido.perigo" (click)="responder(true)">
            {{ pedido.confirmar ?? 'Confirmar' }}
          </button>
        </div>
      }
    </dialog>
  `,
  styles: `
    .dialogo {
      width: min(28rem, calc(100vw - 2rem)); padding: 1.5rem; border: 0; border-radius: 18px;
      background: #fff; color: #17181c; box-shadow: 0 30px 80px rgba(0,0,0,.35);
    }
    .dialogo::backdrop { background: rgba(10, 11, 14, .6); backdrop-filter: blur(3px); }
    h2 { margin: 0 0 .5rem; font: 600 1.2rem/1.3 var(--fonte-display); }
    p { margin: 0 0 1.5rem; color: #5b616b; line-height: 1.55; }
    .dialogo__acoes { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: .6rem; }
  `,
})
export class DialogoConfirmacao {
  protected readonly servico = inject(ConfirmacaoService);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    // Abre/fecha o <dialog> conforme o signal do serviço.
    effect(() => {
      const el = this.dialogo().nativeElement;
      if (this.servico.ativo() && !el.open) el.showModal();
      if (!this.servico.ativo() && el.open) el.close();
    });
  }

  protected responder(ok: boolean, evento?: Event): void {
    evento?.preventDefault();
    this.servico.ativo()?.responder(ok);
  }
}
