import { Injectable, signal } from '@angular/core';

export interface PedidoConfirmacao {
  titulo: string;
  mensagem: string;
  confirmar?: string;
  cancelar?: string;
  perigo?: boolean;
}

interface PedidoAtivo extends PedidoConfirmacao {
  responder: (ok: boolean) => void;
}

/**
 * Diálogo de confirmação acessível (usa <dialog> nativo, renderizado no App).
 * Retorna Promise<boolean> — compatível com guards CanDeactivate.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmacaoService {
  readonly ativo = signal<PedidoAtivo | null>(null);

  perguntar(pedido: PedidoConfirmacao): Promise<boolean> {
    this.ativo()?.responder(false);
    return new Promise<boolean>((resolve) => {
      this.ativo.set({
        ...pedido,
        responder: (ok) => {
          this.ativo.set(null);
          resolve(ok);
        },
      });
    });
  }
}
