import { Injectable, computed, signal } from '@angular/core';

export const LIMITE_COMPARACAO = 3;

/** Lista de veículos selecionados para comparação lado a lado (máx. 3). */
@Injectable({ providedIn: 'root' })
export class ComparadorService {
  private readonly ids = signal<string[]>(this.ler());

  readonly lista = this.ids.asReadonly();
  readonly quantidade = computed(() => this.ids().length);
  readonly cheio = computed(() => this.ids().length >= LIMITE_COMPARACAO);

  contem(id: string): boolean {
    return this.ids().includes(id);
  }

  /** Retorna false quando o limite foi atingido. */
  alternar(id: string): boolean {
    if (this.contem(id)) {
      this.atualizar(this.ids().filter((x) => x !== id));
      return true;
    }
    if (this.cheio()) return false;
    this.atualizar([...this.ids(), id]);
    return true;
  }

  remover(id: string): void {
    this.atualizar(this.ids().filter((x) => x !== id));
  }

  limpar(): void {
    this.atualizar([]);
  }

  private atualizar(lista: string[]): void {
    this.ids.set(lista);
    try {
      sessionStorage.setItem('vertice-motors:comparar', JSON.stringify(lista));
    } catch {
      /* ignora */
    }
  }

  private ler(): string[] {
    try {
      const v = JSON.parse(sessionStorage.getItem('vertice-motors:comparar') ?? '[]');
      return Array.isArray(v) ? v.slice(0, LIMITE_COMPARACAO) : [];
    } catch {
      return [];
    }
  }
}
