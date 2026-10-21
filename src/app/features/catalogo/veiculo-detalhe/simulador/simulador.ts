import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';
import { FINANCIAMENTO_CONFIG } from '../../../../core/config/app.tokens';
import { calcularPrice } from '../../../../core/utils/financiamento';
import { MoedaBrPipe } from '../../../../shared/pipes/moeda-br.pipe';
import { valorMaximoValidator } from '../../../../shared/validators/validadores';

/**
 * Simulador de financiamento (Tabela Price) com Reactive Forms.
 * valueChanges + debounceTime recalculam a parcela "ao vivo" sem travar a digitação.
 */
@Component({
  selector: 'app-simulador',
  imports: [ReactiveFormsModule, MoedaBrPipe, DecimalPipe],
  templateUrl: './simulador.html',
  styleUrl: './simulador.scss',
})
export class Simulador {
  /** Valor padrão 0: o validador da entrada roda já na criação do FormControl. */
  readonly preco = input(0);

  /** Configuração injetada via InjectionToken (taxa padrão, limites de parcelas). */
  protected readonly config = inject(FINANCIAMENTO_CONFIG);

  protected readonly opcoesParcelas = [12, 24, 36, 48, 60].filter(
    (n) => n >= this.config.parcelasMin && n <= this.config.parcelasMax,
  );

  protected readonly form = inject(FormBuilder).nonNullable.group({
    entrada: [0, [Validators.required, Validators.min(0), valorMaximoValidator(() => (this.preco() || Infinity) * 0.9, 'entradaAlta')]],
    parcelas: [48, [Validators.required, Validators.min(this.config.parcelasMin), Validators.max(this.config.parcelasMax)]],
    taxa: [this.config.taxaMensalPadrao, [Validators.required, Validators.min(0), Validators.max(5)]],
  });

  constructor() {
    // Ao trocar de veículo, sugere entrada de X% (vem do token de configuração).
    effect(() => {
      const sugerida = Math.round((this.preco() * this.config.entradaSugeridaPercentual) / 100 / 1000) * 1000;
      this.form.patchValue({ entrada: sugerida });
    });
  }

  private readonly valores = toSignal(
    this.form.valueChanges.pipe(
      startWith(this.form.getRawValue()),
      debounceTime(200),
      map(() => (this.form.valid ? this.form.getRawValue() : null)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    ),
    { initialValue: null },
  );

  protected readonly resultado = computed(() => {
    const v = this.valores();
    return v ? { ...calcularPrice(this.preco(), v.entrada, v.parcelas, v.taxa), parcelas: v.parcelas } : null;
  });

  protected readonly percentualEntrada = computed(() => {
    const v = this.valores();
    return v && this.preco() ? Math.round((v.entrada / this.preco()) * 100) : 0;
  });

  protected erro(campo: 'entrada' | 'taxa', codigo: string): boolean {
    const c = this.form.controls[campo];
    return c.hasError(codigo) && (c.dirty || c.touched);
  }
}
