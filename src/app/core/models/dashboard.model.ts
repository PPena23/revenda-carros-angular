import { Categoria, Veiculo } from './veiculo.model';
import { Lead } from './lead.model';

export interface VendaMes {
  /** Rótulo curto, ex.: "out/26". */
  mes: string;
  quantidade: number;
  receita: number;
}

export interface Dashboard {
  emEstoque: number;
  valorEstoque: number;
  vendidosNoMes: number;
  receitaNoMes: number;
  leadsNovos: number;
  tempoMedioEstoqueDias: number;
  vendasPorMes: VendaMes[];
  estoquePorCategoria: { categoria: Categoria; quantidade: number }[];
  ultimosLeads: Lead[];
  maisTempoEmEstoque: Veiculo[];
}

export interface Usuario {
  nome: string;
  email: string;
  cargo: string;
}

export interface Sessao {
  token: string;
  usuario: Usuario;
}
