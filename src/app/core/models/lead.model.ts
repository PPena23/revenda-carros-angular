export type StatusLead = 'novo' | 'em-contato' | 'proposta' | 'fechado' | 'perdido';
export type OrigemLead = 'site' | 'whatsapp' | 'telefone' | 'loja';
export type PreferenciaContato = 'whatsapp' | 'telefone' | 'email';

/** Ordem do funil comercial — usada no quadro de leads do painel. */
export const PIPELINE_LEADS: readonly StatusLead[] = ['novo', 'em-contato', 'proposta', 'fechado', 'perdido'];

export interface Lead {
  id: string;
  veiculoId?: string;
  /** Snapshot do nome do carro, para o lead continuar legível mesmo se o veículo for excluído. */
  veiculoTitulo?: string;
  nome: string;
  telefone: string;
  email: string;
  mensagem: string;
  preferencia: PreferenciaContato;
  origem: OrigemLead;
  status: StatusLead;
  criadoEm: string;
  atualizadoEm: string;
}

export type LeadPayload = Pick<
  Lead,
  'veiculoId' | 'nome' | 'telefone' | 'email' | 'mensagem' | 'preferencia'
>;
