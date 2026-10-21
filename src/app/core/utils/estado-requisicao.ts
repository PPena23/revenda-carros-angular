import { HttpErrorResponse } from '@angular/common/http';
import { Observable, OperatorFunction, catchError, map, of, startWith } from 'rxjs';

/** Estado de UI de uma requisição — alimenta os componentes de carregando / vazio / erro. */
export type EstadoRequisicao<T> =
  | { status: 'carregando' }
  | { status: 'sucesso'; dados: T }
  | { status: 'erro'; mensagem: string };

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof HttpErrorResponse) {
    return (erro.error as { mensagem?: string } | null)?.mensagem ?? 'Não foi possível conectar ao servidor.';
  }
  return 'Algo deu errado. Tente novamente.';
}

/**
 * Operador RxJS customizado: transforma Observable<T> em Observable<EstadoRequisicao<T>>.
 * Emite "carregando" imediatamente, depois "sucesso" ou "erro" (sem quebrar o stream externo).
 */
export function comEstado<T>(): OperatorFunction<T, EstadoRequisicao<T>> {
  return (fonte: Observable<T>) =>
    fonte.pipe(
      map((dados): EstadoRequisicao<T> => ({ status: 'sucesso', dados })),
      startWith<EstadoRequisicao<T>>({ status: 'carregando' }),
      catchError((erro: unknown) => of<EstadoRequisicao<T>>({ status: 'erro', mensagem: mensagemDeErro(erro) })),
    );
}
