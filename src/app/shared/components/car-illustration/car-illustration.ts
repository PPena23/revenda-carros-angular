import { Component, computed, input } from '@angular/core';
import { Categoria } from '../../../core/models/veiculo.model';
import { ajustarCor, luminancia } from '../../../core/utils/cores';
import { PERFIS, PROPORCOES, geometriaFrontal } from './geometria';

export type AnguloCarro = 'lateral' | 'frente' | 'traseira' | 'detalhe';
export type TemaEstudio = 'escuro' | 'claro';

let sequencia = 0;

/**
 * Ilustração vetorial de um carro em "estúdio fotográfico".
 * Substitui fotos reais (sem direitos autorais, sem logotipos): o desenho muda
 * conforme a carroceria, a cor do veículo e o ângulo escolhido na galeria.
 */
@Component({
  selector: 'app-car-illustration',
  templateUrl: './car-illustration.html',
  styleUrl: './car-illustration.scss',
  host: { role: 'img', '[attr.aria-label]': 'descricao()' },
})
export class CarIllustration {
  readonly categoria = input<Categoria>('Sedã');
  readonly cor = input('#A9AEB6');
  readonly angulo = input<AnguloCarro>('lateral');
  readonly tema = input<TemaEstudio>('escuro');
  /** Texto alternativo — obrigatório para leitores de tela entenderem a "foto". */
  readonly rotulo = input('');

  /** Prefixo único: vários SVGs na mesma página não podem compartilhar ids de gradiente. */
  protected readonly uid = `carro-${++sequencia}`;
  protected url(nome: string): string {
    return `url(#${this.uid}-${nome})`;
  }

  protected readonly perfil = computed(() => PERFIS[this.categoria()] ?? PERFIS['Sedã']);
  protected readonly frontal = computed(() => geometriaFrontal(PROPORCOES[this.categoria()] ?? PROPORCOES['Sedã']));

  protected readonly viewBox = computed(() =>
    this.angulo() === 'detalhe' ? `${28 + this.perfil().deslocX} 150 300 160` : '0 0 640 340',
  );

  /** Tons derivados da cor base para dar volume (luz em cima, sombra embaixo). */
  protected readonly tons = computed(() => {
    const base = this.cor();
    const escuro = luminancia(base) < 0.06;
    return {
      base,
      claro: ajustarCor(base, escuro ? 0.32 : 0.38),
      medio: ajustarCor(base, -0.06),
      sombra: ajustarCor(base, escuro ? -0.4 : -0.5),
      linha: ajustarCor(base, escuro ? 0.25 : -0.35),
      brilho: escuro ? 0.22 : 0.3,
    };
  });

  protected readonly estudio = computed(() =>
    this.tema() === 'escuro'
      ? { topo: '#2C2E35', meio: '#1C1D22', chao: '#121317', reflexo: 0.16, sombra: 0.7, spot: 0.1 }
      : { topo: '#FFFFFF', meio: '#EEF0F3', chao: '#DDE1E6', reflexo: 0.9, sombra: 0.32, spot: 0.6 },
  );

  protected readonly descricao = computed(
    () => this.rotulo() || `Ilustração de ${this.categoria().toLowerCase()} (vista ${this.angulo()})`,
  );

  /** Raios da roda de liga leve (5 raios). */
  protected readonly anguloRaios = [0, 72, 144, 216, 288];
}
