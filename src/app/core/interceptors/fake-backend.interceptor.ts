import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, mergeMap, of, throwError, timer } from 'rxjs';
import { API_CONFIG } from '../config/app.tokens';
import { BancoLocalService } from '../data/banco-local.service';
import { Dashboard, Sessao } from '../models/dashboard.model';
import { Lead, LeadPayload, StatusLead, PIPELINE_LEADS } from '../models/lead.model';
import { CATEGORIAS, OpcoesFiltro, Veiculo, VeiculoPayload } from '../models/veiculo.model';
import { diasEntre, mesmoMes, rotuloMes } from '../utils/datas';
import { aplicarFiltro, filtroDeParams } from '../utils/filtro-veiculos';
import { tituloVeiculo } from '../utils/rotulos';
import { SimulacaoService } from '../services/simulacao.service';

/** Credenciais e token da DEMONSTRAÇÃO — não há autenticação real neste projeto. */
export const CREDENCIAIS_DEMO = { email: 'admin@demo.com', senha: 'demo123' } as const;
export const TOKEN_DEMO = 'demo-token-vertice-motors';

/**
 * Back-end simulado. Intercepta chamadas a /api/* e responde a partir do
 * BancoLocalService (localStorage), com latência aleatória e falhas opcionais.
 * Trocar por uma API real = remover este interceptor.
 */
export const fakeBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(API_CONFIG);
  if (!req.url.startsWith(config.baseUrl)) return next(req);

  const banco = inject(BancoLocalService);
  const simulacao = inject(SimulacaoService);
  const latencia = config.latenciaMinMs + Math.random() * (config.latenciaMaxMs - config.latenciaMinMs);
  const caminho = req.url.slice(config.baseUrl.length);

  const responder = <T>(corpo: T, status = 200): Observable<HttpResponse<T>> =>
    timer(latencia).pipe(mergeMap(() => of(new HttpResponse({ status, body: corpo }))));

  const erro = (status: number, mensagem: string): Observable<never> =>
    timer(latencia).pipe(
      mergeMap(() =>
        throwError(() => new HttpErrorResponse({ status, statusText: mensagem, error: { mensagem }, url: req.url })),
      ),
    );

  // Falha simulada (somente leituras, para não "perder" dados de formulários).
  if (req.method === 'GET' && simulacao.deveFalhar()) {
    return erro(503, 'Serviço temporariamente indisponível (falha simulada).');
  }

  const rotasAdmin = caminho.startsWith('/admin');
  if (rotasAdmin && req.headers.get('Authorization') !== `Bearer ${TOKEN_DEMO}`) {
    return erro(401, 'Sessão expirada. Faça login novamente.');
  }

  const rota = (metodo: string, padrao: RegExp) =>
    req.method === metodo ? caminho.match(padrao) : null;
  let m: RegExpMatchArray | null;

  // ---------- Autenticação ----------
  if (rota('POST', /^\/auth\/login$/)) {
    const { email, senha } = req.body as { email: string; senha: string };
    if (email?.toLowerCase() === CREDENCIAIS_DEMO.email && senha === CREDENCIAIS_DEMO.senha) {
      const sessao: Sessao = {
        token: TOKEN_DEMO,
        usuario: { nome: 'Gestor Demo', email: CREDENCIAIS_DEMO.email, cargo: 'Gerente comercial' },
      };
      return responder(sessao);
    }
    return erro(401, 'E-mail ou senha inválidos.');
  }

  // ---------- Catálogo público ----------
  if (rota('GET', /^\/veiculos$/)) {
    const publicos = banco.veiculos.filter((v) => v.status !== 'vendido');
    return responder(aplicarFiltro(publicos, filtroDeParams(req.params)));
  }

  if (rota('GET', /^\/veiculos\/opcoes$/)) {
    const publicos = banco.veiculos.filter((v) => v.status !== 'vendido');
    const anos = publicos.map((v) => v.anoModelo);
    const opcoes: OpcoesFiltro = {
      marcas: [...new Set(publicos.map((v) => v.marca))].sort(),
      cores: [...new Set(publicos.map((v) => v.cor))].sort(),
      anoMin: Math.min(...anos),
      anoMax: Math.max(...anos),
      precoMax: Math.max(...publicos.map((v) => v.preco)),
    };
    return responder(opcoes);
  }

  if ((m = rota('GET', /^\/veiculos\/([\w-]+)$/))) {
    const v = banco.veiculos.find((x) => x.id === m![1]);
    return v ? responder(v) : erro(404, 'Veículo não encontrado.');
  }

  if (rota('POST', /^\/leads$/)) {
    const payload = req.body as LeadPayload;
    const veiculo = banco.veiculos.find((v) => v.id === payload.veiculoId);
    const agora = new Date().toISOString();
    const lead: Lead = {
      ...payload,
      id: novoId('l'),
      veiculoTitulo: veiculo ? tituloVeiculo(veiculo) : undefined,
      origem: 'site',
      status: 'novo',
      criadoEm: agora,
      atualizadoEm: agora,
    };
    banco.setLeads([lead, ...banco.leads]);
    return responder(lead, 201);
  }

  // ---------- Painel administrativo ----------
  if (rota('GET', /^\/admin\/veiculos$/)) {
    return responder(banco.veiculos);
  }

  if (rota('GET', /^\/admin\/veiculos\/placa-disponivel$/)) {
    const placa = (req.params.get('placa') ?? '').toUpperCase();
    const ignorar = req.params.get('ignorarId');
    const emUso = banco.veiculos.some((v) => v.placa === placa && v.id !== ignorar);
    return responder({ disponivel: !emUso });
  }

  if (rota('POST', /^\/admin\/veiculos$/)) {
    const novo: Veiculo = {
      ...(req.body as VeiculoPayload),
      id: novoId('v'),
      dataEntrada: new Date().toISOString(),
    };
    banco.setVeiculos([novo, ...banco.veiculos]);
    return responder(novo, 201);
  }

  if ((m = rota('PUT', /^\/admin\/veiculos\/([\w-]+)$/))) {
    const id = m[1];
    const atual = banco.veiculos.find((v) => v.id === id);
    if (!atual) return erro(404, 'Veículo não encontrado.');
    const atualizado: Veiculo = { ...atual, ...(req.body as VeiculoPayload), id };
    if (atualizado.status !== 'vendido') {
      delete atualizado.dataVenda;
      delete atualizado.precoVenda;
    }
    banco.setVeiculos(banco.veiculos.map((v) => (v.id === id ? atualizado : v)));
    return responder(atualizado);
  }

  if ((m = rota('POST', /^\/admin\/veiculos\/([\w-]+)\/venda$/))) {
    const id = m[1];
    const { precoVenda, dataVenda } = req.body as { precoVenda: number; dataVenda: string };
    const atual = banco.veiculos.find((v) => v.id === id);
    if (!atual) return erro(404, 'Veículo não encontrado.');
    if (atual.status === 'vendido') return erro(409, 'Este veículo já foi vendido.');
    const vendido: Veiculo = { ...atual, status: 'vendido', precoVenda, dataVenda, destaque: false };
    banco.setVeiculos(banco.veiculos.map((v) => (v.id === id ? vendido : v)));
    return responder(vendido);
  }

  if ((m = rota('DELETE', /^\/admin\/veiculos\/([\w-]+)$/))) {
    const id = m[1];
    banco.setVeiculos(banco.veiculos.filter((v) => v.id !== id));
    return responder(null, 204);
  }

  if (rota('GET', /^\/admin\/leads$/)) {
    return responder(banco.leads);
  }

  if ((m = rota('PATCH', /^\/admin\/leads\/([\w-]+)$/))) {
    const id = m[1];
    const { status } = req.body as { status: StatusLead };
    if (!PIPELINE_LEADS.includes(status)) return erro(422, 'Status inválido.');
    let atualizado: Lead | undefined;
    banco.setLeads(
      banco.leads.map((l) =>
        l.id === id ? (atualizado = { ...l, status, atualizadoEm: new Date().toISOString() }) : l,
      ),
    );
    return atualizado ? responder(atualizado) : erro(404, 'Lead não encontrado.');
  }

  if (rota('GET', /^\/admin\/dashboard$/)) {
    return responder(montarDashboard(banco.veiculos, banco.leads));
  }

  if (rota('POST', /^\/admin\/restaurar$/)) {
    banco.restaurar();
    return responder(null, 204);
  }

  return erro(404, `Rota não encontrada na API simulada: ${req.method} ${caminho}`);
};

function novoId(prefixo: string): string {
  return `${prefixo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function montarDashboard(veiculos: Veiculo[], leads: Lead[]): Dashboard {
  const estoque = veiculos.filter((v) => v.status !== 'vendido');
  const vendidos = veiculos.filter((v) => v.status === 'vendido' && v.dataVenda);
  const vendidosMes = vendidos.filter((v) => mesmoMes(v.dataVenda!));

  // Últimos 6 meses, do mais antigo ao atual.
  const hoje = new Date();
  const vendasPorMes = Array.from({ length: 6 }, (_, i) => {
    const ref = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
    const doMes = vendidos.filter((v) => mesmoMes(v.dataVenda!, ref));
    return {
      mes: rotuloMes(ref),
      quantidade: doMes.length,
      receita: doMes.reduce((s, v) => s + (v.precoVenda ?? v.preco), 0),
    };
  });

  const dias = estoque.map((v) => diasEntre(v.dataEntrada));
  return {
    emEstoque: estoque.length,
    valorEstoque: estoque.reduce((s, v) => s + v.preco, 0),
    vendidosNoMes: vendidosMes.length,
    receitaNoMes: vendidosMes.reduce((s, v) => s + (v.precoVenda ?? v.preco), 0),
    leadsNovos: leads.filter((l) => l.status === 'novo').length,
    tempoMedioEstoqueDias: dias.length ? Math.round(dias.reduce((a, b) => a + b, 0) / dias.length) : 0,
    vendasPorMes,
    estoquePorCategoria: CATEGORIAS.map((categoria) => ({
      categoria,
      quantidade: estoque.filter((v) => v.categoria === categoria).length,
    })),
    ultimosLeads: [...leads].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 5),
    maisTempoEmEstoque: [...estoque]
      .sort((a, b) => a.dataEntrada.localeCompare(b.dataEntrada))
      .slice(0, 5),
  };
}
