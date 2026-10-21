import { Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Placa no padrão Mercosul (ABC1D23) — também aceita o padrão antigo (ABC1234).
 * Converte para maiúsculas e descarta caracteres fora da posição esperada.
 */
export function formatarPlaca(valor: string): string {
  const bruto = valor.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let saida = '';
  for (const c of bruto) {
    const pos = saida.length;
    if (pos >= 7) break;
    const letra = /[A-Z]/.test(c);
    const digito = /\d/.test(c);
    if ((pos < 3 && letra) || (pos === 3 && digito) || pos === 4 || (pos > 4 && digito)) saida += c;
  }
  return saida;
}

@Directive({
  selector: 'input[appMascaraPlaca]',
  host: {
    autocapitalize: 'characters',
    autocomplete: 'off',
    spellcheck: 'false',
    maxlength: '7',
    '(input)': 'aoDigitar()',
  },
})
export class MascaraPlacaDirective {
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly controle = inject(NgControl, { optional: true, self: true });

  aoDigitar(): void {
    const formatado = formatarPlaca(this.el.nativeElement.value);
    this.el.nativeElement.value = formatado;
    this.controle?.control?.setValue(formatado);
  }
}
