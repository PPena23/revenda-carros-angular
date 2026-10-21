const MS_DIA = 86_400_000;

/** Diferença em dias inteiros entre duas datas (b − a). */
export function diasEntre(a: Date | string, b: Date | string = new Date()): number {
  const inicio = new Date(a);
  const fim = new Date(b);
  inicio.setHours(0, 0, 0, 0);
  fim.setHours(0, 0, 0, 0);
  return Math.round((fim.getTime() - inicio.getTime()) / MS_DIA);
}

/** Data relativa a hoje (negativo = passado). Usada pelo seed para que os dados nunca "envelheçam". */
export function diasAPartirDeHoje(dias: number, hora = 10): Date {
  const d = new Date();
  d.setHours(hora, 0, 0, 0);
  d.setDate(d.getDate() + dias);
  return d;
}

export function mesmoMes(a: Date | string, b: Date = new Date()): boolean {
  const d = new Date(a);
  return d.getMonth() === b.getMonth() && d.getFullYear() === b.getFullYear();
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function rotuloMes(d: Date): string {
  return `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
}
