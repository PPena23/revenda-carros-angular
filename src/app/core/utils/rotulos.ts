import { OrigemLead, StatusLead } from '../models/lead.model';
import { StatusVeiculo, Veiculo } from '../models/veiculo.model';

export const ROTULO_STATUS_VEICULO: Record<StatusVeiculo, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
};

export const ROTULO_STATUS_LEAD: Record<StatusLead, string> = {
  novo: 'Novo',
  'em-contato': 'Em contato',
  proposta: 'Proposta',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

export const ROTULO_ORIGEM_LEAD: Record<OrigemLead, string> = {
  site: 'Site',
  whatsapp: 'WhatsApp',
  telefone: 'Telefone',
  loja: 'Na loja',
};

export function tituloVeiculo(v: Pick<Veiculo, 'marca' | 'modelo' | 'versao'>): string {
  return `${v.marca} ${v.modelo} ${v.versao}`.trim();
}
