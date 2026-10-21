import { Component, computed, input } from '@angular/core';
import { MoedaBrPipe } from '../../../shared/pipes/moeda-br.pipe';

export interface Barra {
  rotulo: string;
  valor: number;
  detalhe?: number;
}

/**
 * Gráfico de barras em SVG puro (sem biblioteca). Acessível: o SVG é decorativo e
 * uma tabela equivalente fica disponível para leitores de tela.
 */
@Component({
  selector: 'app-grafico-barras',
  imports: [MoedaBrPipe],
  template: `
    <svg [attr.viewBox]="'0 0 ' + L + ' ' + A" class="grafico" aria-hidden="true" preserveAspectRatio="none">
      @for (g of grades(); track g) {
        <line x1="0" [attr.x2]="L" [attr.y1]="y(g)" [attr.y2]="y(g)" class="grafico__grade" />
      }
      @for (b of dados(); track b.rotulo; let i = $index; let ultimo = $last) {
        @let x = i * passo() + (passo() - largura()) / 2;
        <rect
          [attr.x]="x"
          [attr.y]="y(b.valor)"
          [attr.width]="largura()"
          [attr.height]="A - 24 - y(b.valor)"
          rx="4"
          [class.grafico__barra--atual]="ultimo"
          class="grafico__barra"
        />
        <text [attr.x]="x + largura() / 2" [attr.y]="y(b.valor) - 6" text-anchor="middle" class="grafico__valor">{{ b.valor }}</text>
        <text [attr.x]="x + largura() / 2" [attr.y]="A - 6" text-anchor="middle" class="grafico__rotulo">{{ b.rotulo }}</text>
      }
    </svg>
    <table class="sr-only">
      <caption>{{ titulo() }}</caption>
      <thead><tr><th scope="col">Mês</th><th scope="col">Vendas</th><th scope="col">Receita</th></tr></thead>
      <tbody>
        @for (b of dados(); track b.rotulo) {
          <tr><th scope="row">{{ b.rotulo }}</th><td>{{ b.valor }}</td><td>{{ b.detalhe | moedaBr: 'inteiro' }}</td></tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    :host { display: block; }
    .grafico { width: 100%; height: 220px; overflow: visible; }
    .grafico__grade { stroke: var(--borda); stroke-width: 1; vector-effect: non-scaling-stroke; }
    .grafico__barra { fill: #c9cdd4; transition: fill 200ms; }
    .grafico__barra--atual { fill: var(--vermelho); }
    .grafico__valor { fill: var(--texto); font: 600 13px var(--fonte-texto); }
    .grafico__rotulo { fill: var(--texto-suave); font: 500 12px var(--fonte-texto); }
  `,
})
export class GraficoBarras {
  readonly dados = input.required<Barra[]>();
  readonly titulo = input('');

  protected readonly L = 600;
  protected readonly A = 220;

  private readonly maximo = computed(() => Math.max(4, ...this.dados().map((d) => d.valor)));
  protected readonly passo = computed(() => this.L / Math.max(this.dados().length, 1));
  protected readonly largura = computed(() => Math.min(56, this.passo() * 0.55));
  protected readonly grades = computed(() => {
    const m = this.maximo();
    return [0, Math.round(m / 2), m];
  });

  protected y(valor: number): number {
    const util = this.A - 24 - 20; // espaço para rótulos embaixo e valor em cima
    return 20 + util - (valor / this.maximo()) * util;
  }
}

export interface Fatia {
  rotulo: string;
  valor: number;
}

const CORES_ROSCA = ['#17181C', '#E10600', '#8B9099', '#D2D5DB'];

/** Gráfico de rosca com legenda textual (cor nunca é a única informação). */
@Component({
  selector: 'app-grafico-rosca',
  template: `
    <div class="rosca">
      <svg viewBox="0 0 120 120" class="rosca__svg" aria-hidden="true">
        <circle cx="60" cy="60" r="44" fill="none" stroke="var(--superficie-2)" stroke-width="18" />
        @for (f of arcos(); track f.rotulo) {
          <circle
            cx="60" cy="60" r="44" fill="none" stroke-width="18"
            [attr.stroke]="f.cor"
            [attr.stroke-dasharray]="f.tamanho + ' ' + (C - f.tamanho)"
            [attr.stroke-dashoffset]="-f.inicio"
            transform="rotate(-90 60 60)"
          />
        }
        <text x="60" y="58" text-anchor="middle" class="rosca__total">{{ total() }}</text>
        <text x="60" y="74" text-anchor="middle" class="rosca__legenda-total">veículos</text>
      </svg>
      <ul class="rosca__legenda">
        @for (f of arcos(); track f.rotulo) {
          <li>
            <span class="rosca__cor" [style.background]="f.cor"></span>
            <span class="rosca__nome">{{ f.rotulo }}</span>
            <strong>{{ f.valor }}</strong>
            <span class="rosca__pct">{{ f.pct }}%</span>
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    .rosca { display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem; }
    .rosca__svg { width: 150px; height: 150px; flex-shrink: 0; }
    .rosca__total { font: 700 22px var(--fonte-display); fill: var(--texto); }
    .rosca__legenda-total { font: 500 9px var(--fonte-texto); fill: var(--texto-suave); }
    .rosca__legenda { flex: 1; min-width: 10rem; margin: 0; padding: 0; list-style: none; display: grid; gap: .55rem; font-size: .9rem; }
    .rosca__legenda li { display: flex; align-items: center; gap: .6rem; }
    .rosca__cor { width: .75rem; height: .75rem; border-radius: 3px; flex-shrink: 0; }
    .rosca__nome { flex: 1; }
    .rosca__pct { width: 2.8rem; text-align: right; color: var(--texto-suave); font-variant-numeric: tabular-nums; }
  `,
})
export class GraficoRosca {
  readonly dados = input.required<Fatia[]>();

  protected readonly C = 2 * Math.PI * 44;
  protected readonly total = computed(() => this.dados().reduce((s, f) => s + f.valor, 0));

  protected readonly arcos = computed(() => {
    const total = this.total() || 1;
    let acumulado = 0;
    return this.dados().map((f, i) => {
      const tamanho = (f.valor / total) * this.C;
      const arco = { ...f, cor: CORES_ROSCA[i % CORES_ROSCA.length], tamanho, inicio: acumulado, pct: Math.round((f.valor / total) * 100) };
      acumulado += tamanho;
      return arco;
    });
  });
}
