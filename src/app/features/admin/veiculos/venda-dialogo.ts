import { Component, ElementRef, afterNextRender, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Veiculo } from '../../../core/models/veiculo.model';
import { VeiculosService } from '../../../core/services/veiculos.service';
import { mensagemDeErro } from '../../../core/utils/estado-requisicao';
import { MoedaBrPipe } from '../../../shared/pipes/moeda-br.pipe';

const hojeIso = () => new Date().toISOString().slice(0, 10);

/** Data da venda não pode estar no futuro. */
const naoFuturoValidator: ValidatorFn = (c) => (c.value && c.value > hojeIso() ? { futuro: true } : null);

/** Modal "Registrar venda": grava data e valor efetivo da venda. */
@Component({
  selector: 'app-venda-dialogo',
  imports: [ReactiveFormsModule, MoedaBrPipe],
  template: `
    <dialog #dialogo class="dialogo" aria-labelledby="venda-titulo" (cancel)="cancelar($event)">
      <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>
        <h2 id="venda-titulo">Registrar venda</h2>
        <p class="texto-suave">{{ veiculo().marca }} {{ veiculo().modelo }} {{ veiculo().versao }} · anunciado por {{ veiculo().preco | moedaBr: 'inteiro' }}</p>

        <div class="campos">
          <div class="campo">
            <label class="campo__rotulo" for="venda-preco">Valor da venda (R$)</label>
            <input id="venda-preco" type="number" class="campo__entrada" formControlName="precoVenda" min="1" step="100" />
            @if (form.controls.precoVenda.invalid && form.controls.precoVenda.touched) {
              <p class="campo__erro">Informe um valor maior que zero.</p>
            }
          </div>
          <div class="campo">
            <label class="campo__rotulo" for="venda-data">Data da venda</label>
            <input id="venda-data" type="date" class="campo__entrada" formControlName="dataVenda" [max]="hoje" />
            @if (form.controls.dataVenda.hasError('futuro')) {
              <p class="campo__erro">A data não pode estar no futuro.</p>
            } @else if (form.controls.dataVenda.invalid && form.controls.dataVenda.touched) {
              <p class="campo__erro">Informe a data.</p>
            }
          </div>
        </div>

        @if (erro()) {
          <p class="campo__erro" role="alert">{{ erro() }}</p>
        }

        <div class="acoes">
          <button type="button" class="btn btn--fantasma" (click)="cancelar()">Cancelar</button>
          <button type="submit" class="btn btn--primario" [disabled]="salvando()">
            @if (salvando()) { <span class="girando" aria-hidden="true"></span> } Confirmar venda
          </button>
        </div>
      </form>
    </dialog>
  `,
  styles: `
    .dialogo { width: min(30rem, calc(100vw - 2rem)); padding: 1.5rem; border: 0; border-radius: 18px; background: #fff; color: #17181c; box-shadow: 0 30px 80px rgba(0,0,0,.35); }
    .dialogo::backdrop { background: rgba(10,11,14,.55); }
    h2 { margin: 0 0 .25rem; font-size: 1.25rem; }
    p.texto-suave { margin: 0 0 1.25rem; font-size: .9rem; }
    .campos { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); margin-bottom: 1rem; }
    .acoes { display: flex; justify-content: flex-end; gap: .5rem; margin-top: 1rem; }
  `,
  host: { class: 'tema-claro' },
})
export class VendaDialogo {
  readonly veiculo = input.required<Veiculo>();
  readonly concluido = output<Veiculo>();
  readonly cancelado = output<void>();

  private readonly api = inject(VeiculosService);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  protected readonly hoje = hojeIso();
  protected readonly salvando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    precoVenda: [0, [Validators.required, Validators.min(1)]],
    dataVenda: [this.hoje, [Validators.required, naoFuturoValidator]],
  });

  constructor() {
    afterNextRender(() => {
      this.form.controls.precoVenda.setValue(this.veiculo().preco);
      this.dialogo().nativeElement.showModal();
    });
  }

  protected cancelar(evento?: Event): void {
    evento?.preventDefault();
    this.dialogo().nativeElement.close();
    this.cancelado.emit();
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { precoVenda, dataVenda } = this.form.getRawValue();
    this.salvando.set(true);
    this.erro.set(null);
    this.api
      .registrarVenda(this.veiculo().id, precoVenda, new Date(`${dataVenda}T12:00:00`).toISOString())
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: (v) => {
          this.dialogo().nativeElement.close();
          this.concluido.emit(v);
        },
        error: (e: unknown) => this.erro.set(mensagemDeErro(e)),
      });
  }
}
