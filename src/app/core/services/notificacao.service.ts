import { Injectable, signal } from '@angular/core';

export type TipoNotificacao = 'sucesso' | 'erro' | 'info';

export interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  mensagem: string;
}

/** Toasts globais (exibidos pelo NotificacoesComponent em uma região aria-live). */
@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private proximoId = 1;
  readonly itens = signal<Notificacao[]>([]);

  sucesso(mensagem: string): void {
    this.mostrar('sucesso', mensagem);
  }

  erro(mensagem: string): void {
    this.mostrar('erro', mensagem, 6000);
  }

  info(mensagem: string): void {
    this.mostrar('info', mensagem);
  }

  fechar(id: number): void {
    this.itens.update((lista) => lista.filter((n) => n.id !== id));
  }

  private mostrar(tipo: TipoNotificacao, mensagem: string, duracao = 3800): void {
    const id = this.proximoId++;
    this.itens.update((lista) => [...lista.slice(-3), { id, tipo, mensagem }]);
    setTimeout(() => this.fechar(id), duracao);
  }
}
