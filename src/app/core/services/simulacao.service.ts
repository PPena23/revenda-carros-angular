import { Injectable, effect, signal } from '@angular/core';

const CHAVE = 'vertice-motors:simular-falhas';

/**
 * Controla o "modo instável" da API simulada: quando ligado, parte das
 * requisições falha de propósito para exibir os estados de erro da interface.
 */
@Injectable({ providedIn: 'root' })
export class SimulacaoService {
  readonly simularFalhas = signal(this.lerPreferencia());
  /** Probabilidade de falha quando o modo está ligado. */
  readonly taxaDeFalha = 0.5;

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(CHAVE, String(this.simularFalhas()));
      } catch {
        /* ignora */
      }
    });
  }

  alternar(): void {
    this.simularFalhas.update((v) => !v);
  }

  deveFalhar(): boolean {
    return this.simularFalhas() && Math.random() < this.taxaDeFalha;
  }

  private lerPreferencia(): boolean {
    try {
      return localStorage.getItem(CHAVE) === 'true';
    } catch {
      return false;
    }
  }
}
