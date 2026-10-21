import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmacaoService } from '../services/confirmacao.service';

/** Contrato que um componente implementa para ser protegido por este guard. */
export interface ComAlteracoesPendentes {
  temAlteracoesPendentes(): boolean;
}

/** CanDeactivate: pergunta antes de sair de um formulário com alterações não salvas. */
export const alteracoesPendentesGuard: CanDeactivateFn<ComAlteracoesPendentes> = (componente) => {
  if (!componente.temAlteracoesPendentes()) return true;

  return inject(ConfirmacaoService).perguntar({
    titulo: 'Descartar alterações?',
    mensagem: 'Você tem alterações que ainda não foram salvas. Se sair agora, elas serão perdidas.',
    confirmar: 'Sair sem salvar',
    cancelar: 'Continuar editando',
    perigo: true,
  });
};
