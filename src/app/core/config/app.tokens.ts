import { InjectionToken } from '@angular/core';

/** Parâmetros do simulador de financiamento. */
export interface FinanciamentoConfig {
  /** Taxa padrão ao mês, em % (ex.: 1.49 = 1,49% a.m.). */
  taxaMensalPadrao: number;
  parcelasMin: number;
  parcelasMax: number;
  /** Entrada sugerida, em % do valor do veículo. */
  entradaSugeridaPercentual: number;
}

/**
 * InjectionToken com valor padrão via `factory` — qualquer componente pode
 * fazer `inject(FINANCIAMENTO_CONFIG)`; o app.config.ts sobrescreve com `useValue`.
 */
export const FINANCIAMENTO_CONFIG = new InjectionToken<FinanciamentoConfig>('FINANCIAMENTO_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    taxaMensalPadrao: 1.79,
    parcelasMin: 12,
    parcelasMax: 60,
    entradaSugeridaPercentual: 30,
  }),
});

/** Dados institucionais da loja (todos fictícios). */
export interface LojaConfig {
  nome: string;
  slogan: string;
  cidade: string;
  endereco: string;
  telefone: string;
  whatsapp: string;
  email: string;
  horarios: { dias: string; horas: string }[];
}

export const LOJA_CONFIG = new InjectionToken<LojaConfig>('LOJA_CONFIG');

/** Configuração da API simulada (latência e chave de armazenamento). */
export interface ApiConfig {
  baseUrl: string;
  latenciaMinMs: number;
  latenciaMaxMs: number;
  chaveStorage: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    baseUrl: '/api',
    latenciaMinMs: 350,
    latenciaMaxMs: 900,
    chaveStorage: 'vertice-motors:db:v1',
  }),
});
