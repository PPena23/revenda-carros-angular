import { Component, inject } from '@angular/core';
import { SimulacaoService } from '../../../core/services/simulacao.service';
import { TooltipDirective } from '../../directives/tooltip.directive';

/** Interruptor "Simular falhas de rede" — demonstra os estados de erro da interface. */
@Component({
  selector: 'app-demo-controles',
  imports: [TooltipDirective],
  template: `
    <label class="interruptor" appTooltip="Quando ligado, metade das consultas à API simulada falha de propósito.">
      <input type="checkbox" role="switch" [checked]="simulacao.simularFalhas()" (change)="simulacao.alternar()" />
      <span class="interruptor__trilho" aria-hidden="true"></span>
      <span class="interruptor__texto">Simular falhas de rede</span>
    </label>
  `,
  styles: `
    .interruptor { display: inline-flex; align-items: center; gap: .6rem; cursor: pointer; font-size: .82rem; color: var(--texto-suave); }
    input { position: absolute; opacity: 0; width: 1px; height: 1px; }
    .interruptor__trilho {
      position: relative; width: 2.3rem; height: 1.3rem; border-radius: 999px;
      background: var(--superficie-2); border: 1px solid var(--borda-forte); transition: background var(--transicao);
    }
    .interruptor__trilho::after {
      content: ''; position: absolute; top: 2px; left: 2px; width: calc(1.3rem - 6px); height: calc(1.3rem - 6px);
      border-radius: 50%; background: var(--texto-suave); transition: transform var(--transicao), background var(--transicao);
    }
    input:checked + .interruptor__trilho { background: var(--vermelho); border-color: var(--vermelho); }
    input:checked + .interruptor__trilho::after { transform: translateX(1rem); background: #fff; }
    input:focus-visible + .interruptor__trilho { outline: 2px solid var(--foco); outline-offset: 2px; }
  `,
})
export class DemoControles {
  protected readonly simulacao = inject(SimulacaoService);
}
