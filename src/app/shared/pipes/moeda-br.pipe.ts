import { Pipe, PipeTransform } from '@angular/core';

const COM_CENTAVOS = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const SEM_CENTAVOS = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});
const COMPACTO = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export type FormatoMoeda = 'completo' | 'inteiro' | 'compacto';

/**
 * Formata valores em Real: `89990 | moedaBr` → "R$ 89.990,00".
 * Formatos: 'completo' (padrão), 'inteiro' (sem centavos) e 'compacto' ("R$ 2,4 mi").
 */
@Pipe({ name: 'moedaBr' })
export class MoedaBrPipe implements PipeTransform {
  transform(valor: number | null | undefined, formato: FormatoMoeda = 'completo'): string {
    if (valor === null || valor === undefined || Number.isNaN(valor)) return '—';
    const fmt = formato === 'inteiro' ? SEM_CENTAVOS : formato === 'compacto' ? COMPACTO : COM_CENTAVOS;
    return fmt.format(valor);
  }
}
