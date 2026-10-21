import { Component, computed, input } from '@angular/core';

/** Conjunto de ícones de traço (24×24) desenhados para o projeto — sem dependências externas. */
const ICONES = {
  busca: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
  coracao: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  comparar: 'M8 4v16M16 4v16M4 8h8M12 16h8',
  menu: 'M4 7h16M4 12h16M4 17h16',
  fechar: 'M6 6l12 12M18 6L6 18',
  esquerda: 'M15 5l-7 7 7 7',
  direita: 'M9 5l7 7-7 7',
  baixo: 'M6 9l6 6 6-6',
  calendario: 'M5 6h14v14H5zM5 10h14M9 3v4M15 3v4',
  velocimetro: 'M4 16a8 8 0 1 1 16 0M12 16l4-5M8 20h8',
  combustivel: 'M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M4 20h11M14 9h2l2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3M7 8h5',
  cambio: 'M6 5v14M12 5v14M18 5v7H6M6 5h0',
  cor: 'M12 4a8 8 0 1 0 0 16c1.1 0 1.5-.8 1.5-1.6 0-1.4-1.2-1.6-1.2-2.8 0-.9.7-1.6 1.6-1.6H16a4 4 0 0 0 4-4c0-3.3-3.6-6-8-6zM7.5 11.5h0M10 7.5h0M14.5 7.5h0',
  usuario: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0',
  telefone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z',
  email: 'M4 6h16v12H4zM4 7l8 6 8-6',
  local: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  relogio: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 8v4l3 2',
  painel: 'M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z',
  carro: 'M5 16h14M3 16v-3l2-5h14l2 5v3M7 16v2M17 16v2M6.5 13h0M17.5 13h0M5 11h14',
  leads: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.5a6 6 0 0 1 3 5.5',
  sair: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  mais: 'M12 5v14M5 12h14',
  editar: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  lixeira: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  check: 'M5 12.5l4.5 4.5L19 7',
  alerta: 'M12 4l9 16H3zM12 10v4M12 17h0',
  atualizar: 'M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4',
  filtro: 'M4 5h16l-6 8v6l-4-2v-4z',
  ordenar: 'M7 4v16M4 7l3-3 3 3M17 20V4M14 17l3 3 3-3',
  olho: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h0',
  escudo: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  chave: 'M14 10a4 4 0 1 0-3.5 3.9L8 16.5V19h2.5v-2H13l1.4-1.4M15.5 7.5h0',
  seta: 'M5 12h14M13 6l6 6-6 6',
  vazio: 'M4 7l2-3h12l2 3M4 7v12h16V7M4 7h16M9 12h6',
  grafico: 'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3',
  cifrao: 'M12 3v18M16.5 7.5C16 6 14.4 5 12 5S7.5 6.2 7.5 8.2c0 4.6 9 2.5 9 7.4 0 2-2 3.4-4.5 3.4s-4.3-1.1-4.8-2.8',
  estrela: 'M12 4l2.5 5.2 5.5.8-4 3.9.9 5.6L12 16.9 7.1 19.5l.9-5.6-4-3.9 5.5-.8z',
} as const;

export type NomeIcone = keyof typeof ICONES;

@Component({
  selector: 'app-icone',
  template: `
    <svg viewBox="0 0 24 24" [attr.width]="tamanho()" [attr.height]="tamanho()" aria-hidden="true" focusable="false">
      <path [attr.d]="caminho()" [attr.fill]="preenchido() ? 'currentColor' : 'none'" />
    </svg>
  `,
  styles: `
    :host { display: inline-flex; flex-shrink: 0; line-height: 0; }
    svg { stroke: currentColor; stroke-width: var(--icone-traco, 1.8); stroke-linecap: round; stroke-linejoin: round; }
  `,
})
export class Icone {
  readonly nome = input.required<NomeIcone>();
  readonly tamanho = input(20);
  readonly preenchido = input(false);
  protected readonly caminho = computed(() => ICONES[this.nome()]);
}
