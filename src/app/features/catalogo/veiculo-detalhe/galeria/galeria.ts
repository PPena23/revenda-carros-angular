import { Component, computed, input, signal } from '@angular/core';
import { Veiculo } from '../../../../core/models/veiculo.model';
import { AnguloCarro, CarIllustration } from '../../../../shared/components/car-illustration/car-illustration';
import { Icone } from '../../../../shared/components/icone/icone';

interface Foto {
  angulo: AnguloCarro;
  rotulo: string;
}

/** Galeria acessível: miniaturas como botões, setas do teclado navegam, contador "2 de 4". */
@Component({
  selector: 'app-galeria',
  imports: [CarIllustration, Icone],
  template: `
    @let v = veiculo();
    <div class="galeria" (keydown.arrowleft)="anterior()" (keydown.arrowright)="proxima()">
      <figure class="galeria__principal">
        @for (f of fotos; track f.angulo; let i = $index) {
          @if (i === indice()) {
            <app-car-illustration
              class="galeria__imagem"
              [categoria]="v.categoria"
              [cor]="v.corHex"
              [angulo]="f.angulo"
              [rotulo]="v.marca + ' ' + v.modelo + ' — ' + f.rotulo"
            />
          }
        }
        <figcaption class="galeria__legenda">
          <span>{{ fotoAtual().rotulo }}</span>
          <span aria-hidden="true">{{ indice() + 1 }} / {{ fotos.length }}</span>
        </figcaption>
        <button type="button" class="icone-btn galeria__seta galeria__seta--esq" aria-label="Imagem anterior" (click)="anterior()">
          <app-icone nome="esquerda" />
        </button>
        <button type="button" class="icone-btn galeria__seta galeria__seta--dir" aria-label="Próxima imagem" (click)="proxima()">
          <app-icone nome="direita" />
        </button>
      </figure>

      <ul class="galeria__miniaturas" aria-label="Escolher imagem">
        @for (f of fotos; track f.angulo; let i = $index) {
          <li>
            <button
              type="button"
              class="miniatura"
              [class.miniatura--ativa]="i === indice()"
              [attr.aria-current]="i === indice()"
              [attr.aria-label]="'Ver ' + f.rotulo + ' (' + (i + 1) + ' de ' + fotos.length + ')'"
              (click)="indice.set(i)"
            >
              <app-car-illustration [categoria]="v.categoria" [cor]="v.corHex" [angulo]="f.angulo" rotulo="" aria-hidden="true" />
            </button>
          </li>
        }
      </ul>
      <p class="sr-only" aria-live="polite">Imagem {{ indice() + 1 }} de {{ fotos.length }}: {{ fotoAtual().rotulo }}</p>
    </div>
  `,
  styleUrl: './galeria.scss',
})
export class Galeria {
  readonly veiculo = input.required<Veiculo>();

  protected readonly fotos: Foto[] = [
    { angulo: 'lateral', rotulo: 'Vista lateral' },
    { angulo: 'frente', rotulo: 'Vista frontal' },
    { angulo: 'traseira', rotulo: 'Vista traseira' },
    { angulo: 'detalhe', rotulo: 'Detalhe da roda e farol' },
  ];

  protected readonly indice = signal(0);
  protected readonly fotoAtual = computed(() => this.fotos[this.indice()]);

  protected anterior(): void {
    this.indice.update((i) => (i - 1 + this.fotos.length) % this.fotos.length);
  }

  protected proxima(): void {
    this.indice.update((i) => (i + 1) % this.fotos.length);
  }
}
