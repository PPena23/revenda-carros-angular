import { Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/** Formata telefones brasileiros: (16) 99876-5432 ou (16) 3456-7890. */
export function formatarTelefone(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Diretiva de atributo: máscara aplicada enquanto o usuário digita. */
@Directive({
  selector: 'input[appMascaraTelefone]',
  host: {
    inputmode: 'tel',
    autocomplete: 'tel',
    maxlength: '15',
    '(input)': 'aoDigitar()',
  },
})
export class MascaraTelefoneDirective {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  /** Opcional: integra com Reactive Forms quando houver formControlName no mesmo input. */
  private readonly controle = inject(NgControl, { optional: true, self: true });

  aoDigitar(): void {
    const formatado = formatarTelefone(this.el.nativeElement.value);
    this.el.nativeElement.value = formatado;
    this.controle?.control?.setValue(formatado);
  }
}
