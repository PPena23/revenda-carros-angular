import { Pipe, PipeTransform } from '@angular/core';
import { diasEntre } from '../../core/utils/datas';

/**
 * Tempo relativo em português: "hoje", "ontem", "há 23 dias", "há 2 meses".
 * Pipe puro: só recalcula quando a data muda.
 */
@Pipe({ name: 'tempoEmEstoque' })
export class TempoEmEstoquePipe implements PipeTransform {
  transform(data: string | Date | null | undefined): string {
    if (!data) return '—';
    const dias = Math.max(diasEntre(data), 0);
    if (dias === 0) return 'hoje';
    if (dias === 1) return 'ontem';
    if (dias < 45) return `há ${dias} dias`;
    const meses = Math.round(dias / 30);
    return `há ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  }
}
