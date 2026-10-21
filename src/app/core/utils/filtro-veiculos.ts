import { Params } from '@angular/router';

import {
  CAMBIOS,
  CATEGORIAS,
  COMBUSTIVEIS,
  Cambio,
  Categoria,
  Combustivel,
  FiltroVeiculos,
  Ordenacao,
  Pagina,
  Veiculo,
} from '../models/veiculo.model';

/** Qualquer objeto com get() — atende ParamMap (rotas) e HttpParams (API). */
export interface LeitorParams {
  get(nome: string): string | null;
}

const ORDENACOES: readonly Ordenacao[] = ['relevancia', 'menor-preco', 'maior-preco', 'mais-novo', 'menor-km'];

function numero(valor: string | null): number | undefined {
  if (valor === null || valor.trim() === '') return undefined;
  const n = Number(valor);
  return Number.isFinite(n) ? n : undefined;
}

function umDe<T extends string>(valor: string | null, lista: readonly T[]): T | undefined {
  return lista.includes(valor as T) ? (valor as T) : undefined;
}

/** Converte os query params (sempre string) em um filtro tipado — valores inválidos são ignorados. */
export function filtroDeParams(p: LeitorParams): FiltroVeiculos {
  return limparFiltro({
    q: p.get('q') ?? undefined,
    marca: p.get('marca') ?? undefined,
    categoria: umDe<Categoria>(p.get('categoria'), CATEGORIAS),
    precoMin: numero(p.get('precoMin')),
    precoMax: numero(p.get('precoMax')),
    anoMin: numero(p.get('anoMin')),
    kmMax: numero(p.get('kmMax')),
    cambio: umDe<Cambio>(p.get('cambio'), CAMBIOS),
    combustivel: umDe<Combustivel>(p.get('combustivel'), COMBUSTIVEIS),
    cor: p.get('cor') ?? undefined,
    ordenar: umDe<Ordenacao>(p.get('ordenar'), ORDENACOES),
    pagina: numero(p.get('pagina')),
    porPagina: numero(p.get('porPagina')),
    destaque: p.get('destaque') === 'true' || undefined,
  });
}

/** Remove chaves vazias para gerar URLs limpas (ex.: /estoque?categoria=SUV). */
export function limparFiltro<T extends object>(filtro: T): T {
  return Object.fromEntries(
    Object.entries(filtro).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== false),
  ) as T;
}

export function filtroParaParams(filtro: FiltroVeiculos): Params {
  return limparFiltro({ ...filtro, pagina: filtro.pagina && filtro.pagina > 1 ? filtro.pagina : undefined });
}

export function filtrosIguais(a: FiltroVeiculos, b: FiltroVeiculos): boolean {
  return JSON.stringify(limparFiltro(a)) === JSON.stringify(limparFiltro(b));
}

/** Quantos filtros "de verdade" estão ativos (ignora ordenação e página). */
export function contarFiltrosAtivos(f: FiltroVeiculos): number {
  const { ordenar, pagina, porPagina, ...resto } = limparFiltro(f);
  return Object.keys(resto).length;
}

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Regra de negócio do "servidor": filtra, ordena e pagina. */
export function aplicarFiltro(lista: Veiculo[], f: FiltroVeiculos): Pagina<Veiculo> {
  const termo = f.q ? normalizar(f.q) : '';

  let r = lista.filter((v) => {
    if (termo && !normalizar(`${v.marca} ${v.modelo} ${v.versao}`).includes(termo)) return false;
    if (f.marca && v.marca !== f.marca) return false;
    if (f.categoria && v.categoria !== f.categoria) return false;
    if (f.precoMin && v.preco < f.precoMin) return false;
    if (f.precoMax && v.preco > f.precoMax) return false;
    if (f.anoMin && v.anoModelo < f.anoMin) return false;
    if (f.kmMax && v.km > f.kmMax) return false;
    if (f.cambio && v.cambio !== f.cambio) return false;
    if (f.combustivel && v.combustivel !== f.combustivel) return false;
    if (f.cor && v.cor !== f.cor) return false;
    if (f.destaque && !v.destaque) return false;
    return true;
  });

  const ordenadores: Record<Ordenacao, (a: Veiculo, b: Veiculo) => number> = {
    relevancia: (a, b) => Number(b.destaque) - Number(a.destaque) || b.dataEntrada.localeCompare(a.dataEntrada),
    'menor-preco': (a, b) => a.preco - b.preco,
    'maior-preco': (a, b) => b.preco - a.preco,
    'mais-novo': (a, b) => b.anoModelo - a.anoModelo || a.km - b.km,
    'menor-km': (a, b) => a.km - b.km,
  };
  r = [...r].sort(ordenadores[f.ordenar ?? 'relevancia']);

  const porPagina = f.porPagina ?? 12;
  const pagina = Math.max(1, f.pagina ?? 1);
  return {
    itens: r.slice((pagina - 1) * porPagina, pagina * porPagina),
    total: r.length,
    pagina,
    porPagina,
  };
}
