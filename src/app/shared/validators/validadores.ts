import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, take, timer } from 'rxjs';

/** DDDs válidos no Brasil (11–99, exceto faixas não atribuídas). */
const DDDS_INVALIDOS = new Set([20, 23, 25, 26, 29, 30, 36, 39, 40, 50, 52, 56, 57, 58, 59, 60, 70, 72, 76, 78, 80, 90]);

/** Telefone BR com máscara: (16) 99876-5432 ou (16) 3456-7890, com DDD existente. */
export const telefoneBrValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const valor = (c.value ?? '') as string;
  if (!valor) return null; // "required" cuida do vazio
  const m = /^\((\d{2})\) (9?\d{4})-(\d{4})$/.exec(valor);
  if (!m) return { telefoneBr: 'Use o formato (16) 99999-9999.' };
  const ddd = Number(m[1]);
  if (ddd < 11 || DDDS_INVALIDOS.has(ddd)) return { telefoneBr: `O DDD ${m[1]} não existe.` };
  return null;
};

/** Exige nome e sobrenome. */
export const nomeCompletoValidator: ValidatorFn = (c) => {
  const partes = ((c.value ?? '') as string).trim().split(/\s+/).filter((p) => p.length >= 2);
  return c.value && partes.length < 2 ? { nomeCompleto: true } : null;
};

/** Placa Mercosul (ABC1D23) ou antiga (ABC1234), sem hífen. */
export const placaValidator: ValidatorFn = (c) => {
  const valor = (c.value ?? '') as string;
  return valor && !/^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(valor) ? { placa: true } : null;
};

/**
 * Validador de GRUPO (cross-field): ano modelo deve ser igual ao ano de fabricação
 * ou o ano seguinte — regra real do mercado brasileiro.
 */
export function anoModeloValidator(campoFab = 'anoFabricacao', campoModelo = 'anoModelo'): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const fab = Number(grupo.get(campoFab)?.value);
    const modelo = Number(grupo.get(campoModelo)?.value);
    if (!fab || !modelo) return null;
    if (modelo < fab) return { anoModelo: 'O ano modelo não pode ser anterior ao ano de fabricação.' };
    if (modelo > fab + 1) return { anoModelo: 'O ano modelo pode ser no máximo o ano seguinte ao de fabricação.' };
    return null;
  };
}

/** Valor máximo dinâmico (ex.: entrada não pode passar de 90% do preço do carro). */
export function valorMaximoValidator(maximo: () => number, chave = 'valorMaximo'): ValidatorFn {
  return (c) => {
    const v = Number(c.value);
    return Number.isFinite(v) && v > maximo() ? { [chave]: { maximo: maximo() } } : null;
  };
}

/** Rejeita valores de opcionais repetidos dentro de um FormArray. */
export const semDuplicadosValidator: ValidatorFn = (array) => {
  const valores = ((array.value ?? []) as string[]).map((v) => v.trim().toLowerCase()).filter(Boolean);
  return new Set(valores).size !== valores.length ? { duplicados: true } : null;
};

/**
 * Validador ASSÍNCRONO: consulta a API para garantir placa única.
 * timer() faz o papel de debounce — cada nova digitação cancela a verificação anterior.
 */
export function placaUnicaValidator(
  verificar: (placa: string) => Observable<boolean>,
): AsyncValidatorFn {
  return (c) => {
    const placa = (c.value ?? '') as string;
    if (!placa || placa.length < 7) return of(null);
    return timer(400).pipe(
      switchMap(() => verificar(placa)),
      map((disponivel) => (disponivel ? null : { placaEmUso: true })),
      catchError(() => of(null)), // falha de rede não deve bloquear o formulário
      take(1),
    );
  };
}
