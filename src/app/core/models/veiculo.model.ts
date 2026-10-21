/** Tipos de carroceria aceitos pela loja (também definem o desenho da ilustração). */
export type Categoria = 'Hatch' | 'Sedã' | 'SUV' | 'Picape';
export type Cambio = 'Manual' | 'Automático' | 'CVT';
export type Combustivel = 'Flex' | 'Gasolina' | 'Diesel' | 'Híbrido' | 'Elétrico';
export type StatusVeiculo = 'disponivel' | 'reservado' | 'vendido';

export const CATEGORIAS: readonly Categoria[] = ['Hatch', 'Sedã', 'SUV', 'Picape'];
export const CAMBIOS: readonly Cambio[] = ['Manual', 'Automático', 'CVT'];
export const COMBUSTIVEIS: readonly Combustivel[] = ['Flex', 'Gasolina', 'Diesel', 'Híbrido', 'Elétrico'];
export const STATUS_VEICULO: readonly StatusVeiculo[] = ['disponivel', 'reservado', 'vendido'];

export interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  versao: string;
  categoria: Categoria;
  anoFabricacao: number;
  anoModelo: number;
  km: number;
  preco: number;
  cambio: Cambio;
  combustivel: Combustivel;
  cor: string;
  /** Cor em hexadecimal usada para pintar a ilustração SVG. */
  corHex: string;
  placa: string;
  portas: number;
  motor: string;
  opcionais: string[];
  descricao: string;
  destaque: boolean;
  status: StatusVeiculo;
  /** ISO 8601 — data em que o carro entrou no estoque. */
  dataEntrada: string;
  dataVenda?: string;
  precoVenda?: number;
}

/** Dados enviados pelo formulário administrativo (sem campos gerados pelo "servidor"). */
export type VeiculoPayload = Omit<Veiculo, 'id' | 'dataEntrada' | 'dataVenda' | 'precoVenda'>;

export type Ordenacao = 'relevancia' | 'menor-preco' | 'maior-preco' | 'mais-novo' | 'menor-km';

/** Filtro do catálogo — espelha 1:1 os query params da rota /estoque. */
export interface FiltroVeiculos {
  q?: string;
  marca?: string;
  categoria?: Categoria;
  precoMin?: number;
  precoMax?: number;
  anoMin?: number;
  kmMax?: number;
  cambio?: Cambio;
  combustivel?: Combustivel;
  cor?: string;
  destaque?: boolean;
  ordenar?: Ordenacao;
  pagina?: number;
  porPagina?: number;
}

export interface Pagina<T> {
  itens: T[];
  total: number;
  pagina: number;
  porPagina: number;
}

export interface OpcoesFiltro {
  marcas: string[];
  cores: string[];
  anoMin: number;
  anoMax: number;
  precoMax: number;
}
