import { Component, input } from '@angular/core';

/** Marca fictícia "Vértice Motors" — um V estilizado com um vértice vermelho. */
@Component({
  selector: 'app-logo',
  template: `
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
      <path d="M5 7h5l6 13 6-13h5l-9 18h-4z" fill="currentColor" />
      <path d="M13.6 25h4.8L16 29.5z" fill="#E10600" />
    </svg>
    <span class="nome">Vértice<span class="sufixo">Motors</span></span>
    @if (rotulo()) {
      <span class="rotulo">{{ rotulo() }}</span>
    }
  `,
  styles: `
    :host { display: inline-flex; align-items: center; gap: .55rem; color: var(--texto); }
    .nome { font: 700 1.1rem/1 var(--fonte-display); letter-spacing: .02em; text-transform: uppercase; }
    .sufixo { margin-left: .35rem; font-weight: 400; color: var(--texto-suave); }
    .rotulo {
      padding: .18rem .45rem; border-radius: 6px; background: var(--vermelho); color: #fff;
      font: 700 .62rem/1.2 var(--fonte-texto); letter-spacing: .08em; text-transform: uppercase;
    }
  `,
})
export class Logo {
  readonly rotulo = input('');
}
