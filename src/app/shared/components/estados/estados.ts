import { Component, computed, input, output } from '@angular/core';
import { Icone } from '../icone/icone';

/** Estado de erro com ação de nova tentativa (role="alert" anuncia para leitores de tela). */
@Component({
  selector: 'app-estado-erro',
  imports: [Icone],
  template: `
    <div class="estado estado--erro" role="alert">
      <span class="estado__icone"><app-icone nome="alerta" [tamanho]="28" /></span>
      <h3 class="estado__titulo">{{ titulo() }}</h3>
      <p class="estado__texto">{{ mensagem() }}</p>
      <button type="button" class="btn btn--secundario" (click)="tentarNovamente.emit()">
        <app-icone nome="atualizar" [tamanho]="18" /> Tentar novamente
      </button>
    </div>
  `,
})
export class EstadoErro {
  readonly titulo = input('Não foi possível carregar');
  readonly mensagem = input('Verifique sua conexão e tente de novo.');
  readonly tentarNovamente = output<void>();
}

/** Estado vazio — ações extras entram via <ng-content>. */
@Component({
  selector: 'app-estado-vazio',
  imports: [Icone],
  template: `
    <div class="estado" role="status">
      <span class="estado__icone"><app-icone [nome]="icone()" [tamanho]="28" /></span>
      <h3 class="estado__titulo">{{ titulo() }}</h3>
      @if (texto()) {
        <p class="estado__texto">{{ texto() }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class EstadoVazio {
  readonly titulo = input.required<string>();
  readonly texto = input('');
  readonly icone = input<'vazio' | 'busca' | 'coracao' | 'comparar' | 'leads'>('vazio');
}

/** Placeholder animado ("skeleton") exibido enquanto os dados chegam. */
@Component({
  selector: 'app-skeleton',
  template: `
    <span class="sr-only" role="status">Carregando…</span>
    @for (i of linhas(); track i) {
      <div class="skeleton" [class]="'skeleton--' + tipo()" aria-hidden="true">
        @if (tipo() === 'card') {
          <div class="skeleton__img"></div>
          <div class="skeleton__corpo">
            <div class="skeleton__linha" style="width: 70%"></div>
            <div class="skeleton__linha" style="width: 45%"></div>
            <div class="skeleton__linha skeleton__linha--grossa" style="width: 55%"></div>
          </div>
        } @else {
          <div class="skeleton__linha"></div>
        }
      </div>
    }
  `,
  host: { '[class]': "'skeletons skeletons--' + tipo()" },
})
export class Skeleton {
  readonly tipo = input<'card' | 'linha' | 'kpi'>('card');
  readonly quantidade = input(6);
  protected readonly linhas = computed(() => Array.from({ length: this.quantidade() }, (_, i) => i));
}
