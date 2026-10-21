import { Injectable, computed, effect, signal } from '@angular/core';

const CHAVE = 'vertice-motors:favoritos';

/** Favoritos do visitante: signal como fonte da verdade + effect que persiste no localStorage. */
@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private readonly ids = signal<string[]>(this.ler());

  readonly lista = this.ids.asReadonly();
  readonly quantidade = computed(() => this.ids().length);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(CHAVE, JSON.stringify(this.ids()));
      } catch {
        /* ignora */
      }
    });
  }

  ehFavorito(id: string): boolean {
    return this.ids().includes(id);
  }

  alternar(id: string): boolean {
    const adicionou = !this.ehFavorito(id);
    this.ids.update((lista) => (adicionou ? [...lista, id] : lista.filter((x) => x !== id)));
    return adicionou;
  }

  private ler(): string[] {
    try {
      const v = JSON.parse(localStorage.getItem(CHAVE) ?? '[]');
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }
}
