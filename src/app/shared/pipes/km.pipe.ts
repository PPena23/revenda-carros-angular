import { Pipe, PipeTransform } from '@angular/core';

const NUMERO = new Intl.NumberFormat('pt-BR');

/** `45000 | km` → "45.000 km". */
@Pipe({ name: 'km' })
export class KmPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return '—';
    return `${NUMERO.format(valor)} km`;
  }
}
